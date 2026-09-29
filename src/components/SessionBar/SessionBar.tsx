import { useEffect, useState } from 'react';
import { THEMES } from '../../data/themes';
import { isSoundEnabled, setSoundEnabled } from '../../utils/sound';

const ORDER = ['acuity', 'astigmatism', 'duochrome', 'amsler', 'color'] as const;

interface Props {
  /** 0..4 = current test, -1 = none. */
  current: number;
  /** Number of completed tests. */
  done: number;
  phaseLabel: string;
  sessionCode: string;
  startedAt: number;
}

function Timecode({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const s = Math.max(0, Math.floor((now - startedAt) / 1000));
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return <span className="num" aria-label="Время сессии">{`${hh}:${mm}:${ss}`}</span>;
}

/** Minimal session bar: wordmark · progression 01—05 · session code and timecode. */
export function SessionBar({ current, done, phaseLabel, sessionCode, startedAt }: Props) {
  const [sound, setSound] = useState(isSoundEnabled);
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur-[2px]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 items-center gap-x-6 px-5 py-3.5 sm:px-10">
        <div className="col-span-6 flex items-baseline gap-3 lg:col-span-3">
          <span className="whitespace-nowrap text-[15px] font-semibold uppercase tracking-[0.2em] text-ink">Vision Motion</span>
          <span className="hidden whitespace-nowrap text-[13px] text-graphite 2xl:inline">Digital vision screening</span>
        </div>

        <nav aria-label="Прогресс скрининга" className="order-last col-span-12 mt-3 lg:order-none lg:col-span-6 lg:mt-0">
          <ol className="flex items-center gap-2">
            <li className="label mr-2 hidden whitespace-nowrap text-graphite sm:block">{phaseLabel}</li>
            {[0, 1, 2, 3, 4].map((i) => {
              const isDone = i < done;
              const isCur = i === current;
              return (
                <li key={i} className="flex flex-1 items-center gap-2" aria-current={isCur ? 'step' : undefined}>
                  <span
                    className={`num flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[13px] transition-colors duration-200 ${isCur ? 'font-semibold' : isDone ? 'font-medium' : 'text-graphite'}`}
                    style={
                      isCur || isDone
                        ? { background: THEMES[ORDER[i]].base, color: THEMES[ORDER[i]].on }
                        : { boxShadow: 'inset 0 0 0 1px var(--color-rule-strong)' }
                    }
                  >
                    {String(i + 1).padStart(2, '0')}
                    <span className="sr-only">{isDone ? ' пройден' : isCur ? ' текущий' : ''}</span>
                  </span>
                  {i < 4 && (
                    <span className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-rule">
                      <span
                        className="absolute inset-y-0 left-0 w-full origin-left transition-transform duration-300"
                        style={{ transform: `scaleX(${isDone ? 1 : 0})`, background: THEMES[ORDER[i]].base }}
                      />
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="col-span-6 flex items-baseline justify-end gap-5 text-[12px] text-graphite lg:col-span-3">
          <span className="num hidden sm:inline">{sessionCode}</span>
          <Timecode startedAt={startedAt} />
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!sound);
              setSound(!sound);
            }}
            className="label -my-3.5 min-w-11 py-3.5 text-graphite transition-colors hover:text-ink"
            aria-pressed={sound}
          >
            Звук {sound ? 'вкл' : 'выкл'}
          </button>
        </div>
      </div>
    </header>
  );
}
