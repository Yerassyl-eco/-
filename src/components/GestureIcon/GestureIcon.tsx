import { Hand, HandFist, Pointer, ThumbsUp, type LucideProps } from 'lucide-react';
import type { Gesture } from '../../vision/types';

const ROTATION: Partial<Record<Gesture, number>> = {
  POINT_UP: 0,
  POINT_RIGHT: 90,
  POINT_DOWN: 180,
  POINT_LEFT: -90,
};

/** Consistent SVG pictogram for every gesture (replaces emoji icons). */
export function GestureIcon({ gesture, size = 22, strokeWidth = 2, className = '', ...rest }: { gesture: Gesture } & LucideProps) {
  const common = { size, strokeWidth, className, 'aria-hidden': true, ...rest } as LucideProps;
  switch (gesture) {
    case 'THUMBS_UP':
      return <ThumbsUp {...common} />;
    case 'FIST':
      return <HandFist {...common} />;
    case 'OPEN_PALM':
      return <Hand {...common} />;
    default:
      return <Pointer {...common} style={{ transform: `rotate(${ROTATION[gesture] ?? 0}deg)` }} />;
  }
}

/** Large gesture tile used in "show this gesture" call-to-action cards. */
export function GestureCue({ gesture, tone = 'light' }: { gesture: Gesture; tone?: 'light' | 'solid' }) {
  return (
    <span
      className={`animate-float flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
        tone === 'solid' ? 'bg-white/15 text-white ring-1 ring-white/25' : 'bg-accent-50 text-accent-500 ring-1 ring-accent-100'
      }`}
    >
      <GestureIcon gesture={gesture} size={28} />
    </span>
  );
}
