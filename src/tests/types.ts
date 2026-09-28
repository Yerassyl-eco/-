import type { ComponentType } from 'react';
import type { Gesture } from '../vision/types';

export type TestId = 'acuity' | 'astigmatism' | 'duochrome' | 'amsler' | 'color';

export interface AnswerOption {
  value: string;
  gesture: Gesture;
  label: string;
  /** Optional small visual shown inside the option chip. */
  glyph?: string;
  /** Optional colour swatch (in addition to the text label). */
  swatch?: string;
}

export interface AnswerRecord {
  trialIndex: number;
  value: string;
  correct: boolean | null;
  reactionMs: number;
  at: number;
}

export interface TestSummary {
  testId: TestId;
  /** Big number/label on the result card: "8 / 10", "Уровень 7", "Ответы сохранены". */
  headline: string;
  headlineCaption: string;
  /** "Ваш результат" — plain description of what the user answered. */
  result: string;
  /** "Что это означает" — neutral interpretation, never a diagnosis. */
  meaning: string;
  /** Answers differ from the expected screening result. */
  attention: boolean;
  /** Short label for the final summary card. */
  short: string;
  stats: { label: string; value: string }[];
  answered: number;
  correct: number | null;
  durationMs: number;
}

export interface StimulusProps<T> {
  trial: T;
  trialIndex: number;
  trialCount: number;
  selected: string | null;
  confirmed: boolean;
  /** false while the observation countdown is running. */
  ready: boolean;
  /** 0..1 progress of the observation countdown. */
  observeProgress: number;
}

export interface TestDefinition<T = unknown> {
  id: TestId;
  number: number;
  title: string;
  /** Short English technical name shown as a subline. */
  titleEn: string;
  shortTitle: string;
  /** "Что проверял тест". */
  checks: string;
  /** Intro instructions before the test starts. */
  intro: string[];
  createTrials(): T[];
  /** Question shown during a trial. */
  prompt(trial: T): string;
  options(trial: T): AnswerOption[];
  /** Observation time before answers are accepted (ms). */
  observeMs?(trial: T): number;
  isCorrect(trial: T, value: string): boolean | null;
  /** Human label of the expected answer (tests with a right answer). */
  expectedLabel?(trial: T): string;
  /** Stop early (adaptive tests). */
  shouldStop?(records: AnswerRecord[], trials: T[]): boolean;
  summarize(records: AnswerRecord[], trials: T[], durationMs: number): TestSummary;
  Stimulus: ComponentType<StimulusProps<T>>;
  /** How answer options are laid out. */
  layout: 'pair' | 'triple' | 'cross';
}
