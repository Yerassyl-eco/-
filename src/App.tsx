import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { DemoPanel } from './components/DemoPanel/DemoPanel';
import { Instrument, type Flash } from './components/Instrument/Instrument';
import { SessionBar } from './components/SessionBar/SessionBar';
import { CalibrationPage } from './pages/CalibrationPage';
import { FinalResultPage } from './pages/FinalResultPage';
import { PreparationPage } from './pages/PreparationPage';
import { TestIntroPage } from './pages/TestIntroPage';
import { TestPage } from './pages/TestPage';
import { TestResultPage } from './pages/TestResultPage';
import { WelcomePage } from './pages/WelcomePage';
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
const CALIBRATION_PHASES: Phase[] = ['LANDING', 'CAMERA_SETUP', 'PREPARATION'];
const isDemo =
  import.meta.env.VITE_DEMO === '1' ||
  new URLSearchParams(window.location.search).has('demo') ||
  window.location.hash === '#demo';
const SCREEN_SETTLE_MS = 1200;
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
      if ((phase === 'TEST_RESULT' || phase === 'TEST_INTRO') && performance.now() - phaseEnteredAt.current < SCREEN_SETTLE_MS) {
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
      expectHand: !['FINAL_RESULT', 'ANSWER_CONFIRMED'].includes(state.phase) && !observing,
      faceCheck:
        ['CAMERA_SETUP', 'PREPARATION', 'TEST_INTRO'].includes(state.phase) || (TEST_PHASES.includes(state.phase) && test.id === 'acuity'),
    });
    if (observing) {
      const t = setTimeout(() => visionRuntime.setOptions({ expectHand: true }), state.trialReadyAt - performance.now());
      return () => clearTimeout(t);
    }
  }, [state.phase, state.testIndex, state.trialReadyAt]);

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

  useEffect(() => {
    if (state.phase === 'ANSWER_SELECTED' || state.phase === 'ANSWER_CONFIRMED') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.phase, state.testIndex, state.trialIndex]);

  const test = TESTS[state.testIndex];
  const calibration = CALIBRATION_PHASES.includes(state.phase);

  const bar = (() => {
    switch (state.phase) {
      case 'LANDING':
        return { current: -1, done: 0, label: 'Standby' };
      case 'CAMERA_SETUP':
      case 'PREPARATION':
        return { current: -1, done: 0, label: 'Calibration' };
      case 'FINAL_RESULT':
        return { current: -1, done: 5, label: 'Report' };
      case 'TEST_RESULT':
        return { current: state.testIndex, done: state.testIndex + 1, label: 'Result' };
      default:
        return { current: state.testIndex, done: state.testIndex, label: 'Test' };
    }
  })();

  const selectByValue = (v: string) => {
    const opt = test.options(state.trials[state.testIndex][state.trialIndex]).find((o) => o.value === v);
    if (opt) handleGesture(opt.gesture);
  };

  let page: ReactNode = null;
  switch (state.phase) {
    case 'LANDING':
      page = <WelcomePage last={last} onStart={() => handleGesture('THUMBS_UP')} />;
      break;
    case 'CAMERA_SETUP':
      page = <CalibrationPage vision={vision} onContinue={() => handleGesture('THUMBS_UP')} />;
      break;
    case 'PREPARATION':
      page = <PreparationPage replayKey={state.replayKey} onBegin={() => handleGesture('THUMBS_UP')} onReplay={() => handleGesture('OPEN_PALM')} />;
      break;
    case 'TEST_INTRO':
      page = (
        <TestIntroPage
          test={test}
          firstTrial={state.trials[state.testIndex][0]}
          replayKey={state.replayKey}
          onStart={() => handleGesture('THUMBS_UP')}
          onReplay={() => handleGesture('OPEN_PALM')}
        />
      );
      break;
    case 'TEST_ACTIVE':
    case 'ANSWER_SELECTED':
    case 'ANSWER_CONFIRMED':
      page = <TestPage test={test} state={state} onGesture={handleGesture} onSelect={selectByValue} />;
      break;
    case 'TEST_RESULT':
      page = (
        <TestResultPage
          test={test}
          next={TESTS[state.testIndex + 1] ?? null}
          summary={state.results[state.testIndex]!}
          records={state.answers[state.testIndex]}
          trials={state.trials[state.testIndex]}
          onNext={() => handleGesture('THUMBS_UP')}
        />
      );
      break;
    case 'FINAL_RESULT':
      page = (
        <FinalResultPage
          tests={TESTS}
          results={state.results}
          durationMs={state.screeningFinishedAt && state.screeningStartedAt ? state.screeningFinishedAt - state.screeningStartedAt : null}
          sessionCode={SESSION_CODE}
          finishedAt={Date.now()}
          onRestart={() => handleGesture('OPEN_PALM')}
          onHome={() => dispatch({ type: 'GO_HOME' })}
        />
      );
      break;
  }

  const pageKey = `${TEST_PHASES.includes(state.phase) ? 'TEST' : state.phase}-${state.testIndex}`;

  return (
    <div className="min-h-dvh">
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
        className="mx-auto grid max-w-[1440px] grid-cols-12 gap-x-6 gap-y-8 px-5 pb-24 pt-8 sm:px-10 lg:pt-12"
      >
        <section key={pageKey} className={`col-span-12 min-w-0 ${calibration ? 'lg:col-span-5' : 'lg:col-span-9'}`}>
          {page}
        </section>
        <div
          className={`order-first col-span-12 lg:order-none ${calibration ? 'lg:col-span-6 lg:col-start-7' : 'lg:col-span-3'}`}
        >
          <div className={`lg:sticky lg:top-24 ${calibration ? '' : 'mx-auto max-w-[420px] lg:max-w-none'}`}>
            <Instrument flash={flash} />
          </div>
        </div>
      </main>
      {isDemo && <DemoPanel />}
    </div>
  );
}

