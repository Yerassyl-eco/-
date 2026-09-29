import { Check } from 'lucide-react';
import { HandGlyph } from '../components/GestureIcon/GestureIcon';
import { COUNT_GESTURES, PROFILE_QUESTIONS, type Profile } from '../data/profile';
import { useVision } from '../vision/useVision';

interface Props {
  index: number;
  selected: string | null;
  profile: Profile;
  onSelect: (i: number) => void;
}

/**
 * Questionnaire without a keyboard: each answer has a number, the user raises
 * that many fingers (☝️ 1, ✌️ 2, 3, 4) and confirms with a fist.
 */
export function ProfilePage({ index, selected, profile, onSelect }: Props) {
  const { engine } = useVision();
  const q = PROFILE_QUESTIONS[index];
  const answered = profile[q.key];
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-[clamp(30px,4.4vh,44px)] leading-[1.1] text-ink">Немного о вас</h1>
        <ol className="flex items-center gap-2" aria-label={`Вопрос ${index + 1} из ${PROFILE_QUESTIONS.length}`}>
          {PROFILE_QUESTIONS.map((x, i) => (
            <li
              key={x.key}
              className={`num flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-[13px] ${i === index ? 'bg-accent' : i < index ? 'bg-ink text-paper' : 'text-graphite'}`}
              style={i > index ? { boxShadow: 'inset 0 0 0 1px var(--color-rule-strong)' } : undefined}
            >
              {i < index ? <Check size={14} strokeWidth={2.5} aria-hidden /> : i + 1}
            </li>
          ))}
        </ol>
      </div>

      <section key={q.key} className="animate-slide-in mt-[clamp(16px,3vh,32px)] flex min-h-0 flex-1 flex-col" aria-labelledby="q-title">
        <h2 id="q-title" className="max-w-[26ch] text-[clamp(26px,4vh,40px)] leading-[1.15] text-ink">
          {q.question}
        </h2>

        <ul className="mt-[clamp(16px,3.5vh,36px)] grid min-h-0 flex-1 grid-cols-2 gap-3 lg:grid-cols-4" role="radiogroup" aria-labelledby="q-title">
          {q.options.map((label, i) => {
            const g = COUNT_GESTURES[i];
            const isSel = selected === String(i);
            const was = selected === null && answered === i;
            const hot = engine.gesture === g;
            return (
              <li key={label} className="min-h-0">
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSel}
                  onClick={() => onSelect(i)}
                  className={`flex h-full max-h-[260px] min-h-[120px] w-full flex-col justify-between p-5 text-left transition-[background-color,box-shadow,transform] duration-200 ${
                    isSel ? 'bg-accent' : hot ? 'bg-accent-wash text-ink' : 'bg-field text-ink hover:-translate-y-0.5'
                  }`}
                  style={{
                    borderRadius: 'var(--radius-card)',
                    boxShadow: isSel ? 'var(--shadow-lift)' : was ? 'inset 0 0 0 2px var(--accent)' : 'var(--shadow-card)',
                  }}
                >
                  <span className="num text-[clamp(28px,4.4vh,44px)] leading-none">{i + 1}</span>
                  <span className="flex min-h-0 flex-1 items-center justify-center py-2" style={{ color: isSel ? undefined : 'var(--accent-text)' }}>
                    <HandGlyph raised={i + 1} size="100%" strokeWidth={1.3} className="h-full max-h-[88px] w-auto" />
                  </span>
                  <span className="block text-[clamp(17px,2.4vh,22px)] font-medium leading-snug">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-[15px] text-graphite">
          Один палец — первый ответ, два — второй, три — третий, четыре — четвёртый. Затем покажите кулак. Имя и другие личные данные не нужны.
        </p>
      </section>
    </div>
  );
}
