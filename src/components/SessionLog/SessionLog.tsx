import { Check, X } from 'lucide-react';
import type { AnswerOption, AnswerRecord } from '../../tests/types';
import { GestureIcon } from '../GestureIcon/GestureIcon';

interface Props {
  total: number;
  /** Index of the trial on screen; -1 when the test is finished. */
  current: number;
  records: AnswerRecord[];
  optionsFor: (trialIndex: number) => AnswerOption[];
  /** performance.now() when the test started — rows are time-coded from it. */
  startedAt: number;
  /** Results view: show expected answer and correctness. */
  expectedFor?: (trialIndex: number) => string | null;
}

function timecode(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** Time-coded session log, one row per recorded trial (the lab runner's data file). */
export function SessionLog({ total, current, records, optionsFor, startedAt, expectedFor }: Props) {
  const showExpected = !!expectedFor;
  const rows = [...records].sort((a, b) => a.trialIndex - b.trialIndex);
  const cols = showExpected ? 'grid-cols-[3rem_4rem_minmax(0,1fr)_minmax(0,1fr)_5rem]' : 'grid-cols-[3rem_4rem_minmax(0,1fr)_5rem]';
  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-ink pb-2">
        <span className="label text-ink">Session log</span>
        <span className="num text-xs text-graphite">
          {String(records.length).padStart(2, '0')} / {String(total).padStart(2, '0')} recorded
        </span>
      </div>
      <div className={`label grid ${cols} gap-x-3 border-b border-rule py-2 text-graphite`} aria-hidden>
        <span>Trial</span>
        <span>Time</span>
        <span>Answer</span>
        {showExpected && <span>Expected</span>}
        <span className="text-right">Latency</span>
      </div>
      <ol aria-label="Журнал ответов">
        {rows.map((r) => {
          const opt = optionsFor(r.trialIndex).find((o) => o.value === r.value);
          const expected = expectedFor?.(r.trialIndex) ?? null;
          return (
            <li key={r.trialIndex} className={`animate-enter grid ${cols} items-center gap-x-3 border-b border-rule py-2 text-[14px]`}>
              <span className="num text-graphite">T{String(r.trialIndex + 1).padStart(2, '0')}</span>
              <span className="num text-graphite">{timecode(r.at - startedAt)}</span>
              <span className="flex min-w-0 items-center gap-2 text-ink">
                {opt && <GestureIcon gesture={opt.gesture} size={15} className="shrink-0" />}
                <span className="min-w-0">{opt?.label ?? r.value}</span>
              </span>
              {showExpected && (
                <span className="flex min-w-0 items-center gap-2 text-graphite">
                  {r.correct === null ? (
                    '—'
                  ) : (
                    <>
                      <span className={r.correct ? 'text-ink' : 'text-amber'} aria-label={r.correct ? 'совпадает' : 'не совпадает'}>
                        {r.correct ? <Check size={14} strokeWidth={2.25} /> : <X size={14} strokeWidth={2.25} />}
                      </span>
                      <span className="min-w-0">{expected}</span>
                    </>
                  )}
                </span>
              )}
              <span className="num text-right text-graphite">{(r.reactionMs / 1000).toFixed(1)} s</span>
            </li>
          );
        })}
        {current >= 0 && current < total && !records.some((r) => r.trialIndex === current) && (
          <li className={`grid ${cols} items-center gap-x-3 border-b border-rule py-2 text-[14px]`} aria-current="step">
            <span className="num text-cobalt">T{String(current + 1).padStart(2, '0')}</span>
            <span className="num text-graphite">—</span>
            <span className="text-graphite">ожидание ответа</span>
            {showExpected && <span />}
            <span className="flex justify-end">
              <span className="animate-blink h-1.5 w-1.5 rounded-full bg-cobalt" aria-hidden />
            </span>
          </li>
        )}
      </ol>
    </div>
  );
}
