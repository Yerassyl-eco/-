import { useEffect, useRef } from 'react';
import { IRIS_FRACTION, PUPIL_REST, renderIris } from './renderIris';

interface Props {
  /** A hand is in frame: the pupil contracts and the reticle closes in. */
  locked: boolean;
  /** 0..1 hold progress of the start gesture, drawn on the outer ring. */
  progress: number;
}

// SVG space: 1000 × 1000, centre 500. The iris radius matches the canvas.
const C = 500;
const IRIS = 500 * IRIS_FRACTION;
const RING = 400;
const PUPIL = IRIS * PUPIL_REST;
const PUPIL_RING = PUPIL + 4;

/**
 * The landing visual: a procedurally drawn iris under an optical reticle.
 * The canvas is painted once per size; everything live is SVG on top.
 */
export function IrisScope({ locked, progress }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    let painted = 0;
    const paint = () => {
      const px = Math.min(2000, Math.round(el.clientWidth * Math.min(2, window.devicePixelRatio || 1)));
      // Repaint only when the size changes noticeably; the drawing is deterministic.
      if (px && Math.abs(px - painted) > 40) {
        painted = px;
        renderIris(cv, px);
      }
    };
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bracket = 52;
  const shift = locked ? 26 : 0;
  return (
    <div ref={wrap} className="iris-scope relative aspect-square w-full" data-locked={locked || undefined}>
      <canvas ref={canvas} className="animate-iris-in absolute inset-0 h-full w-full" aria-hidden />
      <svg viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {/* pupil: breathes at rest, contracts when a hand appears */}
        <circle className="iris-pupil" cx={C} cy={C} r={PUPIL} fill="#070606" />

        <g className="reticle" fill="none" strokeLinecap="butt">
          {/* crosshair: graphite beyond the ring, white across the iris */}
          <line className="draw" pathLength={1} x1={C} y1={40} x2={C} y2={960} stroke="var(--color-rule-strong)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <line className="draw" pathLength={1} x1={bracket} y1={C} x2={1000 - bracket} y2={C} stroke="var(--color-rule-strong)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <line x1={C} y1={C - IRIS} x2={C} y2={C + IRIS} stroke="rgba(255,255,255,0.55)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <line x1={C - IRIS} y1={C} x2={C + IRIS} y2={C} stroke="rgba(255,255,255,0.55)" strokeWidth={1} vectorEffect="non-scaling-stroke" />

          {/* range brackets: close in on lock */}
          <g stroke={locked ? 'var(--color-ink)' : 'var(--color-graphite)'} strokeWidth={1.25} className="brackets">
            <g style={{ transform: `translateX(${shift}px)` }}>
              <line x1={bracket} y1={C - 36} x2={bracket} y2={C + 36} vectorEffect="non-scaling-stroke" />
              <line x1={bracket} y1={C} x2={bracket + 18} y2={C} vectorEffect="non-scaling-stroke" />
            </g>
            <g style={{ transform: `translateX(${-shift}px)` }}>
              <line x1={1000 - bracket} y1={C - 36} x2={1000 - bracket} y2={C + 36} vectorEffect="non-scaling-stroke" />
              <line x1={1000 - bracket - 18} y1={C} x2={1000 - bracket} y2={C} vectorEffect="non-scaling-stroke" />
            </g>
          </g>

          {/* measuring ring and pupil ring */}
          <circle className="draw" pathLength={1} cx={C} cy={C} r={RING} stroke="#ffffff" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          <circle cx={C} cy={C} r={PUPIL_RING} stroke="#ffffff" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          <path d={`M${C - 9} ${C}H${C + 9}M${C} ${C - 9}V${C + 9}`} stroke="#ffffff" strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
        </g>

        {/* hold progress of 👍, clockwise from 12 o'clock */}
        <circle
          cx={C}
          cy={C}
          r={RING}
          fill="none"
          stroke="var(--color-cobalt)"
          strokeWidth={3}
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - progress}
          transform={`rotate(-90 ${C} ${C})`}
          style={{ transition: 'stroke-dashoffset 90ms linear', opacity: progress > 0 ? 1 : 0 }}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
