import type { AnyTest } from '../tests';
import type { TestSummary } from '../tests/types';
import { formatDuration } from '../utils/format';

interface Props {
  tests: AnyTest[];
  results: (TestSummary | null)[];
  durationMs: number | null;
  onRestart: () => void;
  onHome: () => void;
}

export function FinalResultPage({ tests, results, durationMs, onRestart, onHome }: Props) {
  const done = results.filter(Boolean).length;
  const attention = results.some((r) => r?.attention);
  return (
    <div className="flex flex-col gap-5">
      <header className="animate-rise relative overflow-hidden rounded-[28px] bg-gradient-to-br from-accent-600 via-accent-500 to-cyan-500 p-6 text-white shadow-[var(--shadow-float)] sm:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" aria-hidden />
        <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-white/10" aria-hidden />
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/85">Итог</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Скрининг завершён</h1>
        <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-2">
          <p>
            <span className="text-5xl font-black sm:text-6xl">{done} / {tests.length}</span>
            <span className="ml-2 font-semibold text-white/85">тестов пройдено</span>
          </p>
          <p className="pb-1 text-sm font-semibold text-white/85">Время: {formatDuration(durationMs)}</p>
        </div>
      </header>

      <ol className="relative grid gap-3" aria-label="Результаты по тестам">
        <span className="absolute bottom-6 left-[27px] top-6 w-0.5 bg-gradient-to-b from-accent-200 to-cyan-glow/40" aria-hidden />
        {tests.map((t, i) => {
          const r = results[i];
          return (
            <li key={t.id} className="animate-rise relative flex items-start gap-4" style={{ animationDelay: `${100 + i * 90}ms` }}>
              <span
                className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black shadow-sm ${r?.attention ? 'bg-warning-50 text-warning-700 ring-2 ring-warning-500/40' : 'bg-white text-accent-600 ring-1 ring-line'}`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2 rounded-2xl bg-white p-4 shadow-[var(--shadow-card)] ring-1 ring-line">
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900">{t.title}</p>
                  <p className="text-sm text-slate-600">{r?.result ?? 'Тест не пройден'}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${r?.attention ? 'bg-warning-50 text-warning-700' : 'bg-success-50 text-success-700'}`}
                >
                  {r?.attention ? '◆ ' : '✓ '}
                  {r?.short ?? '—'}
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      {attention && (
        <div className="animate-rise rounded-2xl border border-warning-500/35 bg-warning-50 p-4 text-[15px] font-medium leading-relaxed text-slate-800" role="note">
          <strong className="text-warning-700">◆ Обратите внимание.</strong> Некоторые ответы отличаются от ожидаемых результатов скрининга. Если вы
          замечаете проблемы со зрением или эти результаты повторяются, обратитесь к офтальмологу.
        </div>
      )}

      <section className="rounded-2xl bg-white p-5 ring-1 ring-line" aria-labelledby="important">
        <h2 id="important" className="text-lg font-extrabold text-slate-900">
          Важно
        </h2>
        <p className="mt-1 text-[15px] leading-relaxed text-slate-700">
          Этот веб-тест предназначен только для предварительного скрининга и не заменяет полноценное офтальмологическое обследование или
          медицинский диагноз. Результат не является медицинским диагнозом. При проблемах со зрением обратитесь к офтальмологу.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-line">
          <span className="emoji text-3xl" aria-hidden>✋</span>
          <p className="font-bold text-slate-800">Покажите открытую ладонь, чтобы пройти скрининг ещё раз</p>
        </div>
        <button type="button" onClick={onRestart} className="rounded-full bg-accent-500 px-5 py-3 font-bold text-white shadow-[var(--shadow-float)] transition hover:bg-accent-600">
          Пройти ещё раз
        </button>
        <button type="button" onClick={onHome} className="rounded-full bg-white px-5 py-3 font-bold text-slate-700 ring-1 ring-line transition hover:ring-accent-200">
          Начать новый скрининг
        </button>
      </div>
    </div>
  );
}
