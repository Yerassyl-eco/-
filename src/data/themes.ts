import type { CSSProperties } from 'react';
import type { TestId } from '../tests/types';

/** Colour identity of each part of the screening (all pairs pass WCAG AA). */
export interface Theme {
  /** Solid fill (cards, selected states, headers). */
  base: string;
  /** Text on `base`. */
  on: string;
  /** Light tint for backgrounds. */
  wash: string;
  /** Accent text on the paper ground. */
  text: string;
  name: string;
}

export const THEMES: Record<TestId | 'calibration', Theme> = {
  calibration: { base: '#111111', on: '#ffffff', wash: '#ecebe5', text: '#111111', name: 'Калибровка' },
  acuity: { base: '#2457ff', on: '#ffffff', wash: '#e6ecff', text: '#1f4be0', name: 'Кобальт' },
  astigmatism: { base: '#7c3aed', on: '#ffffff', wash: '#efe7fd', text: '#6a2fd6', name: 'Фиолетовый' },
  duochrome: { base: '#d23b26', on: '#ffffff', wash: '#fce8e4', text: '#b8321f', name: 'Коралл' },
  amsler: { base: '#0a7c6e', on: '#ffffff', wash: '#def2ee', text: '#0a7c6e', name: 'Бирюза' },
  color: { base: '#f5a300', on: '#111111', wash: '#fff1d1', text: '#111111', name: 'Солнце' },
};

export function themeVars(t: Theme): CSSProperties {
  return {
    '--accent': t.base,
    '--accent-on': t.on,
    '--accent-wash': t.wash,
    '--accent-text': t.text,
  } as CSSProperties;
}
