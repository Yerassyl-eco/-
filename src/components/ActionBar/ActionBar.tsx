import { Volume2 } from 'lucide-react';
import type { PhaseGuide } from '../../state/phaseActions';
import { speak } from '../../utils/voice';

/**
 * Always-visible line at the bottom: what to do right now, in plain words.
 * The same sentence is spoken aloud; the gesture itself is shown large on the page.
 */
export function ActionBar({ guide }: { guide: PhaseGuide }) {
  if (!guide.hint) return null;
  return (
    <div className="shrink-0 border-t border-rule bg-paper">
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-5 py-3 sm:px-10">
        <button
          type="button"
          onClick={() => speak(guide.hint, { force: true })}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-wash text-accent transition-colors hover:bg-accent hover:text-[var(--accent-on)]"
          aria-label="Прочитать подсказку вслух"
        >
          <Volume2 size={20} strokeWidth={1.8} aria-hidden />
        </button>
        <p className="min-w-0 text-[clamp(17px,2.5vh,20px)] font-medium leading-snug text-ink" aria-live="polite">
          {guide.hint}
        </p>
      </div>
    </div>
  );
}
