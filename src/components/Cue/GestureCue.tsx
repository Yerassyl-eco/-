import { useVision } from '../../vision/useVision';
import { GESTURE_META } from '../../vision/gestureEngine/messages';
import type { Gesture } from '../../vision/types';
import { GestureIcon } from '../GestureIcon/GestureIcon';

interface Props {
  gesture: Gesture;
  /** What happens: "Начать скрининг". */
  action: string;
  onTrigger?: () => void;
  primary?: boolean;
  disabled?: boolean;
}

/**
 * Action row driven by a gesture. Its baseline rule fills live while the user
 * holds that gesture — the instrument's signature interaction. The row is also
 * a real button (mouse / keyboard fallback).
 */
export function GestureCue({ gesture, action, onTrigger, primary = false, disabled = false }: Props) {
  const { engine } = useVision();
  const active = engine.gesture === gesture;
  const fill = active ? engine.holdProgress : 0;
  const meta = GESTURE_META[gesture];
  return (
    <button
      type="button"
      onClick={onTrigger}
      disabled={disabled}
      aria-label={`${action}: жест «${meta.name}»`}
      className="group relative flex w-full items-center gap-4 py-3.5 text-left text-ink transition-colors duration-150 disabled:cursor-default disabled:opacity-40"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center border transition-colors duration-150 ${
          active ? 'border-cobalt bg-cobalt text-white' : primary ? 'border-ink text-ink group-hover:bg-ink group-hover:text-paper' : 'border-rule-strong text-ink group-hover:border-ink'
        }`}
        style={{ borderRadius: 'var(--radius-hair)' }}
      >
        <GestureIcon gesture={gesture} size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block leading-tight ${primary ? 'text-[17px] font-medium' : 'text-[15px]'}`}>{action}</span>
        <span className="label mt-0.5 block text-graphite">{meta.label}</span>
      </span>
      <span className="label num shrink-0 text-graphite" aria-hidden>
        {active && fill > 0 ? `${Math.round(fill * 100)}%` : 'Hold'}
      </span>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-rule" aria-hidden />
      <span
        className="pointer-events-none absolute bottom-0 left-0 h-[2px] origin-left bg-cobalt"
        style={{ width: '100%', transform: `scaleX(${fill})`, transition: 'transform 90ms linear' }}
        aria-hidden
      />
    </button>
  );
}
