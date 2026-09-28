import type { ReactNode } from 'react';

interface Props {
  /** "01" … "05", or null for calibration screens. */
  index?: string | null;
  title: string;
  subtitle?: string;
  aside?: ReactNode;
  status?: ReactNode;
}

/**
 * Protocol heading: the test number sits in its own grid column on the
 * title's baseline (a row number, not an eyebrow above the heading).
 */
export function ProtocolHeader({ index, title, subtitle, aside, status }: Props) {
  return (
    <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-x-3 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto]">
      <span className="num text-[15px] text-graphite">{index ? `${index}/05` : '00'}</span>
      <div className="min-w-0">
        <h1 className="text-[30px] font-medium leading-[1.1] text-ink sm:text-[40px]">{title}</h1>
        {(subtitle || status) && (
          <p className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[15px] text-graphite">
            {subtitle && <span>{subtitle}</span>}
            {status}
          </p>
        )}
      </div>
      {aside && <div className="col-span-2 mt-3 sm:col-span-1 sm:mt-0 sm:text-right">{aside}</div>}
    </div>
  );
}
