import type { ReactNode } from 'react';
import type { TestSummary } from '../../tests/types';

export function ResultSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-line">
      <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">{title}</h3>
      <p className="mt-1.5 text-[15px] font-medium leading-relaxed text-slate-800">{children}</p>
    </div>
  );
}

/** Per-test result card: big indicator + what / result / meaning. */
export function ResultCard({ title, number, checks, summary }: { title: string; number: number; checks: string; summary: TestSummary }) {
  return (
    <article className="animate-rise overflow-hidden rounded-[28px] bg-white shadow-[var(--shadow-card)] ring-1 ring-line">
      <header className="relative overflow-hidden bg-accent-700 px-6 py-7 text-white sm:px-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" aria-hidden />
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/85">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-success-500" aria-hidden>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray="60" className="animate-draw" />
            </svg>
          </span>
          Тест {number} завершён
        </p>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{title}</h2>
        <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-1">
          <span className="text-5xl font-black leading-none tracking-tight sm:text-6xl">{summary.headline}</span>
          <span className="pb-1 text-sm font-semibold text-white/85">{summary.headlineCaption}</span>
        </div>
      </header>
      <div className="grid gap-3 p-5 sm:p-6">
        <ResultSection title="Что проверял тест">{checks}</ResultSection>
        <ResultSection title="Ваш результат">{summary.result}</ResultSection>
        <div className={`rounded-2xl p-4 ring-1 ${summary.attention ? 'bg-warning-50 ring-warning-500/30' : 'bg-success-50 ring-success-500/25'}`}>
          <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-slate-600">
            <span aria-hidden>{summary.attention ? '◆' : '●'}</span>
            Что это означает {summary.attention ? '· стоит обратить внимание' : ''}
          </h3>
          <p className="mt-1.5 text-[15px] font-medium leading-relaxed text-slate-800">{summary.meaning}</p>
        </div>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {summary.stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-white p-3 ring-1 ring-line">
              <dt className="text-xs font-semibold leading-tight text-slate-500">{s.label}</dt>
              <dd className="mt-1 text-lg font-extrabold text-slate-900">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}
