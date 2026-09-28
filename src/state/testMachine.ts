import type { AnyTest } from '../tests';
import type { AnswerRecord, TestSummary } from '../tests/types';
import type { Gesture } from '../vision/types';

/**
 * Explicit screening state machine.
 *
 *  LANDING ─👍→ CAMERA_SETUP ─👍→ PREPARATION ─👍→ TEST_INTRO ─👍→ TEST_ACTIVE
 *  TEST_ACTIVE ─👈👉☝️👇→ ANSWER_SELECTED ─✊→ ANSWER_CONFIRMED ─(auto)→ TEST_ACTIVE | TEST_RESULT
 *  ANSWER_SELECTED ─✋→ TEST_ACTIVE (cancel)
 *  TEST_RESULT ─👍→ TEST_INTRO (next test) | FINAL_RESULT
 *  FINAL_RESULT ─✋→ PREPARATION (new screening)
 */
export type Phase =
  | 'LANDING'
  | 'CAMERA_SETUP'
  | 'PREPARATION'
  | 'TEST_INTRO'
  | 'TEST_ACTIVE'
  | 'ANSWER_SELECTED'
  | 'ANSWER_CONFIRMED'
  | 'TEST_RESULT'
  | 'FINAL_RESULT';

export interface MachineState {
  phase: Phase;
  testIndex: number;
  trialIndex: number;
  /** Trials for each test, generated when a screening begins. */
  trials: unknown[][];
  selected: string | null;
  answers: AnswerRecord[][];
  results: (TestSummary | null)[];
  /** Time the current trial was shown. */
  trialShownAt: number;
  /** Answers are accepted only after this time (observation period). */
  trialReadyAt: number;
  testStartedAt: number;
  screeningStartedAt: number;
  screeningFinishedAt: number | null;
  /** Increments to replay instructions (✋ on intro screens). */
  replayKey: number;
}

export type Action =
  | { type: 'START' }
  | { type: 'CAMERA_OK' }
  | { type: 'BEGIN_TESTS'; now: number; trials: unknown[][] }
  | { type: 'START_TEST'; now: number }
  | { type: 'SELECT'; value: string }
  | { type: 'CANCEL' }
  | { type: 'CONFIRM'; now: number }
  | { type: 'ADVANCE'; now: number }
  | { type: 'NEXT_TEST' }
  | { type: 'REPLAY' }
  | { type: 'NEW_SCREENING' }
  | { type: 'GO_HOME' };

export function initialState(tests: AnyTest[]): MachineState {
  return {
    phase: 'LANDING',
    testIndex: 0,
    trialIndex: 0,
    trials: tests.map(() => []),
    selected: null,
    answers: tests.map(() => []),
    results: tests.map(() => null),
    trialShownAt: 0,
    trialReadyAt: 0,
    testStartedAt: 0,
    screeningStartedAt: 0,
    screeningFinishedAt: null,
    replayKey: 0,
  };
}

export function createTrials(tests: AnyTest[]): unknown[][] {
  return tests.map((t) => t.createTrials());
}

function trialTimes(test: AnyTest, trial: unknown, now: number) {
  return { trialShownAt: now, trialReadyAt: now + (test.observeMs?.(trial) ?? 0) };
}

