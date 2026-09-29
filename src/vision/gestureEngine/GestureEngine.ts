import type {
  EngineSnapshot,
  FaceObservation,
  FaceStatus,
  FrameInput,
  Gesture,
  GestureOrNone,
  HandObservation,
  IssueCode,
} from '../types';
import { classifyHand } from './classifyHand';
import { LM, bbox, dist2, palmScale, toUserSpace } from './geometry';

/** Tunable parameters of the engine. */
export const ENGINE_CONFIG = {
  /** Sliding window used for majority voting (ms). */
  voteWindowMs: 320,
  /** Share of the window a gesture must own to become the candidate. */
  voteShare: 0.6,
  /** Minimum smoothed confidence to accept a candidate. */
  minConfidence: 0.55,
  /** Hold time before a gesture is committed (ms). */
  holdMs: {
    THUMBS_UP: 650,
    FIST: 500,
    POINT_LEFT: 450,
    POINT_RIGHT: 450,
    POINT_UP: 450,
    POINT_DOWN: 450,
    OPEN_PALM: 700,
    OK: 450,
    TWO: 500,
    THREE: 500,
    FOUR: 550,
  } satisfies Record<Gesture, number>,
  /** No new commit for this long after a commit (ms). */
  cooldownMs: 650,
  /** A gesture dropped after this share of its hold → "hold it longer". */
  tooQuickMinProgress: 0.25,
  tooQuickShowMs: 1800,
  /** Hand is considered missing after this long (ms). */
  noHandAfterMs: 700,
  /** An issue must persist this long before it is shown (ms). */
  issueShowDelayMs: 350,
  /** A shown issue stays at least this long (ms). */
  issueMinVisibleMs: 1100,
  /** Palm size relative to frame height. */
  handMinScale: 0.11,
  handMaxScale: 0.45,
  /** Border margin for "partly outside the frame". */
  edgeMargin: 0.012,
  /** Wrist speed (palm sizes per second) considered "moving too fast". */
  maxSpeed: 3.2,
  minHandScore: 0.6,
  /** Face checks. */
  faceMissingAfterMs: 1500,
  faceMaxWidth: 0.5,
  faceMinWidth: 0.11,
  faceMaxCenterY: 0.66,
  faceMinCenterY: 0.2,
  faceMaxCenterOffsetX: 0.3,
} as const;

/** Issues that block a gesture from being accepted. */
const BLOCKING: ReadonlySet<IssueCode> = new Set<IssueCode>([
  'MULTIPLE_HANDS',
  'HAND_OUT_LEFT',
  'HAND_OUT_RIGHT',
  'HAND_OUT_TOP',
  'HAND_OUT_BOTTOM',
  'HAND_TOO_FAR',
  'HAND_TOO_CLOSE',
  'LOW_CONFIDENCE',
  'HAND_MOVING',
]);

/** Display priority: lower index wins. */
const PRIORITY: IssueCode[] = [
  'MULTIPLE_HANDS',
  'HAND_TOO_CLOSE',
  'HAND_OUT_LEFT',
  'HAND_OUT_RIGHT',
  'HAND_OUT_TOP',
  'HAND_OUT_BOTTOM',
  'HAND_TOO_FAR',
  'HAND_MOVING',
  'TOO_QUICK',
  'LOW_CONFIDENCE',
  'DIRECTION_AMBIGUOUS',
  'FINGER_FORESHORTENED',
  'EXTRA_FINGERS',
  'THUMB_NOT_UP',
  'FIST_LOOSE',
  'FINGERS_UNCLEAR',
  'FACE_NOT_VISIBLE',
  'FACE_TOO_CLOSE',
  'FACE_TOO_FAR',
  'FACE_TOO_LOW',
  'FACE_TOO_HIGH',
  'FACE_OFF_CENTER',
  'NO_HAND',
];

const FACE_ISSUE: Partial<Record<FaceStatus, IssueCode>> = {
  missing: 'FACE_NOT_VISIBLE',
  'too-close': 'FACE_TOO_CLOSE',
  'too-far': 'FACE_TOO_FAR',
  'too-low': 'FACE_TOO_LOW',
  'too-high': 'FACE_TOO_HIGH',
  'off-center': 'FACE_OFF_CENTER',
};

interface Vote {
  t: number;
  g: GestureOrNone;
  c: number;
}

