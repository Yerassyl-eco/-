import { ArrowLeft, ArrowRight, ClipboardList, Eye, Hand, Ruler, Sun, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

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
}

/**
 * Instruction cards shown one at a time in the centre of the screen.
 * The current card rises into place; earlier cards settle into a stack behind it.
 */
export function InstructionDeck({ kicker, title, cards, index, onIndex }: Props) {
  const last = index >= cards.length - 1;
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[760px] flex-col items-center text-center">
      <h1 className="text-[clamp(30px,4.6vh,48px)] leading-[1.1] text-ink">{title}</h1>
      <div className="mt-1 text-[15px] font-medium text-graphite">{kicker}</div>

      {/* stack: takes the height that is left, never more than it needs */}
      <div className="relative mt-[clamp(20px,3.5vh,40px)] min-h-[200px] w-full flex-1" style={{ maxHeight: 380 }} aria-live="polite">
        {cards.map((c, i) => {
          const depth = index - i; // 0 = current, >0 = behind
          if (depth < 0 || depth > 2) return null;
          const Icon = c.icon ?? Hand;
          const isCur = depth === 0;
          return (
            <article
              key={i}
              aria-hidden={!isCur}
              className={`absolute inset-x-0 top-0 mx-auto flex h-full w-full flex-col justify-between p-[clamp(20px,3.5vh,40px)] text-left ${isCur ? 'animate-card-in bg-accent' : 'bg-accent'}`}
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
                <h2 className="text-[clamp(24px,3.8vh,38px)] leading-tight">{c.title}</h2>
                <p className="mt-2 max-w-[34ch] text-[clamp(17px,2.5vh,22px)] leading-snug opacity-95">{c.text}</p>
              </div>
            </article>
          );
        })}
      </div>

      {/* progress + paging */}
      <div className="mt-[clamp(8px,2vh,20px)] flex w-full items-center justify-between gap-4">
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

    </div>
  );
}
