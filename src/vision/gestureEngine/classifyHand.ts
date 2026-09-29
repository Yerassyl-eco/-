import type { GestureOrNone, IssueCode, Landmark } from '../types';
import {
  FINGERS,
  LM,
  clamp01,
  cos3,
  dist3,
  palmScale,
  smoothstep,
  sub,
  toUserSpace,
  type FingerName,
  type Vec3,
} from './geometry';

/** Per-finger pose features. */
export interface FingerFeatures {
  /** 0 = fully curled, 1 = fully extended. */
  extension: number;
  /** tip distance from wrist / pip distance from wrist. */
  reach: number;
  /** average cosine between consecutive bone segments (1 = straight). */
  straightness: number;
}

export interface HandFeatures {
  scale: number;
  fingers: Record<FingerName, FingerFeatures>;
  thumb: { extension: number; up: number; aboveKnuckles: boolean };
}

export interface HandClassification {
  gesture: GestureOrNone;
  /** 0..1 rule confidence of `gesture`. */
  confidence: number;
  /** When the pose is almost a gesture: what exactly is wrong. */
  hint: IssueCode | null;
  /** What the user was probably trying to show (for hints). */
  intended: GestureOrNone;
  features: HandFeatures;
}

function fingerFeatures(p: Vec3[], idx: readonly number[]): FingerFeatures {
  const [mcp, pip, dip, tip] = idx.map((i) => p[i]);
  const wrist = p[LM.WRIST];
  const reach = dist3(wrist, tip) / Math.max(1e-6, dist3(wrist, pip));
  const s1 = cos3(sub(pip, mcp), sub(dip, pip));
  const s2 = cos3(sub(dip, pip), sub(tip, dip));
  const straightness = (s1 + s2) / 2;
  // A finger is extended when its tip is clearly farther from the wrist than
  // its middle joint AND its bones are roughly aligned.
  const extension = Math.min(smoothstep(0.95, 1.25, reach), smoothstep(0.1, 0.75, straightness));
  return { extension, reach, straightness };
}

export function computeFeatures(landmarks: Landmark[], aspect: number): HandFeatures {
  const p = toUserSpace(landmarks, aspect);
  const scale = palmScale(p);

  const fingers = {
    index: fingerFeatures(p, FINGERS.index),
    middle: fingerFeatures(p, FINGERS.middle),
    ring: fingerFeatures(p, FINGERS.ring),
    pinky: fingerFeatures(p, FINGERS.pinky),
  };

  // Thumb: extended if its tip is far from the middle-finger knuckle area
  // and the last two bones are aligned.
  const tip = p[LM.THUMB_TIP];
  const ip = p[LM.THUMB_IP];
  const mcp = p[LM.THUMB_MCP];
  const away = dist3(tip, p[LM.INDEX_PIP]) / scale;
  const straight = cos3(sub(ip, mcp), sub(tip, ip));
  const extension = Math.min(smoothstep(0.35, 0.7, away), smoothstep(0.2, 0.7, straight));

  // How much the thumb points up (screen space; y grows downwards).
  const dir = sub(tip, mcp);
  const l2 = Math.hypot(dir.x, dir.y);
  const up = l2 > 1e-6 ? -dir.y / l2 : 0;
  const knuckleTop = Math.min(
    p[LM.INDEX_MCP].y,
    p[LM.INDEX_PIP].y,
    p[LM.MIDDLE_PIP].y,
    p[LM.RING_PIP].y,
    p[LM.PINKY_PIP].y,
  );
  const aboveKnuckles = tip.y < knuckleTop - 0.15 * scale;

  return { scale, fingers, thumb: { extension, up, aboveKnuckles } };
}

const POINT_GESTURE = {
  up: 'POINT_UP',
  down: 'POINT_DOWN',
  left: 'POINT_LEFT',
  right: 'POINT_RIGHT',
} as const;

/**
 * Rule-based single-frame classifier on top of MediaPipe landmarks.
 * Works in "user space" (mirrored), so POINT_RIGHT means the user points to
 * the right side of the screen.
 */
