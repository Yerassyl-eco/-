import { TriangleAlert } from 'lucide-react';
import { GestureCue } from '../components/Cue/GestureCue';
import { StatusToken } from '../components/Report/ReportRow';
import { THEMES } from '../data/themes';
import type { AnyTest } from '../tests';
import type { TestSummary } from '../tests/types';
import { formatDate, formatDuration } from '../utils/format';

interface Props {
  tests: AnyTest[];
  results: (TestSummary | null)[];
  durationMs: number | null;
  sessionCode: string;
  finishedAt: number;
  onRestart: () => void;
  onHome: () => void;
}

export function FinalResultPage({ tests, results, durationMs, sessionCode, finishedAt, onRestart, onHome }: Props) {
  const done = results.filter(Boolean).length;
  const attention = results.some((r) => r?.attention);
  return (
    <article className="animate-enter" aria-labelledby="report-title">
      <section className="bg-accent p-7 sm:p-10" style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)' }}>
        <p className="text-[15px] font-medium opacity-85">Vision screening report</p>
        <h1 id="report-title" className="mt-3 text-[40px] leading-[1.05] sm:text-[60px]">Скрининг завершён</h1>
        <div className="mt-6 flex flex-wrap gap-2" aria-hidden>
          {tests.map((t) => (
            <span key={t.id} className="h-2.5 w-14 rounded-full" style={{ background: THEMES[t.id].base, boxShadow: '0 0 0 2px color-mix(in srgb, var(--accent-on) 40%, transparent)' }} />
          ))}
        </div>
      </section>
      <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4">
        {[
          ['Пройдено', `${String(done).padStart(2, '0')} / 05`],
          ['Длительность', formatDuration(durationMs)],
          ['Сессия', sessionCode],
          ['Дата', formatDate(finishedAt)],
        ].map(([k, v]) => (
          <div key={k} className="border-b border-rule py-3 pr-3 sm:border-r sm:[&:not(:first-child)]:pl-4 sm:last:border-r-0">
            <dt className="label text-graphite">{k}</dt>
            <dd className="num mt-1 text-[15px] text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-10" aria-labelledby="summary">
        <h2 id="summary" className="label border-b-2 border-accent pb-2 text-accent">
          Сводка по тестам
        </h2>
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Результаты по тестам</caption>
          <thead className="sr-only">
            <tr>
              <th>№</th>
              <th>Тест</th>
              <th>Результат</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t, i) => {
              const r = results[i];
              return (
                <tr key={t.id} className="border-b border-rule align-baseline">
                  <td className="w-14 py-4">
                    <span className="num flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-medium" style={{ background: THEMES[t.id].base, color: THEMES[t.id].on }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="display block text-[22px] text-ink">{t.title}</span>
                    <span className="mt-0.5 block text-[14px] text-graphite sm:hidden">{r?.short ?? 'Не пройден'}</span>
                  </td>
                  <td className="hidden py-4 pr-4 text-[15px] text-graphite sm:table-cell">{r?.short ?? 'Не пройден'}</td>
                  <td className="py-4 text-right">{r ? <StatusToken attention={r.attention} /> : null}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {attention && (
        <div className="mt-6 grid gap-x-6 gap-y-1.5 border-t border-amber-line pt-3 sm:grid-cols-[11rem_minmax(0,1fr)]">
          <span className="label flex items-center gap-1.5 pt-0.5 text-amber"><TriangleAlert size={13} strokeWidth={2} aria-hidden /> Внимание</span>
          <p className="max-w-[62ch] text-[16px] leading-relaxed text-ink">
            Некоторые ответы отличаются от ожидаемых результатов скрининга. Если вы замечаете проблемы со зрением или эти результаты повторяются, обратитесь к
            офтальмологу.
          </p>
        </div>
      )}

      <section className="mt-10 grid gap-x-6 border-t border-ink pt-4 sm:grid-cols-[11rem_minmax(0,1fr)]" aria-labelledby="important">
        <h2 id="important" className="label pt-0.5 text-accent">
          Важно
        </h2>
        <div className="max-w-[62ch] space-y-3 text-[16px] leading-relaxed text-ink">
          <p>
            Этот веб-тест предназначен только для предварительного скрининга и не заменяет полноценное офтальмологическое обследование. Результат не является
            медицинским диагнозом.
          </p>
          <p className="text-graphite">
            Если вы замечаете изменения зрения, боль, вспышки, «плавающие» точки или другие тревожные симптомы, обратитесь за профессиональной медицинской
            помощью.
          </p>
        </div>
      </section>

      <div className="mt-10 grid gap-x-6 border-t border-ink sm:grid-cols-[11rem_minmax(0,1fr)]">
        <h2 className="label pt-5 text-graphite">Дальше</h2>
        <div>
          <GestureCue gesture="OPEN_PALM" action="Пройти скрининг ещё раз" primary onTrigger={onRestart} />
          <button type="button" onClick={onHome} className="mt-2 min-h-11 text-[15px] text-graphite underline decoration-rule-strong underline-offset-4 hover:text-ink">
            Вернуться к началу
          </button>
          <p className="mt-4 text-[13px] text-graphite">Результаты сохранены только в этом браузере.</p>
        </div>
      </div>
    </article>
  );
}
