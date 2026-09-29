import { StimulusField } from '../../components/StimulusField/StimulusField';
import { useEffect, useRef } from 'react';
import type { Gesture } from '../../vision/types';
import type { AnswerOption, StimulusProps, TestDefinition } from '../types';
import { drawPlate, generatePlate, type PlatePalette } from './plate';

export interface ColorTrial {
  plate: number;
  digit: string;
  control: boolean;
  palette: PlatePalette;
  seed: number;
  options: AnswerOption[];
}

/** Everyone should see this one: blue-grey digit on warm background. */
const CONTROL: PlatePalette = {
  figure: ['#2f5d8a', '#3b6fa0', '#284f78', '#4a7fb0'],
  background: ['#e6a45a', '#d9924a', '#efb873', '#e39c50', '#f0c083'],
};
/** Red–green confusion palettes with matched lightness. */
const RG_EASY: PlatePalette = {
  figure: ['#e0703a', '#d8643a', '#ea8446', '#cf5f36'],
  background: ['#8fae4a', '#9db957', '#7fa043', '#a8bf62', '#88a84c'],
};
const RG_MEDIUM: PlatePalette = {
  figure: ['#d7824e', '#cc7a4a', '#df9160', '#c97550'],
  background: ['#9fae5c', '#a9b465', '#94a653', '#b0b86c', '#9aa85a'],
};
const RG_HARD: PlatePalette = {
  figure: ['#c98d5e', '#c58456', '#d09868', '#bf8a5c'],
  background: ['#a8ad6a', '#b0b270', '#a0a864', '#b6b476', '#a6aa66'],
};

const SLOTS: Gesture[] = ['POINT_LEFT', 'POINT_UP', 'POINT_RIGHT'];
const DISTRACTORS: Record<string, string[]> = {
  '7': ['1', '4'],
  '5': ['6', '3'],
  '3': ['8', '5'],
  '6': ['9', '5'],
  '2': ['7', '5'],
  '8': ['3', '0'],
  '9': ['4', '6'],
  '4': ['1', '9'],
};

function buildOptions(digit: string): AnswerOption[] {
  const values = [digit, ...(DISTRACTORS[digit] ?? ['1', '4'])].sort(() => Math.random() - 0.5);
  return [
    ...values.map((v, i) => ({ value: v, gesture: SLOTS[i], label: `Цифра ${v}`, glyph: v })),
    { value: 'none', gesture: 'POINT_DOWN' as Gesture, label: 'Не вижу цифру', glyph: '∅' },
  ];
}

function pickDigits(n: number) {
  const pool = ['2', '3', '5', '6', '7', '8', '9', '4'];
  return pool.sort(() => Math.random() - 0.5).slice(0, n);
}

function Plate({ trial }: { trial: ColorTrial }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const dots = generatePlate(trial.digit, trial.palette, trial.seed);
    drawPlate(ref.current, dots);
  }, [trial]);
  return (
    <canvas
      ref={ref}
      className="aspect-square h-auto w-full max-w-[300px] rounded-full"
      role="img"
      aria-label={`Цветовая карточка ${trial.plate}: круг из цветных точек со скрытой цифрой`}
    />
  );
}

function Stimulus({ trial, trialIndex, trialCount, observeProgress }: StimulusProps<ColorTrial>) {
  return (
    <StimulusField
      label={`Цветовая карточка ${trial.plate}`}
      tagLeft={`Карточка ${String(trialIndex + 1).padStart(2, '0')} / ${String(trialCount).padStart(2, '0')}`}
      tagRight={trial.control ? 'контрольная' : 'тестовая'}
      progress={observeProgress}
    >
      <div key={trial.plate} className="animate-fade flex w-full items-center justify-center p-8">
        <Plate trial={trial} />
      </div>
    </StimulusField>
  );
}

export const colorVisionTest: TestDefinition<ColorTrial> = {
  id: 'color',
  number: 5,
  title: 'Цветовое зрение',
  titleEn: 'Colour vision · generated plates',
  shortTitle: 'Цвет',
  checks:
    'Различаете ли вы цифры, составленные из точек близких оттенков. Карточки созданы по принципу псевдоизохроматических таблиц (собственная генерация).',
  intro: [
    'Проверьте, что яркость экрана достаточная и не включён ночной режим / фильтр синего света.',
    'На каждой карточке спрятана цифра из цветных точек.',
    'Выберите цифру, указав влево, вверх или вправо; вниз — «не вижу цифру».',
    'Подтвердите выбор кулаком.',
  ],
  layout: 'cross',
  createTrials() {
    const digits = pickDigits(4);
    const palettes = [CONTROL, RG_EASY, RG_MEDIUM, RG_HARD];
    return digits.map((digit, i) => ({
      plate: i + 1,
      digit,
      control: i === 0,
      palette: palettes[i],
      seed: 1000 + i * 97 + Number(digit),
      options: buildOptions(digit),
    }));
  },
  prompt: () => 'Какую цифру вы видите на карточке?',
  options: (t) => t.options,
  observeMs: () => 1200,
  isCorrect: (t, v) => t.digit === v,
  expectedLabel: (t) => `Цифра ${t.digit}`,
  summarize(records, trials, durationMs) {
    const correct = records.filter((r) => r.correct).length;
    const test = records.filter((r) => !trials[r.trialIndex].control);
    const testCorrect = test.filter((r) => r.correct).length;
    const controlOk = records.find((r) => trials[r.trialIndex].control)?.correct ?? false;
    const attention = testCorrect < test.length;
    return {
      testId: 'color',
      headline: `${correct} / ${records.length}`,
      headlineCaption: 'карточек распознано',
      result: `Вы правильно назвали цифру на ${correct} из ${records.length} карточек.${controlOk ? '' : ' Контрольную карточку распознать не удалось — возможно, стоит проверить настройки экрана.'}`,
      meaning: attention
        ? 'Результат отличается от ожидаемого для этих карточек. Экранный тест зависит от настроек и цветопередачи дисплея и не является диагнозом. Если вы замечаете трудности с различением цветов, стоит пройти проверку цветового зрения у офтальмолога.'
        : 'Вы различили цифры на всех карточках — это ожидаемый результат экранного скрининга цветового зрения.',
      attention,
      short: `${correct} из ${records.length} карточек`,
      stats: [
        { label: 'Показано карточек', value: String(records.length) },
        { label: 'Правильно', value: String(correct) },
        { label: 'Контрольная карточка', value: controlOk ? 'распознана' : 'не распознана' },
      ],
      answered: records.length,
      correct,
      durationMs,
    };
  },
  Stimulus,
};
