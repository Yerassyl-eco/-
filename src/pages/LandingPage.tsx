import { HeroIllustration } from '../components/Illustration/HeroIllustration';
import type { StoredScreening } from '../utils/storage';
import { formatDate } from '../utils/format';

export function LandingPage({ last }: { last: StoredScreening | null }) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
      <div className="animate-rise">
        <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-accent-600 ring-1 ring-accent-100">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden /> Предварительный скрининг зрения
        </p>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl xl:text-6xl">
          Проверим ваше <span className="bg-gradient-to-r from-accent-600 to-cyan-500 bg-clip-text text-transparent">зрение</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg font-medium leading-relaxed text-slate-600 sm:text-xl">
          Интерактивный предварительный скрининг зрения с управлением жестами
        </p>
        <div className="mt-6 max-w-xl rounded-3xl bg-white/80 p-5 shadow-[var(--shadow-card)] ring-1 ring-line">
          <p className="text-[17px] font-semibold leading-relaxed text-slate-800">
            Привет! Я помогу тебе пройти короткий предварительный скрининг зрения — 5 визуальных тестов, около 5 минут.
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            Вам не понадобится клавиатура или мышь. Просто следуйте инструкциям и управляйте тестом жестами перед камерой.
          </p>
          <div className="mt-4 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-accent-500 to-cyan-500 p-4 text-white shadow-[var(--shadow-float)]">
            <span className="emoji animate-float flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl" aria-hidden>
              👍
            </span>
            <div>
              <p className="text-lg font-extrabold leading-tight">Готовы начать? Покажите 👍</p>
              <p className="text-sm font-medium text-white/85">Держите жест около секунды — кольцо заполнится</p>
            </div>
          </div>
        </div>
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-600">
          <li>🔒 Видео не покидает ваш браузер</li>
          <li>🖐 6 жестов управления</li>
          <li>🩺 Не является диагнозом</li>
        </ul>
        {last && (
          <p className="mt-4 text-sm text-slate-500">
            Последний скрининг: {formatDate(last.finishedAt ?? last.startedAt)} · {last.completedTests} / 5 тестов
          </p>
        )}
      </div>
      <div className="animate-fade-in hidden lg:block">
        <HeroIllustration />
      </div>
    </div>
  );
}
