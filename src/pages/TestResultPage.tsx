import { GestureCue } from '../components/GestureIcon/GestureIcon';
import { ResultCard } from '../components/ResultCard/ResultCard';
import type { AnyTest } from '../tests';
import type { TestSummary } from '../tests/types';

export function TestResultPage({ test, summary, isLast }: { test: AnyTest; summary: TestSummary; isLast: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <ResultCard title={test.title} number={test.number} checks={test.checks} summary={summary} />
      <div className="animate-rise flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[var(--shadow-card)] ring-1 ring-line" style={{ animationDelay: '200ms' }}>
        <GestureCue gesture="THUMBS_UP" />
        <div>
          <p className="text-lg font-extrabold text-slate-900">Готовы продолжить?</p>
          <p className="text-sm text-slate-600">{isLast ? 'Покажите 👍, чтобы увидеть итоговый результат.' : 'Покажите 👍, чтобы перейти к следующему тесту.'}</p>
        </div>
      </div>
    </div>
  );
}
