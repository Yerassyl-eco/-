import type { PhaseGuide } from '../../state/phaseActions';

/** Always-visible line at the bottom: what to do right now, in plain words. */
export function ActionBar({ guide }: { guide: PhaseGuide }) {
  if (!guide.hint) return null;
  return (
    <div className="shrink-0 border-t border-rule bg-paper">
      <div className="mx-auto max-w-[1440px] px-5 py-3 sm:px-10">
        <p className="text-[clamp(17px,2.5vh,20px)] font-medium leading-snug text-ink" aria-live="polite">
          {guide.hint}
        </p>
      </div>
    </div>
  );
}
