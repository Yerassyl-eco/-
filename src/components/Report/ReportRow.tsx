import type { ReactNode } from 'react';

/** One row of a report sheet: label column + content column, hairline above. */
export function ReportRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-x-6 gap-y-1.5 border-t border-rule py-4 sm:grid-cols-[11rem_minmax(0,1fr)]">
      <h3 className="label pt-0.5 text-graphite">{label}</h3>
      <div className="max-w-[62ch] text-[16px] leading-relaxed text-ink">{children}</div>
    </div>
  );
}

/** Screening status token — text + mark, never colour alone. */
export function StatusToken({ attention }: { attention: boolean }) {
  return attention ? (
    <span className="label inline-flex items-center gap-1.5 text-amber">
      <span className="inline-block h-1.5 w-1.5 bg-amber-line" aria-hidden /> Review
    </span>
  ) : (
    <span className="label inline-flex items-center gap-1.5 text-green">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-green" aria-hidden /> Within screening range
    </span>
  );
}
