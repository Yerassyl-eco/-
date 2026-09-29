import { PREPARATION_STEPS } from '../data/preparation';
import { COUNT_GESTURES, PROFILE_QUESTIONS, type Profile } from '../data/profile';
import type { AnyTest } from '../tests';
import type { AnswerRecord, TestSummary } from '../tests/types';
import type { Gesture } from '../vision/types';

/**
 * Explicit screening state machine.
 *
 *  LANDING ─👍→ CAMERA_SETUP ─👍→ PROFILE ─(3 answers: 1–4 fingers, ✊)→ PREPARATION ─👍→ TEST_INTRO ─👍→ TEST_ACTIVE
 *  TEST_ACTIVE ─👈👉☝️👇→ ANSWER_SELECTED ─✊→ ANSWER_CONFIRMED ─(auto)→ TEST_ACTIVE | TEST_RESULT
 *  ANSWER_SELECTED ─✋→ TEST_ACTIVE (cancel)
 *  TEST_RESULT ("ready for the next test?") ─👍→ TEST_INTRO (next test) | COMPLETE
 *  COMPLETE ─👍→ DETAILS (one test per slide, 👌 next, 👈 back) ─👌→ VISION_MAP ─👌→ FINAL_RESULT
 *  VISION_MAP ─👈→ DETAILS, FINAL_RESULT ─👈→ VISION_MAP, FINAL_RESULT ─✋→ PREPARATION (new screening)
 */
export type Phase =
  | 'LANDING'
  | 'CAMERA_SETUP'
  | 'PROFILE'
  | 'PREPARATION'
  | 'TEST_INTRO'
  | 'TEST_ACTIVE'
  | 'ANSWER_SELECTED'
  | 'ANSWER_CONFIRMED'
  | 'TEST_RESULT'
  | 'COMPLETE'
  | 'DETAILS'
  | 'VISION_MAP'
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
  /** Instruction card / question / result slide currently in focus. */
  cardIndex: number;
  /** Questionnaire answers (option index per question). */
  profile: Profile;
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
  | { type: 'PROFILE_SELECT'; value: number }
  | { type: 'PROFILE_CONFIRM' }
  | { type: 'PROFILE_BACK' }
  | { type: 'NEXT_TEST' }
  | { type: 'OPEN_DETAILS' }
  | { type: 'OPEN_MAP' }
  | { type: 'OPEN_REPORT' }
  | { type: 'BACK' }
  | { type: 'REPLAY' }
  | { type: 'CARD'; index: number }
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
    cardIndex: 0,
    profile: {},
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
        return s.phase === 'CAMERA_SETUP' ? { ...s, phase: 'PROFILE', cardIndex: 0, selected: null } : s;

      case 'PROFILE_SELECT':
        return s.phase === 'PROFILE' ? { ...s, selected: a.value < 0 ? null : String(a.value) } : s;

      case 'PROFILE_CONFIRM': {
        if (s.phase !== 'PROFILE' || s.selected === null) return s;
        const q = PROFILE_QUESTIONS[s.cardIndex];
        const profile = { ...s.profile, [q.key]: Number(s.selected) };
        const next = s.cardIndex + 1;
        if (next >= PROFILE_QUESTIONS.length) return { ...s, profile, selected: null, phase: 'PREPARATION', cardIndex: 0 };
        return { ...s, profile, selected: null, cardIndex: next };
      }

      case 'PROFILE_BACK':
        if (s.phase !== 'PROFILE' || s.cardIndex === 0) return s;
        return { ...s, cardIndex: s.cardIndex - 1, selected: null };

      case 'BEGIN_TESTS':
        if (s.phase !== 'PREPARATION') return s;
        return {
          ...initialState(tests),
          phase: 'TEST_INTRO',
          trials: a.trials,
          screeningStartedAt: a.now,
          profile: s.profile,
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
        if (s.testIndex >= tests.length - 1) return { ...s, phase: 'COMPLETE' };
        return { ...s, phase: 'TEST_INTRO', testIndex: s.testIndex + 1, trialIndex: 0, selected: null, cardIndex: 0 };

      case 'OPEN_DETAILS':
        return s.phase === 'COMPLETE' ? { ...s, phase: 'DETAILS', cardIndex: 0 } : s;

      case 'OPEN_MAP':
        return s.phase === 'DETAILS' ? { ...s, phase: 'VISION_MAP' } : s;

      case 'OPEN_REPORT':
        return s.phase === 'VISION_MAP' ? { ...s, phase: 'FINAL_RESULT' } : s;

      case 'BACK':
        if (s.phase === 'VISION_MAP') return { ...s, phase: 'DETAILS', cardIndex: tests.length - 1 };
        if (s.phase === 'FINAL_RESULT') return { ...s, phase: 'VISION_MAP' };
        return s;

      case 'REPLAY':
        return { ...s, replayKey: s.replayKey + 1, cardIndex: 0 };

      case 'CARD':
        if (s.phase !== 'PREPARATION' && s.phase !== 'TEST_INTRO' && s.phase !== 'DETAILS') return s;
        return { ...s, cardIndex: Math.max(0, a.index) };

      case 'NEW_SCREENING':
        return { ...initialState(tests), phase: 'PREPARATION', profile: s.profile };

      case 'GO_HOME':
        return initialState(tests);
    }
  };
}

