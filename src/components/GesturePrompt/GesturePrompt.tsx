import { GESTURE_META } from '../../vision/gestureEngine/messages';
import type { Gesture } from '../../vision/types';

export interface PromptChip {
  gesture: Gesture;
  label: string;
  onClick?: () => void;
  highlighted?: boolean;
}

/**
 * Row of gesture hints for the current step. Chips are also real buttons —
 * a mouse/keyboard fallback for accessibility; gestures remain the main input.
 */
export function GesturePrompt({ items, title = 'Управление жестами' }: { items: PromptChip[]; title?: string }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <button
            key={it.gesture + it.label}
            type="button"
            onClick={it.onClick}
            aria-label={`${GESTURE_META[it.gesture].name}: ${it.label}`}
            className={`group flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition hover:-translate-y-0.5 ${
              it.highlighted
                ? 'animate-pulse-ring border-accent-500 bg-accent-500 text-white'
                : 'border-line bg-white text-slate-800 shadow-sm hover:border-accent-200'
            }`}
          >
            <span className="emoji text-lg" aria-hidden>
              {GESTURE_META[it.gesture].emoji}
            </span>
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}