export interface EngineOptions {
  /** Report face-position issues (preparation / tests). */
  faceCheck: boolean;
  /** Report "no hand" as an issue (when the app waits for a gesture). */
  expectHand: boolean;
}

export type CommitListener = (gesture: Gesture) => void;

/**
 * Temporal gesture engine: turns noisy per-frame classifications into stable,
 * de-duplicated gesture commits plus human-readable problems (Error Mode).
 */
export class GestureEngine {
  private votes: Vote[] = [];
  private holdGesture: GestureOrNone = 'NONE';
  private holdStart = 0;
  private lastHoldProgress = 0;
  /** Gesture already committed and still being held (must be released). */
  private latched: GestureOrNone = 'NONE';
  private latchReleaseAt = 0;
  private cooldownUntil = 0;
  private lastHandAt = -Infinity;
  private lastWrist: { x: number; y: number; t: number } | null = null;
  private speed = 0;
  private tooQuickUntil = 0;
  private confidence = 0;

  private faceStatus: FaceStatus = 'unknown';
  private lastFaceAt = -Infinity;
  private faceStarted = -1;

  private issueCandidate: IssueCode | null = null;
  private issueCandidateSince = 0;
  private shownIssue: IssueCode | null = null;
  private shownIssueSince = 0;

  private lastT = 0;
  private fps = 0;
  private listeners = new Set<CommitListener>();

  options: EngineOptions = { faceCheck: false, expectHand: true };

  private snapshot: EngineSnapshot = {
    handCount: 0,
    handVisible: false,
    gesture: 'NONE',
    confidence: 0,
    holdProgress: 0,
    stable: false,
    issue: null,
    face: 'unknown',
    fps: 0,
  };

