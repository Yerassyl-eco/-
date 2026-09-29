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
  startedAt: number;
  onNext: () => void;
}

export function TestResultPage({ test, next, summary, records, trials, startedAt, onNext }: Props) {
  const idx = String(test.number).padStart(2, '0');
  return (
    <div className="animate-enter">
      <ProtocolHeader
        index={idx}
        title={test.title}
        subtitle={test.titleEn}
        status={
          <span className="label inline-flex items-center gap-1.5 text-accent">
            <Check size={15} strokeWidth={2.5} aria-hidden /> Тест завершён
          </span>
        }
      />

      <section className="bg-accent mt-8 p-7 sm:p-9" style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[15px] font-medium opacity-85">Результат скрининга</span>
          <span className="rounded-full px-3 py-1 text-[14px] font-medium" style={{ background: 'color-mix(in srgb, var(--accent-on) 16%, transparent)' }}>
            {summary.attention ? 'Стоит обратить внимание' : 'В пределах скрининга'}
          </span>
        </div>
        <p className="display mt-5 text-[40px] leading-none sm:text-[56px]">{summary.headline}</p>
        <p className="mt-2 text-[16px] opacity-85">{summary.headlineCaption}</p>
        <p className="mt-6 max-w-[48ch] text-[19px] leading-snug sm:text-[21px]">{summary.result}</p>
      </section>

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
          <SessionLog
            total={records.length}
            current={-1}
            records={records}
            optionsFor={(i) => test.options(trials[i])}
            startedAt={startedAt}
            expectedFor={test.expectedLabel ? (i) => test.expectedLabel!(trials[i]) : undefined}
          />
        </div>
        <div className="grid gap-x-6 border-t-2 border-accent pt-4 sm:grid-cols-[11rem_minmax(0,1fr)]">
          <h3 className="label pt-4 text-accent">Далее</h3>
          <div>
            <p className="display pb-3 pt-3 text-[26px] text-ink">
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
