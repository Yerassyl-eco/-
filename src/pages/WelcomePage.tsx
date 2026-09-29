import { ArrowRight, Hand, KeyboardOff, MouseOff, ScanFace, ThumbsUp, TriangleAlert } from 'lucide-react';
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
    <div className="pointer-events-none fixed bottom-0 right-0 h-px w-px overflow-hidden opacity-[0.01]" aria-hidden>
      <video ref={video} muted playsInline autoPlay className="h-px w-px" />
      <canvas ref={canvas} className="h-px w-px" />
    </div>
  );
}

function Stage({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <li className={`flex items-center gap-2 transition-colors duration-300 ${on ? 'text-ink' : 'text-graphite/60'}`}>
      <span className={`h-1 w-1 rounded-full transition-colors duration-300 ${on ? 'bg-cobalt' : 'bg-rule-strong'}`} aria-hidden />
      {children}
    </li>
  );
}

function CameraLine({ vision }: { vision: RuntimeState }) {
  const { status, engine } = vision;
  if (status === 'error') {
    const err = vision.cameraError ? CAMERA_ERROR_TEXT[vision.cameraError] : null;
    return (
      <div className="flex max-w-[34rem] flex-wrap items-center justify-end gap-x-4 gap-y-2 text-right">
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
  const text =
    status === 'ready'
      ? engine.handVisible
        ? 'Камера активна · рука в кадре'
        : 'Камера подключена и активна'
      : status === 'loading'
        ? 'Камера подключена · загружаю распознавание'
        : status === 'demo'
          ? 'Демо-режим · камера не используется'
          : 'Подключаю камеру · разрешите доступ в браузере';
  const live = status === 'ready';
  return (
    <p className="flex items-center gap-3 text-[14px] text-ink">
      <span className="relative flex h-2 w-2" aria-hidden>
        {live && <span className="absolute inset-0 animate-ping rounded-full bg-live/40 [animation-duration:2.4s]" />}
        <span className={`relative h-2 w-2 rounded-full ${live ? 'bg-live' : status === 'demo' ? 'bg-rule-strong' : 'animate-blink bg-graphite'}`} />
      </span>
      {text}
      <ScanFace size={26} strokeWidth={1.25} className={engine.face === 'ok' ? 'text-cobalt' : 'text-ink'} aria-hidden />
    </p>
  );
}

export function WelcomePage({ last, flash, onStart }: Props) {
  const vision = useVision();
  const { engine, status } = vision;
  const live = status === 'ready' || status === 'demo';
  const holding = engine.gesture === 'THUMBS_UP' && !engine.stable ? engine.holdProgress : engine.gesture === 'THUMBS_UP' ? 1 : 0;
  const issue = live && engine.issue && engine.issue !== 'NO_HAND' ? ISSUE_MESSAGES[engine.issue] : null;

  // One live line under the action: Error Mode first, then progress, then guidance.
  let hint: { tone: 'warn' | 'live' | 'idle'; text: string } | null = null;
  if (flash?.kind === 'hint') hint = { tone: 'warn', text: flash.text };
  else if (issue) hint = { tone: 'warn', text: `${issue.title}. ${issue.hint}` };
  else if (holding > 0) hint = { tone: 'live', text: 'Держите жест…' };
  else if (status === 'ready') hint = { tone: 'idle', text: engine.handVisible ? 'Рука в кадре. Покажите палец вверх.' : 'Поднимите руку на уровень груди.' };

  return (
    <div className="flex min-h-dvh flex-col">
      <HeadlessCamera />
      <header className="flex items-center justify-between px-5 pt-6 sm:px-10 lg:px-[4.2vw] lg:pt-11">
        <span className="text-[15px] font-semibold uppercase tracking-[0.2em] text-ink">Vision Motion</span>
        <span className="num flex items-center gap-4 text-[15px] text-ink" aria-label="Пять тестов">
          01 <span className="h-px w-7 bg-ink/50" aria-hidden /> 05
        </span>
      </header>

      <main id="main" data-phase="LANDING" className="grid flex-1 grid-cols-1 items-center gap-y-6 px-5 sm:px-10 lg:grid-cols-12 lg:gap-x-6 lg:px-[4.2vw]">
        <section className="order-2 pb-4 lg:order-1 lg:col-span-5 lg:pb-0" aria-labelledby="hero-title">
          <h1 id="hero-title" className="text-[clamp(44px,5.4vw,86px)] leading-[1.02] tracking-[-0.035em] text-ink">
            Проверим ваше зрение
          </h1>
          <p className="mt-6 max-w-[30ch] text-[clamp(19px,1.5vw,23px)] leading-[1.5] text-ink/80">
            Интерактивный скрининг зрения с&nbsp;управлением жестами.
          </p>

          <ul className="mt-9 flex flex-col gap-5 text-[17px] text-ink/80">
            <li className="flex items-center gap-5">
              <KeyboardOff size={30} strokeWidth={1.1} className="shrink-0 text-ink" aria-hidden /> Без клавиатуры
            </li>
            <li className="flex items-center gap-5">
              <MouseOff size={30} strokeWidth={1.1} className="shrink-0 text-ink" aria-hidden /> Без мыши
            </li>
            <li className="flex items-center gap-5">
              <Hand size={30} strokeWidth={1.1} className="shrink-0 text-ink" aria-hidden /> Только ваши жесты
            </li>
          </ul>

          <div className="mt-12 flex items-center gap-6">
            <button
              type="button"
              onClick={onStart}
              aria-label="Начать скрининг (жест «палец вверх»)"
              className="group relative flex h-[92px] w-[92px] shrink-0 items-center justify-center rounded-full bg-cobalt text-white shadow-[0_18px_40px_-18px_rgba(36,87,255,0.75)] transition-transform duration-300 [transition-timing-function:var(--ease-out-expo)] hover:scale-[1.04] active:scale-[0.98]"
            >
              <svg className="pointer-events-none absolute -inset-[7px] h-[106px] w-[106px] -rotate-90" viewBox="0 0 106 106" aria-hidden>
                <circle cx="53" cy="53" r="51" fill="none" stroke="var(--color-rule)" strokeWidth="1.5" />
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
              <ArrowRight size={34} strokeWidth={1.4} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </button>
            <p className="text-[clamp(21px,1.6vw,25px)] leading-[1.35] text-ink/85">
              <span className="flex items-center gap-2">
                Покажите
                <ThumbsUp size={26} strokeWidth={1.6} className="text-cobalt" aria-label="палец вверх" />
              </span>
              чтобы начать
            </p>
          </div>

          <p
            className={`mt-6 flex min-h-12 max-w-[40ch] items-start gap-2 text-[15px] leading-snug ${hint?.tone === 'warn' ? 'text-amber' : hint?.tone === 'live' ? 'text-cobalt' : 'text-graphite'}`}
            role="status"
            aria-live="polite"
          >
            {hint?.tone === 'warn' && <TriangleAlert size={15} strokeWidth={2} className="mt-0.5 shrink-0" aria-hidden />}
            {hint && <span key={hint.text} className="animate-enter">{hint.text}</span>}
          </p>
        </section>

        <div className="relative order-1 mx-auto w-full max-w-[min(86vw,440px)] pt-4 lg:order-2 lg:col-span-7 lg:max-w-[min(100%,74vh,860px)] lg:pt-0">
          <IrisScope locked={engine.handVisible} progress={holding} />
          <ul
            className="label mt-2 flex justify-center gap-6 text-[12px] tracking-[0.14em] lg:absolute lg:right-[-2vw] lg:top-[16%] lg:mt-0 lg:flex-col lg:gap-2"
            aria-label="Состояние распознавания"
          >
            <Stage on={status === 'ready' && engine.face !== 'missing' && engine.face !== 'unknown'}>Focus</Stage>
            <Stage on={engine.handVisible}>Align</Stage>
            <Stage on={holding > 0}>Scan</Stage>
          </ul>
        </div>
      </main>

      <footer className="flex flex-col-reverse gap-4 px-5 pb-6 pt-8 sm:px-10 lg:flex-row lg:items-end lg:justify-between lg:px-[4.2vw] lg:pb-9">
        <p className="max-w-[60ch] text-[13px] leading-relaxed text-graphite">
          <span className="text-ink">Digital vision screening</span> · Предварительный скрининг, не медицинский диагноз. Видео обрабатывается
          только в вашем браузере и никуда не отправляется.
          {last && (
            <span className="block">
              Последний скрининг: {formatDate(last.finishedAt ?? last.startedAt)}, {last.completedTests} из 5 тестов.
            </span>
          )}
        </p>
        <CameraLine vision={vision} />
      </footer>
    </div>
  );
}
