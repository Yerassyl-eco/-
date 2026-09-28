import type { Ref } from 'react';

/**
 * Canvas layer for landmarks / skeleton / bounding box. It is drawn directly
 * by the vision runtime every video frame (no React re-render per frame).
 */
export function GestureOverlay({ ref }: { ref: Ref<HTMLCanvasElement> }) {
  return <canvas ref={ref} className="mirror pointer-events-none absolute inset-0 h-full w-full object-cover" aria-hidden />;
}
