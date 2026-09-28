import { Hand, ShieldCheck, Stethoscope } from 'lucide-react';
import { GestureCue, GestureIcon } from '../components/GestureIcon/GestureIcon';
import { HeroIllustration } from '../components/Illustration/HeroIllustration';
import type { Gesture } from '../vision/types';
import type { StoredScreening } from '../utils/storage';
import { formatDate } from '../utils/format';

const GESTURES: { g: Gesture; label: string }[] = [
  { g: 'THUMBS_UP', label: 'дальше' },
  { g: 'POINT_LEFT', label: 'влево' },
  { g: 'POINT_UP', label: 'вверх' },
  { g: 'POINT_DOWN', label: 'вниз' },
  { g: 'POINT_RIGHT', label: 'вправо' },
  { g: 'FIST', label: 'подтвердить' },
  { g: 'OPEN_PALM', label: 'отмена' },
];

export function LandingPage({ last }: { last: StoredScreening | null }) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
      <div className="animate-rise">
        <h1 className="mt-2 text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl xl:text-6xl">
          Проверим ваше <span className="text-accent-500">зрение</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl">
          Интерактивный предварительный скрининг зрения с управлением жестами
        </p>

        <div className="mt-6 max-w-xl">
          <p className="text-[17px] font-semibold leading-relaxed text-slate-900">
            Привет! Я помогу тебе пройти короткий предварительный скрининг зрения: 5 визуальных тестов, около 5 минут.
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            Вам не понадобится клавиатура или мышь. Просто следуйте инструкциям и управляйте тестом жестами перед камерой.
          </p>
          <div className="mt-5 flex items-center gap-4 rounded-3xl bg-accent-500 p-5 text-white shadow-[var(--shadow-float)]">
            <GestureCue gesture="THUMBS_UP" tone="solid" />
            <div>
              <p className="font-display text-lg font-extrabold leading-tight">Готовы начать? Покажите «палец вверх»</p>
              <p className="text-sm text-white/85">Держите жест около секунды, пока заполняется кольцо</p>
            </div>
          </div>
        </div>

        <ul className="mt-5 flex max-w-xl flex-wrap gap-2" aria-label="Жесты управления">
          {GESTURES.map(({ g, label }) => (
            <li key={g} className="flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-line">
              <GestureIcon gesture={g} size={15} className="text-accent-500" />
              {label}
            </li>
          ))}
        </ul>

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-600">
          <li className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-success-500" aria-hidden /> Видео не покидает ваш браузер</li>
          <li className="flex items-center gap-1.5"><Hand size={16} className="text-accent-500" aria-hidden /> 7 жестов управления</li>
          <li className="flex items-center gap-1.5"><Stethoscope size={16} className="text-accent-500" aria-hidden /> Не является диагнозом</li>
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
