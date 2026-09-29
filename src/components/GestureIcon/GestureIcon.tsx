import { Hand, HandFist, ThumbsUp, type LucideProps } from 'lucide-react';
import type { Gesture } from '../../vision/types';

const ROTATION: Partial<Record<Gesture, number>> = {
  POINT_UP: 0,
  POINT_RIGHT: 90,
  POINT_DOWN: 180,
  POINT_LEFT: -90,
};

interface GlyphProps {
  size: number | string;
  strokeWidth: number | string;
  className: string;
  style?: React.CSSProperties;
}

/**
 * A hand drawn in the Lucide stroke language: a palm with four fingers that are
 * either raised or folded. Counting and pointing use the same hand, so ☝️ in the
 * questionnaire and ☝️ in a test look like one gesture.
 */
export function HandGlyph({ raised, size, strokeWidth, className, style }: GlyphProps & { raised: number }) {
  const xs = [7.5, 10.5, 13.5, 16.5];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden>
      {xs.map((x, i) => (i < raised ? <path key={x} d={`M${x} 12V${i === 0 || i === 3 ? 4.5 : 3}`} /> : <path key={x} d={`M${x} 12v-1.5`} />))}
      <path d="M6 11.5h12v3.5a7 7 0 0 1-7 7h0a6 6 0 0 1-5-3" />
      <path d="M6 16.5 4.2 13.8a1.3 1.3 0 0 1 2-1.6L7.5 14" />
    </svg>
  );
}

/** 👌: thumb and index close a ring, the other three fingers stand up. */
function OkSign({ size, strokeWidth, className }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="7" cy="14.5" r="4.2" />
      <path d="M12.5 13V4" />
      <path d="M15.5 13V3" />
      <path d="M18.5 13V5" />
      <path d="M11.2 12.5h8.3V16a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-3.9-1.5" />
    </svg>
  );
}

/** One drawn pictogram per gesture, 1.5px stroke. */
export function GestureIcon({ gesture, size = 20, strokeWidth = 1.5, className = '', ...rest }: { gesture: Gesture } & LucideProps) {
  const common = { size, strokeWidth, className, 'aria-hidden': true, ...rest } as LucideProps;
  const glyph = { size, strokeWidth, className };
  switch (gesture) {
    case 'THUMBS_UP':
      return <ThumbsUp {...common} />;
    case 'FIST':
      return <HandFist {...common} />;
    case 'OPEN_PALM':
      return <Hand {...common} />;
    case 'OK':
      return <OkSign {...glyph} />;
    case 'TWO':
      return <HandGlyph raised={2} {...glyph} />;
    case 'THREE':
      return <HandGlyph raised={3} {...glyph} />;
    case 'FOUR':
      return <HandGlyph raised={4} {...glyph} />;
    default:
      return <HandGlyph raised={1} {...glyph} style={{ transform: `rotate(${ROTATION[gesture] ?? 0}deg)` }} />;
  }
}
