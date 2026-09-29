import { Check, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { THEMES } from '../data/themes';
import type { AnyTest } from '../tests';
import type { TestSummary } from '../tests/types';

interface Props {
  tests: AnyTest[];
  results: (TestSummary | null)[];
}

const TICKS = [0, 25, 50, 75, 100];

/**
 * Vision map: one bar per test. The ink segment is agreement with the expected
 * screening result, the hatched amber tail is the gap. Identity is carried by
 * the test name (the coloured number is only a secondary cue).
 */
export function VisionMapPage({ tests, results }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const rows = tests.map((t, i) => {
    const r = results[i];
    const pct = Math.round((r?.score ?? 0) * 100);
    return { t, r, pct, gap: 100 - pct };
  });
  const gaps = rows.filter((x) => x.gap > 0 && x.r);
  const flagged = rows.filter((x) => x.r?.attention);

  return (
    <div className="animate-enter flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div>
          <h1 className="text-[clamp(30px,4.6vh,48px)] leading-[1.05] text-ink">Карта зрения</h1>
        </div>
        <p className="max-w-[34ch] text-[16px] leading-snug text-ink">
          {flagged.length ? (
            <>
              Пробелы видны в <b className="font-semibold">{flagged.length} из 5</b> тестов. Ниже — где именно.
            </>
          ) : (
            'Во всех тестах результаты совпали с ожидаемыми для скрининга.'
          )}
        </p>
      </div>

      <section
        className="mt-[clamp(10px,2.4vh,28px)] flex min-h-0 flex-1 flex-col bg-field px-5 py-[clamp(14px,2.6vh,28px)] sm:px-8"
        style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)' }}
        aria-labelledby="map-title"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="map-title" className="text-[clamp(18px,2.6vh,24px)] text-ink">
            Совпадение с ожидаемым результатом
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-[14px] text-graphite" aria-hidden>
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-6 rounded-[4px] bg-ink" /> совпадение
            </span>
            <span className="flex items-center gap-2">
              <span className="gap-hatch inline-block h-3 w-6 rounded-[4px]" /> пробел
            </span>
          </div>
        </div>

        {/* scale */}
        <div className="mt-[clamp(8px,2vh,20px)] hidden grid-cols-[13rem_minmax(0,1fr)_7.5rem] gap-x-5 sm:grid" aria-hidden>
          <span />
          <div className="relative h-5">
            {TICKS.map((v) => (
              <span key={v} className="num absolute top-0 -translate-x-1/2 text-[12px] text-graphite" style={{ left: `${v}%` }}>
                {v}%
              </span>
            ))}
          </div>
          <span />
        </div>

        <ol className="mt-1 flex min-h-0 flex-1 flex-col justify-around" aria-hidden>
          {rows.map(({ t, r, pct, gap }, i) => {
            const theme = THEMES[t.id];
            const active = hover === i;
            return (
              <li
                key={t.id}
                className={`relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-2xl px-2 py-[clamp(4px,1vh,12px)] transition-colors sm:grid-cols-[13rem_minmax(0,1fr)_7.5rem] sm:gap-x-5 ${active ? 'bg-paper' : ''}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className="num flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-medium"
                    style={{ background: theme.base, color: theme.on }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 text-[16px] font-medium leading-tight text-ink">{t.title}</span>
                </span>

                <span className="num text-right text-[20px] text-ink sm:order-last">
                  {pct}%
                  <span className="mt-0.5 flex items-center justify-end gap-1 text-[12px] text-graphite">
                    {gap > 0 ? (
                      <>
                        <TriangleAlert size={12} className="text-amber" aria-hidden /> пробел {gap}%
                      </>
                    ) : (
                      <>
                        <Check size={12} aria-hidden /> без пробела
                      </>
                    )}
                  </span>
                </span>

                {/* bar track with recessive grid */}
                <div className="relative col-span-2 h-7 sm:col-span-1">
                  {TICKS.slice(1, -1).map((v) => (
                    <span key={v} className="absolute inset-y-0 w-px bg-rule" style={{ left: `${v}%` }} />
                  ))}
                  <div className="absolute inset-0 flex gap-[2px]">
                    {pct > 0 && (
                      <span
                        className="animate-bar-grow h-full origin-left rounded-[4px] bg-ink"
                        style={{ width: `${pct}%`, animationDelay: `${120 + i * 110}ms` }}
                      />
                    )}
                    {gap > 0 && (
                      <span
                        className="gap-hatch animate-fade h-full rounded-[4px]"
                        style={{ width: `${gap}%`, animationDelay: `${600 + i * 110}ms` }}
                      />
                    )}
                  </div>
                </div>

                {active && r && (
                  <div
                    className="pointer-events-none absolute left-1/2 top-0 z-20 w-[min(22rem,90%)] -translate-x-1/2 -translate-y-[calc(100%+6px)] rounded-xl bg-ink px-4 py-3 text-[14px] leading-snug text-paper"
                    role="tooltip"
                  >
                    <b className="font-semibold">{t.title}</b>: совпадение {pct}%, пробел {gap}%.
                    <span className="mt-1 block opacity-80">{r.short}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {/* table view for screen readers */}
        <table className="sr-only">
          <caption>Карта зрения: совпадение с ожидаемым результатом скрининга по тестам</caption>
          <thead>
            <tr>
              <th>Тест</th>
              <th>Совпадение</th>
              <th>Пробел</th>
              <th>Кратко</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ t, r, pct, gap }) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{pct}%</td>
                <td>{gap}%</td>
                <td>{r?.short}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-3 text-[13px] leading-snug text-graphite">
          Процент показывает, насколько ваши ответы совпали с ожидаемыми для этого экранного теста. Это не оценка здоровья глаз и не
          диагноз.
          {gaps.length > 0 && ' Пробел — повод повторить тест в хороших условиях и, если он сохраняется, обсудить его с офтальмологом.'}
        </p>
      </section>

    </div>
  );
}
