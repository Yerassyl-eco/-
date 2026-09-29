import { ArrowLeft, ArrowRight, ClipboardList, Eye, Hand, Ruler, Sun, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { GestureCue } from '../Cue/GestureCue';

export interface DeckCard {
  title: string;
  text: string;
  icon?: LucideIcon;
}

export const DECK_ICONS: Record<string, LucideIcon> = {
  distance: Ruler,
  light: Sun,
  eye: Eye,
  read: ClipboardList,
  hand: Hand,
};

interface Props {
  /** Small heading above the deck, e.g. "01/05 · Острота зрения". */
  kicker: ReactNode;
  title: string;
  cards: DeckCard[];
  index: number;
  onIndex: (i: number) => void;
  startLabel: string;
  onStart: () => void;
  onReplay: () => void;
}

/**
 * Instruction cards shown one at a time in the centre of the screen.
 * The current card rises into place; earlier cards settle into a stack behind it.
 */
export function InstructionDeck({ kicker, title, cards, index, onIndex, startLabel, onStart, onReplay }: Props) {
  const last = index >= cards.length - 1;
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col items-center text-center">
      <h1 className="text-[40px] leading-[1.1] text-ink sm:text-[52px]">{title}</h1>
      <div className="mt-2 text-[15px] font-medium text-graphite">{kicker}</div>

      {/* stack */}
      <div className="relative mt-8 w-full sm:mt-10" style={{ height: 'clamp(300px, 42vh, 380px)' }} aria-live="polite">
        {cards.map((c, i) => {
          const depth = index - i; // 0 = current, >0 = behind
          if (depth < 0 || depth > 2) return null;
          const Icon = c.icon ?? Hand;
          const isCur = depth === 0;
          return (
            <article
              key={i}
              aria-hidden={!isCur}
              className={`absolute inset-x-0 top-0 mx-auto flex h-full w-full flex-col justify-between p-7 text-left sm:p-10 ${isCur ? 'animate-card-in bg-accent' : 'bg-accent'}`}
              style={{
                borderRadius: 'var(--radius-card)',
                boxShadow: isCur ? 'var(--shadow-lift)' : 'var(--shadow-card)',
                transform: isCur ? undefined : `translateY(${-depth * 18}px) scale(${1 - depth * 0.05})`,
                opacity: isCur ? 1 : 0.45 - (depth - 1) * 0.2,
                zIndex: 10 - depth,
                transition: 'transform 420ms var(--ease-out-expo), opacity 420ms var(--ease-out-expo)',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'color-mix(in srgb, var(--accent-on) 16%, transparent)' }}>
                  <Icon size={28} strokeWidth={1.75} aria-hidden />
                </span>
                <span className="num text-[15px] opacity-80">
                  {String(i + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}
                </span>
              </div>
              <div>
                <h2 className="text-[30px] leading-tight sm:text-[40px]">{c.title}</h2>
                <p className="mt-3 max-w-[32ch] text-[19px] leading-snug opacity-95 sm:text-[22px]">{c.text}</p>
              </div>
            </article>
          );
        })}
      </div>

      {/* progress + paging */}
      <div className="mt-6 flex w-full items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onIndex(index - 1)}
          disabled={index === 0}
          className="flex min-h-11 items-center gap-2 rounded-full px-4 text-[15px] text-ink transition-colors hover:bg-white disabled:opacity-30"
          aria-label="Предыдущая карточка (жест влево)"
        >
          <ArrowLeft size={18} aria-hidden /> Назад
        </button>
        <div className="flex items-center gap-2" aria-label={`Карточка ${index + 1} из ${cards.length}`}>
          {cards.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onIndex(i)}
              aria-label={`Карточка ${i + 1}`}
              className="flex h-11 items-center justify-center"
            >
              <span
                className="block h-2.5 rounded-full transition-all duration-300"
                style={{ width: i === index ? 28 : 10, background: i <= index ? 'var(--accent)' : 'var(--color-rule-strong)' }}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onIndex(index + 1)}
          disabled={last}
          className="flex min-h-11 items-center gap-2 rounded-full px-4 text-[15px] text-ink transition-colors hover:bg-white disabled:opacity-30"
          aria-label="Следующая карточка (жест вправо)"
        >
          Далее <ArrowRight size={18} aria-hidden />
        </button>
      </div>

      <div className="mt-6 grid w-full gap-3 text-left sm:grid-cols-[1.4fr_1fr]">
        <GestureCue gesture="THUMBS_UP" action={startLabel} primary onTrigger={onStart} />
        <GestureCue gesture="OPEN_PALM" action="Сначала" onTrigger={onReplay} />
      </div>
      <p className="mt-4 text-[15px] text-graphite">Листайте жестом: указательный палец вправо — дальше, влево — назад.</p>
    </div>
  );
}
