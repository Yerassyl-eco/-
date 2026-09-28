import type { ReactElement } from 'react';
import type { AnswerOption, StimulusProps, TestDefinition } from '../types';

export interface DialTrial {
  variant: number;
  name: string;
  stroke: string;
  width: number;
  spokes: number;
}

const OPTIONS: AnswerOption[] = [
  { value: 'same', gesture: 'POINT_LEFT', label: 'Линии выглядят одинаково' },
  { value: 'different', gesture: 'POINT_RIGHT', label: 'Некоторые линии отличаются' },
];

/** Radial "clock dial" figure: every spoke is a bundle of 3 parallel lines. */
export function RadialDial({ stroke, width, spokes, size = 320 }: { stroke: string; width: number; spokes: number; size?: number }) {
  const r0 = 18;
  const r1 = 140;
  const gap = width * 2.2;
  const lines: ReactElement[] = [];
  for (let i = 0; i < spokes; i++) {
    const a = (i * 180) / spokes;
    for (const off of [-gap, 0, gap]) {
      lines.push(
        <g key={`${i}-${off}`} transform={`rotate(${a} 160 160)`}>
          <line x1={160 - r1} y1={160 + off} x2={160 - r0} y2={160 + off} stroke={stroke} strokeWidth={width} strokeLinecap="butt" />
          <line x1={160 + r0} y1={160 + off} x2={160 + r1} y2={160 + off} stroke={stroke} strokeWidth={width} strokeLinecap="butt" />
        </g>,
      );
    }
  }
  const labels = Array.from({ length: 12 }, (_, i) => {
    const n = i === 0 ? 12 : i;
    const ang = (i * 30 - 90) * (Math.PI / 180);
    return (
      <text key={n} x={160 + Math.cos(ang) * 152} y={160 + Math.sin(ang) * 152 + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#64748b">
        {n}
      </text>
    );
  });
  return (
    <svg viewBox="0 0 320 320" width={size} height={size} role="img" aria-label="Радиальная фигура из линий, расходящихся от центра" className="max-h-full max-w-full">
      {lines}
      {labels}
      <circle cx="160" cy="160" r="5" fill="#0f172a" />
    </svg>
  );
}

function Stimulus({ trial, trialIndex, trialCount }: StimulusProps<DialTrial>) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-3xl bg-white p-4 ring-1 ring-slate-200">
      <div className="absolute left-4 top-4 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        Вариант {trialIndex + 1} / {trialCount} · {trial.name}
      </div>
      <div key={trial.variant} className="animate-fade-in flex h-full w-full items-center justify-center pt-6">
        <RadialDial stroke={trial.stroke} width={trial.width} spokes={trial.spokes} />
      </div>
    </div>
  );
}

export const astigmatismTest: TestDefinition<DialTrial> = {
  id: 'astigmatism',
  number: 2,
  title: 'Радиальная фигура',
  shortTitle: 'Радиальная',
  checks:
    'Одинаково ли чётко вы видите линии разных направлений. Используется классическая радиальная фигура («лучистая фигура»).',
  intro: [
    'Если вы носите очки — оставайтесь в них.',
    'Смотрите в центр фигуры.',
    'Оцените: все ли линии кажутся одинаково чёрными и чёткими?',
    '👈 — одинаково, 👉 — некоторые линии отличаются. Подтвердите ✊.',
  ],
  layout: 'pair',
  createTrials: () => [
    { variant: 1, name: 'чёткий контраст', stroke: '#0b1220', width: 3, spokes: 12 },
    { variant: 2, name: 'сниженный контраст', stroke: '#5b6576', width: 2.6, spokes: 12 },
    { variant: 3, name: 'тонкие линии', stroke: '#0b1220', width: 1.6, spokes: 18 },
  ],
  prompt: () => 'Смотрите в центр. Кажутся ли некоторые линии темнее или чётче других?',
  options: () => OPTIONS,
  observeMs: () => 2500,
  isCorrect: () => null,
  summarize(records, trials, durationMs) {
    const diff = records.filter((r) => r.value === 'different').length;
    const attention = diff > 0;
    return {
      testId: 'astigmatism',
      headline: attention ? `${diff} из ${records.length}` : 'Ответы сохранены',
      headlineCaption: attention ? 'вариантов с различием линий' : `${records.length} из ${trials.length} вариантов: линии одинаковые`,
      result: attention
        ? `В ${diff} из ${records.length} вариантов вы отметили, что некоторые линии выглядят темнее или чётче других.`
        : 'Во всех вариантах линии показались вам одинаковыми.',
      meaning: attention
        ? 'Ответы этого теста могут быть основанием для дополнительной проверки рефракции специалистом. Такой ответ не является диагнозом — неравномерность линий может зависеть и от экрана, и от освещения.'
        : 'В условиях теста линии разных направлений выглядели для вас одинаково — это ожидаемый результат скрининга.',
      attention,
      short: attention ? 'Есть различия линий' : 'Линии одинаковые',
      stats: [
        { label: 'Показано вариантов', value: String(records.length) },
        { label: '«Одинаково»', value: String(records.length - diff) },
        { label: '«Отличаются»', value: String(diff) },
      ],
      answered: records.length,
      correct: null,
      durationMs,
    };
  },
  Stimulus,
};
