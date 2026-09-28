import type { AnyTest } from '../tests';

export function TestIntroPage({ test, replayKey }: { test: AnyTest; replayKey: number }) {
  return (
    <div key={`${test.id}-${replayKey}`} className="animate-rise">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-600">Тест {test.number} из 5</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
        <span className="text-slate-400">Тест {test.number}</span>
        <br />
        {test.title}
      </h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-600">{test.checks}</p>
      <ol className="mt-6 grid gap-2.5">
        {test.intro.map((line, i) => (
          <li key={i} className="animate-rise flex items-start gap-4 rounded-2xl bg-white p-4 ring-1 ring-line" style={{ animationDelay: `${120 + i * 120}ms` }}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-sm font-extrabold text-accent-600">{i + 1}</span>
            <p className="pt-1 text-[15px] font-semibold leading-snug text-slate-800">{line}</p>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[var(--shadow-card)] ring-1 ring-line">
        <span className="emoji animate-float text-4xl" aria-hidden>👍</span>
        <p className="text-lg font-bold text-slate-900">Покажите 👍, чтобы начать тест</p>
      </div>
    </div>
  );
}
