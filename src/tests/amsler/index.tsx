import { StimulusField } from '../../components/StimulusField/StimulusField';
import type { AnswerOption, StimulusProps, TestDefinition } from '../types';

export interface AmslerTrial {
  eye: 'right' | 'left';
  cover: string;
}

const OPTIONS: AnswerOption[] = [
  { value: 'no', gesture: 'POINT_LEFT', label: 'Нет, линии ровные' },
  { value: 'yes', gesture: 'POINT_RIGHT', label: 'Да, вижу искажения' },
];

const OBSERVE_MS = 6000;

export function AmslerGrid({ cells = 20, size = 340 }: { cells?: number; size?: number }) {
  const step = 400 / cells;
  const lines = [];
  for (let i = 0; i <= cells; i++) {
    const p = i * step;
    lines.push(<line key={`h${i}`} x1={0} y1={p} x2={400} y2={p} />);
    lines.push(<line key={`v${i}`} x1={p} y1={0} x2={p} y2={400} />);
  }
  return (
    <svg viewBox="-2 -2 404 404" width={size} height={size} role="img" aria-label="Сетка Амслера с точкой в центре" className="max-h-full max-w-full">
      <rect x="0" y="0" width="400" height="400" fill="#fff" />
      <g stroke="#111111" strokeWidth="1.3">{lines}</g>
      <circle cx="200" cy="200" r="6" fill="#111111" />
    </svg>
  );
}

function Stimulus({ trial, ready, observeProgress, trialIndex, trialCount }: StimulusProps<AmslerTrial>) {
  const secondsLeft = Math.ceil(((1 - observeProgress) * OBSERVE_MS) / 1000);
  return (
    <StimulusField
      label="Сетка Амслера"
      tagLeft={`${trialIndex + 1} / ${trialCount} · ${trial.eye === 'right' ? 'правый глаз' : 'левый глаз'}`}
      tagRight={ready ? 'отвечайте' : `смотрите 00:0${secondsLeft}`}
      progress={observeProgress}
    >
      <div className="flex h-full w-full items-center justify-center p-8">
        <AmslerGrid size={320} />
      </div>
    </StimulusField>
  );
}

export const amslerTest: TestDefinition<AmslerTrial> = {
  id: 'amsler',
  number: 4,
  title: 'Сетка Амслера',
  titleEn: 'Amsler grid',
  shortTitle: 'Амслер',
  checks:
    'Выглядят ли линии сетки ровными в центральной части поля зрения. Каждый глаз проверяется отдельно.',
  intro: [
    'Если вы носите очки для чтения — наденьте их.',
    'Прикройте один глаз свободной рукой, другой рукой показывайте жесты.',
    'Смотрите на центральную точку и не переводите взгляд.',
    'Обратите внимание, выглядят ли линии ровными, нет ли пропусков или размытых участков.',
  ],
  layout: 'pair',
  createTrials: () => [
    { eye: 'right', cover: 'Прикройте ЛЕВЫЙ глаз и смотрите на точку правым' },
    { eye: 'left', cover: 'Прикройте ПРАВЫЙ глаз и смотрите на точку левым' },
  ],
  prompt: (t) => `${t.cover}. Видите ли вы искривления, пропуски или необычные участки сетки?`,
  options: () => OPTIONS,
  observeMs: () => OBSERVE_MS,
  isCorrect: () => null,
  summarize(records, trials, durationMs) {
    const yes = records.filter((r) => r.value === 'yes');
    const eyes = yes.map((r) => (trials[r.trialIndex].eye === 'right' ? 'правый' : 'левый'));
    const attention = yes.length > 0;
    return {
      testId: 'amsler',
      headline: attention ? 'Отмечены изменения' : 'Линии ровные',
      headlineCaption: `Проверено глаз: ${records.length} из ${trials.length}`,
      result: attention
        ? `Вы отметили изменение изображения (${eyes.join(' и ')} глаз).`
        : 'Для обоих глаз вы отметили, что линии сетки выглядят ровными.',
      meaning: attention
        ? 'Вы отметили изменение изображения. Такой результат не является диагнозом, но при повторении симптома стоит обсудить его с офтальмологом.'
        : 'Сетка выглядела для вас ровной — это ожидаемый результат скрининга. Если вы когда-либо заметите искривление прямых линий в жизни, обратитесь к офтальмологу.',
      attention,
      short: attention ? `Отмечено: ${eyes.join(', ')}` : 'Без искажений',
      stats: trials.map((t, i) => ({
        label: t.eye === 'right' ? 'Правый глаз' : 'Левый глаз',
        value: records.find((r) => r.trialIndex === i)?.value === 'yes' ? 'Есть изменения' : 'Ровно',
      })),
      answered: records.length,
      correct: null,
      durationMs,
    };
  },
  Stimulus,
};
