import { GESTURE_META } from '../../vision/gestureEngine/messages';
import type { Gesture } from '../../vision/types';
import { useVision } from '../../vision/useVision';
import { GestureIcon } from '../GestureIcon/GestureIcon';

interface Props {
  gesture: Gesture;
  /** What it does: "чтобы продолжить". */
  action: string;
  /** Large for the one main action of a screen, medium for secondary ones. */
  size?: 'lg' | 'md';
  /** Greyed out when the gesture does nothing yet (e.g. confirm before a choice). */
  disabled?: boolean;
  /** Secondary actions sit on the paper instead of the accent fill. */
  quiet?: boolean;
  onTrigger?: () => void;
}

export const SHOW_GESTURE: Partial<Record<Gesture, string>> = {
  THUMBS_UP: 'Покажите палец вверх',
  FIST: 'Покажите кулак',
  OPEN_PALM: 'Покажите ладонь',
  OK: 'Покажите знак «ОК»',
  POINT_LEFT: 'Укажите пальцем влево',
  POINT_RIGHT: 'Укажите пальцем вправо',
  POINT_UP: 'Укажите пальцем вверх',
  POINT_DOWN: 'Укажите пальцем вниз',
};

/**
 * The gesture a screen is waiting for, shown where the eye already is:
 * a big pictogram, a plain instruction, and a bar that fills while it is held.
 * Also a real button, so it works with a pointer as a fallback.
 */
export function GesturePrompt({ gesture, action, size = 'lg', disabled = false, quiet = false, onTrigger }: Props) {
  const { engine } = useVision();
  const fill = !disabled && engine.gesture === gesture ? (engine.stable ? 1 : engine.holdProgress) : 0;
  const lg = size === 'lg';
  const say = SHOW_GESTURE[gesture] ?? GESTURE_META[gesture].name;
  return (
    <button
      type="button"
      onClick={onTrigger}
      disabled={disabled}
      aria-label={`${say} ${action}`}
      className={`group relative flex items-center overflow-hidden text-left transition-[opacity,transform] duration-200 hover:-translate-y-px disabled:opacity-35 ${
        lg ? 'gap-5 p-3 pr-7' : 'gap-3.5 p-2 pr-5'
      } ${quiet ? 'border border-rule bg-field text-ink' : 'bg-accent'}`}
      style={{ borderRadius: lg ? 'var(--radius-card)' : 'var(--radius-control)', boxShadow: quiet ? undefined : 'var(--shadow-card)' }}
    >
      <span
        className={`relative flex shrink-0 items-center justify-center ${lg ? 'h-[clamp(64px,10vh,88px)] w-[clamp(64px,10vh,88px)] rounded-[18px]' : 'h-12 w-12 rounded-xl'}`}
        style={{
          background: quiet ? 'var(--accent-wash)' : 'color-mix(in srgb, var(--accent-on) 18%, transparent)',
          color: quiet ? 'var(--accent-text)' : undefined,
        }}
      >
        <span className={`flex h-[58%] w-[58%] items-center justify-center ${!disabled && !fill && lg && !quiet ? 'animate-nudge' : ''}`}>
          <GestureIcon gesture={gesture} size="100%" strokeWidth={lg ? 1.6 : 1.75} />
        </span>
      </span>
      <span className="min-w-0 leading-tight">
        <span className={`block font-semibold ${lg ? 'text-[clamp(20px,3vh,26px)]' : 'text-[17px]'}`}>{say}</span>
        <span className={`mt-0.5 block ${lg ? 'text-[clamp(16px,2.3vh,20px)]' : 'text-[15px]'} ${quiet ? 'text-graphite' : 'opacity-90'}`}>{action}</span>
      </span>
      <span
        className="pointer-events-none absolute bottom-0 left-0 h-1.5 w-full origin-left"
        style={{ background: quiet ? 'var(--accent)' : 'var(--accent-on)', opacity: quiet ? 1 : 0.7, transform: `scaleX(${fill})`, transition: 'transform 90ms linear' }}
        aria-hidden
      />
    </button>
  );
}
