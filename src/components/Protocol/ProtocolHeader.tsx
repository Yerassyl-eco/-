import type { ReactNode } from 'react';

interface Props {
  /** "01" … "05", or null for calibration screens. */
  index?: string | null;
  title: string;
  subtitle?: string;
  aside?: ReactNode;
  status?: ReactNode;
}

/** Test heading: coloured test number, elegant display title, English subline. */
export function ProtocolHeader({ index, title, subtitle, aside, status }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[36px] leading-[1.1] text-ink sm:text-[48px]">
          {index && (
            <span className="num bg-accent rounded-full px-3 py-1 text-[15px] font-medium tracking-normal">
              {index}/05
            </span>
          )}
          {title}
        </h1>
        {(subtitle || status) && (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {subtitle && <span className="text-[15px] text-graphite">{subtitle}</span>}
            {status}
          </div>
        )}
      </div>
      {aside && <div className="text-left sm:text-right">{aside}</div>}
    </div>
  );
}
