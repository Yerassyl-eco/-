import type { ReactNode } from 'react';

/** One row of a report sheet: label column + content column, hairline above. */
export function ReportRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-x-6 gap-y-1.5 border-t border-rule py-4 sm:grid-cols-[11rem_minmax(0,1fr)]">
      <h3 className="label pt-0.5 text-accent">{label}</h3>
      <div className="max-w-[62ch] text-[17px] leading-relaxed text-ink">{children}</div>
    </div>
  );
}

/** Screening status token — text + mark, never colour alone. */
export function StatusToken({ attention }: { attention: boolean }) {
  return attention ? (
    <span className="label inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-wash px-3 py-1 text-amber">
      <span className="inline-block h-2 w-2 rounded-full bg-amber-line" aria-hidden /> Обратить внимание
    </span>
  ) : (
    <span className="label inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#e2f1e8] px-3 py-1 text-[#17703f]">
      <span className="inline-block h-2 w-2 rounded-full bg-[#17703f]" aria-hidden /> В пределах скрининга
    </span>
  );
}
