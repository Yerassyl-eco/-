import { GestureCue } from '../components/Cue/GestureCue';
import { GestureIcon } from '../components/GestureIcon/GestureIcon';
import { ProtocolHeader } from '../components/Protocol/ProtocolHeader';
import type { AnyTest } from '../tests';

interface Props {
  test: AnyTest;
  firstTrial: unknown;
  replayKey: number;
  onStart: () => void;
  onReplay: () => void;
}

export function TestIntroPage({ test, firstTrial, replayKey, onStart, onReplay }: Props) {
  const options = test.options(firstTrial);
  return (
    <div key={`${test.id}-${replayKey}`} className="animate-enter">
      <ProtocolHeader index={String(test.number).padStart(2, '0')} title={test.title} subtitle={test.titleEn} />
      <div className="mt-8 grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section aria-labelledby="protocol">
          <h2 id="protocol" className="label border-b border-rule pb-2 text-graphite">
            Protocol
          </h2>
          <p className="max-w-[58ch] border-b border-rule py-3.5 text-[15px] leading-relaxed text-graphite">{test.checks}</p>
          <ol>
            {test.intro.map((line, i) => (
              <li key={i} className="grid grid-cols-[3rem_minmax(0,1fr)] border-b border-rule py-3.5">
                <span className="num pl-0.5 text-[13px] text-graphite">{String(i + 1).padStart(2, '0')}</span>
                <span className="max-w-[56ch] text-[15px] leading-snug text-ink">{line}</span>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="responses">
          <h2 id="responses" className="label border-b border-rule pb-2 text-graphite">
            Responses
          </h2>
          <ul>
            {test.id === 'color' ? (
              <>
                <li className="flex items-center gap-3 border-b border-rule py-3">
                  <span className="flex shrink-0 gap-1">
                    <GestureIcon gesture="POINT_LEFT" size={18} />
                    <GestureIcon gesture="POINT_UP" size={18} />
                    <GestureIcon gesture="POINT_RIGHT" size={18} />
                  </span>
                  <span className="text-[15px] text-ink">Выбрать цифру, которую вы видите</span>
                </li>
                <li className="flex items-center gap-3 border-b border-rule py-3">
                  <GestureIcon gesture="POINT_DOWN" size={18} className="shrink-0" />
                  <span className="text-[15px] text-ink">Не вижу цифру</span>
                </li>
              </>
            ) : (
              options.map((o) => (
                <li key={o.value} className="flex items-center gap-3 border-b border-rule py-3">
                  <GestureIcon gesture={o.gesture} size={18} className="shrink-0" />
                  <span className="text-[15px] text-ink">{o.label}</span>
                </li>
              ))
            )}
            <li className="flex items-center gap-3 border-b border-rule py-3">
              <GestureIcon gesture="FIST" size={18} className="shrink-0" />
              <span className="text-[15px] text-ink">Подтвердить выбранный ответ</span>
            </li>
          </ul>
          <div className="mt-6 border-t border-ink">
            <GestureCue gesture="THUMBS_UP" action="Начать тест" primary onTrigger={onStart} />
            <GestureCue gesture="OPEN_PALM" action="Повторить инструкцию" onTrigger={onReplay} />
          </div>
        </section>
      </div>
    </div>
  );
}