  onCommit(fn: CommitListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getSnapshot(): EngineSnapshot {
    return this.snapshot;
  }

  reset(): void {
    this.votes = [];
    this.holdGesture = 'NONE';
    this.latched = 'NONE';
    this.shownIssue = null;
    this.issueCandidate = null;
    this.lastWrist = null;
    this.speed = 0;
  }

  /** Main entry: feed one video frame worth of detections. */
  process(frame: FrameInput): EngineSnapshot {
    const { t } = frame;
    if (this.lastT) {
      const dt = t - this.lastT;
      if (dt > 0) this.fps = this.fps * 0.9 + (1000 / dt) * 0.1;
    }
    this.lastT = t;

    if (frame.faces !== undefined) this.updateFace(frame.faces, t);

    const issues = new Set<IssueCode>();
    let raw: GestureOrNone = 'NONE';
    let rawConf = 0;
    const hands = frame.hands;

    if (hands.length > 0) this.lastHandAt = t;

    if (hands.length > 1) {
      issues.add('MULTIPLE_HANDS');
      raw = 'UNKNOWN';
    } else if (hands.length === 1) {
      const res = this.analyseHand(hands[0], frame.aspect, t, issues);
      raw = res.gesture;
      rawConf = res.confidence;
    } else {
      this.lastWrist = null;
      this.speed = 0;
      if (t - this.lastHandAt > ENGINE_CONFIG.noHandAfterMs && this.options.expectHand) issues.add('NO_HAND');
    }

    const blocked = [...issues].some((i) => BLOCKING.has(i));
    if (blocked) raw = 'UNKNOWN';

    // --- temporal smoothing: weighted majority vote over a time window ---
    this.votes.push({ t, g: raw, c: rawConf });
    const cutoff = t - ENGINE_CONFIG.voteWindowMs;
    while (this.votes.length && this.votes[0].t < cutoff) this.votes.shift();
    const { gesture: candidate, confidence } = this.vote();
    this.confidence = this.confidence * 0.6 + confidence * 0.4;

    // --- hold timer, latch & cooldown ---
    const isReal = candidate !== 'NONE' && candidate !== 'UNKNOWN';
    if (candidate !== this.holdGesture) {
      // Gesture dropped before completing its hold → explain "hold longer".
      if (
        this.holdGesture !== 'NONE' &&
        this.holdGesture !== 'UNKNOWN' &&
        this.holdGesture !== this.latched &&
        this.lastHoldProgress >= ENGINE_CONFIG.tooQuickMinProgress &&
        this.lastHoldProgress < 1 &&
        !isReal
      ) {
        this.tooQuickUntil = t + ENGINE_CONFIG.tooQuickShowMs;
      }
      this.holdGesture = candidate;
      this.holdStart = t;
      this.lastHoldProgress = 0;
    }

    // Release the latch once the committed gesture has been gone for a moment.
    if (this.latched !== 'NONE' && candidate !== this.latched) {
      if (!this.latchReleaseAt) this.latchReleaseAt = t;
      else if (t - this.latchReleaseAt > 150) this.latched = 'NONE';
    } else {
      this.latchReleaseAt = 0;
    }

    let holdProgress = 0;
    let stable = false;
    if (isReal) {
      const g = candidate as Gesture;
      if (this.latched === g) {
        holdProgress = 1;
        stable = true;
      } else {
        holdProgress = Math.min(1, (t - this.holdStart) / ENGINE_CONFIG.holdMs[g]);
        if (holdProgress >= 1 && t >= this.cooldownUntil) {
          stable = true;
          this.latched = g;
          this.cooldownUntil = t + ENGINE_CONFIG.cooldownMs;
          this.tooQuickUntil = 0;
          this.emit(g);
        } else if (holdProgress >= 1) {
          holdProgress = 0.99;
        }
      }
      this.lastHoldProgress = holdProgress;
    }

    if (t < this.tooQuickUntil && !isReal) issues.add('TOO_QUICK');

    // Face issues only matter when nothing is wrong with the hand.
    if (this.options.faceCheck) {
      const fi = FACE_ISSUE[this.faceStatus];
      if (fi) issues.add(fi);
    }

    // While a valid gesture is being held, hide soft hints.
    if (isReal) {
      for (const i of [...issues]) if (!BLOCKING.has(i)) issues.delete(i);
    }

    let issue = this.debounceIssue(pickIssue(issues), t);
    // A recognised gesture wins over lingering soft hints.
    if (isReal && issue && !BLOCKING.has(issue)) {
      issue = null;
      this.shownIssue = null;
    }

    this.snapshot = {
      handCount: hands.length,
      handVisible: hands.length > 0,
      gesture: candidate,
      confidence: this.confidence,
      holdProgress,
      stable,
      issue,
      face: this.faceStatus,
      fps: Math.round(this.fps),
    };
    return this.snapshot;
  }

  /** Inject a commit directly (DEV demo mode, no camera). */
  simulate(gesture: Gesture): void {
    this.snapshot = { ...this.snapshot, gesture, confidence: 1, holdProgress: 1, stable: true, issue: null };
    this.emit(gesture);
  }

  private emit(g: Gesture) {
    for (const fn of this.listeners) fn(g);
  }

  private analyseHand(hand: HandObservation, aspect: number, t: number, issues: Set<IssueCode>) {
    const { landmarks } = hand;
    const box = bbox(landmarks);
    const m = ENGINE_CONFIG.edgeMargin;
    // Mirrored display: raw x < 0 is the user's RIGHT side of the screen.
    if (box.minX < m) issues.add('HAND_OUT_RIGHT');
    else if (box.maxX > 1 - m) issues.add('HAND_OUT_LEFT');
    else if (box.minY < m) issues.add('HAND_OUT_TOP');
    else if (box.maxY > 1 - m) issues.add('HAND_OUT_BOTTOM');

    const p = toUserSpace(landmarks, aspect);
    const scale = palmScale(p);
    if (scale < ENGINE_CONFIG.handMinScale) issues.add('HAND_TOO_FAR');
    else if (scale > ENGINE_CONFIG.handMaxScale) issues.add('HAND_TOO_CLOSE');

    // Motion: wrist speed in palm sizes per second (EMA-smoothed).
    const wrist = p[LM.WRIST];
    if (this.lastWrist) {
      const dt = (t - this.lastWrist.t) / 1000;
      if (dt > 0 && dt < 0.5) {
        const v = dist2(wrist, { x: this.lastWrist.x, y: this.lastWrist.y, z: 0 }) / scale / dt;
        this.speed = this.speed * 0.7 + v * 0.3;
      }
    }
    this.lastWrist = { x: wrist.x, y: wrist.y, t };
    if (this.speed > ENGINE_CONFIG.maxSpeed) issues.add('HAND_MOVING');

    const cls = classifyHand(landmarks, aspect);
    let confidence = cls.confidence * (0.6 + 0.4 * hand.score);
    let gesture = cls.gesture;
    if (hand.score < ENGINE_CONFIG.minHandScore) {
      issues.add('LOW_CONFIDENCE');
    } else if (gesture !== 'UNKNOWN' && confidence < ENGINE_CONFIG.minConfidence) {
      issues.add('LOW_CONFIDENCE');
      gesture = 'UNKNOWN';
    }
    if (cls.hint) issues.add(cls.hint);
    if (gesture === 'UNKNOWN') confidence = cls.confidence * 0.5;
    return { gesture, confidence };
  }

  private vote(): { gesture: GestureOrNone; confidence: number } {
    const n = this.votes.length;
    if (!n) return { gesture: 'NONE', confidence: 0 };
    const counts = new Map<GestureOrNone, { n: number; c: number }>();
    for (const v of this.votes) {
      const e = counts.get(v.g) ?? { n: 0, c: 0 };
      e.n += 1;
      e.c += v.c;
      counts.set(v.g, e);
    }
    let best: GestureOrNone = 'NONE';
    let bestN = 0;
    let bestC = 0;
    for (const [g, e] of counts) {
      if (e.n > bestN) {
        best = g;
        bestN = e.n;
        bestC = e.c / e.n;
      }
    }
    // Last frame without a hand → NONE quickly, so releasing feels responsive.
    if (bestN / n < ENGINE_CONFIG.voteShare) {
      const last = this.votes[n - 1].g;
      return { gesture: last === 'NONE' ? 'NONE' : 'UNKNOWN', confidence: bestC * (bestN / n) };
    }
    if (best !== 'NONE' && best !== 'UNKNOWN' && bestC < ENGINE_CONFIG.minConfidence) {
      return { gesture: 'UNKNOWN', confidence: bestC };
    }
    return { gesture: best, confidence: bestC * (bestN / n) };
  }

  private updateFace(faces: FaceObservation[], t: number) {
    if (this.faceStarted < 0) this.faceStarted = t;
    const c = ENGINE_CONFIG;
    const face = faces.slice().sort((a, b) => b.width * b.height - a.width * a.height)[0];
    if (!face) {
      if (t - this.lastFaceAt > c.faceMissingAfterMs && t - this.faceStarted > c.faceMissingAfterMs) {
        this.faceStatus = 'missing';
      }
      return;
    }
    this.lastFaceAt = t;
    const cx = face.x + face.width / 2;
    const cy = face.y + face.height / 2;
    if (face.width > c.faceMaxWidth) this.faceStatus = 'too-close';
    else if (face.width < c.faceMinWidth) this.faceStatus = 'too-far';
    else if (cy > c.faceMaxCenterY) this.faceStatus = 'too-low';
    else if (cy < c.faceMinCenterY) this.faceStatus = 'too-high';
    else if (Math.abs(cx - 0.5) > c.faceMaxCenterOffsetX) this.faceStatus = 'off-center';
    else this.faceStatus = 'ok';
  }

  /** Avoid flicker: issues need to persist before showing and stay visible a while. */
  private debounceIssue(next: IssueCode | null, t: number): IssueCode | null {
    const c = ENGINE_CONFIG;
    if (next !== this.issueCandidate) {
      this.issueCandidate = next;
      this.issueCandidateSince = t;
    }
    const persisted = t - this.issueCandidateSince >= (next === 'TOO_QUICK' ? 0 : c.issueShowDelayMs);
    if (next && persisted && next !== this.shownIssue) {
      // Switch immediately to a more important issue; otherwise respect min visibility.
      const moreImportant = this.shownIssue === null || PRIORITY.indexOf(next) < PRIORITY.indexOf(this.shownIssue);
      if (moreImportant || t - this.shownIssueSince >= c.issueMinVisibleMs) {
        this.shownIssue = next;
        this.shownIssueSince = t;
      }
    } else if (!next && this.shownIssue && t - this.shownIssueSince >= c.issueMinVisibleMs) {
      this.shownIssue = null;
    }
    return this.shownIssue;
  }
}

function pickIssue(issues: Set<IssueCode>): IssueCode | null {
  if (!issues.size) return null;
  let best: IssueCode | null = null;
  let bestIdx = Infinity;
  for (const i of issues) {
    const idx = PRIORITY.indexOf(i);
    if (idx < bestIdx) {
      best = i;
      bestIdx = idx;
    }
  }
  return best;
}
