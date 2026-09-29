import { ArrowRight, Hand, ScanFace, ThumbsUp, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import type { Flash } from '../components/Instrument/Instrument';
import { IrisScope } from '../components/Iris/IrisScope';
import { CAMERA_ERROR_TEXT } from '../vision/camera/camera';
import { ISSUE_MESSAGES } from '../vision/gestureEngine/messages';
import { useVision } from '../vision/useVision';
import { visionRuntime, type RuntimeState } from '../vision/VisionRuntime';
import type { StoredScreening } from '../utils/storage';
import { formatDate } from '../utils/format';

interface Props {
  last: StoredScreening | null;
  flash: Flash | null;
  onStart: () => void;
}

/**
 * The camera stays connected on the landing screen but is never shown:
 * the video element exists only so the hand tracker can read frames.
 */
function HeadlessCamera() {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const v = video.current;
    const c = canvas.current;
    if (!v || !c) return;
    visionRuntime.attach(v, c);
    return () => visionRuntime.detach(v);
  }, []);
  return (
    // A real-sized video kept under the page background: browsers keep
    // decoding it (a 1px or transparent video may be paused as "hidden").
    <div className="pointer-events-none fixed left-0 top-0 -z-10 h-[120px] w-[160px] overflow-hidden" aria-hidden>
      <video ref={video} muted playsInline className="h-full w-full object-cover" />
      <canvas ref={canvas} className="hidden" />
    </div>
  );
}

/** Instrument margin note: graphite at rest, ink and heavier when live. */
function Stage({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <li className={`transition-colors duration-300 ${on ? 'font-medium text-ink' : 'font-normal text-graphite'}`}>
      {children}
      <span className="sr-only">{on ? ': активно' : ': ожидание'}</span>
    </li>
  );
}

/** Prohibition marks drawn for this page: the object inside a slashed circle. */
function NoKeyboard() {
  return (
    <svg viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden className="h-[30px] w-[30px] shrink-0 text-ink lg:h-[34px] lg:w-[34px]">
      <circle cx="17" cy="17" r="15.5" />
      <rect x="8.5" y="12" width="17" height="10" rx="1.5" />
      <path d="M11.5 15h1M15 15h1M18.5 15h1M22 15h.5M11.5 18.5h11" strokeLinecap="round" />
      <path d="M6 6l22 22" />
    </svg>
  );
}
function NoMouse() {
  return (
    <svg viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden className="h-[30px] w-[30px] shrink-0 text-ink lg:h-[34px] lg:w-[34px]">
      <circle cx="17" cy="17" r="15.5" />
      <path d="M11 11l12 12M23 11L11 23" />
    </svg>
  );
}

function CameraLine({ vision }: { vision: RuntimeState }) {
  const { status, engine } = vision;
  if (status === 'error') {
    const err = vision.cameraError ? CAMERA_ERROR_TEXT[vision.cameraError] : null;
    return (
      <div className="flex max-w-[34rem] flex-wrap items-center gap-x-4 gap-y-2 lg:justify-end lg:text-right">
        <p className="text-[14px] leading-snug text-ink">
          <span className="inline-flex items-center gap-1.5 font-semibold text-amber">
            <TriangleAlert size={14} strokeWidth={2} aria-hidden /> {vision.modelError ? 'Распознавание не загрузилось' : err?.title}
          </span>
          <span className="block text-graphite">{vision.modelError ?? err?.hint}</span>
        </p>
        <button
          type="button"
          onClick={() => void visionRuntime.start()}
          className="min-h-11 rounded-full border border-ink px-5 text-[14px] font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Разрешить камеру
        </button>
      </div>
    );
  }
  const live = status === 'ready';
  if (live && (vision.videoBlocked || vision.stalled)) {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 lg:justify-end">
        <p className="flex items-center gap-1.5 text-[14px] font-semibold text-amber">
          <TriangleAlert size={14} strokeWidth={2} aria-hidden />
          {vision.videoBlocked ? 'Браузер ждёт клика, чтобы включить камеру' : 'Видео с камеры остановилось'}
        </p>
        <button
          type="button"
          onClick={() => visionRuntime.resume()}
          className="min-h-11 rounded-full bg-ink px-5 text-[14px] font-semibold text-paper transition-opacity hover:opacity-85"
        >
          Включить камеру
        </button>
      </div>
    );
  }
  const text = live
    ? engine.handVisible
      ? 'Камера активна · рука в кадре'
      : 'Камера подключена и активна'
    : status === 'loading'
      ? 'Камера подключена · загружаю распознавание'
      : status === 'demo'
        ? 'Демо-режим'
        : 'Подключаю камеру · разрешите доступ в браузере';
  return (
    <p className="flex items-center gap-3 text-[12.5px] text-graphite">
      <span className={`h-2 w-2 shrink-0 rounded-full ${live ? 'bg-live' : status === 'demo' ? 'bg-rule-strong' : 'animate-blink bg-graphite'}`} aria-hidden />
      <span className="mr-1">{text}</span>
      <ScanFace size={26} strokeWidth={1.2} className={engine.face === 'ok' ? 'text-cobalt' : 'text-ink'} aria-hidden />
    </p>
  );
}

