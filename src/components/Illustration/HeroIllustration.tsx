/** Person in front of a laptop camera, with a tracked hand skeleton. Pure SVG. */
export function HeroIllustration() {
  // Hand skeleton (thumbs-up-ish pose) in local coordinates.
  const pts: [number, number][] = [
    [0, 60], [-14, 44], [-24, 26], [-30, 8], [-32, -12],
    [-6, 20], [-4, 34], [0, 40], [4, 34],
    [6, 22], [8, 38], [12, 44], [14, 36],
    [16, 26], [18, 40], [22, 46], [22, 38],
    [24, 32], [26, 44], [28, 48], [28, 42],
  ];
  const links = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
  ];
  return (
    <svg viewBox="0 0 420 320" className="h-auto w-full" role="img" aria-label="Иллюстрация: человек перед ноутбуком показывает жест, камера отслеживает руку">
      <defs>
        <linearGradient id="hi-screen" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#3b6cf6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="hi-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#c7d7fe" />
          <stop offset="1" stopColor="#e0e9ff" />
        </linearGradient>
        <filter id="hi-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* backdrop */}
      <circle cx="220" cy="150" r="130" fill="#eef4ff" />
      <circle cx="220" cy="150" r="96" fill="#e3ecff" />

      {/* person */}
      <g>
        <path d="M150 300c0-58 32-92 74-92s74 34 74 92z" fill="url(#hi-body)" />
        <circle cx="224" cy="150" r="40" fill="#f6d2b8" />
        <path d="M184 146c0-28 18-44 40-44s42 14 42 42c-10-10-26-16-40-16-18 0-30 8-42 18z" fill="#1f2a44" />
        <circle cx="210" cy="154" r="3.4" fill="#1f2a44" />
        <circle cx="238" cy="154" r="3.4" fill="#1f2a44" />
        <path d="M214 172q10 7 20 0" stroke="#b45f45" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* arm */}
        <path d="M282 250c16-18 26-44 30-74" stroke="#c7d7fe" strokeWidth="26" strokeLinecap="round" fill="none" />
      </g>

      {/* tracked hand */}
      <g transform="translate(318 118)">
        <g className="animate-float">
        <path d="M-6 58c-16-6-22-26-18-42 2-12 16-10 18 0l2-14c2-8 14-8 14 2 4-6 14-4 14 4 4-4 12-2 12 6l-2 26c-2 16-14 22-40 18z" fill="#f6d2b8" />
        <rect x="-44" y="-30" width="92" height="104" rx="14" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeDasharray="14 10" />
        <g filter="url(#hi-glow)">
          {links.map(([a, b]) => (
            <line key={`${a}-${b}`} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="#3b6cf6" strokeWidth="2.4" strokeLinecap="round" />
          ))}
          {pts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 3.6 : 2.6} fill="#fff" stroke="#3b6cf6" strokeWidth="1.8" />
          ))}
        </g>
        <g transform="translate(-6 -50)">
          <rect x="-34" y="-14" width="80" height="26" rx="13" fill="#16a34a" />
          <text x="6" y="4" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" fontFamily="Manrope Variable, sans-serif">
            ✓ 👍 OK
          </text>
        </g>
        </g>
      </g>

      {/* laptop */}
      <g>
        <rect x="40" y="170" width="150" height="100" rx="12" fill="#0f172a" />
        <rect x="48" y="178" width="134" height="84" rx="7" fill="url(#hi-screen)" />
        <circle cx="115" cy="174" r="2.5" fill="#22d3ee" />
        <path d="M78 220s16-20 37-20 37 20 37 20-16 20-37 20-37-20-37-20z" fill="none" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="115" cy="220" r="8" fill="#fff" />
        <path d="M24 270h182l-10 14H34z" fill="#1e293b" />
      </g>

      {/* camera beam */}
      <path d="M115 174 L300 90 L300 200 Z" fill="#22d3ee" opacity="0.08" />
    </svg>
  );
}
