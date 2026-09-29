import { GESTURE_META } from '../../vision/gestureEngine/messages';
import type { Gesture } from '../../vision/types';
import { useVision } from '../../vision/useVision';
import type { PhaseGuide } from '../../state/phaseActions';
import { GestureIcon } from '../GestureIcon/GestureIcon';

/** One gesture action: a real button (fallback) that fills while the gesture is held. */
function Cue({ gesture, label, primary, disabled, onTrigger }: { gesture: Gesture; label: string; primary?: boolean; disabled?: boolean; onTrigger: () => void }) {
  const { engine } = useVision();
  const fill = !disabled && engine.gesture === gesture ? (engine.stable ? 1 : engine.holdProgress) : 0;
  const meta = GESTURE_META[gesture];
  return (
    <button
      type="button"
      onClick={onTrigger}
      disabled={disabled}
      aria-label={`${label}: жест «${meta.name}»`}
      className={`relative flex min-h-[52px] shrink-0 items-center gap-3 overflow-hidden py-2 pl-2 pr-5 text-left transition-[background-color,opacity] duration-200 disabled:opacity-35 ${
        primary ? 'bg-accent' : 'border border-rule bg-field text-ink'
      }`}
      style={{ borderRadius: 'var(--radius-control)' }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
        style={{ background: primary ? 'color-mix(in srgb, var(--accent-on) 16%, transparent)' : 'var(--accent-wash)', color: primary ? undefined : 'var(--accent-text)' }}
      >
        <GestureIcon gesture={gesture} size={20} strokeWidth={1.75} />
      </span>
      <span className="leading-tight">
        <span className="block text-[16px] font-semibold">{label}</span>
        <span className={`block text-[13px] ${primary ? 'opacity-85' : 'text-graphite'}`}>{meta.name}</span>
      </span>
      <span
        className="pointer-events-none absolute bottom-0 left-0 h-1 w-full origin-left"
        style={{ background: primary ? 'var(--accent-on)' : 'var(--accent)', opacity: primary ? 0.6 : 1, transform: `scaleX(${fill})`, transition: 'transform 90ms linear' }}
        aria-hidden
      />
    </button>
  );
}

/**
 * Always-visible strip at the bottom of the screen: what to do now and which
 * gestures work here. Nothing the user needs is ever below the fold.
 */
export function ActionBar({ guide, onGesture }: { guide: PhaseGuide; onGesture: (g: Gesture) => void }) {
  const { engine } = useVision();
  if (!guide.actions.length) return null;
  return (
    <nav aria-label="Доступные жесты" className="shrink-0 border-t border-rule bg-paper">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-5 gap-y-2 px-5 py-2.5 sm:px-10">
        <p className="min-w-0 flex-1 basis-[16rem] text-[15px] leading-snug text-ink" aria-live="polite">
          {guide.hint}
        </p>
        {guide.choose && guide.choose.gestures.length > 0 && (
          <div className="flex items-center gap-2" aria-label={guide.choose.label}>
            <span className="text-[13px] text-graphite">{guide.choose.label}:</span>
            {guide.choose.gestures.map((g) => {
              const on = engine.gesture === g;
              return (
                <span
                  key={g}
                  title={GESTURE_META[g].name}
                  className={`flex h-9 w-9 items-center justify-center rounded-[10px] border transition-colors ${on ? 'border-accent bg-accent-wash text-accent' : 'border-rule bg-field text-ink'}`}
                >
                  <GestureIcon gesture={g} size={19} strokeWidth={1.75} />
                  <span className="sr-only">{GESTURE_META[g].name}</span>
                </span>
              );
            })}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {guide.actions.map((a) => (
            <Cue key={a.gesture} {...a} onTrigger={() => onGesture(a.gesture)} />
          ))}
        </div>
      </div>
    </nav>
  );
}
