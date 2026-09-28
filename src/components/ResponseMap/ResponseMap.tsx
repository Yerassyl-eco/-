import { Check } from 'lucide-react';
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

function Cell({ o, state, hold, disabled, onSelect, compact }: { o: AnswerOption; state: 'idle' | 'selected' | 'confirmed'; hold: number; disabled: boolean; onSelect: () => void; compact: boolean }) {
  const meta = GESTURE_META[o.gesture];
  const tone =
    state === 'confirmed'
      ? 'border-green text-green bg-green-wash'
      : state === 'selected'
        ? 'border-cobalt text-cobalt bg-cobalt-wash'
        : 'border-rule text-ink hover:border-ink';
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={state !== 'idle'}
      aria-label={`${meta.name}: ${o.label}`}
      className={`relative flex w-full items-center border bg-field text-left transition-colors duration-150 disabled:cursor-default disabled:opacity-40 ${tone} ${
        compact ? 'min-h-[64px] flex-col justify-center gap-1 px-2 py-2 text-center' : 'min-h-[56px] gap-3 px-3.5 py-3'
      }`}
      style={{ borderRadius: 'var(--radius-hair)' }}
    >
      <GestureIcon gesture={o.gesture} size={compact ? 18 : 20} className="shrink-0" />
      <span className="min-w-0 flex-1">
        {o.glyph && compact && <span className="block text-[22px] font-medium leading-none">{o.glyph}</span>}
        <span className={`block leading-tight ${compact ? 'text-[12px]' : 'text-[15px]'}`}>
          {o.swatch && <span className="mr-2 inline-block h-2.5 w-2.5 align-[1px]" style={{ background: o.swatch }} aria-hidden />}
          {o.label}
        </span>
      </span>
      {!compact && state !== 'idle' && (state === 'confirmed' ? <Check size={16} strokeWidth={2} aria-hidden /> : <span className="label">Выбрано</span>)}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left bg-cobalt" style={{ transform: `scaleX(${hold})`, transition: 'transform 90ms linear' }} aria-hidden />
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
      <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Варианты ответа">
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
    <div className="grid gap-1.5" role="group" aria-label="Варианты ответа">
      {order.map((g) => cell(by(g), false))}
    </div>
  );
}
