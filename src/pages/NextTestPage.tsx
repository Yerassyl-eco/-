import { Check } from 'lucide-react';
import { THEMES } from '../data/themes';
import type { AnyTest } from '../tests';
import type { TestSummary } from '../tests/types';

interface Props {
  test: AnyTest;
  next: AnyTest | null;
  summary: TestSummary;
}

/** Between tests: one calm question, not a report. Details come at the end. */
export function NextTestPage({ test, next, summary }: Props) {
  const nt = next ? THEMES[next.id] : null;
  return (
    <div className="flex h-full min-h-0 items-center justify-center">
      <section
        className="animate-card-in w-full max-w-[720px] bg-field p-[clamp(24px,4vh,48px)]"
        style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-lift)' }}
        aria-labelledby="next-title"
      >
        <p className="flex items-center gap-2 text-[16px] text-graphite">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent">
            <Check size={16} strokeWidth={2.5} aria-hidden />
          </span>
          Тест {String(test.number).padStart(2, '0')} «{test.title}» пройден · {summary.short}
        </p>

        {next && nt ? (
          <>
            <h1 id="next-title" className="mt-[clamp(16px,3vh,32px)] text-[clamp(32px,5.2vh,52px)] leading-[1.08] text-ink">
              Готовы к следующему тесту?
            </h1>
            <div className="mt-[clamp(16px,3vh,28px)] flex items-center gap-4 rounded-2xl p-4" style={{ background: nt.wash }}>
              <span className="num flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[17px]" style={{ background: nt.base, color: nt.on }}>
                {String(next.number).padStart(2, '0')}
              </span>
              <span>
                <span className="block text-[clamp(20px,2.8vh,26px)] font-medium leading-tight text-ink">{next.title}</span>
                <span className="block text-[15px] text-graphite">{next.titleEn}</span>
              </span>
            </div>
          </>
        ) : (
          <h1 id="next-title" className="mt-[clamp(16px,3vh,32px)] text-[clamp(32px,5.2vh,52px)] leading-[1.08] text-ink">
            Это был последний тест
          </h1>
        )}
        <p className="mt-5 text-[16px] text-graphite">Подробный разбор каждого теста — в конце скрининга.</p>
      </section>
    </div>
  );
}
