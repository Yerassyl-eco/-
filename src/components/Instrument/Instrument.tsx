import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { CAMERA_ERROR_TEXT } from '../../vision/camera/camera';
import { GESTURE_META, ISSUE_MESSAGES, type SignalCategory } from '../../vision/gestureEngine/messages';
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
  ok: 'CENTERED',
  missing: 'NOT IN FRAME',
  'too-low': 'TOO LOW',
  'too-high': 'TOO HIGH',
  'too-close': 'TOO CLOSE',
  'too-far': 'TOO FAR',
  'off-center': 'OFF CENTER',
};

const DIRECTION_ICON: Partial<Record<Gesture, typeof ArrowUp>> = {
  POINT_UP: ArrowUp,
  POINT_DOWN: ArrowDown,
  POINT_LEFT: ArrowLeft,
  POINT_RIGHT: ArrowRight,
};

function Dot({ tone }: { tone: 'live' | 'warn' | 'idle' | 'ok' }) {
  const c = { live: 'bg-cobalt', warn: 'bg-amber-line', idle: 'bg-rule-strong', ok: 'bg-green' }[tone];
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${c} ${tone === 'live' ? 'animate-blink' : ''}`} aria-hidden />;
}

function Row({ label, children, tone = 'idle' }: { label: string; children: ReactNode; tone?: 'live' | 'warn' | 'idle' | 'ok' }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-rule py-2">
      <dt className="label text-graphite">{label}</dt>
      <dd className={`num flex items-center gap-2 text-[13px] ${tone === 'warn' ? 'text-amber' : tone === 'ok' ? 'text-green' : 'text-ink'}`}>
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
      <div className="flex items-baseline justify-between">
        <span className="label text-graphite">{accepted ? 'Accepted' : real ? 'Gesture detected' : 'Gesture'}</span>
        <span className="num text-xs text-graphite">{real ? `${Math.round(engine.confidence * 100)}% CONF` : '—'}</span>
      </div>
      <div key={accepted ? `a${flash!.id}` : engine.gesture} className="animate-enter mt-2 flex min-h-9 items-center gap-3">
        {accepted ? (
          <>
            <Check size={22} strokeWidth={2} className="text-green" aria-hidden />
            <span className="text-[15px] font-medium text-green">{flash!.text}</span>
          </>
        ) : meta ? (
          <>
            <span className={`flex items-center gap-2 ${engine.stable ? 'text-cobalt' : 'text-ink'}`}>
              {Arrow ? <Arrow size={24} strokeWidth={1.75} aria-hidden /> : <GestureIcon gesture={engine.gesture as Gesture} size={24} />}
              <span className="text-[20px] font-medium leading-none tracking-[-0.01em] lg:text-[26px]">{meta.label}</span>
            </span>
            <span className="ml-auto hidden text-[13px] text-graphite sm:inline">{meta.name}</span>
          </>
        ) : (
          <span className="text-[15px] text-graphite">{engine.handVisible ? 'Рука в кадре — покажите жест' : 'Ожидаю руку в кадре'}</span>
        )}
      </div>
      <div className="relative mt-3 h-[2px] bg-rule">
        <span
          className={`absolute inset-y-0 left-0 w-full origin-left ${engine.stable ? 'bg-cobalt' : 'bg-ink'}`}
          style={{ transform: `scaleX(${real ? engine.holdProgress : 0})`, transition: 'transform 90ms linear' }}
        />
      </div>
    </div>
  );
}

/** Error Mode: part of the instrument, not a popup. */
function SignalPanel({ engine, flash, live }: { engine: EngineSnapshot; flash: Flash | null; live: boolean }) {
  let content: { category: SignalCategory | string; title: string; hint: string; key: string; info?: boolean } | null = null;
  if (flash?.kind === 'hint') {
    content = { category: 'GESTURE', title: 'Этот жест сейчас не используется', hint: flash.text, key: `f${flash.id}` };
  } else if (live && engine.issue) {
    const m = ISSUE_MESSAGES[engine.issue];
    content = { category: m.category, title: m.title, hint: m.hint, key: engine.issue, info: engine.issue === 'NO_HAND' };
  }
  return (
    <div className="py-3 lg:min-h-[124px]" role="status" aria-live="polite" aria-atomic="true">
      {content ? (
        <div key={content.key} className="animate-enter">
          <div className="flex items-baseline justify-between">
            <span className={`label ${content.info ? 'text-graphite' : 'text-amber'}`}>
              {content.info ? '' : '! '}
              {content.category}
            </span>
            <span className={`label flex items-center gap-1.5 ${content.info ? 'text-graphite' : 'text-amber'}`}>
              <Dot tone={content.info ? 'idle' : 'warn'} /> Live
            </span>
          </div>
          <div className={`mt-2 border-t pt-2.5 ${content.info ? 'border-rule' : 'border-amber-line'}`}>
            <p className="text-[15px] font-medium leading-snug text-ink">{content.title}</p>
            <p className="mt-1 text-[14px] leading-snug text-graphite">{content.hint}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-baseline justify-between">
          <span className="label text-graphite">Signal</span>
          <span className="label flex items-center gap-1.5 text-green">
            <Dot tone="ok" /> {live ? 'Clear' : '—'}
          </span>
        </div>
      )}
    </div>
  );
}

function CameraStatus({ vision }: { vision: RuntimeState }) {
  const err = vision.cameraError ? CAMERA_ERROR_TEXT[vision.cameraError] : null;
  const { status } = vision;
  return (
    <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
      {status === 'error' ? (
        <div className="max-w-sm">
          <p className="label text-[#ffb020]">! Camera</p>
          <p className="mt-2 text-[17px] font-medium leading-snug">{vision.modelError ? 'Модель распознавания не загрузилась' : err?.title}</p>
          <p className="mt-1 text-sm text-white/70">{vision.modelError ?? err?.hint}</p>
          <button
            type="button"
            onClick={() => void visionRuntime.start()}
            className="mt-4 border border-white px-4 py-2 text-sm font-medium transition-colors hover:bg-white hover:text-ink"
            style={{ borderRadius: 'var(--radius-hair)' }}
          >
            Разрешить камеру
          </button>
        </div>
      ) : status === 'demo' ? (
        <div>
          <p className="label text-white/60">Dev demo mode</p>
          <p className="mt-1 text-sm text-white/80">Камера отключена, жесты подаются с панели разработчика.</p>
        </div>
      ) : status === 'idle' ? (
        <div className="max-w-sm">
          <p className="text-[17px] font-medium">Для прохождения тестов необходим доступ к камере.</p>
          <button
            type="button"
            onClick={() => void visionRuntime.start()}
            className="mt-4 border border-white px-4 py-2 text-sm font-medium transition-colors hover:bg-white hover:text-ink"
            style={{ borderRadius: 'var(--radius-hair)' }}
          >
            Разрешить камеру
          </button>
        </div>
      ) : (
        <div className="w-full max-w-xs">
          <p className="label text-white/70">{status === 'loading' ? 'Loading hand model' : 'Requesting camera access'}</p>
          <div className="relative mt-3 h-px overflow-hidden bg-white/20">
            <span className="animate-scan absolute inset-y-0 left-0 w-1/3 bg-white" />
          </div>
          {status === 'requesting' && <p className="mt-3 text-sm text-white/70">Разрешите доступ во всплывающем окне браузера.</p>}
        </div>
      )}
    </div>
  );
}

interface InstrumentProps {
  flash: Flash | null;
}

/** The camera as a measuring instrument: scope, telemetry, readout, signal. */
export function Instrument({ flash }: InstrumentProps) {
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
  const handTone = engine.handCount > 1 ? 'warn' : engine.handVisible ? 'live' : 'idle';
  const faceTone = engine.face === 'ok' ? 'ok' : engine.face === 'unknown' ? 'idle' : 'warn';
  const warn = live && engine.issue && engine.issue !== 'NO_HAND';

  return (
    <section aria-label="Инструмент: камера и распознавание жестов" className="w-full">
      <div className="flex items-baseline justify-between pb-2">
        <span className="label text-ink">Cam 01</span>
        <span className={`label flex items-center gap-1.5 ${warn ? 'text-amber' : live ? 'text-cobalt' : 'text-graphite'}`}>
          <Dot tone={warn ? 'warn' : live ? 'live' : 'idle'} />
          {warn ? 'Adjust position' : live ? 'Tracking' : demo ? 'Demo' : status === 'error' ? 'Offline' : 'Starting'}
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-x-4 lg:block">
      <div className="crop relative self-start overflow-hidden bg-scope text-white/70 aspect-[4/3]">
        <span className="crop-mark tl" />
        <span className="crop-mark tr" />
        <span className="crop-mark bl" />
        <span className="crop-mark br" />
        <video
          ref={videoRef}
          className={`mirror absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${live ? 'opacity-100' : 'opacity-0'}`}
          muted
          playsInline
          autoPlay
          aria-label="Видео с вашей камеры"
        />
        <canvas ref={canvasRef} className="mirror pointer-events-none absolute inset-0 h-full w-full object-cover" aria-hidden />
        {/* centre reticle */}
        <span className="pointer-events-none absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-white/35" aria-hidden />
        <span className="pointer-events-none absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-white/35" aria-hidden />
        {live && (
          <span className="num absolute bottom-2.5 right-3 text-xs text-white/70" aria-hidden>
            {engine.fps} FPS · 640×480
          </span>
        )}
        {!live && <CameraStatus vision={vision} />}
      </div>

      <div className="min-w-0">
      <dl className="hidden lg:mt-3 lg:block">
        <Row label="Hand" tone={handTone}>
          {engine.handCount > 1 ? `${engine.handCount} HANDS` : engine.handVisible ? 'DETECTED' : 'NOT IN FRAME'}
        </Row>
        <Row label="Face" tone={faceTone}>
          {FACE_TEXT[engine.face]}
        </Row>
      </dl>
      <GestureReadout engine={engine} flash={flash} />
      <SignalPanel engine={engine} flash={flash} live={live || demo} />
      </div>
      </div>
    </section>
  );
}
