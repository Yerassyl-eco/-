import { GestureCue } from '../components/GestureIcon/GestureIcon';
import type { RuntimeState } from '../vision/VisionRuntime';

function Check({ ok, pending, label, hint }: { ok: boolean; pending?: boolean; label: string; hint: string }) {
  return (
    <li className={`flex items-start gap-3 rounded-2xl p-4 ring-1 transition-colors duration-500 ${ok ? 'bg-success-50 ring-success-500/25' : 'bg-white ring-line'}`}>
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${ok ? 'animate-pop-in bg-success-500 text-white' : pending ? 'bg-accent-50 text-accent-600' : 'bg-slate-100 text-slate-400'}`}
        aria-hidden
      >
        {ok ? '✓' : pending ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent-200 border-t-accent-600" /> : '•'}
      </span>
      <div>
        <p className="font-bold text-slate-900">{label}</p>
        <p className="text-sm text-slate-600">{hint}</p>
      </div>
      <span className="sr-only">{ok ? 'выполнено' : 'ожидание'}</span>
    </li>
  );
}

export function CameraSetupPage({ vision }: { vision: RuntimeState }) {
  const live = vision.status === 'ready' || vision.status === 'demo';
  const hand = vision.engine.handVisible || vision.status === 'demo';
  const face = vision.engine.face === 'ok' || vision.status === 'demo';
  return (
    <div className="animate-rise">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-600">Шаг 1 · Камера</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Проверим камеру</h1>
      <p className="mt-2 max-w-xl text-lg text-slate-600">
        Поверх видео вы видите слой распознавания: точки суставов, линии пальцев и рамку вокруг руки.
      </p>
      <ul className="mt-6 grid gap-3">
        <Check ok={live} pending={!live} label={live ? 'Камера активна' : 'Подключаю камеру…'} hint="Видео обрабатывается локально в браузере и не отправляется на сервер." />
        <Check ok={hand} pending={live && !hand} label={hand ? 'Я вижу вашу руку' : 'Покажите ладонь в камеру'} hint="Держите руку на уровне груди, чтобы в кадре была вся ладонь." />
        <Check ok={face} pending={live && !face} label={face ? 'Лицо хорошо видно' : 'Проверяю положение лица'} hint="Сядьте так, чтобы лицо было по центру кадра." />
      </ul>
      <div className="mt-6 flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[var(--shadow-card)] ring-1 ring-line">
        <GestureCue gesture="THUMBS_UP" />
        <p className="text-lg font-bold text-slate-900">
          Всё в порядке? Покажите 👍, чтобы продолжить
        </p>
      </div>
    </div>
  );
}
