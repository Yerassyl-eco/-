/**
 * Hero graphic: a Tumbling E chart (rows shrink like the real test) with a
 * tracked hand skeleton answering the highlighted symbol. Drawn from the
 * product's own material instead of generic clip art.
 */
type Dir = 'up' | 'down' | 'left' | 'right';
const ROT: Record<Dir, number> = { right: 0, down: 90, left: 180, up: 270 };

const ROWS: Dir[][] = [
  ['right'],
  ['up', 'left'],
  ['down', 'right', 'up'],
  ['left', 'down', 'right', 'left'],
  ['up', 'right', 'down', 'left', 'up'],
];
const SIZES = [64, 46, 34, 25, 18];

function E({ x, y, size, dir, color }: { x: number; y: number; size: number; dir: Dir; color: string }) {
  return (
    <path
      d="M0 0H5V1H1V2H5V3H1V4H5V5H0Z"
      fill={color}
      transform={`translate(${x} ${y}) rotate(${ROT[dir]} ${size / 2} ${size / 2}) scale(${size / 5})`}
    />
  );
}

// 21 hand landmarks of a hand pointing right (index finger extended).
const HAND: [number, number][] = [
  [0, 40], [14, 30], [26, 22], [36, 20], [44, 22],
  [30, 4], [52, 2], [66, 2], [80, 3],
  [30, 14], [44, 18], [44, 26], [36, 26],
  [28, 24], [40, 30], [40, 36], [32, 36],
  [24, 32], [34, 40], [34, 44], [28, 44],
];
const LINKS = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];

export function HeroIllustration() {
  const chartW = 300;
  let y = 34;
  const rows = ROWS.map((row, r) => {
    const size = SIZES[r];
    const gap = size * 0.9;
    const total = row.length * size + (row.length - 1) * gap;
    const out = { r, y, size, gap, row, x0: 14 + (chartW - total) / 2 };
    y += size + 24;
    return out;
  });
  const target = rows[0];
  const font = 'Manrope Variable, Noto Sans Variable, sans-serif';
  return (
    <svg
      viewBox="0 0 440 360"
      className="h-auto w-full"
      role="img"
      aria-label="Таблица с буквой E разного размера; рука указывает направление разрыва, система распознаёт ответ «вправо»"
    >
      <rect x="6" y="6" width="330" height="348" rx="28" fill="#ffffff" stroke="#d5e9ee" />
      {rows.map(({ r, y: ry, size, gap, row, x0 }) => (
        <g key={r}>
          {row.map((d, i) => (
            <E key={i} x={x0 + i * (size + gap)} y={ry} size={size} dir={d} color="#000000" />
          ))}
          <text x="324" y={ry + size / 2 + 4} textAnchor="end" fontSize="12" fontWeight="700" fill="#8aa3ad" fontFamily={font}>
            {r + 1}
          </text>
        </g>
      ))}
      <rect
        x={target.x0 - 12}
        y={target.y - 12}
        width={target.size + 24}
        height={target.size + 24}
        rx="16"
        fill="none"
        stroke="#0891b2"
        strokeWidth="2.5"
        strokeDasharray="8 6"
      />
      <path d={`M${target.x0 + target.size + 16} ${target.y + target.size / 2} H 300`} stroke="#22d3ee" strokeWidth="2" strokeDasharray="3 5" />

      <g transform="translate(318 44)">
        <g className="animate-float">
          <g stroke="#0e7490" strokeWidth="2.6" strokeLinecap="round">
            {LINKS.map(([a, b]) => (
              <line key={`${a}-${b}`} x1={HAND[a][0]} y1={HAND[a][1]} x2={HAND[b][0]} y2={HAND[b][1]} />
            ))}
          </g>
          {HAND.map(([x, hy], i) => (
            <circle key={i} cx={x} cy={hy} r={i === 8 ? 4.5 : 3} fill={i === 8 ? '#22d3ee' : '#ffffff'} stroke="#0e7490" strokeWidth="1.8" />
          ))}
          <g transform="translate(-10 60)">
            <rect width="110" height="32" rx="16" fill="#047857" />
            <text x="55" y="21" textAnchor="middle" fontSize="13" fontWeight="800" fill="#ffffff" fontFamily={font}>
              ✓ ВПРАВО
            </text>
          </g>
        </g>
      </g>
    </svg>
  );
}
