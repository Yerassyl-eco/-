import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { HAND_CONNECTIONS, bbox } from '../gestureEngine/geometry';
import type { FaceObservation } from '../types';

export type OverlayTone = 'idle' | 'tracking' | 'holding' | 'stable' | 'warning';

/** Instrument palette for the live video layer (drawn over dark footage). */
const TONES: Record<OverlayTone, { line: string; joint: string; bracket: string }> = {
  idle: { line: 'rgba(255,255,255,0.55)', joint: 'rgba(255,255,255,0.9)', bracket: 'rgba(255,255,255,0.5)' },
  tracking: { line: 'rgba(255,255,255,0.8)', joint: '#ffffff', bracket: 'rgba(255,255,255,0.7)' },
  holding: { line: '#7f9bff', joint: '#ffffff', bracket: '#7f9bff' },
  stable: { line: '#2457ff', joint: '#ffffff', bracket: '#2457ff' },
  warning: { line: '#ffb020', joint: '#fff4de', bracket: '#ffb020' },
};

/**
 * Draws the tracking layer directly on a canvas every video frame (outside
 * React): hairline skeleton, joint dots, corner brackets, hold progress and
 * the face frame. The canvas is mirrored by CSS, so text is counter-flipped.
 */
export function drawOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  hands: NormalizedLandmark[][],
  faces: FaceObservation[] | null,
  tone: OverlayTone,
  holdProgress: number,
) {
  ctx.clearRect(0, 0, w, h);
  const u = Math.max(1, Math.min(w, h) / 480);

  if (faces) {
    for (const f of faces) {
      const x = f.x * w;
      const y = f.y * h;
      const fw = f.width * w;
      const fh = f.height * h;
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1 * u;
      ctx.setLineDash([4 * u, 4 * u]);
      ctx.strokeRect(x, y, fw, fh);
      ctx.setLineDash([]);
      // label, counter-flipped because the canvas is mirrored
      ctx.translate(x + fw, y - 6 * u);
      ctx.scale(-1, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = `${10 * u}px "Geist Mono Variable", ui-monospace, monospace`;
      ctx.fillText('FACE', 0, 0);
      ctx.restore();
    }
  }

  const c = TONES[tone];
  for (const lms of hands) {
    const b = bbox(lms);
    const pad = 0.025;
    const x0 = (b.minX - pad) * w;
    const y0 = (b.minY - pad) * h;
    const x1 = (b.maxX + pad) * w;
    const y1 = (b.maxY + pad) * h;
    const cl = Math.min(14 * u, (x1 - x0) / 4, (y1 - y0) / 4);

    ctx.save();
    ctx.lineCap = 'square';
    ctx.strokeStyle = c.bracket;
    ctx.lineWidth = 1.5 * u;
    ctx.beginPath();
    ctx.moveTo(x0, y0 + cl); ctx.lineTo(x0, y0); ctx.lineTo(x0 + cl, y0);
    ctx.moveTo(x1 - cl, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + cl);
    ctx.moveTo(x1, y1 - cl); ctx.lineTo(x1, y1); ctx.lineTo(x1 - cl, y1);
    ctx.moveTo(x0 + cl, y1); ctx.lineTo(x0, y1); ctx.lineTo(x0, y1 - cl);
    ctx.stroke();

    // hold progress: a hairline along the bottom edge of the brackets
    if (holdProgress > 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 2 * u;
      ctx.beginPath();
      ctx.moveTo(x0, y1 + 6 * u);
      ctx.lineTo(x1, y1 + 6 * u);
      ctx.stroke();
      ctx.strokeStyle = c.line;
      ctx.beginPath();
      // canvas is mirrored: draw from the user's left (raw right edge)
      ctx.moveTo(x1, y1 + 6 * u);
      ctx.lineTo(x1 - (x1 - x0) * Math.min(1, holdProgress), y1 + 6 * u);
      ctx.stroke();
    }

    ctx.strokeStyle = c.line;
    ctx.lineWidth = 1.5 * u;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const [a, z] of HAND_CONNECTIONS) {
      ctx.moveTo(lms[a].x * w, lms[a].y * h);
      ctx.lineTo(lms[z].x * w, lms[z].y * h);
    }
    ctx.stroke();

    for (let i = 0; i < lms.length; i++) {
      const tip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20;
      ctx.beginPath();
      ctx.fillStyle = tip ? c.line : c.joint;
      ctx.arc(lms[i].x * w, lms[i].y * h, (tip ? 3 : 2.2) * u, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
