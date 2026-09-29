import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check } from 'lucide-react';
import type { AnswerOption } from '../../tests/types';
import { GESTURE_META } from '../../vision/gestureEngine/messages';
import type { Gesture } from '../../vision/types';
import { useVision } from '../../vision/useVision';
import { GestureIcon } from '../GestureIcon/GestureIcon';

interface Props {
  options: AnswerOption[];
  layout: 'pair' | 'triple' | 'cross';
  selected: string | null;
  confirmed: boolean;
  disabled: boolean;
  onSelect: (value: string) => void;
}

const ARROW: Partial<Record<Gesture, typeof ArrowUp>> = { POINT_LEFT: ArrowLeft, POINT_RIGHT: ArrowRight, POINT_UP: ArrowUp, POINT_DOWN: ArrowDown };

function Cell({ o, state, hold, disabled, onSelect, compact }: { o: AnswerOption; state: 'idle' | 'selected' | 'confirmed'; hold: number; disabled: boolean; onSelect: () => void; compact: boolean }) {
  const meta = GESTURE_META[o.gesture];
  const tone =
    state === 'confirmed'
      ? 'border-accent bg-accent'
      : state === 'selected'
        ? 'border-accent bg-accent-wash text-ink'
        : 'border-rule bg-field text-ink hover:border-[var(--accent)]';
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={state !== 'idle'}
      aria-label={`${meta.name}: ${o.label}`}
      className={`relative flex w-full items-center overflow-hidden border-2 text-left transition-colors duration-150 disabled:cursor-default ${state === 'idle' ? 'disabled:opacity-45' : ''} ${tone} ${
        compact ? 'min-h-[clamp(66px,11vh,120px)] flex-col justify-center gap-1 p-2 text-center' : 'min-h-[clamp(64px,10vh,84px)] gap-4 p-2.5 pr-4'
      }`}
      style={{ borderRadius: 'var(--radius-control)' }}
    >
      {compact ? (
        <>
          <span className="flex items-center gap-2">
            <span
              className="flex h-[clamp(40px,6.4vh,54px)] w-[clamp(40px,6.4vh,54px)] shrink-0 items-center justify-center rounded-xl"
              style={{ background: state === 'confirmed' ? 'color-mix(in srgb, var(--accent-on) 18%, transparent)' : 'var(--accent-wash)', color: state === 'confirmed' ? undefined : 'var(--accent-text)' }}
            >
              <GestureIcon gesture={o.gesture} size="64%" strokeWidth={1.7} />
            </span>
            {o.glyph && <span className="text-[clamp(22px,3.4vh,30px)] font-semibold leading-none">{o.glyph}</span>}
          </span>
          <span className="block text-[clamp(14px,2.1vh,17px)] font-semibold leading-tight">{o.glyph ? (o.glyph === '∅' ? o.label : meta.name.replace('Указать ', '')) : o.label}</span>
        </>
      ) : (
        <>
          <span
            className="flex h-[clamp(48px,7.5vh,60px)] w-[clamp(48px,7.5vh,60px)] shrink-0 items-center justify-center rounded-xl"
            style={{ background: state === 'confirmed' ? 'color-mix(in srgb, var(--accent-on) 18%, transparent)' : 'var(--accent-wash)', color: state === 'confirmed' ? undefined : 'var(--accent-text)' }}
          >
            <GestureIcon gesture={o.gesture} size={34} strokeWidth={1.7} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[clamp(17px,2.5vh,20px)] font-semibold leading-tight">
              {o.swatch && <span className="mr-2 inline-block h-3 w-3 align-[1px]" style={{ background: o.swatch }} aria-hidden />}
              {o.label}
            </span>
            <span className={`mt-0.5 block text-[14px] ${state === 'confirmed' ? 'opacity-85' : 'text-graphite'}`}>{meta.name}</span>
          </span>
        </>
      )}
      {!compact &&
        (state === 'idle' ? (
          (() => {
            const Arrow = ARROW[o.gesture];
            return Arrow ? <Arrow size={32} strokeWidth={2} className="shrink-0 text-accent" aria-hidden /> : null;
          })()
        ) : state === 'confirmed' ? (
          <Check size={24} strokeWidth={2.5} aria-hidden />
        ) : (
          <span className="label text-accent">Выбрано</span>
        ))}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 origin-left bg-[var(--accent)]" style={{ transform: `scaleX(${hold})`, transition: 'transform 90ms linear' }} aria-hidden />
    </button>
  );
}

/** Response mapping: every answer shown with the gesture that selects it. */
export function ResponseMap({ options, layout, selected, confirmed, disabled, onSelect }: Props) {
  const { engine } = useVision();
  const by = (g: Gesture) => options.find((o) => o.gesture === g);
  const cell = (o: AnswerOption | undefined, compact: boolean) =>
    o ? (
      <Cell
        key={o.value}
        o={o}
        compact={compact}
        disabled={disabled}
        onSelect={() => onSelect(o.value)}
        hold={!disabled && engine.gesture === o.gesture && selected !== o.value ? engine.holdProgress : 0}
        state={selected === o.value ? (confirmed ? 'confirmed' : 'selected') : 'idle'}
      />
    ) : (
      <span aria-hidden />
    );

  if (layout === 'cross') {
    return (
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Варианты ответа">
        <span aria-hidden />
        {cell(by('POINT_UP'), true)}
        <span aria-hidden />
        {cell(by('POINT_LEFT'), true)}
        <span className="flex items-center justify-center text-graphite" aria-hidden>
          <span className="relative h-5 w-5">
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-rule-strong" />
            <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-rule-strong" />
          </span>
        </span>
        {cell(by('POINT_RIGHT'), true)}
        <span aria-hidden />
        {cell(by('POINT_DOWN'), true)}
        <span aria-hidden />
      </div>
    );
  }
  const order: Gesture[] = layout === 'triple' ? ['POINT_LEFT', 'POINT_UP', 'POINT_RIGHT'] : ['POINT_LEFT', 'POINT_RIGHT'];
  return (
    <div className="grid gap-2" role="group" aria-label="Варианты ответа">
      {order.map((g) => cell(by(g), false))}
    </div>
  );
}
