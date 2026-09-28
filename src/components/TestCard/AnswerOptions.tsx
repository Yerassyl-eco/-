import { GESTURE_META } from '../../vision/gestureEngine/messages';
import type { Gesture } from '../../vision/types';
import type { AnswerOption } from '../../tests/types';

interface Props {
  options: AnswerOption[];
  layout: 'pair' | 'triple' | 'cross';
  selected: string | null;
  confirmed: boolean;
  disabled: boolean;
  onSelect: (value: string) => void;
}

function OptionCard({ o, selected, confirmed, disabled, onSelect, compact }: { o: AnswerOption; selected: boolean; confirmed: boolean; disabled: boolean; onSelect: () => void; compact?: boolean }) {
  const meta = GESTURE_META[o.gesture];
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${meta.name}: ${o.label}`}
      className={`relative flex w-full items-center gap-3 rounded-2xl border-2 bg-white text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-45 ${
        compact ? 'flex-col justify-center gap-1 px-2 py-2.5 text-center' : 'px-4 py-3'
      } ${
        selected
          ? confirmed
            ? 'scale-[1.03] border-success-500 shadow-[0_0_0_6px_rgba(22,163,74,0.15)]'
            : 'scale-[1.03] border-accent-500 shadow-[0_0_0_6px_rgba(59,108,246,0.18),var(--shadow-float)]'
          : 'border-line shadow-sm hover:border-accent-200'
      }`}
    >
      <span className={`emoji flex shrink-0 items-center justify-center rounded-xl bg-slate-50 ${compact ? 'h-9 w-9 text-xl' : 'h-11 w-11 text-2xl'}`} aria-hidden>
        {meta.emoji}
      </span>
      <span className="min-w-0">
        {o.glyph && !compact && <span className="mr-1 text-lg font-black text-slate-900">{o.glyph}</span>}
        {compact && o.glyph ? (
          <span className="block text-xl font-black leading-none text-slate-900">{o.glyph}</span>
        ) : null}
        <span className={`font-bold text-slate-800 ${compact ? 'block text-[11px] leading-tight text-slate-600' : 'text-[15px]'}`}>{o.label}</span>
      </span>
      {selected && (
        <span
          className={`absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-white ${confirmed ? 'bg-success-500' : 'bg-accent-500'} animate-pop-in`}
          aria-hidden
        >
          {confirmed ? '✓' : '•'}
        </span>
      )}
    </button>
  );
}

/** Answer choices laid out to mirror the gesture direction. */
export function AnswerOptions({ options, layout, selected, confirmed, disabled, onSelect }: Props) {
  const by = (g: Gesture) => options.find((o) => o.gesture === g);
  const card = (o: AnswerOption | undefined, compact = false) =>
    o ? (
      <OptionCard
        key={o.value}
        o={o}
        compact={compact}
        selected={selected === o.value}
        confirmed={confirmed && selected === o.value}
        disabled={disabled}
        onSelect={() => onSelect(o.value)}
      />
    ) : (
      <span />
    );

  if (layout === 'cross') {
    return (
      <div className="mx-auto grid w-full max-w-[380px] grid-cols-3 gap-2" role="group" aria-label="Варианты ответа">
        <span />
        {card(by('POINT_UP'), true)}
        <span />
        {card(by('POINT_LEFT'), true)}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-1 text-center text-[11px] font-semibold leading-tight text-slate-500">
          <span className="emoji text-xl" aria-hidden>✊</span>
          подтвердить
        </div>
        {card(by('POINT_RIGHT'), true)}
        <span />
        {card(by('POINT_DOWN'), true)}
        <span />
      </div>
    );
  }

  return (
    <div className={`grid gap-3 ${layout === 'triple' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`} role="group" aria-label="Варианты ответа">
      {layout === 'triple' ? (
        <>
          {card(by('POINT_LEFT'))}
          {card(by('POINT_UP'))}
          {card(by('POINT_RIGHT'))}
        </>
      ) : (
        options.map((o) => card(o))
      )}
    </div>
  );
}
