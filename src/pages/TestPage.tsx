import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ProtocolHeader } from '../components/Protocol/ProtocolHeader';
import { ResponseMap } from '../components/ResponseMap/ResponseMap';
import type { MachineState } from '../state/testMachine';
import type { AnyTest } from '../tests';

interface Props {
  test: AnyTest;
  state: MachineState;
  onSelect: (value: string) => void;
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

export function TestPage({ test, state, onSelect }: Props) {
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

      <div className="grid min-h-0 flex-1 gap-x-8 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(250px,290px)]">
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

        <aside aria-label="Ответ" className="flex min-h-0 flex-col">
          <h2 className="label border-b border-rule pb-2 text-accent">Ваш ответ</h2>
          <div className="pt-3">
            <ResponseMap
              options={options}
              layout={test.layout}
              selected={state.selected}
              confirmed={confirmed}
              disabled={!ready || confirmed}
              onSelect={onSelect}
            />
          </div>

          <div className="mt-4" aria-live="polite">
            {confirmed ? (
              <p key="c" className="animate-enter label flex items-center gap-1.5 border-t border-accent pt-3 text-accent">
                <Check size={14} strokeWidth={2.5} aria-hidden /> Ответ принят: {selectedOpt?.label}
              </p>
            ) : selectedOpt ? (
              <div key={`s${selectedOpt.value}`} className="animate-enter border-t border-accent pt-3">
                <p className="label text-accent">Выбрано</p>
                <p className="mt-1 text-[17px] font-medium text-ink">{selectedOpt.label}</p>
                <p className="mt-1 text-[14px] text-graphite">Кулак — подтвердить, ладонь — отменить.</p>
              </div>
            ) : !ready ? (
              <div className="border-t border-rule pt-3">
                <p className="label text-graphite">
                  Смотрите · <span className="num">00:{String(secondsLeft).padStart(2, '0')}</span>
                </p>
                <p className="mt-1 text-[14px] text-graphite">Ответы откроются через мгновение.</p>
              </div>
            ) : (
              <div className="border-t border-rule pt-3">
                <p className="label text-graphite">Жду ответ</p>
                <p className="mt-1 text-[14px] text-graphite">Укажите пальцем, затем кулак.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
