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
    default:
      return <Pointer {...common} style={{ transform: `rotate(${ROTATION[gesture] ?? 0}deg)` }} />;
  }
}
