import { useState } from 'react';
import { isSoundEnabled, setSoundEnabled } from '../../utils/sound';
import { ProgressBar } from '../ProgressBar/ProgressBar';

export function Header({ current, done, stepLabel }: { current: number; done: number; stepLabel: string | null }) {
  const [sound, setSound] = useState(isSoundEnabled);
  return (
    <header className="glass sticky top-0 z-30 border-b border-white/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-8">
        <div className="flex items-center justify-between gap-3">
          <a href="./" className="flex items-center gap-2.5" aria-label="Vision Motion — на главную">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-cyan-500 shadow-[var(--shadow-float)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth="2.2" strokeLinejoin="round" aria-hidden>
                <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" fill="white" />
              </svg>
            </span>
            <span className="text-lg font-extrabold tracking-tight text-slate-950">
              Vision<span className="text-accent-500">Motion</span>
            </span>
          </a>
          <div className="flex items-center gap-2 lg:hidden">
            {stepLabel && <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-bold text-accent-700">{stepLabel}</span>}
          </div>
        </div>
        <div className="flex-1">
          <ProgressBar current={current} done={done} />
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          {stepLabel && <span className="whitespace-nowrap rounded-full bg-accent-50 px-3 py-1.5 text-sm font-bold text-accent-700">{stepLabel}</span>}
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!sound);
              setSound(!sound);
            }}
            className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 ring-1 ring-line"
            aria-pressed={sound}
            aria-label={sound ? 'Выключить звуки' : 'Включить звуки'}
          >
            {sound ? '🔊 Звук' : '🔇 Без звука'}
          </button>
        </div>
      </div>
    </header>
  );
}
