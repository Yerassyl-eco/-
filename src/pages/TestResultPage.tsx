import { Check } from 'lucide-react';
import { GestureCue } from '../components/Cue/GestureCue';
import { ProtocolHeader } from '../components/Protocol/ProtocolHeader';
import { ReportRow, StatusToken } from '../components/Report/ReportRow';
import { SessionLog } from '../components/SessionLog/SessionLog';
import type { AnyTest } from '../tests';
import type { AnswerRecord, TestSummary } from '../tests/types';

interface Props {
  test: AnyTest;
  next: AnyTest | null;
  summary: TestSummary;
  records: AnswerRecord[];
  trials: unknown[];
  onNext: () => void;
}

export function TestResultPage({ test, next, summary, records, trials, onNext }: Props) {
  const idx = String(test.number).padStart(2, '0');
  return (
    <div className="animate-enter">
      <ProtocolHeader
        index={idx}
        title={test.title}
        subtitle={test.titleEn}
        status={
          <span className="label inline-flex items-center gap-1.5 text-green">
            <Check size={14} strokeWidth={2.5} aria-hidden /> {idx} complete
          </span>
        }
      />

      <p className="mt-10 max-w-[30ch] text-[26px] leading-[1.25] text-ink sm:text-[30px]">{summary.result}</p>

      <div className="mt-10">
        <ReportRow label="Что проверялось">{test.checks}</ReportRow>
        <ReportRow label="Наблюдение">
          <StatusToken attention={summary.attention} />
          <p className="mt-2">{summary.meaning}</p>
        </ReportRow>
        <ReportRow label="Данные">
          <dl className="grid grid-cols-2 gap-x-6 sm:grid-cols-4">
            {summary.stats.map((s) => (
              <div key={s.label} className="border-l border-rule pl-3">
                <dt className="text-[13px] leading-tight text-graphite">{s.label}</dt>
                <dd className="num mt-1 text-[18px] text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        </ReportRow>
        <div className="border-t border-rule py-4">
          <SessionLog total={records.length} current={-1} records={records} optionsFor={(i) => test.options(trials[i])} showCorrect />
        </div>
        <div className="grid gap-x-6 border-t border-ink pt-4 sm:grid-cols-[11rem_minmax(0,1fr)]">
          <h3 className="label pt-4 text-graphite">Далее</h3>
          <div>
            <p className="pt-3 text-[18px] text-ink">
              {next ? (
                <>
                  <span className="num mr-3 text-graphite">{String(next.number).padStart(2, '0')}/05</span>
                  {next.title}
                </>
              ) : (
                'Итоговый отчёт скрининга'
              )}
            </p>
            <GestureCue gesture="THUMBS_UP" action={next ? 'Перейти к следующему тесту' : 'Открыть итоговый отчёт'} primary onTrigger={onNext} />
          </div>
        </div>
      </div>
    </div>
  );
}
