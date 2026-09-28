import { useEffect, useRef } from 'react';
import { Camera, CameraOff, FlaskConical } from 'lucide-react';
import { CAMERA_ERROR_TEXT } from '../../vision/camera/camera';
import { useVision } from '../../vision/useVision';
import { visionRuntime } from '../../vision/VisionRuntime';
import { GestureIndicator } from '../GestureIndicator/GestureIndicator';
import { GestureOverlay } from '../GestureOverlay/GestureOverlay';

interface Props {
  className?: string;
}

/** Persistent live camera panel with hand tracking layer and gesture HUD. */
export function CameraView({ className = '' }: Props) {
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

  const { status, engine } = vision;
  const live = status === 'ready';
  const err = vision.cameraError ? CAMERA_ERROR_TEXT[vision.cameraError] : null;

  return (
    <section
      aria-label="Камера и распознавание жестов"
      className={`relative overflow-hidden rounded-[28px] bg-slate-950 shadow-[var(--shadow-card)] ring-1 ring-slate-900/10 ${className}`}
    >
      <div className="relative aspect-[4/3] w-full">
        <video
          ref={videoRef}
          className={`mirror absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${live ? 'opacity-100' : 'opacity-0'}`}
          muted
          playsInline
          autoPlay
          aria-label="Видео с вашей камеры"
        />
        <GestureOverlay ref={canvasRef} />

        {/* soft vignette so HUD stays readable */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45" />

        {/* status pill */}
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
          <span
            className={`h-2 w-2 rounded-full ${live ? 'bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)]' : status === 'error' ? 'bg-red-400' : status === 'demo' ? 'bg-fuchsia-400' : 'animate-pulse bg-amber-300'}`}
          />
          {live ? 'Камера активна' : status === 'demo' ? 'Dev demo mode' : status === 'error' ? 'Камера недоступна' : status === 'loading' ? 'Загрузка модели' : 'Подключение камеры'}
        </div>
        {live && (
          <div className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1.5 text-xs font-bold tracking-wider text-white backdrop-blur" title="Кадров в секунду">
            {engine.fps} FPS
          </div>
        )}

        {/* non-live states */}
        {!live && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
            {status === 'error' ? (
              <>
                <CameraOff size={40} strokeWidth={1.6} aria-hidden />
                <p className="text-base font-bold">{err?.title ?? 'Камера недоступна'}</p>
                <p className="max-w-xs text-sm text-white/75">{vision.modelError ?? err?.hint}</p>
                <button
                  type="button"
                  onClick={() => void visionRuntime.start()}
                  className="mt-1 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg transition hover:scale-[1.03] active:scale-95"
                >
                  Разрешить камеру
                </button>
              </>
            ) : status === 'demo' ? (
              <>
                <FlaskConical size={40} strokeWidth={1.6} aria-hidden />
                <p className="hidden text-sm font-semibold text-white/85 sm:block">Камера отключена. Жесты имитируются панелью разработчика.</p>
              </>
            ) : status === 'idle' ? (
              <>
                <Camera size={40} strokeWidth={1.6} aria-hidden />
                <p className="max-w-xs text-sm text-white/80">Для прохождения тестов необходим доступ к камере.</p>
                <button
                  type="button"
                  onClick={() => void visionRuntime.start()}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg transition hover:scale-[1.03]"
                >
                  Разрешить камеру
                </button>
              </>
            ) : (
              <>
                <span className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" aria-hidden />
                <p className="text-sm font-semibold text-white/85">
                  {status === 'loading' ? 'Загружаю модель распознавания рук…' : 'Разрешите доступ к камере во всплывающем окне браузера'}
                </p>
              </>
            )}
          </div>
        )}

        {(live || status === 'demo') && (
          <div className="absolute inset-x-3 bottom-3">
            <GestureIndicator snap={engine} />
          </div>
        )}
      </div>
    </section>
  );
}
