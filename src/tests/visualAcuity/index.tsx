import type { AnswerOption, AnswerRecord, StimulusProps, TestDefinition } from '../types';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface AcuityTrial {
  level: number;
  /** Symbol height in CSS px. */
  size: number;
  direction: Direction;
}

/** 10 levels, each ~25% smaller than the previous one. */
export const ACUITY_SIZES = [200, 150, 112, 84, 63, 47, 35, 26, 19, 14];

const ROTATION: Record<Direction, number> = { right: 0, down: 90, left: 180, up: 270 };

const DIRECTION_TEXT: Record<Direction, string> = {
  up: 'вверх',
  down: 'вниз',
  left: 'влево',
  right: 'вправо',
};

const OPTIONS: AnswerOption[] = [
  { value: 'up', gesture: 'POINT_UP', label: 'Вверх', glyph: '↑' },
  { value: 'left', gesture: 'POINT_LEFT', label: 'Влево', glyph: '←' },
  { value: 'right', gesture: 'POINT_RIGHT', label: 'Вправо', glyph: '→' },
  { value: 'down', gesture: 'POINT_DOWN', label: 'Вниз', glyph: '↓' },
];

function randomDirections(n: number): Direction[] {
  const all: Direction[] = ['up', 'down', 'left', 'right'];
  const out: Direction[] = [];
  for (let i = 0; i < n; i++) {
    const pool = all.filter((d) => d !== out[i - 1]);
    out.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return out;
}

/** Tumbling E: a 5×5 grid "E" whose open side faces `direction`. */
export function TumblingE({ size, direction, color = '#000000' }: { size: number; direction: Direction; color?: string }) {
  return (
    <svg
      viewBox="0 0 5 5"
      role="img"
      aria-label={`Символ E, разрыв ${DIRECTION_TEXT[direction]}`}
      style={{
        // Scales down proportionally on narrow screens so level ratios stay intact.
        width: `min(${size}px, ${(size * 0.17).toFixed(2)}vw)`,
        height: `min(${size}px, ${(size * 0.17).toFixed(2)}vw)`,
        transform: `rotate(${ROTATION[direction]}deg)`,
        shapeRendering: 'crispEdges',
      }}
    >
      <path d="M0 0H5V1H1V2H5V3H1V4H5V5H0Z" fill={color} />
    </svg>
  );
}

/** Highest level answered correctly. */
function bestLevel(records: AnswerRecord[], trials: AcuityTrial[]) {
  let best = 0;
  for (const r of records) if (r.correct) best = Math.max(best, trials[r.trialIndex].level);
  return best;
}

function Stimulus({ trial }: StimulusProps<AcuityTrial>) {
  return (
    <div className="relative flex h-full min-h-[240px] w-full items-center justify-center overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200">
      <div className="absolute left-4 top-4 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        Уровень {trial.level} / {ACUITY_SIZES.length}
      </div>
      <div key={`${trial.level}`} className="animate-pop-in" style={{ maxWidth: '72%', maxHeight: '72%' }}>
        <TumblingE size={trial.size} direction={trial.direction} />
      </div>
    </div>
  );
}

export const visualAcuityTest: TestDefinition<AcuityTrial> = {
  id: 'acuity',
  number: 1,
  title: 'Острота зрения',
  shortTitle: 'Острота',
  checks:
    'Насколько хорошо вы различаете мелкие символы. Использован принцип таблицы «Tumbling E»: нужно определить, в какую сторону открыта буква E.',
  intro: [
    'Сядьте на расстоянии вытянутой руки от экрана (≈ 50–70 см).',
    'Если вы носите очки для дали — оставайтесь в них.',
    'Покажите указательным пальцем, куда открыта буква E: ☝️ 👇 👈 👉.',
    'Подтвердите ответ кулаком ✊. Символ будет постепенно уменьшаться.',
  ],
  layout: 'cross',
  createTrials() {
    const dirs = randomDirections(ACUITY_SIZES.length);
    return ACUITY_SIZES.map((size, i) => ({ level: i + 1, size, direction: dirs[i] }));
  },
  prompt: () => 'Куда открыта буква E?',
  options: () => OPTIONS,
  isCorrect: (trial, value) => trial.direction === value,
  shouldStop(records) {
    // Stop after two consecutive misses — the symbol is below the visible limit.
    const n = records.length;
    return n >= 2 && records[n - 1].correct === false && records[n - 2].correct === false;
  },
  summarize(records, trials, durationMs) {
    const correct = records.filter((r) => r.correct).length;
    const level = bestLevel(records, trials);
    const total = ACUITY_SIZES.length;
    const attention = level < 7;
    return {
      testId: 'acuity',
      headline: `Уровень ${level}`,
      headlineCaption: `из ${total} · ${correct} из ${records.length} верно`,
      result:
        level > 0
          ? `Вы уверенно различали символ до уровня ${level} из ${total} (высота ≈ ${trials[level - 1].size}px). Правильных ответов: ${correct} из ${records.length}.`
          : `Правильных ответов: ${correct} из ${records.length}.`,
      meaning: attention
        ? 'Результат этого теста показывает, насколько хорошо вы различали мелкие символы в условиях теста. Результат ниже ожидаемого для этих условий — это может зависеть от освещения, расстояния или экрана. Если вам сложно видеть мелкие детали, стоит проверить зрение у офтальмолога.'
        : 'Результат этого теста показывает, насколько хорошо вы различали мелкие символы в условиях теста. В этих условиях вы различали даже мелкие символы.',
      attention,
      short: `Уровень ${level} из ${total}`,
      stats: [
        { label: 'Показано символов', value: String(records.length) },
        { label: 'Правильных ответов', value: `${correct}` },
        { label: 'Ошибок', value: `${records.length - correct}` },
        { label: 'Достигнутый уровень', value: `${level} / ${total}` },
      ],
      answered: records.length,
      correct,
      durationMs,
    };
  },
  Stimulus,
};
