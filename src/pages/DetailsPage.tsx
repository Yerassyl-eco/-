import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GestureCue } from '../components/Cue/GestureCue';
import { StatusToken } from '../components/Report/ReportRow';
import { ADVICE } from '../data/advice';
import { THEMES } from '../data/themes';
import type { AnyTest } from '../tests';
import type { TestSummary } from '../tests/types';

interface Props {
  tests: AnyTest[];
  results: (TestSummary | null)[];
  index: number;
  /** Auto-advance time of one slide; drives the story progress fill. */
  slideMs: number;
  replayKey: number;
  onIndex: (i: number) => void;
  onReport: () => void;
}

/**
 * "Learn more about your vision": one slide per test, shown in sequence like
 * a story. Each slide wears its test colour and slides in from the right.
 */
export function DetailsPage({ tests, results, index, slideMs, replayKey, onIndex, onReport }: Props) {
  const test = tests[index];
  const summary = results[index];
  const pct = Math.round((summary?.score ?? 0) * 100);
  const last = index === tests.length - 1;

  return (
    <div className="animate-enter">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[15px] text-graphite">Подробнее о вашем зрении</p>
          <h1 className="mt-2 text-[34px] leading-[1.05] text-ink sm:text-[44px]">Разбор по тестам</h1>
        </div>
        <p className="num text-[15px] text-graphite" aria-live="polite">
          {String(index + 1).padStart(2, '0')} / {String(tests.length).padStart(2, '0')}
        </p>
      </div>

      {/* story progress: done segments full, current one fills over the slide time */}
      <ol className="mt-6 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${tests.length}, minmax(0, 1fr))` }} aria-label="Слайды">
        {tests.map((t, i) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onIndex(i)}
              className="group block w-full py-2"
              aria-label={`${t.title}${i === index ? ' (сейчас)' : ''}`}
              aria-current={i === index ? 'step' : undefined}
            >
              <span className="block h-1.5 overflow-hidden rounded-full bg-rule">
                {i < index && <span className="block h-full w-full" style={{ background: THEMES[t.id].base }} />}
                {i === index && (
                  <span
                    key={`${index}-${replayKey}`}
                    className={`block h-full w-full origin-left ${last ? '' : 'animate-story-fill'}`}
                    style={{ background: THEMES[t.id].base, animationDuration: `${slideMs}ms` }}
                  />
                )}
              </span>
              <span className={`mt-2 block truncate text-left text-[13px] ${i === index ? 'font-semibold text-ink' : 'text-graphite'}`}>
                {t.shortTitle}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <article key={test.id} className="animate-slide-in mt-6 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" aria-labelledby="slide-title">
        <section className="bg-accent flex flex-col p-7 sm:p-8 lg:sticky lg:top-24 lg:self-start" style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-lift)' }}>
          <div className="flex items-center justify-between gap-3">
            <span
              className="num flex h-10 w-10 items-center justify-center rounded-full text-[15px]"
              style={{ background: 'color-mix(in srgb, var(--accent-on) 16%, transparent)' }}
            >
              {String(test.number).padStart(2, '0')}
            </span>
            <span className="text-[14px] opacity-85">{test.titleEn}</span>
          </div>
          <h2 id="slide-title" className="mt-6 text-[32px] leading-[1.08] sm:text-[38px]">
            {test.title}
          </h2>
          <p className="mt-8 text-[15px] opacity-85">Совпадение с ожидаемым</p>
          <p className="num mt-1 text-[64px] leading-none sm:text-[80px]">{pct}%</p>
          <div
            className="mt-5 flex h-3 gap-[2px] overflow-hidden rounded-full"
            style={{ background: 'color-mix(in srgb, var(--accent-on) 18%, transparent)' }}
            role="img"
            aria-label={`Совпадение ${pct}%, пробел ${100 - pct}%`}
          >
            {pct > 0 && (
              <span
                className="animate-bar-grow h-full origin-left rounded-full"
                style={{ width: `${pct}%`, background: 'var(--accent-on)', animationDelay: '260ms' }}
              />
            )}
          </div>
          <p className="mt-3 text-[15px] opacity-85">{summary?.short}</p>
          <div className="pt-8">
            <span
              className="inline-flex rounded-full px-3 py-1.5 text-[14px] font-medium"
              style={{ background: 'color-mix(in srgb, var(--accent-on) 16%, transparent)' }}
            >
              {summary?.attention ? 'Стоит обратить внимание' : 'В пределах скрининга'}
            </span>
          </div>
        </section>

        <section className="bg-field p-7 sm:p-8" style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)' }}>
          <Block title="Что проверял тест">{test.checks}</Block>
          <Block title="Ваш результат">
            <p>{summary?.result}</p>
          </Block>
          <Block title="Что это означает">
            {summary && <StatusToken attention={summary.attention} />}
            <p className="mt-2">{summary?.meaning}</p>
          </Block>
          <Block title="Что можно сделать">
            <ul className="flex flex-col gap-2.5">
              {ADVICE[test.id].map((a) => (
                <li key={a} className="flex gap-3">
                  <span className="mt-[0.55em] h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </Block>
        </section>
      </article>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onIndex(index - 1)}
          disabled={index === 0}
          className="flex min-h-12 items-center gap-2 rounded-[14px] border border-rule bg-field px-4 text-[15px] font-medium text-ink transition-colors hover:border-ink disabled:opacity-40"
        >
          <ChevronLeft size={18} aria-hidden /> Назад
        </button>
        <p className="hidden text-center text-[14px] text-graphite sm:block">Укажите влево или вправо, чтобы листать</p>
        <button
          type="button"
          onClick={() => onIndex(index + 1)}
          disabled={last}
          className="flex min-h-12 items-center gap-2 rounded-[14px] border border-rule bg-field px-4 text-[15px] font-medium text-ink transition-colors hover:border-ink disabled:opacity-40"
        >
          Далее <ChevronRight size={18} aria-hidden />
        </button>
      </div>

      <div className="mx-auto mt-8 max-w-[560px]">
        <GestureCue gesture="THUMBS_UP" action="Итоговый отчёт" primary={last} onTrigger={onReport} />
        <p className="mt-4 text-center text-[14px] leading-snug text-graphite">
          Это предварительный скрининг, а не медицинский диагноз. Если результат вас беспокоит, обратитесь к офтальмологу.
        </p>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-rule py-5 first:border-t-0 first:pt-0 last:pb-0">
      <h3 className="text-[20px] text-ink">{title}</h3>
      <div className="mt-2 text-[17px] leading-relaxed text-ink">{children}</div>
    </div>
  );
}
