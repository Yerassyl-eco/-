import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { CAMERA_ERROR_TEXT } from '../../vision/camera/camera';
import { GESTURE_META, ISSUE_MESSAGES } from '../../vision/gestureEngine/messages';
import type { EngineSnapshot, FaceStatus, Gesture } from '../../vision/types';
import { useVision } from '../../vision/useVision';
import { visionRuntime, type RuntimeState } from '../../vision/VisionRuntime';
import { GestureIcon } from '../GestureIcon/GestureIcon';

export interface Flash {
  id: number;
  kind: 'ok' | 'hint';
  text: string;
}

const FACE_TEXT: Record<FaceStatus, string> = {
  unknown: '—',
  ok: 'по центру',
  missing: 'не видно',
  'too-low': 'низко',
  'too-high': 'высоко',
  'too-close': 'близко',
  'too-far': 'далеко',
  'off-center': 'не по центру',
};

const DIRECTION_ICON: Partial<Record<Gesture, typeof ArrowUp>> = {
  POINT_UP: ArrowUp,
  POINT_DOWN: ArrowDown,
  POINT_LEFT: ArrowLeft,
  POINT_RIGHT: ArrowRight,
};

type Tone = 'live' | 'warn' | 'idle' | 'ok';

function Dot({ tone, blink = false }: { tone: Tone; blink?: boolean }) {
  const c = { live: 'bg-[var(--accent)]', warn: 'bg-amber-line', idle: 'bg-rule-strong', ok: 'bg-ink' }[tone];
  return <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${c} ${blink ? 'animate-blink' : ''}`} aria-hidden />;
}

function Row({ label, children, tone = 'idle' }: { label: string; children: ReactNode; tone?: Tone }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-rule py-2">
      <dt className="label text-graphite">{label}</dt>
      <dd className={`flex items-center gap-2 text-[15px] ${tone === 'warn' ? 'text-amber' : 'text-ink'}`}>
        <Dot tone={tone} />
        {children}
      </dd>
    </div>
  );
}

/** Live gesture readout: GESTURE DETECTED → RIGHT, with a hold rule. */
function GestureReadout({ engine, flash }: { engine: EngineSnapshot; flash: Flash | null }) {
  const real = engine.gesture !== 'NONE' && engine.gesture !== 'UNKNOWN';
  const meta = real ? GESTURE_META[engine.gesture as Gesture] : null;
  const Arrow = real ? DIRECTION_ICON[engine.gesture as Gesture] : undefined;
  const accepted = flash?.kind === 'ok';
  return (
    <div className="border-b border-rule pb-3 lg:pt-3" aria-live="polite">
      <div className="flex items-baseline justify-between gap-3">
        <span className="label text-graphite">{accepted ? 'Принято' : real ? 'Жест распознан' : 'Жест'}</span>
        <span className="num text-xs text-graphite">{real ? `уверенность ${Math.round(engine.confidence * 100)}%` : '—'}</span>
      </div>
      <div key={accepted ? `a${flash!.id}` : engine.gesture} className="animate-enter mt-2 flex min-h-9 items-center gap-3">
        {accepted ? (
          <>
            <Check size={22} strokeWidth={2} className="shrink-0 text-accent" aria-hidden />
            <span className="text-[17px] font-semibold text-accent">{flash!.text}</span>
          </>
        ) : meta ? (
          <>
            <span className={`flex items-center gap-2 ${engine.stable ? 'text-accent' : 'text-ink'}`}>
              {Arrow ? <Arrow size={24} strokeWidth={1.75} aria-hidden /> : <GestureIcon gesture={engine.gesture as Gesture} size={24} />}
              <span className="text-[22px] font-semibold leading-none lg:text-[28px]">{meta.name}</span>
            </span>
            
          </>
        ) : (
          <span className="text-[15px] text-graphite">{engine.handVisible ? 'Рука в кадре — покажите жест' : 'Ожидаю руку в кадре'}</span>
        )}
      </div>
      <div className="relative mt-3 h-[2px] bg-rule">
        <span
          className={`absolute inset-y-0 left-0 w-full origin-left ${engine.stable ? 'bg-[var(--accent)]' : 'bg-ink'}`}
          style={{ transform: `scaleX(${real && !accepted ? engine.holdProgress : 0})`, transition: 'transform 90ms linear' }}
        />
      </div>
    </div>
  );
}

interface Signal {
  category: string;
  title: string;
  hint: string;
  key: string;
  info: boolean;
}

function readSignal(engine: EngineSnapshot, flash: Flash | null, live: boolean): Signal | null {
  if (flash?.kind === 'hint') {
    return { category: 'Жест', title: 'Этот жест сейчас не используется', hint: flash.text, key: `f${flash.id}`, info: false };
  }
  if (live && engine.issue) {
    const m = ISSUE_MESSAGES[engine.issue];
    return { category: m.category, title: m.title, hint: m.hint, key: engine.issue, info: engine.issue === 'NO_HAND' };
  }
  return null;
}

/** Error Mode content — the instrument's SIGNAL readout. */
function SignalBody({ s }: { s: Signal }) {
  return (
    <div key={s.key} className="animate-enter">
      <div className="flex items-center justify-between gap-3">
        <span className={`label flex items-center gap-1.5 ${s.info ? 'text-graphite' : 'text-amber'}`}>
          {!s.info && <TriangleAlert size={13} strokeWidth={2} aria-hidden />}
          {s.category}
        </span>
        <span className={`label flex items-center gap-1.5 ${s.info ? 'text-graphite' : 'text-amber'}`}>
          <Dot tone={s.info ? 'idle' : 'warn'} /> Сейчас
        </span>
      </div>
      <p className="mt-1.5 text-[15px] font-medium leading-snug text-ink">{s.title}</p>
      <p className="mt-0.5 text-[14px] leading-snug text-graphite">{s.hint}</p>
    </div>
  );
}

function CameraStatus({ vision }: { vision: RuntimeState }) {
  const err = vision.cameraError ? CAMERA_ERROR_TEXT[vision.cameraError] : null;
  const { status } = vision;
  const button = (
    <button
      type="button"
      onClick={() => void visionRuntime.start()}
      className="mt-4 min-h-11 border border-white px-4 text-sm font-medium transition-colors hover:bg-white hover:text-ink"
      style={{ borderRadius: 'var(--radius-hair)' }}
    >
      Разрешить камеру
    </button>
  );
  return (
    <div className="absolute inset-0 flex flex-col justify-end p-4 text-white lg:p-5">
      {status === 'error' ? (
        <div className="max-w-sm">
          <p className="label flex items-center gap-1.5 text-[#ffb020]">
            <TriangleAlert size={13} strokeWidth={2} aria-hidden /> Camera
          </p>
          <p className="mt-2 text-[16px] font-medium leading-snug">{vision.modelError ? 'Модель распознавания не загрузилась' : err?.title}</p>
          <p className="mt-1 text-sm text-white/75">{vision.modelError ?? err?.hint}</p>
          {button}
        </div>
      ) : status === 'demo' ? (
        <div>
          <p className="label text-white/60">Dev demo mode</p>
          <p className="mt-1 hidden text-sm text-white/80 sm:block">Камера отключена, жесты подаются с панели разработчика.</p>
        </div>
      ) : status === 'idle' ? (
        <div className="max-w-sm">
          <p className="text-[16px] font-medium">Для прохождения тестов необходим доступ к камере.</p>
          {button}
        </div>
      ) : (
        <div className="w-full max-w-xs">
          <p className="label text-white/75">{status === 'loading' ? 'Loading hand model' : 'Requesting camera'}</p>
          <div className="relative mt-3 h-px overflow-hidden bg-white/20">
            <span className="animate-scan absolute inset-y-0 left-0 w-1/3 bg-white" />
          </div>
          {status === 'requesting' && <p className="mt-3 hidden text-sm text-white/75 sm:block">Разрешите доступ во всплывающем окне браузера.</p>}
        </div>
      )}
    </div>
  );
}

/** Graduated ticks along the scope edges (every 10%, longer every 50%) and a centre reticle. */
function Graticule() {
  const ticks = Array.from({ length: 11 }, (_, i) => i);
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden>
      <g stroke="rgba(255,255,255,0.5)" strokeWidth="1">
        {ticks.map((i) => {
          const x = i * 40;
          const y = i * 30;
          const l = i % 5 === 0 ? 10 : 5;
          return (
            <g key={i}>
              <line x1={x} y1={0} x2={x} y2={l} vectorEffect="non-scaling-stroke" />
              <line x1={x} y1={300} x2={x} y2={300 - l} vectorEffect="non-scaling-stroke" />
              <line x1={0} y1={y} x2={l} y2={y} vectorEffect="non-scaling-stroke" />
              <line x1={400} y1={y} x2={400 - l} y2={y} vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}
        <line x1="194" y1="150" x2="206" y2="150" vectorEffect="non-scaling-stroke" />
        <line x1="200" y1="142" x2="200" y2="158" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

/** The camera as a measuring instrument: scope, telemetry, readout, signal. */
export function Instrument({ flash }: { flash: Flash | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vision = useVision();

  useEffect(() => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    visionRuntime.attach(v, c);
    return () => visionRuntime.detach(v);
  }, []);

  const { engine, status } = vision;
  const live = status === 'ready';
  const demo = status === 'demo';
  const signal = readSignal(engine, flash, live || demo);
  const warn = !!signal && !signal.info;
  // Keep the band off the edge the user is correcting.
  const bandTop = engine.issue === 'HAND_OUT_BOTTOM' || engine.issue === 'FACE_TOO_LOW';
  const handTone: Tone = engine.handCount > 1 ? 'warn' : engine.handVisible ? 'live' : 'idle';
  const faceTone: Tone = engine.face === 'ok' ? 'ok' : engine.face === 'unknown' ? 'idle' : 'warn';

  return (
    <section aria-label="Инструмент: камера и распознавание жестов" className="w-full">
      <div className="flex items-baseline justify-between gap-3 pb-2">
        <span className="label text-ink">
          Камера
          {live && <span className="num ml-2 font-normal tracking-normal text-graphite">{engine.fps} к/с</span>}
        </span>
        <span className={`label flex items-center gap-1.5 ${warn ? 'text-amber' : live ? 'text-accent' : 'text-graphite'}`}>
          <Dot tone={warn ? 'warn' : live ? 'live' : 'idle'} blink={live && !warn} />
          {warn ? 'Поправьте' : live ? 'Отслеживание' : demo ? 'Демо' : status === 'error' ? 'Нет камеры' : 'Запуск'}
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-x-4 lg:block">
        <div className="self-start">
          <div className="relative aspect-[4/3] overflow-hidden bg-scope text-white/70" style={{ borderRadius: 'var(--radius-control)', boxShadow: 'var(--shadow-card)' }}>
            <video
              ref={videoRef}
              className={`mirror absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${live ? 'opacity-100' : 'opacity-0'}`}
              muted
              playsInline
              autoPlay
              aria-label="Видео с вашей камеры"
            />
            <canvas ref={canvasRef} className="mirror pointer-events-none absolute inset-0 h-full w-full object-cover" aria-hidden />
            <Graticule />
            {!live && <CameraStatus vision={vision} />}
            {signal && (
              <div
                className={`absolute inset-x-0 hidden bg-paper/95 px-4 py-3 lg:block ${bandTop ? 'top-0 border-b-2' : 'bottom-0 border-t-2'} ${signal.info ? 'border-rule-strong' : 'border-amber-line'}`}
                role="status"
                aria-live="polite"
              >
                <SignalBody s={signal} />
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <dl className="hidden lg:mt-3 lg:block">
            <Row label="Рука" tone={handTone}>
              {engine.handCount > 1 ? `${engine.handCount} руки` : engine.handVisible ? 'в кадре' : 'не видна'}
            </Row>
            <Row label="Лицо" tone={faceTone}>
              {FACE_TEXT[engine.face]}
            </Row>
          </dl>
          <GestureReadout engine={engine} flash={flash} />
          <div className="py-3 lg:hidden" role="status" aria-live="polite" aria-atomic="true">
            {signal ? (
              <div className={`border-t-2 pt-2 ${signal.info ? 'border-rule-strong' : 'border-amber-line'}`}>
                <SignalBody s={signal} />
              </div>
            ) : (
              <span className="label flex items-center gap-1.5 text-graphite">
                <Dot tone="ok" /> Всё в порядке
              </span>
            )}
          </div>
          <div className="hidden items-center justify-between py-2.5 lg:flex">
            <span className="label text-graphite">Сигнал</span>
            <span className={`label flex items-center gap-1.5 ${warn ? 'text-amber' : 'text-ink'}`}>
              <Dot tone={warn ? 'warn' : signal ? 'idle' : 'ok'} /> {signal ? signal.category : 'В порядке'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
