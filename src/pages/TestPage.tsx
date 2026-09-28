import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GestureCue } from '../components/Cue/GestureCue';
import { ProtocolHeader } from '../components/Protocol/ProtocolHeader';
import { ResponseMap } from '../components/ResponseMap/ResponseMap';
import { SessionLog } from '../components/SessionLog/SessionLog';
import type { MachineState } from '../state/testMachine';
import type { AnyTest } from '../tests';

interface Props {
  test: AnyTest;
  state: MachineState;
  onGesture: (g: 'FIST' | 'OPEN_PALM') => void;
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

export function TestPage({ test, state, onGesture, onSelect }: Props) {
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
    <div className="flex flex-col gap-8">
      <ProtocolHeader
        index={String(test.number).padStart(2, '0')}
        title={test.title}
        subtitle={test.titleEn}
        aside={
          <span className="num text-[13px] text-graphite">
            TRIAL <span className="text-ink">{String(state.trialIndex + 1).padStart(2, '0')}</span> / {String(trials.length).padStart(2, '0')}
          </span>
        }
      />

      <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
        <div className="flex flex-col gap-4">
          <div className="flex h-[clamp(240px,40vh,380px)] flex-col lg:h-[clamp(300px,52vh,560px)]">
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
          <p className="max-w-[60ch] text-[20px] leading-snug text-ink">{test.prompt(trial)}</p>
        </div>

        <aside aria-label="Ответ" className="flex flex-col">
          <h2 className="label border-b border-rule pb-2 text-graphite">Response</h2>
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

          <div className="mt-5 min-h-[152px]" aria-live="polite">
            {confirmed ? (
              <div key="c" className="animate-enter border-t border-green pt-3">
                <p className="label flex items-center gap-1.5 text-green">
                  <Check size={14} strokeWidth={2.5} aria-hidden /> Confirmed
                </p>
                <p className="mt-2 text-[15px] text-ink">
                  Ответ записан в журнал: {selectedOpt?.label}, T{String(state.trialIndex + 1).padStart(2, '0')}.
                </p>
              </div>
            ) : selectedOpt ? (
              <div key={`s${selectedOpt.value}`} className="animate-enter border-t border-cobalt">
                <p className="label pt-3 text-cobalt">Confirm · {selectedOpt.label}</p>
                <GestureCue gesture="FIST" action="Подтвердить ответ" primary onTrigger={() => onGesture('FIST')} />
                <GestureCue gesture="OPEN_PALM" action="Отменить выбор" onTrigger={() => onGesture('OPEN_PALM')} />
              </div>
            ) : !ready ? (
              <div className="border-t border-rule pt-3">
                <p className="label text-graphite">
                  Observe · <span className="num">00:{String(secondsLeft).padStart(2, '0')}</span>
                </p>
                <p className="mt-2 text-[15px] text-graphite">Смотрите на изображение. Ответы откроются через мгновение.</p>
              </div>
            ) : (
              <div className="border-t border-rule pt-3">
                <p className="label text-graphite">Awaiting response</p>
                <p className="mt-2 text-[15px] text-graphite">Покажите ответ указательным пальцем, затем подтвердите кулаком.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <SessionLog
        total={trials.length}
        current={state.trialIndex}
        records={state.answers[state.testIndex]}
        optionsFor={(i) => test.options(trials[i])}
      />
    </div>
  );
}
