import type { ReactNode } from 'react';

interface Props {
  tagLeft?: ReactNode;
  tagRight?: ReactNode;
  /** 0..1 observation progress, drawn as a cobalt rule on the top edge. */
  progress?: number | null;
  children: ReactNode;
  /** When the stimulus paints its own ground (duochrome), drop the white field. */
  bare?: boolean;
  label: string;
}

/** The measurement field: white ground, hairline frame, crop marks, corner tags. */
export function StimulusField({ tagLeft, tagRight, progress = null, children, bare = false, label }: Props) {
  return (
    <figure className="crop relative flex h-full min-h-[240px] w-full flex-col border border-rule text-ink" aria-label={label}>
      <span className="crop-mark tl" />
      <span className="crop-mark tr" />
      <span className="crop-mark bl" />
      <span className="crop-mark br" />
      {progress !== null && progress < 1 && (
        <span className="absolute inset-x-0 top-0 z-10 h-[2px] bg-rule">
          <span className="absolute inset-y-0 left-0 w-full origin-left bg-cobalt" style={{ transform: `scaleX(${progress})` }} />
        </span>
      )}
      <div className={`relative flex flex-1 items-center justify-center overflow-hidden ${bare ? '' : 'bg-field'}`}>{children}</div>
      {(tagLeft || tagRight) && (
        <figcaption className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-between p-3">
          <span className="num rounded-[2px] bg-field/85 px-1.5 py-0.5 text-xs text-graphite">{tagLeft}</span>
          <span className="num rounded-[2px] bg-field/85 px-1.5 py-0.5 text-xs text-graphite">{tagRight}</span>
        </figcaption>
      )}
    </figure>
  );
}