export function makeReducer(tests: AnyTest[]) {
  return function reducer(s: MachineState, a: Action): MachineState {
    switch (a.type) {
      case 'START':
        return s.phase === 'LANDING' ? { ...s, phase: 'CAMERA_SETUP' } : s;

      case 'CAMERA_OK':
        return s.phase === 'CAMERA_SETUP' ? { ...s, phase: 'PREPARATION' } : s;

      case 'BEGIN_TESTS':
        if (s.phase !== 'PREPARATION') return s;
        return {
          ...initialState(tests),
          phase: 'TEST_INTRO',
          trials: a.trials,
          screeningStartedAt: a.now,
        };

      case 'START_TEST': {
        if (s.phase !== 'TEST_INTRO') return s;
        const test = tests[s.testIndex];
        return {
          ...s,
          phase: 'TEST_ACTIVE',
          trialIndex: 0,
          selected: null,
          testStartedAt: a.now,
          ...trialTimes(test, s.trials[s.testIndex][0], a.now),
        };
      }

      case 'SELECT':
        if (s.phase !== 'TEST_ACTIVE' && s.phase !== 'ANSWER_SELECTED') return s;
        return { ...s, phase: 'ANSWER_SELECTED', selected: a.value };

      case 'CANCEL':
        if (s.phase !== 'ANSWER_SELECTED') return s;
        return { ...s, phase: 'TEST_ACTIVE', selected: null };

      case 'CONFIRM': {
        if (s.phase !== 'ANSWER_SELECTED' || s.selected === null) return s;
        const test = tests[s.testIndex];
        const trial = s.trials[s.testIndex][s.trialIndex];
        const record: AnswerRecord = {
          trialIndex: s.trialIndex,
          value: s.selected,
          correct: test.isCorrect(trial, s.selected),
          reactionMs: Math.max(0, a.now - s.trialShownAt),
          at: a.now,
        };
        const answers = s.answers.slice();
        answers[s.testIndex] = [...answers[s.testIndex], record];
        return { ...s, phase: 'ANSWER_CONFIRMED', answers };
      }

      case 'ADVANCE': {
        if (s.phase !== 'ANSWER_CONFIRMED') return s;
        const test = tests[s.testIndex];
        const trials = s.trials[s.testIndex];
        const records = s.answers[s.testIndex];
        const next = s.trialIndex + 1;
        const done = next >= trials.length || (test.shouldStop?.(records, trials) ?? false);
        if (!done) {
          return { ...s, phase: 'TEST_ACTIVE', trialIndex: next, selected: null, ...trialTimes(test, trials[next], a.now) };
        }
        const results = s.results.slice();
        results[s.testIndex] = test.summarize(records, trials, a.now - s.testStartedAt);
        const isLast = s.testIndex === tests.length - 1;
        return {
          ...s,
          phase: 'TEST_RESULT',
          selected: null,
          results,
          screeningFinishedAt: isLast ? a.now : s.screeningFinishedAt,
        };
      }

      case 'NEXT_TEST':
        if (s.phase !== 'TEST_RESULT') return s;
        if (s.testIndex >= tests.length - 1) return { ...s, phase: 'FINAL_RESULT' };
        return { ...s, phase: 'TEST_INTRO', testIndex: s.testIndex + 1, trialIndex: 0, selected: null };

      case 'REPLAY':
        return { ...s, replayKey: s.replayKey + 1 };

      case 'NEW_SCREENING':
        return { ...initialState(tests), phase: 'PREPARATION' };

      case 'GO_HOME':
        return initialState(tests);
    }
  };
}

export type RouteResult =
  | { kind: 'action'; action: Action; feedback?: string }
  | { kind: 'reject'; hint: string }
  | { kind: 'ignore' };

const DIR_NAME: Partial<Record<Gesture, string>> = { POINT_LEFT: 'влево', POINT_RIGHT: 'вправо', POINT_UP: 'вверх', POINT_DOWN: 'вниз' };

const ANSWER_GESTURES: Gesture[] = ['POINT_LEFT', 'POINT_RIGHT', 'POINT_UP', 'POINT_DOWN'];

/**
 * Maps a committed gesture to an action for the current phase. Gestures that
 * make no sense right now produce a concrete hint instead of silence.
 */
