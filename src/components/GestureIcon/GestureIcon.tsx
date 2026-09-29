import { Hand, HandFist, Pointer, ThumbsUp, type LucideProps } from 'lucide-react';
import type { Gesture } from '../../vision/types';

const ROTATION: Partial<Record<Gesture, number>> = {
  POINT_UP: 0,
  POINT_RIGHT: 90,
  POINT_DOWN: 180,
  POINT_LEFT: -90,
};

/** One drawn pictogram per gesture (Lucide, 1.5px stroke); pointing is one glyph rotated. */
export function GestureIcon({ gesture, size = 20, strokeWidth = 1.5, className = '', ...rest }: { gesture: Gesture } & LucideProps) {
  const common = { size, strokeWidth, className, 'aria-hidden': true, ...rest } as LucideProps;
  switch (gesture) {
    case 'THUMBS_UP':
      return <ThumbsUp {...common} />;
    case 'FIST':
      return <HandFist {...common} />;
    case 'OPEN_PALM':
      return <Hand {...common} />;
    case 'OK':
      return <OkSign size={size} strokeWidth={strokeWidth} className={className} />;
    case 'TWO':
    case 'THREE':
    case 'FOUR':
      return <FingerCount n={gesture === 'TWO' ? 2 : gesture === 'THREE' ? 3 : 4} size={size} strokeWidth={strokeWidth} className={className} />;
    default:
      return <Pointer {...common} style={{ transform: `rotate(${ROTATION[gesture] ?? 0}deg)` }} />;
  }
}

/** 👌 drawn in the same 24px, round-cap stroke language as Lucide. */
function OkSign({ size, strokeWidth, className }: { size: number | string; strokeWidth: number | string; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="8" cy="15" r="3.5" />
      <path d="M11.5 15V5.5a1.5 1.5 0 0 1 3 0V13" />
      <path d="M14.5 12V4a1.5 1.5 0 0 1 3 0v9" />
      <path d="M17.5 11V6.5a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-7 7h-2a6 6 0 0 1-4.5-2.5" />
    </svg>
  );
}

/** Raised fingers for choosing an option by count (2–4). */
function FingerCount({ n, size, strokeWidth, className }: { n: number; size: number | string; strokeWidth: number | string; className: string }) {
  const xs = [6, 10, 14, 18].slice(0, n);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {xs.map((x) => (
        <path key={x} d={`M${x} 13V4.5`} />
      ))}
      <path d="M4 13h16v2a7 7 0 0 1-7 7h-2a7 7 0 0 1-7-7z" />
    </svg>
  );
}
