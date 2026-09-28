import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { CameraView } from './components/CameraView/CameraView';
import { DemoPanel } from './components/DemoPanel/DemoPanel';
import { ErrorMessage, type Flash } from './components/ErrorMessage/ErrorMessage';
import { GesturePrompt, type PromptChip } from './components/GesturePrompt/GesturePrompt';
import { Header } from './components/Header/Header';
import { PHASE_PROMPTS } from './data/testConfig';
import { CameraSetupPage } from './pages/CameraSetupPage';
import { FinalResultPage } from './pages/FinalResultPage';
import { LandingPage } from './pages/LandingPage';
import { PreparationPage } from './pages/PreparationPage';
import { TestIntroPage } from './pages/TestIntroPage';
import { TestPage } from './pages/TestPage';
import { TestResultPage } from './pages/TestResultPage';
import { createTrials, gestureEmoji, initialState, makeReducer, routeGesture, type Phase } from './state/testMachine';
import { TESTS } from './tests';
import { playSound } from './utils/sound';
import { lastCompleted, saveProgress } from './utils/storage';
import { GESTURE_META } from './vision/gestureEngine/messages';
import type { Gesture } from './vision/types';
import { useVision } from './vision/useVision';
import { visionRuntime } from './vision/VisionRuntime';

const reducer = makeReducer(TESTS);
const TEST_PHASES: Phase[] = ['TEST_ACTIVE', 'ANSWER_SELECTED', 'ANSWER_CONFIRMED'];
const isDemo =
  import.meta.env.VITE_DEMO === '1' ||
  new URLSearchParams(window.location.search).has('demo') ||
  window.location.hash === '#demo';
const SCREEN_SETTLE_MS = 1200;