export function WelcomePage({ last, flash, onStart }: Props) {
  const vision = useVision();
  const { engine, status } = vision;
  const live = status === 'ready' || status === 'demo';
  const holding = engine.gesture === 'THUMBS_UP' ? (engine.stable ? 1 : engine.holdProgress) : 0;
  const issue = live && engine.issue && engine.issue !== 'NO_HAND' ? ISSUE_MESSAGES[engine.issue] : null;

  // One live line under the action: Error Mode first, then progress, then guidance.
  let hint: { tone: 'warn' | 'live' | 'idle'; text: string } | null = null;
  if (flash?.kind === 'hint') hint = { tone: 'warn', text: flash.text };
  else if (issue) hint = { tone: 'warn', text: `${issue.title}. ${issue.hint}` };
  else if (holding > 0) hint = { tone: 'live', text: 'Держите жест…' };
  else if (status === 'ready') hint = { tone: 'idle', text: engine.handVisible ? 'Рука в кадре. Покажите палец вверх.' : 'Поднимите руку на уровень груди.' };

  return (
    <div className="flex min-h-dvh flex-col bg-paper-2 lg:h-dvh lg:overflow-hidden">
      <HeadlessCamera />
      <header className="flex items-center justify-between px-5 pt-6 sm:px-10 lg:px-[4.2vw] lg:pt-[clamp(20px,4.4vh,44px)]">
        <span className="text-[15px] font-semibold uppercase tracking-[0.2em] text-ink lg:text-[16.5px]">Vision Motion</span>
        <span className="flex items-center gap-5 text-[17px] tabular-nums text-ink" aria-label="Пять тестов">
          01 <span className="h-px w-7 bg-ink/60" aria-hidden /> 05
        </span>
      </header>

      <main
        id="main"
        data-phase="LANDING"
        className="grid flex-1 grid-cols-1 items-center gap-y-5 px-5 sm:px-10 lg:grid-cols-12 lg:gap-x-6 lg:px-[4.2vw]"
      >
        <section className="order-2 lg:order-1 lg:col-span-5 lg:pt-[6vh]" aria-labelledby="hero-title">
          <h1 id="hero-title" className="text-[clamp(40px,min(4.7vw,7.2vh),76px)] leading-[1.1] tracking-[-0.015em] text-ink">
            Проверим ваше зрение
          </h1>
          <p className="mt-4 max-w-[30ch] text-[clamp(18px,1.5vw,23px)] leading-[1.5] text-ink/80 lg:mt-6">
            Интерактивный скрининг зрения с&nbsp;управлением жестами.
          </p>

          <ul className="mt-6 flex flex-col gap-[10px] text-[16px] text-ink/80 lg:mt-[clamp(20px,3.6vh,36px)] lg:gap-[clamp(12px,2.1vh,21px)] lg:text-[17px]">
            <li className="flex items-center gap-6 lg:gap-[29px]">
              <NoKeyboard /> Без клавиатуры
            </li>
            <li className="flex items-center gap-6 lg:gap-[29px]">
              <NoMouse /> Без мыши
            </li>
            <li className="flex items-center gap-6 lg:gap-[29px]">
              <Hand strokeWidth={1.1} className="h-[30px] w-[30px] shrink-0 text-ink lg:h-[34px] lg:w-[34px]" aria-hidden /> Только ваши жесты
            </li>
          </ul>

          <div className="relative mt-8 lg:mt-[clamp(28px,6.5vh,76px)]">
            <div className="flex items-center gap-[22px]">
              <button
                type="button"
                onClick={onStart}
                aria-label="Начать скрининг (жест «палец вверх»)"
                className="group relative flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full bg-cobalt text-white transition-transform duration-300 [transition-timing-function:var(--ease-out-expo)] hover:scale-[1.04] active:scale-[0.98] lg:h-[87px] lg:w-[87px]"
              >
                {holding > 0 && (
                  <svg className="pointer-events-none absolute -inset-[7px] h-[calc(100%+14px)] w-[calc(100%+14px)] -rotate-90" viewBox="0 0 106 106" aria-hidden>
                    <circle cx="53" cy="53" r="51" fill="none" stroke="var(--color-rule-strong)" strokeWidth="1.5" />
                    <circle
                      cx="53"
                      cy="53"
                      r="51"
                      fill="none"
                      stroke="var(--color-cobalt)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      pathLength={1}
                      strokeDasharray="1 1"
                      strokeDashoffset={1 - holding}
                      style={{ transition: 'stroke-dashoffset 90ms linear' }}
                    />
                  </svg>
                )}
                <ArrowRight size={30} strokeWidth={1.4} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </button>
              <p className="text-[clamp(20px,1.5vw,23px)] leading-[1.4] text-ink/85">
                <span className="flex items-center gap-2">
                  Покажите
                  <ThumbsUp size={24} strokeWidth={1.6} className="text-cobalt" aria-label="палец вверх" />
                </span>
                чтобы начать
              </p>
            </div>

            <p
              className={`mt-4 flex min-h-10 max-w-[40ch] items-start gap-2 text-[15px] leading-snug ${
                hint?.tone === 'warn' ? 'text-amber' : hint?.tone === 'live' ? 'text-cobalt' : 'text-graphite'
              }`}
              role="status"
              aria-live="polite"
            >
              {hint?.tone === 'warn' && <TriangleAlert size={15} strokeWidth={2} className="mt-0.5 shrink-0" aria-hidden />}
              {hint && (
                <span key={hint.text} className="animate-enter">
                  {hint.text}
                </span>
              )}
            </p>
          </div>
        </section>

        <div className="relative order-1 mx-auto w-full max-w-[min(64vw,260px)] pt-4 sm:max-w-[min(56vw,380px)] lg:order-2 lg:col-span-7 lg:-left-[1.7vw] lg:w-[min(78vh,56vw,980px)] lg:max-w-none lg:justify-self-center lg:pt-0">
          <IrisScope locked={engine.handVisible} progress={holding} />
          <ul
            className="mt-1 flex justify-center gap-6 text-[12px] uppercase tracking-[0.08em] lg:absolute lg:left-[calc(90%+35px)] lg:top-[27%] lg:mt-0 lg:flex-col lg:gap-0 lg:text-[11.5px] lg:leading-[19px]"
            aria-label="Состояние распознавания"
          >
            <Stage on={status === 'ready' && engine.face !== 'missing' && engine.face !== 'unknown'}>Focus</Stage>
            <Stage on={engine.handVisible}>Align</Stage>
            <Stage on={holding > 0}>Scan</Stage>
          </ul>
        </div>
      </main>

      <footer className="px-5 pb-6 pt-6 sm:px-10 lg:px-[4.2vw] lg:pb-[clamp(16px,4vh,60px)] lg:pt-0">
        <div className="flex lg:justify-end">
          <CameraLine vision={vision} />
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-graphite lg:mt-[clamp(10px,2.6vh,34px)]">
          Digital vision screening · предварительный скрининг, не диагноз · видео не покидает браузер
          {last && <> · последний скрининг {formatDate(last.finishedAt ?? last.startedAt)}, {last.completedTests} из 5</>}
        </p>
      </footer>
    </div>
  );
}
