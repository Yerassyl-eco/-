import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { ActionBar } from './components/ActionBar/ActionBar';
import { DebugPanel } from './components/Debug/DebugPanel';
import { DemoPanel } from './components/DemoPanel/DemoPanel';
import { Instrument, type Flash } from './components/Instrument/Instrument';
import { SessionBar } from './components/SessionBar/SessionBar';
import { CalibrationPage } from './pages/CalibrationPage';
import { CompletePage } from './pages/CompletePage';
import { DetailsPage } from './pages/DetailsPage';
import { FinalResultPage } from './pages/FinalResultPage';
import { PreparationPage } from './pages/PreparationPage';
import { TestIntroPage } from './pages/TestIntroPage';
import { TestPage } from './pages/TestPage';
import { NextTestPage } from './pages/NextTestPage';
import { ProfilePage } from './pages/ProfilePage';
import { VisionMapPage } from './pages/VisionMapPage';
import { WelcomePage } from './pages/WelcomePage';
import { PREPARATION_STEPS } from './data/preparation';
import { THEMES, themeVars } from './data/themes';
import { phaseGuide } from './state/phaseActions';
import { createTrials, initialState, makeReducer, routeGesture, type Phase } from './state/testMachine';
import { TESTS } from './tests';
import { playSound } from './utils/sound';
import { lastCompleted, saveProgress } from './utils/storage';
import { GESTURE_META } from './vision/gestureEngine/messages';
import type { Gesture } from './vision/types';
import { useVision } from './vision/useVision';
import { visionRuntime } from './vision/VisionRuntime';

const reducer = makeReducer(TESTS);
const TEST_PHASES: Phase[] = ['TEST_ACTIVE', 'ANSWER_SELECTED', 'ANSWER_CONFIRMED'];
/** Calibration screens give the instrument the wide column; tests give it to the stimulus. */
const CALIBRATION_PHASES: Phase[] = ['LANDING', 'CAMERA_SETUP'];
/** Instruction decks: cards appear one by one in the centre. */
const DECK_PHASES: Phase[] = ['PREPARATION', 'TEST_INTRO'];
const CARD_AUTO_MS = 4200;
const isDemo =
  import.meta.env.VITE_DEMO === '1' ||
  new URLSearchParams(window.location.search).has('demo') ||
  window.location.hash === '#demo';
const SCREEN_SETTLE_MS = 1200;
/** `?demo=clean` keeps keyboard simulation but hides the dev panel (for captures). */
const demoClean = new URLSearchParams(window.location.search).get('demo') === 'clean';
const isDebug = new URLSearchParams(window.location.search).has('debug');
const SESSION_CODE = `S-${String(Math.floor(1000 + Math.random() * 9000))}`;

