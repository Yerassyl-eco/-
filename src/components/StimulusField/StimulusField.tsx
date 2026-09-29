import type { ReactNode } from 'react';

interface Props {
  tagLeft?: ReactNode;
  tagRight?: ReactNode;
  /** 0..1 observation progress, drawn along the top edge. */
  progress?: number | null;
  children: ReactNode;
  /** When the stimulus paints its own ground (duochrome), drop the white field. */
  bare?: boolean;
  label: string;
}

/** The measurement field: white ground framed by the test colour, corner tags. */
export function StimulusField({ tagLeft, tagRight, progress = null, children, bare = false, label }: Props) {
  return (
    <figure
      className="relative flex h-full min-h-[240px] w-full flex-col overflow-hidden border border-rule bg-field text-ink"
      style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)' }}
      aria-label={label}
    >
      <span className="absolute inset-x-0 top-0 z-10 h-1.5 bg-[var(--accent)]" aria-hidden />
      {progress !== null && progress < 1 && (
        <span className="absolute inset-x-0 top-0 z-20 h-1.5 bg-[var(--accent-wash)]">
          <span className="absolute inset-y-0 left-0 w-full origin-left bg-[var(--accent)]" style={{ transform: `scaleX(${progress})` }} />
        </span>
      )}
      <div className={`relative flex flex-1 items-center justify-center overflow-hidden ${bare ? '' : 'bg-field'}`}>{children}</div>
      {(tagLeft || tagRight) && (
        <figcaption className="pointer-events-none absolute inset-x-0 top-1.5 z-10 flex justify-between p-3">
          <span className="num rounded-full bg-[var(--accent-wash)] px-2.5 py-0.5 text-[13px] text-accent">{tagLeft}</span>
          <span className="num rounded-full bg-field/90 px-2.5 py-0.5 text-[13px] text-graphite">{tagRight}</span>
        </figcaption>
      )}
    </figure>
  );
}
