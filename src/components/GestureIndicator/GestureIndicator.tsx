import { Hand, ScanEye } from 'lucide-react';
import { gestureMeta } from '../../vision/gestureEngine/messages';
import { GestureIcon } from '../GestureIcon/GestureIcon';
import type { EngineSnapshot } from '../../vision/types';

/** HUD at the bottom of the camera: current gesture, hold ring and confidence. */
export function GestureIndicator({ snap }: { snap: EngineSnapshot }) {
  const meta = gestureMeta(snap.gesture);
  const pct = Math.round(snap.confidence * 100);
  const ring = 2 * Math.PI * 22;

  if (!meta) {
    return (
      <div className="glass flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-slate-700 shadow-lg" aria-live="polite">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600" aria-hidden>
          {snap.handVisible ? <Hand size={22} /> : <ScanEye size={22} />}
        </span>
        <span className="font-semibold leading-tight">
          {snap.handVisible ? 'Я вижу вашу руку' : 'Покажите ладонь в камеру'}
          <span className="block text-xs font-medium text-slate-500">
            {snap.handVisible ? 'Покажите нужный жест' : 'Жду руку в кадре'}
          </span>
        </span>
      </div>
    );
  }

  return (
    <div
      className={`glass flex items-center gap-3 rounded-2xl px-3 py-2 shadow-lg transition-colors ${snap.stable ? 'ring-2 ring-success-500' : ''}`}
      aria-live="polite"
    >
      <span className="relative flex h-12 w-12 items-center justify-center">
        <svg viewBox="0 0 50 50" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="25" cy="25" r="22" fill="white" stroke="#e2e8f0" strokeWidth="4" />
          <circle
            cx="25"
            cy="25"
            r="22"
            fill="none"
            stroke={snap.stable ? 'var(--color-success-500)' : 'var(--color-accent-500)'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${snap.holdProgress * ring} ${ring}`}
            style={{ transition: 'stroke-dasharray 90ms linear' }}
          />
        </svg>
        <span key={snap.gesture} className={`relative ${snap.stable ? 'animate-pop-in text-success-500' : 'text-accent-500'}`}>
          {snap.gesture !== 'NONE' && snap.gesture !== 'UNKNOWN' && <GestureIcon gesture={snap.gesture} size={24} />}
        </span>
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block text-sm font-extrabold tracking-wide text-slate-900">{meta.label}</span>
        <span className={`block text-xs font-semibold ${snap.stable ? 'text-success-700' : 'text-accent-600'}`}>
          {snap.stable ? '✓ Жест распознан' : 'Держите жест…'}
        </span>
      </span>
      <span className="ml-auto hidden w-16 flex-col items-end gap-1 sm:flex" title="Уверенность распознавания">
        <span className="text-xs font-bold tracking-wider text-slate-600">{pct}%</span>
        <span className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <span className="block h-full rounded-full bg-accent-500 transition-[width]" style={{ width: `${pct}%` }} />
        </span>
      </span>
    </div>
  );
}
