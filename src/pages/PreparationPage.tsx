import { useEffect, useState } from 'react';
import type { FaceStatus } from '../vision/types';

const STEPS = [
  { icon: '📏', text: 'Сядьте или встаньте на комфортном расстоянии от экрана — примерно на вытянутую руку (50–70 см).' },
  { icon: '💡', text: 'Убедитесь, что лицо хорошо освещено и видно в камере.' },
  { icon: '👀', text: 'Смотрите прямо на экран. Если носите очки для дали — оставайтесь в них.' },
  { icon: '📋', text: 'Следуйте инструкциям каждого теста.' },
  { icon: '🖐', text: 'Отвечайте жестами: 👈 👉 ☝️ 👇 — выбрать, ✊ — подтвердить, ✋ — отменить.' },
];

const FACE_TEXT: Record<FaceStatus, string> = {
  unknown: 'Проверяю положение лица…',
  ok: 'Положение лица — отлично',
  missing: 'Камера не видит лицо — сядьте так, чтобы лицо было в кадре',
  'too-low': 'Поднимите голову немного выше',
  'too-high': 'Опуститесь немного ниже',
  'too-close': 'Отодвиньтесь немного назад',
  'too-far': 'Подойдите немного ближе',
  'off-center': 'Сядьте по центру экрана',
};

export function PreparationPage({ replayKey, face }: { replayKey: number; face: FaceStatus }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    setActive(0);
    const id = setInterval(() => setActive((a) => (a < STEPS.length ? a + 1 : a)), 900);
    return () => clearInterval(id);
  }, [replayKey]);

  return (
    <div className="animate-rise">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-600">Подготовка</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Подготовимся</h1>
      <div className="mt-3 flex items-center gap-2" aria-label="Подготовка: шаг 1 из 6">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-2.5 rounded-full transition-all duration-500 ${i === 0 ? 'w-8 bg-accent-500' : 'w-2.5 bg-slate-300'}`} />
        ))}
      </div>
      <ol className="mt-6 grid gap-2.5">
        {STEPS.map((s, i) => (
          <li
            key={`${replayKey}-${i}`}
            className={`flex items-start gap-4 rounded-2xl bg-white p-4 ring-1 transition-all duration-500 ${i < active ? 'opacity-100 ring-line' : 'translate-y-1 opacity-40 ring-transparent'}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-sm font-extrabold text-accent-600">{i + 1}</span>
            <p className="pt-1.5 text-[15px] font-semibold leading-snug text-slate-800">
              <span className="emoji mr-1.5" aria-hidden>{s.icon}</span>
              {s.text}
            </p>
          </li>
        ))}
      </ol>
      <p className={`mt-4 flex items-center gap-2 text-sm font-semibold ${face === 'ok' ? 'text-success-700' : 'text-warning-700'}`} role="status">
        <span aria-hidden>{face === 'ok' ? '✓' : '⚠'}</span> {FACE_TEXT[face]}
      </p>
      <div className="mt-5 flex items-center gap-4 rounded-3xl bg-gradient-to-r from-accent-500 to-cyan-500 p-5 text-white shadow-[var(--shadow-float)]">
        <span className="emoji animate-float text-4xl" aria-hidden>👍</span>
        <div>
          <p className="text-xl font-extrabold">Готовы начать?</p>
          <p className="text-sm font-medium text-white/85">Покажите 👍 — начнётся первый тест. ✋ — повторить инструкцию.</p>
        </div>
      </div>
    </div>
  );
}
