import { describe, expect, it } from 'vitest';
import { TESTS } from '../tests';
import type { Gesture } from '../vision/types';
import { createTrials, initialState, makeReducer, routeGesture, type MachineState } from './testMachine';

const reducer = makeReducer(TESTS);

/** Drives the machine with gestures only — exactly like the camera would. */
function gesture(s: MachineState, g: Gesture, now: number) {
  const r = routeGesture(TESTS, s, g, now, () => createTrials(TESTS));
  return { state: r.kind === 'action' ? reducer(s, r.action) : s, route: r };
}

/** Answers the three questionnaire cards with option 1 (☝️ then ✊). */
function skipProfile(s: MachineState) {
  let x = s;
  for (let i = 0; i < 3; i++) x = reducer(reducer(x, { type: 'PROFILE_SELECT', value: 0 }), { type: 'PROFILE_CONFIRM' });
  return x;
}

describe('screening state machine', () => {
  it('completes the whole screening using gestures only', () => {
    let s = initialState(TESTS);
    let now = 1000;
    const step = (g: Gesture) => {
      now += 1000;
      s = gesture(s, g, now).state;
    };
    step('THUMBS_UP');
    expect(s.phase).toBe('CAMERA_SETUP');
    step('THUMBS_UP');
    expect(s.phase).toBe('PROFILE');
    // questionnaire: fingers choose, fist confirms, 👈 goes back
    step('TWO');
    expect(s.selected).toBe('1');
    step('FIST');
    expect(s.cardIndex).toBe(1);
    step('POINT_LEFT');
    expect(s.cardIndex).toBe(0);
    step('THREE');
    step('FIST');
    step('POINT_UP');
    step('FIST');
    step('FOUR');
    step('FIST');
    expect(s.phase).toBe('PREPARATION');
    expect(s.profile).toEqual({ age: 2, glasses: 0, visit: 3 });
    step('THUMBS_UP');
    expect(s.phase).toBe('TEST_INTRO');
    expect(s.profile.age).toBe(2);

    for (let t = 0; t < TESTS.length; t++) {
      expect(s.testIndex).toBe(t);
      step('THUMBS_UP');
      expect(s.phase).toBe('TEST_ACTIVE');
      let guard = 0;
      while (s.phase !== 'TEST_RESULT' && guard++ < 50) {
        now += 10_000; // wait out the observation period
        const opts = TESTS[t].options(s.trials[t][s.trialIndex]);
        step(opts[0].gesture);
        expect(s.phase).toBe('ANSWER_SELECTED');
        step('FIST');
        expect(s.phase).toBe('ANSWER_CONFIRMED');
        s = reducer(s, { type: 'ADVANCE', now });
      }
      expect(s.results[t]).not.toBeNull();
      step('THUMBS_UP');
    }
    expect(s.phase).toBe('COMPLETE');
    expect(s.results.every(Boolean)).toBe(true);
    step('THUMBS_UP');
    expect(s.phase).toBe('DETAILS');
    step('OK');
    expect(s.cardIndex).toBe(1);
    step('POINT_LEFT');
    expect(s.cardIndex).toBe(0);
    for (let i = 0; i < TESTS.length; i++) step('OK');
    expect(s.phase).toBe('VISION_MAP');
    step('POINT_LEFT');
    expect(s.phase).toBe('DETAILS');
    expect(s.cardIndex).toBe(TESTS.length - 1);
    step('OK');
    step('OK');
    expect(s.phase).toBe('FINAL_RESULT');
    step('POINT_LEFT');
    expect(s.phase).toBe('VISION_MAP');
  });

  it('requires ✊ confirmation and explains a premature fist', () => {
    let s = initialState(TESTS);
    s = { ...reducer(skipProfile(reducer(reducer(s, { type: 'START' }), { type: 'CAMERA_OK' })), { type: 'BEGIN_TESTS', now: 0, trials: createTrials(TESTS) }) };
    s = reducer(s, { type: 'START_TEST', now: 0 });
    const r = routeGesture(TESTS, s, 'FIST', 5000, () => []);
    expect(r.kind).toBe('reject');
    if (r.kind === 'reject') expect(r.hint).toMatch(/Сначала выберите ответ/);
  });

  it('lets the user change or cancel the selected answer', () => {
    let s = initialState(TESTS);
    s = reducer(skipProfile(reducer(reducer(s, { type: 'START' }), { type: 'CAMERA_OK' })), { type: 'BEGIN_TESTS', now: 0, trials: createTrials(TESTS) });
    s = reducer(s, { type: 'START_TEST', now: 0 });
    s = gesture(s, 'POINT_LEFT', 5000).state;
    expect(s.selected).toBe('left');
    s = gesture(s, 'POINT_RIGHT', 6000).state;
    expect(s.selected).toBe('right');
    s = gesture(s, 'OPEN_PALM', 7000).state;
    expect(s.phase).toBe('TEST_ACTIVE');
    expect(s.selected).toBeNull();
  });

  it('blocks answers during the observation period (Amsler)', () => {
    let s = initialState(TESTS);
    s = reducer(skipProfile(reducer(reducer(s, { type: 'START' }), { type: 'CAMERA_OK' })), { type: 'BEGIN_TESTS', now: 0, trials: createTrials(TESTS) });
    s = { ...s, testIndex: 3 };
    s = reducer(s, { type: 'START_TEST', now: 0 });
    expect(gesture(s, 'POINT_RIGHT', 1000).route.kind).toBe('reject');
    expect(gesture(s, 'POINT_RIGHT', 7000).state.phase).toBe('ANSWER_SELECTED');
  });

  it('stops the acuity test after two consecutive mistakes', () => {
    let s = initialState(TESTS);
    s = reducer(skipProfile(reducer(reducer(s, { type: 'START' }), { type: 'CAMERA_OK' })), { type: 'BEGIN_TESTS', now: 0, trials: createTrials(TESTS) });
    s = reducer(s, { type: 'START_TEST', now: 0 });
    for (let i = 0; i < 2; i++) {
      const trial = s.trials[0][s.trialIndex] as { direction: string };
      const wrong = trial.direction === 'up' ? 'down' : 'up';
      s = reducer(s, { type: 'SELECT', value: wrong });
      s = reducer(s, { type: 'CONFIRM', now: 1 });
      s = reducer(s, { type: 'ADVANCE', now: 2 });
    }
    expect(s.phase).toBe('TEST_RESULT');
    expect(s.results[0]?.headline).toBe('Уровень 0');
  });

  it('never uses diagnostic wording in summaries', () => {
    const banned = /(глауком|катаракт|AMD|макулярн|дальтони|у вас астигматизм|диагноз:)/i;
    const trials = createTrials(TESTS);
    TESTS.forEach((t, i) => {
      for (const pick of [0, 1]) {
        const recs = trials[i].map((tr, k) => ({ trialIndex: k, value: t.options(tr)[pick].value, correct: t.isCorrect(tr, t.options(tr)[pick].value), reactionMs: 1, at: 1 }));
        const sum = t.summarize(recs, trials[i], 1000);
        expect(`${sum.result} ${sum.meaning} ${sum.short}`).not.toMatch(banned);
      }
    });
  });

  it('pages instruction cards with pointing gestures and restarts with the palm', () => {
    let s2 = initialState(TESTS);
    s2 = skipProfile(reducer(reducer(s2, { type: 'START' }), { type: 'CAMERA_OK' }));
    expect(s2.phase).toBe('PREPARATION');
    s2 = gesture(s2, 'POINT_RIGHT', 1000).state;
    s2 = gesture(s2, 'POINT_RIGHT', 2000).state;
    expect(s2.cardIndex).toBe(2);
    s2 = gesture(s2, 'POINT_LEFT', 3000).state;
    expect(s2.cardIndex).toBe(1);
    s2 = gesture(s2, 'OPEN_PALM', 4000).state;
    expect(s2.cardIndex).toBe(0);
    expect(gesture(s2, 'POINT_LEFT', 5000).route.kind).toBe('reject');
  });
});
