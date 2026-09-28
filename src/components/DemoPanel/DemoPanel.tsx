import { useEffect } from 'react';
import { GESTURE_META } from '../../vision/gestureEngine/messages';
import { ALL_GESTURES, type Gesture } from '../../vision/types';
import { visionRuntime } from '../../vision/VisionRuntime';

const KEYS: Record<string, Gesture> = {
  ArrowLeft: 'POINT_LEFT',
  ArrowRight: 'POINT_RIGHT',
  ArrowUp: 'POINT_UP',
  ArrowDown: 'POINT_DOWN',
  Enter: 'FIST',
  f: 'FIST',
  t: 'THUMBS_UP',
  ' ': 'THUMBS_UP',
  p: 'OPEN_PALM',
};

/**
 * DEV DEMO MODE (open the app with ?demo). Lets developers walk through the
 * flow without a camera. Not part of the production user experience.
 */
export function DemoPanel() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const g = KEYS[e.key];
      if (g) {
        e.preventDefault();
        visionRuntime.simulate(g);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <aside className="fixed bottom-3 left-3 z-50 max-w-[calc(100vw-24px)] rounded-2xl bg-slate-900/95 p-2 sm:p-3 text-white shadow-2xl" aria-label="Панель разработчика">
      <p className="mb-2 hidden text-[10px] sm:block font-bold uppercase tracking-[0.18em] text-fuchsia-300">Dev demo mode · без камеры</p>
      <div className="flex flex-wrap gap-1.5">
        {ALL_GESTURES.map((g) => (
          <button
            key={g}
            type="button"
            data-gesture={g}
            onClick={() => visionRuntime.simulate(g)}
            className="rounded-lg bg-white/10 px-2 py-1 text-xs font-semibold hover:bg-white/20"
          >
            <span className="emoji sm:mr-1">{GESTURE_META[g].emoji}</span>
            <span className="hidden sm:inline">{GESTURE_META[g].label}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 hidden text-[10px] text-white/60 sm:block">Клавиши: ← → ↑ ↓ · Enter/F = ✊ · T/Space = 👍 · P = ✋</p>
    </aside>
  );
}
