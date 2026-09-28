import { useEffect, useState } from 'react';
import { AnswerOptions } from '../components/TestCard/AnswerOptions';
import type { MachineState } from '../state/testMachine';
import type { AnyTest } from '../tests';
import { Check, Hand } from 'lucide-react';
import { GestureIcon } from '../components/GestureIcon/GestureIcon';

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-600">
            Тест {test.number} из 5 · {test.title}
          </p>
          <h1 className="mt-1 text-xl font-extrabold leading-snug text-slate-950 sm:text-2xl">{test.prompt(trial)}</h1>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-line">
          Задание {state.trialIndex + 1} / {trials.length}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
        <div className="flex min-h-[clamp(220px,34vh,440px)] flex-col [&>*]:flex-1">
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
        <div className="lg:order-last">
          <AnswerOptions
            options={options}
            layout={test.layout}
            selected={state.selected}
            confirmed={confirmed}
            disabled={!ready || confirmed}
            onSelect={onSelect}
          />
        </div>
      </div>

      {/* selection / confirmation status */}
      <div className="min-h-[64px]" aria-live="polite" role="status">
        {confirmed ? (
          <div key="confirmed" className="animate-pop-in flex items-center gap-3 rounded-2xl bg-success-500 px-4 py-3 text-white shadow-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25" aria-hidden><Check size={20} strokeWidth={3} /></span>
            <p className="text-lg font-extrabold">Ответ принят</p>
          </div>
        ) : selectedOpt ? (
          <div key={`sel-${selectedOpt.value}`} className="animate-pop-in flex flex-wrap items-center gap-3 rounded-2xl bg-accent-500 px-4 py-3 text-white shadow-[var(--shadow-float)]">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25"><GestureIcon gesture={selectedOpt.gesture} size={24} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/80">Распознан ответ</p>
              <p className="text-lg font-extrabold leading-tight">{selectedOpt.label}</p>
            </div>
            <p className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-accent-700">
              <GestureIcon gesture="FIST" size={18} /> Покажите кулак, чтобы подтвердить
            </p>
          </div>
        ) : !ready ? (
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-line">
            <span className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
              <span className="block h-full rounded-full bg-accent-500" style={{ width: `${progress * 100}%` }} />
            </span>
            <p className="text-sm font-semibold text-slate-700">Смотрите на изображение — ответы откроются через мгновение</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-line">
            <Hand size={22} className="shrink-0 text-accent-500" aria-hidden />
            <p className="text-sm font-semibold text-slate-700">Покажите ответ жестом, затем подтвердите ✊. ✋ — отменить выбор.</p>
          </div>
        )}
      </div>

    </div>
  );
}
