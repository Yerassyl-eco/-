import { GestureCue } from '../components/Cue/GestureCue';
import { GestureIcon } from '../components/GestureIcon/GestureIcon';
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
      <h1 className="max-w-[16ch] text-[34px] font-medium leading-[1.08] text-ink sm:text-[44px]">Короткий скрининг зрения, управляемый движением руки</h1>
      <div className="mt-6 max-w-[46ch] space-y-3 text-[17px] leading-relaxed text-graphite">
        <p>Пять визуальных тестов. Без клавиатуры. Без мыши.</p>
        <p className="text-ink">Смотрите на экран. Следуйте инструкциям. Отвечайте руками.</p>
      </div>

      <dl className="mt-8 grid grid-cols-3 border-t border-rule">
        {[
          ['Tests', '05'],
          ['Duration', '≈ 5 min'],
          ['Input', 'Hand'],
        ].map(([k, v]) => (
          <div key={k} className="border-r border-rule py-3 pr-3 last:border-r-0 [&:not(:first-child)]:pl-4">
            <dt className="label text-graphite">{k}</dt>
            <dd className="num mt-1 text-[20px] text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-2 border-t border-ink">
        <GestureCue gesture="THUMBS_UP" action="Начать скрининг" primary onTrigger={onStart} />
      </div>

      <section className="mt-10" aria-labelledby="vocab">
        <h2 id="vocab" className="label border-b border-rule pb-2 text-graphite">
          Gesture vocabulary
        </h2>
        <ul className="grid sm:grid-cols-2 sm:gap-x-8">
          {VOCABULARY.map((v) => (
            <li key={v.g} className="flex items-center gap-3 border-b border-rule py-2.5">
              <GestureIcon gesture={v.g} size={18} className="shrink-0 text-ink" />
              <span className="text-[14px] text-ink">{v.name}</span>
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