export function routeGesture(tests: AnyTest[], s: MachineState, g: Gesture, now: number, makeTrials: () => unknown[][]): RouteResult {
  const test = tests[s.testIndex];
  const trial = s.trials[s.testIndex]?.[s.trialIndex];
  const options = trial !== undefined ? test.options(trial) : [];
  const optionFor = (gesture: Gesture) => options.find((o) => o.gesture === gesture);
  const optionHint = () => options.map((o) => `${DIR_NAME[o.gesture] ?? ''} — ${o.label}`).join(', ');

  switch (s.phase) {
    case 'LANDING':
      if (g === 'THUMBS_UP') return { kind: 'action', action: { type: 'START' } };
      return { kind: 'reject', hint: 'Чтобы начать, покажите «палец вверх» и задержите на секунду.' };

    case 'CAMERA_SETUP':
      if (g === 'THUMBS_UP') return { kind: 'action', action: { type: 'CAMERA_OK' } };
      return { kind: 'reject', hint: 'Рука видна. Чтобы продолжить, покажите «палец вверх».' };

    case 'PREPARATION':
      if (g === 'THUMBS_UP') return { kind: 'action', action: { type: 'BEGIN_TESTS', now, trials: makeTrials() } };
      if (g === 'OPEN_PALM') return { kind: 'action', action: { type: 'REPLAY' }, feedback: 'Повторяю инструкцию' };
      return { kind: 'reject', hint: 'Когда будете готовы, покажите «палец вверх».' };

    case 'TEST_INTRO':
      if (g === 'THUMBS_UP') return { kind: 'action', action: { type: 'START_TEST', now } };
      if (g === 'OPEN_PALM') return { kind: 'action', action: { type: 'REPLAY' }, feedback: 'Повторяю инструкцию' };
      return { kind: 'reject', hint: 'Прочитайте инструкцию и покажите «палец вверх», чтобы начать тест.' };

    case 'TEST_ACTIVE':
    case 'ANSWER_SELECTED': {
      if (ANSWER_GESTURES.includes(g)) {
        if (now < s.trialReadyAt) return { kind: 'reject', hint: 'Сначала посмотрите на изображение — ответы откроются через пару секунд.' };
        const opt = optionFor(g);
        if (opt) return { kind: 'action', action: { type: 'SELECT', value: opt.value } };
        return { kind: 'reject', hint: `В этом задании доступны ответы: ${optionHint()}.` };
      }
      if (g === 'FIST') {
        if (s.phase === 'ANSWER_SELECTED') return { kind: 'action', action: { type: 'CONFIRM', now }, feedback: 'Ответ принят' };
        return { kind: 'reject', hint: `Сначала выберите ответ указательным пальцем (${optionHint()}), затем подтвердите кулаком.` };
      }
      if (g === 'OPEN_PALM') {
        if (s.phase === 'ANSWER_SELECTED') return { kind: 'action', action: { type: 'CANCEL' }, feedback: 'Выбор отменён' };
        return { kind: 'ignore' };
      }
      return {
        kind: 'reject',
        hint: s.phase === 'ANSWER_SELECTED' ? 'Чтобы подтвердить ответ, покажите кулак.' : `Выберите ответ: ${optionHint()}.`,
      };
    }

    case 'ANSWER_CONFIRMED':
      return { kind: 'ignore' };

    case 'TEST_RESULT':
      if (g === 'THUMBS_UP') return { kind: 'action', action: { type: 'NEXT_TEST' } };
      return { kind: 'reject', hint: 'Чтобы продолжить, покажите «палец вверх».' };

    case 'FINAL_RESULT':
      if (g === 'OPEN_PALM') return { kind: 'action', action: { type: 'NEW_SCREENING' } };
      return { kind: 'ignore' };
  }
}

const EMOJI: Record<Gesture, string> = {
  THUMBS_UP: '👍',
  FIST: '✊',
  POINT_LEFT: '👈',
  POINT_RIGHT: '👉',
  POINT_UP: '☝️',
  POINT_DOWN: '👇',
  OPEN_PALM: '✋',
};

export const gestureEmoji = (g: Gesture) => EMOJI[g];
