import { SCREENING_STEPS } from '../../data/testConfig';

/** Top progress: Подготовка ● 01 ● 02 ● 03 ● 04 ● 05. `current` = -1 before preparation. */
export function ProgressBar({ current, done }: { current: number; done: number }) {
  return (
    <nav aria-label="Прогресс скрининга" className="w-full">
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {SCREENING_STEPS.map((label, i) => {
          const isDone = i < done;
          const isCurrent = i === current;
          return (
            <li key={label} className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2" aria-current={isCurrent ? 'step' : undefined}>
              <span
                className={`flex h-7 shrink-0 items-center justify-center rounded-full px-2 text-[11px] font-extrabold tracking-wide transition-all duration-500 sm:h-8 sm:px-3 sm:text-xs ${
                  isCurrent
                    ? 'bg-accent-500 text-white shadow-[var(--shadow-float)]'
                    : isDone
                      ? 'bg-success-500 text-white'
                      : 'bg-white text-slate-500 ring-1 ring-line'
                }`}
              >
                {isDone ? '✓' : i === 0 ? <span className="hidden sm:inline">{label}</span> : label}
                {i === 0 && !isDone && <span className="sm:hidden">•</span>}
              </span>
              {i < SCREENING_STEPS.length - 1 && (
                <span className="relative h-1 min-w-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-success-500 transition-all duration-700"
                    style={{ width: isDone ? '100%' : '0%' }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
