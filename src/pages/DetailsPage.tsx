import { GesturePrompt } from '../components/Cue/GesturePrompt';
import { StatusToken } from '../components/Report/ReportRow';
import { adviceFor } from '../data/advice';
import type { Profile } from '../data/profile';
import { THEMES } from '../data/themes';
import type { AnyTest } from '../tests';
import type { TestSummary } from '../tests/types';

interface Props {
  tests: AnyTest[];
  results: (TestSummary | null)[];
  profile: Profile;
  index: number;
  onIndex: (i: number) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Results one test at a time. The user pages with 👌 (next) and 👈 (back);
 * each slide wears its test colour and slides in from the right.
 */
export function DetailsPage({ tests, results, profile, index, onIndex, onNext, onBack }: Props) {
  const test = tests[index];
  const summary = results[index];
  const pct = Math.round((summary?.score ?? 0) * 100);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-[clamp(28px,4.2vh,42px)] leading-[1.05] text-ink">Ваши результаты</h1>
        <p className="num text-[15px] text-graphite" aria-live="polite">
          {String(index + 1).padStart(2, '0')} / {String(tests.length).padStart(2, '0')}
        </p>
      </div>

      <ol className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${tests.length}, minmax(0, 1fr))` }} aria-label="Результаты по тестам">
        {tests.map((t, i) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onIndex(i)}
              className="block w-full py-1.5"
              aria-label={`${t.title}${i === index ? ' (сейчас)' : ''}`}
              aria-current={i === index ? 'step' : undefined}
            >
              <span className="block h-1.5 overflow-hidden rounded-full bg-rule">
                <span
                  className="block h-full w-full origin-left transition-transform duration-500"
                  style={{ background: THEMES[t.id].base, transform: `scaleX(${i <= index ? 1 : 0})` }}
                />
              </span>
              <span className={`mt-1.5 block truncate text-left text-[13px] ${i === index ? 'font-semibold text-ink' : 'text-graphite'}`}>{t.shortTitle}</span>
            </button>
          </li>
        ))}
      </ol>

      <article key={test.id} className="animate-slide-in mt-[clamp(10px,2vh,20px)] grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" aria-labelledby="slide-title">
        <section className="bg-accent flex min-h-0 flex-col p-[clamp(20px,3vh,32px)]" style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-lift)' }}>
          <div className="flex items-center justify-between gap-3">
            <span className="num flex h-10 w-10 items-center justify-center rounded-full text-[15px]" style={{ background: 'color-mix(in srgb, var(--accent-on) 16%, transparent)' }}>
              {String(test.number).padStart(2, '0')}
            </span>
            <span className="text-[14px] opacity-85">{test.titleEn}</span>
          </div>
          <h2 id="slide-title" className="mt-[clamp(10px,2.4vh,24px)] text-[clamp(26px,3.8vh,36px)] leading-[1.08]">
            {test.title}
          </h2>
          <p className="mt-auto pt-4 text-[15px] opacity-85">Совпадение с ожидаемым</p>
          <p className="num mt-1 text-[clamp(48px,8.5vh,80px)] leading-none">{pct}%</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full" style={{ background: 'color-mix(in srgb, var(--accent-on) 18%, transparent)' }} role="img" aria-label={`Совпадение ${pct}%, пробел ${100 - pct}%`}>
            {pct > 0 && <span className="animate-bar-grow block h-full origin-left rounded-full" style={{ width: `${pct}%`, background: 'var(--accent-on)', animationDelay: '260ms' }} />}
          </div>
          <p className="mt-3 text-[15px] opacity-90">{summary?.short}</p>
          <p className="mt-3 text-[13px] opacity-80">Предварительный скрининг, не медицинский диагноз.</p>
        </section>

        <section className="flex min-h-0 flex-col gap-[clamp(10px,2vh,18px)] bg-field p-[clamp(20px,3vh,32px)]" style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)' }}>
          <Block title="Ваш результат">
            {summary && <StatusToken attention={summary.attention} />}
            <p className="mt-1.5">{summary?.result}</p>
          </Block>
          <Block title="Что это означает">{summary?.meaning}</Block>
          <Block title="Что можно сделать">
            <ul className="flex flex-col gap-1.5">
              {adviceFor(test.id, profile).map((a) => (
                <li key={a} className="flex gap-3">
                  <span className="mt-[0.6em] h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </Block>
        </section>
      </article>
      <div className="mt-[clamp(8px,1.8vh,16px)] flex flex-wrap items-center gap-3">
        <GesturePrompt gesture="OK" action={index === tests.length - 1 ? 'чтобы открыть карту зрения' : 'чтобы перейти к следующему тесту'} size="md" onTrigger={onNext} />
        {index > 0 && <GesturePrompt gesture="POINT_LEFT" action="чтобы вернуться назад" size="md" quiet onTrigger={onBack} />}
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-rule pt-[clamp(8px,1.6vh,14px)] first:border-t-0 first:pt-0">
      <h3 className="text-[clamp(17px,2.3vh,20px)] text-ink">{title}</h3>
      <div className="mt-1 text-[clamp(14px,1.95vh,16.5px)] leading-[1.5] text-ink">{children}</div>
    </div>
  );
}