export default function App() {
  const [state, dispatch] = useReducer(reducer, TESTS, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const vision = useVision();
  const [flash, setFlash] = useState<Flash | null>(null);
  const flashId = useRef(0);
  const wallStart = useRef(Date.now());
  const sessionStart = useRef(Date.now());
  const last = useMemo(() => lastCompleted(), []);
  const phaseEnteredAt = useRef(0);
  const phaseSeen = useRef(state.phase);
  if (phaseSeen.current !== state.phase) {
    phaseSeen.current = state.phase;
    phaseEnteredAt.current = performance.now();
  }

  const showFlash = useCallback((kind: Flash['kind'], text: string) => {
    flashId.current += 1;
    setFlash({ id: flashId.current, kind, text });
  }, []);

  // A screen change is its own confirmation: drop the previous "accepted" readout.
  const screenKey = `${TEST_PHASES.includes(state.phase) ? 'TEST' : state.phase}-${state.testIndex}`;
  useEffect(() => {
    setFlash((f) => (f?.kind === 'ok' ? null : f));
  }, [screenKey]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), flash.kind === 'ok' ? 1600 : 3400);
    return () => clearTimeout(t);
  }, [flash]);

  /** Single entry for every input: camera gestures, demo panel and on-screen fallbacks. */
  const handleGesture = useCallback(
    (g: Gesture) => {
      // Let each new screen register before accepting "next" gestures, so a
      // result is never skipped by a gesture that was already on its way.
      const phase = stateRef.current.phase;
      if (['TEST_RESULT', 'TEST_INTRO', 'COMPLETE', 'VISION_MAP', 'DETAILS', 'FINAL_RESULT'].includes(phase) && performance.now() - phaseEnteredAt.current < SCREEN_SETTLE_MS) {
        showFlash('hint', 'Сначала посмотрите на экран, затем покажите жест ещё раз.');
        return;
      }
      const r = routeGesture(TESTS, stateRef.current, g, performance.now(), () => createTrials(TESTS));
      if (r.kind === 'action') {
        const a = r.action;
        dispatch(a);
        stateRef.current = reducer(stateRef.current, a);
        playSound(a.type === 'CONFIRM' ? 'confirm' : 'detect');
        showFlash('ok', r.feedback ?? GESTURE_META[g].name);
      } else if (r.kind === 'reject') {
        playSound('error');
        showFlash('hint', r.hint);
      }
    },
    [showFlash],
  );

  useEffect(() => {
    if (isDemo) visionRuntime.enableDemo();
    else void visionRuntime.start();
    return visionRuntime.onGesture(handleGesture);
  }, [handleGesture]);

  // Engine context per phase: when to expect a hand, when to check the face.
  useEffect(() => {
    const test = TESTS[state.testIndex];
    const observing = state.phase === 'TEST_ACTIVE' && performance.now() < state.trialReadyAt;
    visionRuntime.setOptions({
      expectHand: state.phase !== 'ANSWER_CONFIRMED' && !observing,
      faceCheck:
        ['CAMERA_SETUP', 'PREPARATION', 'TEST_INTRO'].includes(state.phase) || (TEST_PHASES.includes(state.phase) && test.id === 'acuity'),
    });
    if (observing) {
      const t = setTimeout(() => visionRuntime.setOptions({ expectHand: true }), state.trialReadyAt - performance.now());
      return () => clearTimeout(t);
    }
  }, [state.phase, state.testIndex, state.trialReadyAt]);

  // Instruction decks advance on their own until the last card; results page only by gesture.
  const deckCount =
    state.phase === 'PREPARATION'
      ? PREPARATION_STEPS.length
      : state.phase === 'TEST_INTRO'
        ? TESTS[state.testIndex].intro.length + 1
        : state.phase === 'DETAILS'
          ? TESTS.length
          : 0;
  const autoDeck = DECK_PHASES.includes(state.phase);
  useEffect(() => {
    if (!autoDeck || !deckCount || state.cardIndex >= deckCount - 1) return;
    const t = setTimeout(() => dispatch({ type: 'CARD', index: state.cardIndex + 1 }), CARD_AUTO_MS);
    return () => clearTimeout(t);
  }, [autoDeck, deckCount, state.cardIndex, state.replayKey]);
  const goCard = (i: number) => dispatch({ type: 'CARD', index: Math.min(Math.max(0, i), Math.max(0, deckCount - 1)) });

  // Auto-advance after the answer is confirmed and logged.
  useEffect(() => {
    if (state.phase !== 'ANSWER_CONFIRMED') return;
    const t = setTimeout(() => dispatch({ type: 'ADVANCE', now: performance.now() }), 900);
    return () => clearTimeout(t);
  }, [state.phase]);

  // Persist results after each finished test.
  useEffect(() => {
    if (state.phase === 'TEST_INTRO' && state.testIndex === 0) wallStart.current = Date.now();
    if (state.phase === 'TEST_RESULT') {
      playSound('complete');
      saveProgress(wallStart.current, state.results, state.testIndex === TESTS.length - 1);
    }
  }, [state.phase, state.testIndex, state.results]);


  const test = TESTS[state.testIndex];
  const calibration = CALIBRATION_PHASES.includes(state.phase);
  const phaseTheme =
    state.phase === 'DETAILS'
      ? THEMES[TESTS[state.cardIndex].id]
      : CALIBRATION_PHASES.includes(state.phase) || ['PROFILE', 'PREPARATION', 'COMPLETE', 'VISION_MAP', 'FINAL_RESULT'].includes(state.phase)
        ? THEMES.acuity
        : THEMES[test.id];

  const bar = (() => {
    switch (state.phase) {
      case 'LANDING':
        return { current: -1, done: 0, label: 'Старт' };
      case 'CAMERA_SETUP':
      case 'PREPARATION':
        return { current: -1, done: 0, label: 'Калибровка' };
      case 'PROFILE':
        return { current: -1, done: 0, label: 'Анкета' };
      case 'COMPLETE':
        return { current: -1, done: 5, label: 'Готово' };
      case 'VISION_MAP':
        return { current: -1, done: 5, label: 'Карта' };
      case 'DETAILS':
        return { current: -1, done: 5, label: 'Результаты' };
      case 'FINAL_RESULT':
        return { current: -1, done: 5, label: 'Отчёт' };
      case 'TEST_RESULT':
        return { current: state.testIndex, done: state.testIndex + 1, label: 'Результат' };
      default:
        return { current: state.testIndex, done: state.testIndex, label: 'Тест' };
    }
  })();

  const selectByValue = (v: string) => {
    const opt = test.options(state.trials[state.testIndex][state.trialIndex]).find((o) => o.value === v);
    if (opt) handleGesture(opt.gesture);
  };

  let page: ReactNode = null;
  switch (state.phase) {
    case 'LANDING':
      page = <WelcomePage last={last} flash={flash} onStart={() => handleGesture('THUMBS_UP')} />;
      break;
    case 'CAMERA_SETUP':
      page = <CalibrationPage vision={vision} onContinue={() => handleGesture('THUMBS_UP')} />;
      break;
    case 'PROFILE':
      page = (
        <ProfilePage
          index={state.cardIndex}
          selected={state.selected}
          profile={state.profile}
          onSelect={(i) => handleGesture((['POINT_UP', 'TWO', 'THREE', 'FOUR'] as Gesture[])[i])}
          onConfirm={() => handleGesture('FIST')}
        />
      );
      break;
    case 'PREPARATION':
      page = <PreparationPage cardIndex={state.cardIndex} onIndex={goCard} onBegin={() => handleGesture('THUMBS_UP')} />;
      break;
    case 'TEST_INTRO':
      page = <TestIntroPage test={test} cardIndex={state.cardIndex} onIndex={goCard} onStart={() => handleGesture('THUMBS_UP')} />;
      break;
    case 'TEST_ACTIVE':
    case 'ANSWER_SELECTED':
    case 'ANSWER_CONFIRMED':
      page = <TestPage test={test} state={state} onSelect={selectByValue} onGesture={handleGesture} />;
      break;
    case 'TEST_RESULT':
      page = <NextTestPage test={test} next={TESTS[state.testIndex + 1] ?? null} summary={state.results[state.testIndex]!} onNext={() => handleGesture('THUMBS_UP')} />;
      break;
    case 'COMPLETE':
      page = <CompletePage tests={TESTS} onNext={() => handleGesture('THUMBS_UP')} />;
      break;
    case 'DETAILS':
      page = <DetailsPage tests={TESTS} results={state.results} profile={state.profile} index={state.cardIndex} onIndex={goCard} onNext={() => handleGesture('OK')} onBack={() => handleGesture('POINT_LEFT')} />;
      break;
    case 'VISION_MAP':
      page = <VisionMapPage tests={TESTS} results={state.results} onNext={() => handleGesture('OK')} onBack={() => handleGesture('POINT_LEFT')} />;
      break;
    case 'FINAL_RESULT':
      page = (
        <FinalResultPage
          tests={TESTS}
          results={state.results}
          profile={state.profile}
          durationMs={state.screeningFinishedAt && state.screeningStartedAt ? state.screeningFinishedAt - state.screeningStartedAt : null}
          sessionCode={SESSION_CODE}
          finishedAt={Date.now()}
          onRestart={() => handleGesture('THUMBS_UP')}
          onBack={() => handleGesture('POINT_LEFT')}
        />
      );
      break;
  }

  const guide = phaseGuide(TESTS, state);
  const pageKey = `${TEST_PHASES.includes(state.phase) ? 'TEST' : state.phase}-${state.testIndex}`;

  if (state.phase === 'LANDING') {
    return (
      <div className="min-h-dvh" style={themeVars(phaseTheme)} data-phase={state.phase}>
        {page}
        {isDemo && <DemoPanel hidden={demoClean} />}
        {isDebug && <DebugPanel />}
      </div>
    );
  }

  // One screen, no scrolling: session bar, stage + instrument, and the action bar
  // with the gestures that work right now are always in view.
  return (
    <div className="flex h-dvh flex-col overflow-hidden" style={themeVars(phaseTheme)}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-paper focus:px-4 focus:py-2"
      >
        К содержимому
      </a>
      <SessionBar current={bar.current} done={bar.done} phaseLabel={bar.label} sessionCode={SESSION_CODE} startedAt={sessionStart.current} />
      <main
        id="main"
        data-phase={state.phase}
        data-test={test.id}
        className="mx-auto grid min-h-0 w-full max-w-[1440px] flex-1 grid-cols-12 content-start gap-x-6 gap-y-4 overflow-y-auto px-5 py-4 sm:px-10 lg:content-stretch lg:overflow-hidden lg:py-[clamp(16px,3vh,32px)]"
      >
        <section key={pageKey} className={`col-span-12 min-h-0 min-w-0 ${calibration ? 'lg:col-span-5' : 'lg:col-span-9'}`}>
          {page}
        </section>
        <div className={`order-first col-span-12 min-h-0 lg:order-none ${calibration ? 'lg:col-span-6 lg:col-start-7' : 'lg:col-span-3'}`}>
          <div
            className={`mx-auto w-full ${calibration ? 'max-w-[420px] lg:max-w-[min(100%,calc((100dvh-470px)*4/3))]' : 'max-w-[420px] lg:max-w-none'}`}
          >
            <Instrument flash={flash} />
          </div>
        </div>
      </main>
      <ActionBar guide={guide} />
      {isDemo && <DemoPanel hidden={demoClean} />}
      {isDebug && <DebugPanel />}
    </div>
  );
}
