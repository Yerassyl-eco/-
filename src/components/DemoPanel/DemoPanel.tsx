import { useEffect } from 'react';
import { GESTURE_META } from '../../vision/gestureEngine/messages';
import { GestureIcon } from '../GestureIcon/GestureIcon';
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
export function DemoPanel({ hidden = false }: { hidden?: boolean }) {
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
    <aside hidden={hidden} className="fixed right-3 top-16 z-50 lg:bottom-3 lg:left-3 lg:right-auto lg:top-auto max-w-[calc(100vw-24px)] border border-ink bg-ink p-2 text-paper sm:p-3" aria-label="Панель разработчика">
      <p className="label mb-2 hidden text-paper/60 sm:block">Dev demo · no camera</p>
      <div className="flex flex-wrap gap-1.5">
        {ALL_GESTURES.map((g) => (
          <button
            key={g}
            type="button"
            data-gesture={g}
            onClick={() => visionRuntime.simulate(g)}
            className="flex items-center border border-paper/25 px-2 py-1 text-xs hover:border-paper"
          >
            <GestureIcon gesture={g} size={16} className="inline sm:mr-1" aria-label={GESTURE_META[g].name} />
            <span className="hidden sm:inline">{GESTURE_META[g].label}</span>
          </button>
        ))}
      </div>
      <p className="num mt-2 hidden text-xs text-paper/60 sm:block">Keys: arrows · Enter/F fist · T/Space thumbs up · P palm</p>
    </aside>
  );
}
