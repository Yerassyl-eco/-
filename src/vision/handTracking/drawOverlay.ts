import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { HAND_CONNECTIONS, bbox } from '../gestureEngine/geometry';
import type { FaceObservation } from '../types';

export type OverlayTone = 'idle' | 'tracking' | 'holding' | 'stable' | 'warning';

const TONES: Record<OverlayTone, { line: string; joint: string; glow: string }> = {
  idle: { line: 'rgba(255,255,255,0.75)', joint: '#ffffff', glow: 'rgba(255,255,255,0.35)' },
  tracking: { line: 'rgba(125,211,252,0.95)', joint: '#e0f2fe', glow: 'rgba(56,189,248,0.55)' },
  holding: { line: 'rgba(96,165,250,1)', joint: '#ffffff', glow: 'rgba(59,130,246,0.7)' },
  stable: { line: 'rgba(74,222,128,1)', joint: '#ffffff', glow: 'rgba(34,197,94,0.75)' },
  warning: { line: 'rgba(251,191,36,1)', joint: '#fff7ed', glow: 'rgba(245,158,11,0.6)' },
};

/**
 * Draws landmarks, skeleton, a soft bounding box and the face frame directly
 * on a canvas. Runs every video frame outside React.
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
  const unit = Math.max(1, Math.min(w, h) / 360);

  if (faces) {
    for (const f of faces) {
      ctx.save();
      ctx.setLineDash([6 * unit, 6 * unit]);
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1.5 * unit;
      roundRect(ctx, f.x * w, f.y * h, f.width * w, f.height * h, 14 * unit);
      ctx.stroke();
      ctx.restore();
    }
  }

  const c = TONES[tone];
  for (const lms of hands) {
    // Bounding box with corner brackets.
    const b = bbox(lms);
    const pad = 0.03;
    const x0 = (b.minX - pad) * w;
    const y0 = (b.minY - pad) * h;
    const x1 = (b.maxX + pad) * w;
    const y1 = (b.maxY + pad) * h;
    const cl = Math.min(22 * unit, (x1 - x0) / 3, (y1 - y0) / 3);
    ctx.save();
    ctx.strokeStyle = c.line;
    ctx.lineWidth = 3 * unit;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, y0 + cl); ctx.lineTo(x0, y0); ctx.lineTo(x0 + cl, y0);
    ctx.moveTo(x1 - cl, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + cl);
    ctx.moveTo(x1, y1 - cl); ctx.lineTo(x1, y1); ctx.lineTo(x1 - cl, y1);
    ctx.moveTo(x0 + cl, y1); ctx.lineTo(x0, y1); ctx.lineTo(x0, y1 - cl);
    ctx.stroke();

    // Hold progress along the top edge of the box.
    if (holdProgress > 0 && holdProgress < 1) {
      ctx.strokeStyle = TONES.holding.line;
      ctx.lineWidth = 4 * unit;
      ctx.beginPath();
      ctx.moveTo(x0, y0 - 8 * unit);
      ctx.lineTo(x0 + (x1 - x0) * holdProgress, y0 - 8 * unit);
      ctx.stroke();
    }

    // Skeleton.
    ctx.shadowColor = c.glow;
    ctx.shadowBlur = 10 * unit;
    ctx.strokeStyle = c.line;
    ctx.lineWidth = 3 * unit;
    ctx.beginPath();
    for (const [a, z] of HAND_CONNECTIONS) {
      ctx.moveTo(lms[a].x * w, lms[a].y * h);
      ctx.lineTo(lms[z].x * w, lms[z].y * h);
    }
    ctx.stroke();

    // Joints.
    ctx.shadowBlur = 0;
    for (let i = 0; i < lms.length; i++) {
      const isTip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20;
      ctx.beginPath();
      ctx.fillStyle = c.joint;
      ctx.arc(lms[i].x * w, lms[i].y * h, (isTip ? 4.5 : 3.2) * unit, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 1.5 * unit;
      ctx.strokeStyle = c.line;
      ctx.stroke();
    }
    ctx.restore();
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