export type RouteResult =
  | { kind: 'action'; action: Action; feedback?: string }
  | { kind: 'reject'; hint: string }
  | { kind: 'ignore' };

/** 👉 next card, 👈 previous card (instruction decks). */
function cardStep(s: MachineState, g: Gesture, count: number): RouteResult {
  const next = s.cardIndex + (g === 'POINT_RIGHT' ? 1 : -1);
  if (next < 0) return { kind: 'reject', hint: 'Это первая карточка. Укажите вправо, чтобы листать дальше.' };
  if (next >= count) return { kind: 'reject', hint: 'Это последняя карточка. Покажите «палец вверх», чтобы продолжить.' };
  return { kind: 'action', action: { type: 'CARD', index: next }, feedback: `Карточка ${next + 1} из ${count}` };
}

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

    case 'PROFILE': {
      const q = PROFILE_QUESTIONS[s.cardIndex];
      const n = COUNT_GESTURES.indexOf(g);
      if (n >= 0) return { kind: 'action', action: { type: 'PROFILE_SELECT', value: n }, feedback: `Выбрано: ${q.options[n]}` };
      if (g === 'FIST') {
        if (s.selected !== null) return { kind: 'action', action: { type: 'PROFILE_CONFIRM' }, feedback: 'Ответ сохранён' };
        return { kind: 'reject', hint: 'Сначала покажите номер ответа пальцами: один, два, три или четыре.' };
      }
      if (g === 'OPEN_PALM') {
        if (s.selected !== null) return { kind: 'action', action: { type: 'PROFILE_SELECT', value: -1 }, feedback: 'Выбор отменён' };
        return { kind: 'ignore' };
      }
      if (g === 'POINT_LEFT') {
        if (s.cardIndex > 0) return { kind: 'action', action: { type: 'PROFILE_BACK' }, feedback: 'Предыдущий вопрос' };
        return { kind: 'reject', hint: 'Это первый вопрос. Покажите номер ответа пальцами.' };
      }
      return { kind: 'reject', hint: 'Покажите столько пальцев, какой номер у вашего ответа, затем кулак.' };
    }

    case 'PREPARATION':
      if (g === 'THUMBS_UP') return { kind: 'action', action: { type: 'BEGIN_TESTS', now, trials: makeTrials() } };
      if (g === 'POINT_RIGHT' || g === 'POINT_LEFT') return cardStep(s, g, PREPARATION_STEPS.length);
      if (g === 'OPEN_PALM') return { kind: 'action', action: { type: 'REPLAY' }, feedback: 'Повторяю инструкцию' };
      return { kind: 'reject', hint: 'Когда будете готовы, покажите «палец вверх».' };

    case 'TEST_INTRO':
      if (g === 'THUMBS_UP') return { kind: 'action', action: { type: 'START_TEST', now } };
      if (g === 'POINT_RIGHT' || g === 'POINT_LEFT') return cardStep(s, g, test.intro.length + 1);
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
      return { kind: 'reject', hint: 'Когда будете готовы, покажите «палец вверх».' };

    case 'COMPLETE':
      if (g === 'THUMBS_UP') return { kind: 'action', action: { type: 'OPEN_DETAILS' }, feedback: 'Открываю результаты' };
      return { kind: 'reject', hint: 'Чтобы увидеть результаты, покажите «палец вверх».' };

    case 'VISION_MAP':
      if (g === 'OK' || g === 'THUMBS_UP') return { kind: 'action', action: { type: 'OPEN_REPORT' }, feedback: 'Итог скрининга' };
      if (g === 'POINT_LEFT') return { kind: 'action', action: { type: 'BACK' }, feedback: 'Назад к результатам' };
      return { kind: 'reject', hint: 'Покажите знак «ОК», чтобы перейти к итогу, или укажите влево, чтобы вернуться.' };

    case 'DETAILS':
      if (g === 'OK' || g === 'POINT_RIGHT') {
        if (s.cardIndex >= tests.length - 1) return { kind: 'action', action: { type: 'OPEN_MAP' }, feedback: 'Карта зрения' };
        return { kind: 'action', action: { type: 'CARD', index: s.cardIndex + 1 }, feedback: `Тест ${s.cardIndex + 2} из ${tests.length}` };
      }
      if (g === 'POINT_LEFT') {
        if (s.cardIndex === 0) return { kind: 'reject', hint: 'Это первый результат. Покажите «ОК», чтобы перейти к следующему.' };
        return { kind: 'action', action: { type: 'CARD', index: s.cardIndex - 1 }, feedback: `Тест ${s.cardIndex} из ${tests.length}` };
      }
      return { kind: 'reject', hint: 'Покажите знак «ОК», чтобы перейти дальше, или укажите влево, чтобы вернуться.' };

    case 'FINAL_RESULT':
      if (g === 'OPEN_PALM') return { kind: 'action', action: { type: 'NEW_SCREENING' } };
      if (g === 'POINT_LEFT') return { kind: 'action', action: { type: 'BACK' }, feedback: 'Назад к карте зрения' };
      return { kind: 'reject', hint: 'Ладонь — пройти скрининг заново; влево — вернуться к карте зрения.' };
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
  OK: '👌',
  TWO: '✌️',
  THREE: '3',
  FOUR: '4',
};

export const gestureEmoji = (g: Gesture) => EMOJI[g];
