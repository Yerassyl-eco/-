import { useEffect, useState } from 'react';
import { GestureCue } from '../components/Cue/GestureCue';

const STEPS = [
  'Сядьте на комфортном расстоянии от экрана — примерно на вытянутую руку, 50–70 см.',
  'Убедитесь, что лицо хорошо освещено и целиком видно в камере.',
  'Смотрите прямо на экран. Если носите очки для дали — оставайтесь в них.',
  'Читайте инструкцию перед каждым тестом.',
  'Отвечайте жестами: указательный палец выбирает, кулак подтверждает, ладонь отменяет.',
];

export function PreparationPage({ replayKey, onBegin, onReplay }: { replayKey: number; onBegin: () => void; onReplay: () => void }) {
  // Replaying the instruction walks a cobalt marker down the list.
  const [focus, setFocus] = useState(-1);
  useEffect(() => {
    if (replayKey === 0) return;
    setFocus(0);
    const id = setInterval(() => setFocus((f) => (f < STEPS.length - 1 ? f + 1 : -1)), 1100);
    return () => clearInterval(id);
  }, [replayKey]);

  return (
    <div className="animate-enter">
      <h1 className="text-[34px] font-medium leading-[1.08] text-ink sm:text-[44px]">Подготовка</h1>
      <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-graphite">Пять условий, от которых зависит точность скрининга.</p>
      <ol className="mt-8 border-t border-rule">
        {STEPS.map((s, i) => (
          <li key={i} className="grid grid-cols-[3rem_minmax(0,1fr)] border-b border-rule py-3.5">
            <span className={`num pl-3 text-[13px] ${focus === i ? 'text-cobalt' : 'text-graphite'}`}>{String(i + 1).padStart(2, '0')}</span>
            <span className={`max-w-[52ch] text-[15px] leading-snug transition-colors duration-200 ${focus === i ? 'text-cobalt' : 'text-ink'}`}>{s}</span>
          </li>
        ))}
      </ol>
      <div className="mt-6 border-t border-ink">
        <GestureCue gesture="THUMBS_UP" action="Готов — начать тестирование" primary onTrigger={onBegin} />
        <GestureCue gesture="OPEN_PALM" action="Повторить инструкцию" onTrigger={onReplay} />
      </div>
    </div>
  );
}