export function classifyHand(landmarks: Landmark[], aspect: number): HandClassification {
  const features = computeFeatures(landmarks, aspect);
  const { fingers: f, thumb, scale } = features;
  const p = toUserSpace(landmarks, aspect);

  const I = f.index.extension;
  const others = [f.middle.extension, f.ring.extension, f.pinky.extension];
  const maxOthers = Math.max(...others);
  const maxAll = Math.max(I, maxOthers);
  const minAll = Math.min(I, ...others);
  const curledAll = 1 - maxAll;

  const result = (
    gesture: GestureOrNone,
    confidence: number,
    hint: IssueCode | null = null,
    intended: GestureOrNone = gesture,
  ): HandClassification => ({ gesture, confidence: clamp01(confidence), hint, intended, features });

  // 👌 OK — thumb and index tips touch, the other three fingers are up.
  const pinch = dist3(p[LM.THUMB_TIP], p[LM.INDEX_TIP]) / scale;
  if (pinch < 0.32 && Math.min(...others) > 0.5) {
    const conf = 0.5 * smoothstep(0.32, 0.12, pinch) + 0.5 * Math.min(...others);
    return result('OK', 0.3 + 0.7 * conf);
  }

  // ✋ OPEN PALM — all fingers extended.
  if (minAll > 0.55 && thumb.extension > 0.35) {
    return result('OPEN_PALM', 0.5 * minAll + 0.3 * thumb.extension + 0.2);
  }

  // ☝️👇👈👉 POINTING — index extended, the other three curled.
  if (I > 0.55 && maxOthers < 0.45) {
    const base = p[LM.INDEX_MCP];
    const tip = p[LM.INDEX_TIP];
    const dx = tip.x - base.x;
    const dy = tip.y - base.y;
    const l = Math.hypot(dx, dy);
    // Finger pointing into the camera looks very short on screen.
    if (l / scale < 0.45) {
      return result('UNKNOWN', 0.3, 'FINGER_FORESHORTENED', 'POINT_UP');
    }
    const ax = Math.abs(dx) / l;
    const ay = Math.abs(dy) / l;
    const dirKey = ax >= ay ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
    const gesture = POINT_GESTURE[dirKey];
    const alignment = Math.max(ax, ay); // 1 = perfectly axis-aligned, 0.707 = diagonal
    if (alignment < 0.8) {
      return result('UNKNOWN', 0.35, 'DIRECTION_AMBIGUOUS', gesture);
    }
    const conf = 0.35 * I + 0.35 * (1 - maxOthers) + 0.3 * smoothstep(0.8, 0.95, alignment);
    return result(gesture, 0.25 + 0.75 * conf);
  }

  // Counting fingers: index first, then middle, ring, pinky (thumb ignored).
  const [M, Rg, Pk] = others;
  const up = (v: number) => v > 0.55;
  const down = (v: number) => v < 0.4;
  if (up(I) && up(M) && down(Rg) && down(Pk)) {
    return result('TWO', 0.3 + 0.7 * Math.min(I, M, 1 - Rg, 1 - Pk));
  }
  if (up(I) && up(M) && up(Rg) && down(Pk)) {
    return result('THREE', 0.3 + 0.7 * Math.min(I, M, Rg, 1 - Pk));
  }
  if (minAll > 0.55 && thumb.extension <= 0.35) {
    return result('FOUR', 0.3 + 0.7 * Math.min(minAll, 1 - thumb.extension));
  }

  // Two or more long fingers extended, but not all → probably a sloppy point.
  if (I > 0.55 && maxOthers >= 0.45 && minAll <= 0.55) {
    return result('UNKNOWN', 0.3, 'EXTRA_FINGERS', 'POINT_UP');
  }

  // 👍 / ✊ — all four long fingers curled.
  if (maxAll < 0.4) {
    if (thumb.extension > 0.5) {
      if (thumb.up > 0.7 && thumb.aboveKnuckles) {
        const conf = 0.4 * curledAll + 0.3 * thumb.extension + 0.3 * smoothstep(0.7, 0.95, thumb.up);
        return result('THUMBS_UP', 0.25 + 0.75 * conf);
      }
      return result('UNKNOWN', 0.35, 'THUMB_NOT_UP', 'THUMBS_UP');
    }
    const conf = 0.7 * curledAll + 0.3 * (1 - thumb.extension);
    return result('FIST', 0.25 + 0.75 * conf);
  }

  // Fingers half-bent: between a fist and an open hand.
  if (maxAll < 0.6) {
    return result('UNKNOWN', 0.3, 'FIST_LOOSE', 'FIST');
  }

  return result('UNKNOWN', 0.25, 'FINGERS_UNCLEAR', 'UNKNOWN');
}
