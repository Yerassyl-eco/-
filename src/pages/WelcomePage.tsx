import { GestureCue } from '../components/Cue/GestureCue';
import { GestureIcon } from '../components/GestureIcon/GestureIcon';
import { THEMES } from '../data/themes';
import { TESTS } from '../tests';
import type { Gesture } from '../vision/types';
import type { StoredScreening } from '../utils/storage';
import { formatDate } from '../utils/format';

const VOCABULARY: { g: Gesture; name: string; action: string }[] = [
  { g: 'THUMBS_UP', name: 'Палец вверх', action: 'начать, продолжить' },
  { g: 'POINT_UP', name: 'Указать вверх', action: 'ответ «вверх»' },
  { g: 'POINT_LEFT', name: 'Указать влево', action: 'левый ответ' },
  { g: 'POINT_RIGHT', name: 'Указать вправо', action: 'правый ответ' },
  { g: 'POINT_DOWN', name: 'Указать вниз', action: 'ответ «вниз»' },
  { g: 'FIST', name: 'Кулак', action: 'подтвердить ответ' },
  { g: 'OPEN_PALM', name: 'Ладонь', action: 'отменить, повторить' },
];

export function WelcomePage({ last, onStart }: { last: StoredScreening | null; onStart: () => void }) {
  return (
    <div className="animate-enter">
      <h1 className="max-w-[16ch] text-[38px] leading-[1.08] text-ink sm:text-[54px]">Короткий скрининг зрения, управляемый движением руки</h1>
      <div className="mt-6 max-w-[46ch] space-y-2 text-[19px] leading-relaxed text-graphite">
        <p>Пять визуальных тестов. Без клавиатуры. Без мыши.</p>
        <p className="text-ink">Смотрите на экран. Следуйте инструкциям. Отвечайте руками.</p>
      </div>

      <ol className="mt-8 grid grid-cols-5 gap-2" aria-label="Пять тестов">
        {TESTS.map((t) => (
          <li
            key={t.id}
            className="flex min-h-[92px] flex-col justify-between p-3"
            style={{ background: THEMES[t.id].base, color: THEMES[t.id].on, borderRadius: 'var(--radius-control)' }}
          >
            <span className="num text-[13px] opacity-85">{String(t.number).padStart(2, '0')}</span>
            <span className="text-[13px] font-medium leading-tight sm:text-[14px]">{t.shortTitle}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[15px] text-graphite">5 тестов · около 5 минут · ответы жестами руки</p>

      <div className="mt-6">
        <GestureCue gesture="THUMBS_UP" action="Начать скрининг" primary onTrigger={onStart} />
      </div>

      <section className="mt-10" aria-labelledby="vocab">
        <h2 id="vocab" className="label border-b-2 border-accent pb-2 text-accent">
          Словарь жестов
        </h2>
        <ul className="grid sm:grid-cols-2 sm:gap-x-8">
          {VOCABULARY.map((v) => (
            <li key={v.g} className="flex items-center gap-3 border-b border-rule py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-wash)] text-accent"><GestureIcon gesture={v.g} size={18} /></span>
              <span className="text-[15px] font-medium text-ink">{v.name}</span>
              <span className="ml-auto text-right text-[13px] text-graphite">{v.action}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 max-w-[52ch] text-[13px] leading-relaxed text-graphite">
        Предварительный скрининг, не медицинский диагноз. Видео с камеры обрабатывается локально в браузере и не отправляется на сервер.
        {last && (
          <span className="mt-1 block">
            Последний скрининг: {formatDate(last.finishedAt ?? last.startedAt)}, {last.completedTests} из 5 тестов.
          </span>
        )}
      </p>
    </div>
  );
}
