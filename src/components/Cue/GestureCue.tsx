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
 * Action driven by a gesture. A bar along its lower edge fills live while
 * the user holds that gesture. Also a real button (mouse / keyboard fallback).
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
      className={`group relative flex w-full items-center gap-4 overflow-hidden px-4 py-3.5 text-left transition-[transform,background-color] duration-150 hover:-translate-y-px disabled:cursor-default disabled:opacity-40 ${
        primary ? 'bg-accent' : 'border border-rule bg-field text-ink hover:border-ink'
      }`}
      style={{ borderRadius: 'var(--radius-control)', boxShadow: primary ? 'var(--shadow-card)' : undefined }}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ background: primary ? 'color-mix(in srgb, var(--accent-on) 16%, transparent)' : 'var(--accent-wash)', color: primary ? undefined : 'var(--accent-text)' }}
      >
        <GestureIcon gesture={gesture} size={22} strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block font-semibold leading-tight ${primary ? 'text-[18px]' : 'text-[16px]'}`}>{action}</span>
        <span className={`mt-0.5 block text-[14px] ${primary ? 'opacity-85' : 'text-graphite'}`}>{meta.name}</span>
      </span>
      <span className={`num shrink-0 text-[13px] ${primary ? 'opacity-85' : 'text-graphite'}`} aria-hidden>
        {active && fill > 0 ? `${Math.round(fill * 100)}%` : ''}
      </span>
      <span
        className="pointer-events-none absolute bottom-0 left-0 h-1 w-full origin-left"
        style={{
          background: primary ? 'var(--accent-on)' : 'var(--accent)',
          opacity: primary ? 0.55 : 1,
          transform: `scaleX(${fill})`,
          transition: 'transform 90ms linear',
        }}
        aria-hidden
      />
    </button>
  );
}
