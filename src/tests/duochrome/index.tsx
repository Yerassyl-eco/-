import { StimulusField } from '../../components/StimulusField/StimulusField';
import type { AnswerOption, StimulusProps, TestDefinition } from '../types';

export interface DuochromeTrial {
  round: number;
  rows: { text: string; size: number }[];
}

const OPTIONS: AnswerOption[] = [
  { value: 'red', gesture: 'POINT_LEFT', label: 'Красная сторона', swatch: '#d6202a' },
  { value: 'equal', gesture: 'POINT_UP', label: 'Одинаково', glyph: '=' },
  { value: 'green', gesture: 'POINT_RIGHT', label: 'Зелёная сторона', swatch: '#0f9d58' },
];

const RED = '#d6202a';
const GREEN = '#0f9d58';

function Half({ bg, rows, side, highlighted }: { bg: string; rows: DuochromeTrial['rows']; side: string; highlighted: boolean }) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-4 py-10" style={{ background: bg }} aria-label={`${side} сторона`}>
      {rows.map((r) => (
        <div
          key={r.text}
          className="font-semibold leading-none tracking-[0.3em] text-black"
          style={{ fontSize: `min(${r.size}px, ${(r.size * 0.16).toFixed(1)}vw)`, fontFamily: 'Arial, Helvetica, sans-serif' }}
        >
          {r.text}
        </div>
      ))}
      {highlighted && <span className="animate-fade pointer-events-none absolute inset-3 border-2 border-white" aria-hidden />}
      <span className="label absolute bottom-3 text-white/90">{side}</span>
    </div>
  );
}

function Stimulus({ trial, selected, trialIndex, trialCount, observeProgress }: StimulusProps<DuochromeTrial>) {
  return (
    <StimulusField bare label="Дуохромный тест: красная и зелёная половины" tagLeft={`ROUND ${trialIndex + 1} / ${trialCount}`} tagRight="RED · GREEN" progress={observeProgress}>
      <div className="flex h-full w-full">
        <Half bg={RED} rows={trial.rows} side="Красная" highlighted={selected === 'red' || selected === 'equal'} />
        <Half bg={GREEN} rows={trial.rows} side="Зелёная" highlighted={selected === 'green' || selected === 'equal'} />
      </div>
    </StimulusField>
  );
}

export const duochromeTest: TestDefinition<DuochromeTrial> = {
  id: 'duochrome',
  number: 3,
  title: 'Красный и зелёный фон',
  titleEn: 'Duochrome',
  shortTitle: 'Duochrome',
  checks:
    'Дуохромный тест сравнивает чёткость одинаковых символов на красном и зелёном фоне. Он помогает специалисту понять, как глаз фокусирует изображение.',
  intro: [
    'Если вы носите очки для дали — оставайтесь в них.',
    'Сравните чёрные символы на красной и зелёной половине.',
    'Влево — чётче на красной, вправо — на зелёной, вверх — одинаково.',
    'Подтвердите выбор кулаком.',
  ],
  layout: 'triple',
  createTrials: () => [
    { round: 1, rows: [{ text: 'ЕШН', size: 56 }, { text: 'КБМ', size: 40 }] },
    { round: 2, rows: [{ text: 'ОНК', size: 34 }, { text: 'ШБЕ', size: 26 }] },
    { round: 3, rows: [{ text: 'НМШ', size: 22 }, { text: 'ЕКО', size: 16 }] },
  ],
  prompt: () => 'На какой стороне символы кажутся более чёткими?',
  options: () => OPTIONS,
  observeMs: () => 1500,
  isCorrect: () => null,
  summarize(records, _trials, durationMs) {
    const red = records.filter((r) => r.value === 'red').length;
    const green = records.filter((r) => r.value === 'green').length;
    const equal = records.filter((r) => r.value === 'equal').length;
    const n = records.length;
    const consistentSide = red === n ? 'красной' : green === n ? 'зелёной' : null;
    const attention = consistentSide !== null;
    const dominant = red > green ? 'на красной' : green > red ? 'на зелёной' : null;
    return {
      testId: 'duochrome',
      headline: 'Ответы сохранены',
      headlineCaption: `красная ${red} · одинаково ${equal} · зелёная ${green}`,
      result:
        equal === n
          ? 'Во всех раундах символы на обеих сторонах казались вам одинаково чёткими.'
          : dominant
            ? `Чаще символы казались чётче ${dominant} стороне (красная: ${red}, зелёная: ${green}, одинаково: ${equal}).`
            : `Ответы распределились поровну (красная: ${red}, зелёная: ${green}, одинаково: ${equal}).`,
      meaning: attention
        ? `Во всех раундах символы казались чётче на ${consistentSide} стороне. Результат дуохромного теста не является диагнозом, но стабильная разница может быть поводом проверить рефракцию (подбор очков или линз) у специалиста.`
        : 'Результат дуохромного теста показывает, на каком фоне вам было легче различать символы. Ваши ответы не показали устойчивого преобладания одной стороны.',
      attention,
      short: equal === n ? 'Одинаково чётко' : dominant ? `Чётче ${dominant}` : 'Без преобладания',
      stats: [
        { label: 'Красная сторона', value: String(red) },
        { label: 'Одинаково', value: String(equal) },
        { label: 'Зелёная сторона', value: String(green) },
      ],
      answered: n,
      correct: null,
      durationMs,
    };
  },
  Stimulus,
};