export default function App() {
  const [state, dispatch] = useReducer(reducer, TESTS, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const vision = useVision();
  const [flash, setFlash] = useState<Flash | null>(null);
  const flashId = useRef(0);
  const wallStart = useRef(Date.now());
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
    const t = setTimeout(() => setFlash(null), flash.kind === 'ok' ? 1600 : 3200);
    return () => clearTimeout(t);
  }, [flash]);

  /** Single entry for every input: camera gestures, demo panel and fallback buttons. */
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
        if (a.type === 'CONFIRM') playSound('confirm');
        else playSound('detect');
        showFlash('ok', r.feedback ?? `Отлично! Жест распознан: ${gestureEmoji(g)} ${GESTURE_META[g].name}`);
      } else if (r.kind === 'reject') {
        playSound('error');
        showFlash('hint', r.hint);
      }
    },
    [showFlash],
  );

  // Start camera (or demo mode) and subscribe to committed gestures.
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
        ['CAMERA_SETUP', 'PREPARATION', 'TEST_INTRO'].includes(state.phase) ||
        (TEST_PHASES.includes(state.phase) && test.id === 'acuity'),
    });
    if (observing) {
      const t = setTimeout(() => visionRuntime.setOptions({ expectHand: true }), state.trialReadyAt - performance.now());
      return () => clearTimeout(t);
    }
  }, [state.phase, state.testIndex, state.trialReadyAt]);

  // Auto-advance after "Ответ принят".
  useEffect(() => {
    if (state.phase !== 'ANSWER_CONFIRMED') return;
    const t = setTimeout(() => dispatch({ type: 'ADVANCE', now: performance.now() }), 900);
    return () => clearTimeout(t);
  }, [state.phase]);

  // Persist results & celebrate finished tests.
  useEffect(() => {
    if (state.phase === 'TEST_INTRO' && state.testIndex === 0) wallStart.current = Date.now();
    if (state.phase === 'TEST_RESULT') {
      playSound('complete');
      saveProgress(wallStart.current, state.results, state.testIndex === TESTS.length - 1);
    }
  }, [state.phase, state.testIndex, state.results]);

  // Scroll to top between screens (important on phones).
  useEffect(() => {
    if (state.phase === 'ANSWER_SELECTED' || state.phase === 'ANSWER_CONFIRMED') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.phase, state.testIndex]);

  const test = TESTS[state.testIndex];
  const inTest = TEST_PHASES.includes(state.phase);

  // Progress header.
  const progress = (() => {
    switch (state.phase) {
      case 'LANDING':
      case 'CAMERA_SETUP':
        return { current: -1, done: 0, label: null };
      case 'PREPARATION':
        return { current: 0, done: 0, label: 'Подготовка' };
      case 'FINAL_RESULT':
        return { current: -1, done: 6, label: 'Готово' };
      case 'TEST_RESULT':
        return { current: state.testIndex + 1, done: state.testIndex + 2, label: `Тест ${test.number} из 5` };
      default:
        return { current: state.testIndex + 1, done: state.testIndex + 1, label: `Тест ${test.number} из 5` };
    }
  })();

  // Gesture hint chips (also mouse / keyboard fallback).
  const chips: PromptChip[] = (() => {
    if (inTest) {
      const trial = state.trials[state.testIndex][state.trialIndex];
      const opts = test.options(trial).map((o) => ({
        gesture: o.gesture,
        label: o.label,
        onClick: () => handleGesture(o.gesture),
        highlighted: state.selected === o.value,
      }));
      return [
        ...opts,
        { gesture: 'FIST', label: 'Подтвердить', onClick: () => handleGesture('FIST'), highlighted: state.phase === 'ANSWER_SELECTED' },
        { gesture: 'OPEN_PALM', label: 'Отменить', onClick: () => handleGesture('OPEN_PALM') },
      ];
    }
    return (PHASE_PROMPTS[state.phase] ?? []).map((p) => ({ ...p, onClick: () => handleGesture(p.gesture), highlighted: p.gesture === 'THUMBS_UP' }));
  })();

  let page: ReactNode = null;
  switch (state.phase) {
    case 'LANDING':
      page = <LandingPage last={last} />;
      break;
    case 'CAMERA_SETUP':
      page = <CameraSetupPage vision={vision} />;
      break;
    case 'PREPARATION':
      page = <PreparationPage replayKey={state.replayKey} face={vision.engine.face} />;
      break;
    case 'TEST_INTRO':
      page = <TestIntroPage test={test} replayKey={state.replayKey} />;
      break;
    case 'TEST_ACTIVE':
    case 'ANSWER_SELECTED':
    case 'ANSWER_CONFIRMED':
      page = <TestPage test={test} state={state} onSelect={(v) => {
        const opt = test.options(state.trials[state.testIndex][state.trialIndex]).find((o) => o.value === v);
        if (opt) handleGesture(opt.gesture);
      }} />;
      break;
    case 'TEST_RESULT':
      page = <TestResultPage test={test} summary={state.results[state.testIndex]!} isLast={state.testIndex === TESTS.length - 1} />;
      break;
    case 'FINAL_RESULT':
      page = (
        <FinalResultPage
          tests={TESTS}
          results={state.results}
          durationMs={state.screeningFinishedAt && state.screeningStartedAt ? state.screeningFinishedAt - state.screeningStartedAt : null}
          onRestart={() => handleGesture('OPEN_PALM')}
          onHome={() => dispatch({ type: 'GO_HOME' })}
        />
      );
      break;
  }

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        К содержимому
      </a>
      <Header current={progress.current} done={progress.done} stepLabel={progress.label} />
      <main id="main" data-phase={state.phase} data-test={test.id} className="mx-auto grid max-w-7xl gap-5 px-4 pb-28 pt-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8 lg:pt-8">
        {/* camera column: first on phones, right on desktop */}
        <aside className="order-first flex flex-col gap-3 lg:order-last lg:sticky lg:top-28 lg:self-start">
          <div className={`mx-auto w-full transition-all duration-500 lg:max-w-none ${inTest ? 'max-w-[230px] sm:max-w-[340px]' : 'max-w-[300px] sm:max-w-[440px]'}`}>
            <CameraView />
          </div>
          <ErrorMessage issue={vision.status === 'ready' ? vision.engine.issue : null} flash={flash} />
          <div className="hidden lg:block">
            <GesturePrompt items={chips} />
          </div>
        </aside>
        <section className="min-w-0" aria-live="polite">
          <div key={`${state.phase === 'ANSWER_SELECTED' || state.phase === 'ANSWER_CONFIRMED' ? 'TEST_ACTIVE' : state.phase}-${state.testIndex}`} className="animate-fade-in">
            {page}
          </div>
          <div className="mt-6 lg:hidden">
            <GesturePrompt items={chips} />
          </div>
        </section>
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs leading-relaxed text-slate-500 sm:px-6">
        Vision Motion — предварительный скрининг зрения, не является медицинским диагнозом. Видео с камеры обрабатывается локально в браузере и не
        отправляется на сервер.
      </footer>
      {isDemo && <DemoPanel />}
    </div>
  );
}
