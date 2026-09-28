import { Check, X } from 'lucide-react';
import type { AnswerOption, AnswerRecord } from '../../tests/types';
import { GestureIcon } from '../GestureIcon/GestureIcon';

interface Props {
  total: number;
  current: number;
  records: AnswerRecord[];
  optionsFor: (trialIndex: number) => AnswerOption[];
  /** Hide correctness while the test runs. */
  showCorrect?: boolean;
}

/** Session log strip: one cell per trial, filled as answers are recorded. */
export function SessionLog({ total, current, records, optionsFor, showCorrect = false }: Props) {
  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-rule pb-2">
        <span className="label text-graphite">Session log</span>
        <span className="num text-xs text-graphite">
          {String(records.length).padStart(2, '0')} / {String(total).padStart(2, '0')} recorded
        </span>
      </div>
      <ol className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] border-l border-rule" aria-label="Журнал ответов">
        {Array.from({ length: total }, (_, i) => {
          const r = records.find((x) => x.trialIndex === i);
          const opt = r ? optionsFor(i).find((o) => o.value === r.value) : undefined;
          const isCur = i === current && !r;
          return (
            <li
              key={i}
              className={`relative border-b border-r border-rule px-2.5 py-2 ${r ? 'bg-field' : ''}`}
              aria-current={isCur ? 'step' : undefined}
            >
              {isCur && <span className="absolute inset-x-0 top-0 h-[2px] bg-cobalt" />}
              <span className={`num block text-xs ${isCur ? 'text-cobalt' : 'text-graphite'}`}>T{String(i + 1).padStart(2, '0')}</span>
              {r && opt ? (
                <span key={r.at} className="animate-enter mt-1 flex items-center gap-1.5 text-[13px] text-ink">
                  <GestureIcon gesture={opt.gesture} size={14} />
                  <span className="truncate">{opt.glyph ?? opt.label}</span>
                  {showCorrect && r.correct !== null && (
                    <span className={`ml-auto ${r.correct ? 'text-green' : 'text-amber'}`} aria-label={r.correct ? 'верно' : 'неверно'}>
                      {r.correct ? <Check size={13} strokeWidth={2.25} /> : <X size={13} strokeWidth={2.25} />}
                    </span>
                  )}
                </span>
              ) : (
                <span className="mt-1 block text-[13px] text-graphite">{isCur ? 'ожидание' : '—'}</span>
              )}
              {r && <span className="num block text-xs text-graphite">{(r.reactionMs / 1000).toFixed(1)} s</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
