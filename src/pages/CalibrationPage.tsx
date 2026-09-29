import { GestureCue } from '../components/Cue/GestureCue';
import type { IssueCode } from '../vision/types';
import type { RuntimeState } from '../vision/VisionRuntime';

const HAND_ISSUES: IssueCode[] = ['MULTIPLE_HANDS', 'HAND_OUT_LEFT', 'HAND_OUT_RIGHT', 'HAND_OUT_TOP', 'HAND_OUT_BOTTOM', 'HAND_TOO_FAR', 'HAND_TOO_CLOSE', 'LOW_CONFIDENCE', 'HAND_MOVING', 'TOO_QUICK', 'FINGERS_UNCLEAR', 'FINGER_FORESHORTENED', 'DIRECTION_AMBIGUOUS', 'EXTRA_FINGERS', 'FIST_LOOSE', 'THUMB_NOT_UP'];

type Tone = 'ok' | 'wait' | 'adjust';

function Check({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: Tone }) {
  const c = { ok: 'text-ink', wait: 'text-graphite', adjust: 'text-amber' }[tone];
  const mark = { ok: 'bg-ink rounded-full', wait: 'bg-rule-strong rounded-full', adjust: 'bg-amber-line' }[tone];
  return (
    <li className="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-4 border-b border-rule py-3.5 sm:grid-cols-[8rem_minmax(0,1fr)_auto]">
      <span className="label pt-0.5 text-graphite">{label}</span>
      <span className="text-[15px] leading-snug text-ink">{hint}</span>
      <span className={`label col-start-2 mt-1 flex items-center gap-1.5 sm:col-start-auto sm:mt-0 ${c}`}>
        <span className={`inline-block h-1.5 w-1.5 ${mark}`} aria-hidden /> {value}
      </span>
    </li>
  );
}

export function CalibrationPage({ vision, onContinue }: { vision: RuntimeState; onContinue: () => void }) {
  const demo = vision.status === 'demo';
  const live = vision.status === 'ready' || demo;
  const e = vision.engine;
  const handIssue = !demo && e.issue !== null && HAND_ISSUES.includes(e.issue);
  const hand: Tone = demo || e.handVisible ? (handIssue ? 'adjust' : 'ok') : 'wait';
  const face: Tone = demo || e.face === 'ok' ? 'ok' : e.face === 'unknown' ? 'wait' : 'adjust';
  const dist: Tone = demo ? 'ok' : e.face === 'too-close' || e.face === 'too-far' || e.issue === 'HAND_TOO_FAR' || e.issue === 'HAND_TOO_CLOSE' ? 'adjust' : e.face === 'unknown' || e.face === 'missing' ? 'wait' : 'ok';
  return (
    <div className="animate-enter">
      <h1 className="text-[40px] leading-[1.08] text-ink sm:text-[54px]">Калибровка</h1>
      <p className="mt-4 max-w-[46ch] text-[19px] leading-relaxed text-graphite">
        Проверим, что камера видит вас и вашу руку. Поверх видео — слой отслеживания: точки суставов, линии пальцев, рамка лица.
      </p>
      <ul className="mt-8 border-t border-rule">
        <Check label="Камера" value={live ? 'Работает' : 'Ожидание'} tone={live ? 'ok' : 'wait'} hint="Камера активна, видео остаётся на этом устройстве." />
        <Check label="Рука" value={hand === 'ok' ? 'В кадре' : hand === 'adjust' ? 'Поправьте' : 'Ожидание'} tone={hand} hint={hand === 'ok' ? 'Я вижу вашу руку.' : hand === 'adjust' ? 'Рука видна, но её нужно поправить — см. сигнал камеры.' : 'Покажите ладонь в камеру на уровне груди.'} />
        <Check label="Лицо" value={face === 'ok' ? 'По центру' : face === 'adjust' ? 'Поправьте' : 'Ожидание'} tone={face} hint="Лицо целиком в кадре, взгляд на экран." />
        <Check label="Расстояние" value={dist === 'ok' ? 'Хорошо' : dist === 'adjust' ? 'Поправьте' : 'Ожидание'} tone={dist} hint="Около 50–70 см от экрана — на вытянутую руку." />
      </ul>
      <div className="mt-6">
        <GestureCue gesture="THUMBS_UP" action="Всё в порядке — продолжить" primary onTrigger={onContinue} />
      </div>
    </div>
  );
}
