import type { AnswerOption } from '../../tests/types';
import type { Gesture } from '../../vision/types';
import { useVision } from '../../vision/useVision';
import { GestureIcon } from '../GestureIcon/GestureIcon';

interface Props {
  options: AnswerOption[];
  selected: string | null;
  confirmed: boolean;
  ready: boolean;
  onSelect: (value: string) => void;
  onGesture: (g: 'FIST' | 'OPEN_PALM') => void;
}

const ORDER: Gesture[] = ['POINT_LEFT', 'POINT_UP', 'POINT_DOWN', 'POINT_RIGHT'];

/** Narrow screens: the response pad stays pinned in the first viewport. */
export function MobileResponseBar({ options, selected, confirmed, ready, onSelect, onGesture }: Props) {
  const { engine } = useVision();
  const opts = ORDER.map((g) => options.find((o) => o.gesture === g)).filter(Boolean) as AnswerOption[];
  const hold = (g: Gesture) => (engine.gesture === g ? engine.holdProgress : 0);
  const sel = options.find((o) => o.value === selected);
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink bg-paper px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-2.5 lg:hidden" aria-label="Ответ">
      <div className="flex items-baseline justify-between pb-2">
        <span className={`label ${confirmed || sel ? 'text-accent' : 'text-graphite'}`}>
          {confirmed ? 'Ответ принят' : sel ? `Подтвердите: ${sel.label}` : ready ? 'Ваш ответ' : 'Смотрите на изображение'}
        </span>
        
      </div>
      <div className={`grid gap-1.5 ${opts.length === 4 ? 'grid-cols-4' : opts.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {opts.map((o) => {
          const on = selected === o.value;
          return (
            <button
              key={o.value}
              type="button"
              disabled={!ready || confirmed}
              onClick={() => onSelect(o.value)}
              aria-pressed={on}
              className={`relative flex min-h-12 flex-col items-center justify-center gap-0.5 border px-1 py-1.5 text-center text-[12px] leading-tight ${on ? '' : 'disabled:opacity-40'} ${
                on ? (confirmed ? 'border-accent bg-accent' : 'border-accent bg-accent-wash text-accent') : 'border-rule text-ink'
              }`}
              style={{ borderRadius: 'var(--radius-control)' }}
            >
              <GestureIcon gesture={o.gesture} size={18} />
              <span className="line-clamp-2">{o.glyph ?? o.label}</span>
              <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[var(--accent)]" style={{ transform: `scaleX(${on ? 0 : hold(o.gesture)})` }} aria-hidden />
            </button>
          );
        })}
      </div>
      {sel && !confirmed && (
        <div className="mt-1.5 grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-1.5">
          <button
            type="button"
            onClick={() => onGesture('FIST')}
            className="bg-accent relative flex min-h-11 items-center justify-center gap-2 text-[15px] font-medium"
            style={{ borderRadius: 'var(--radius-control)' }}
          >
            <GestureIcon gesture="FIST" size={16} /> Подтвердить
            <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[var(--accent)]" style={{ transform: `scaleX(${hold('FIST')})` }} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onGesture('OPEN_PALM')}
            className="flex min-h-11 items-center justify-center gap-2 border border-rule text-[14px] text-ink"
            style={{ borderRadius: 'var(--radius-control)' }}
          >
            <GestureIcon gesture="OPEN_PALM" size={16} /> Отмена
          </button>
        </div>
      )}
    </div>
  );
}
