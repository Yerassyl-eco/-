import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ProtocolHeader } from '../components/Protocol/ProtocolHeader';
import { GesturePrompt } from '../components/Cue/GesturePrompt';
import { GestureIcon } from '../components/GestureIcon/GestureIcon';
import { ResponseMap } from '../components/ResponseMap/ResponseMap';
import type { MachineState } from '../state/testMachine';
import type { AnyTest } from '../tests';

interface Props {
  test: AnyTest;
  state: MachineState;
  onSelect: (value: string) => void;
  onGesture: (g: 'FIST' | 'OPEN_PALM') => void;
}

/** Observation countdown (0..1), driven by the machine's trialReadyAt. */
function useObserveProgress(shownAt: number, readyAt: number) {
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    if (readyAt <= shownAt) return;
    let raf = 0;
    const tick = () => {
      const t = performance.now();
      setNow(t);
      if (t < readyAt) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shownAt, readyAt]);
  if (readyAt <= shownAt) return 1;
  return Math.min(1, Math.max(0, (now - shownAt) / (readyAt - shownAt)));
}

export function TestPage({ test, state, onSelect, onGesture }: Props) {
  const trials = state.trials[state.testIndex];
  const trial = trials[state.trialIndex];
  const options = test.options(trial);
  const progress = useObserveProgress(state.trialShownAt, state.trialReadyAt);
  const ready = progress >= 1;
  const confirmed = state.phase === 'ANSWER_CONFIRMED';
  const selectedOpt = options.find((o) => o.value === state.selected);
  const Stimulus = test.Stimulus;
  const secondsLeft = Math.max(1, Math.ceil(((1 - progress) * (state.trialReadyAt - state.trialShownAt)) / 1000));

  return (
    <div className="flex h-full min-h-0 flex-col gap-[clamp(12px,2.2vh,24px)]">
      <ProtocolHeader
        index={String(test.number).padStart(2, '0')}
        title={test.title}
        compact
        aside={
          <span className="num text-[14px] text-graphite">
            Задание <span className="text-ink">{String(state.trialIndex + 1).padStart(2, '0')}</span> / {String(trials.length).padStart(2, '0')}
          </span>
        }
      />

      <div className="grid min-h-0 flex-1 gap-x-8 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
        <div className="flex min-h-[260px] flex-col gap-3">
          <div className="flex min-h-0 flex-1 flex-col">
            <Stimulus
              trial={trial}
              trialIndex={state.trialIndex}
              trialCount={trials.length}
              selected={state.selected}
              confirmed={confirmed}
              ready={ready}
              observeProgress={progress}
            />
          </div>
          <p className="display max-w-[46ch] text-[clamp(18px,2.6vh,24px)] leading-snug text-ink">{test.prompt(trial)}</p>
        </div>

        <aside aria-label="Ответ" className="flex min-h-0 flex-col gap-[clamp(10px,2vh,16px)]">
          <h2 className="text-[clamp(17px,2.5vh,21px)] font-semibold text-ink">
            {confirmed ? 'Ответ принят' : !ready ? `Смотрите на изображение · ${secondsLeft} с` : '1. Укажите пальцем ответ'}
          </h2>
          <ResponseMap
            options={options}
            layout={test.layout}
            selected={state.selected}
            confirmed={confirmed}
            disabled={!ready || confirmed}
            onSelect={onSelect}
          />
          <div aria-live="polite" className="flex flex-col gap-2">
            <h2 className={`text-[clamp(17px,2.5vh,21px)] font-semibold ${selectedOpt && !confirmed ? 'text-ink' : 'text-graphite'}`}>2. Подтвердите</h2>
            {confirmed ? (
              <p key="c" className="animate-enter flex items-center gap-2 text-[18px] font-medium text-accent">
                <Check size={22} strokeWidth={2.5} aria-hidden /> Записано: {selectedOpt?.label}
              </p>
            ) : (
              <>
                <GesturePrompt gesture="FIST" action="чтобы подтвердить ответ" disabled={!selectedOpt} onTrigger={() => onGesture('FIST')} />
                {selectedOpt && (
                  <button type="button" onClick={() => onGesture('OPEN_PALM')} className="flex items-center gap-2 self-start text-[16px] text-graphite hover:text-ink">
                    <GestureIcon gesture="OPEN_PALM" size={22} strokeWidth={1.7} className="text-accent" /> Ошиблись? Покажите ладонь, чтобы отменить
                  </button>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
