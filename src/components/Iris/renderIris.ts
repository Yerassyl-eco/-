/**
 * Procedural iris, drawn once into a canvas. Geometry is in units of the
 * iris radius R so the picture is identical at every resolution; the seed
 * keeps it identical between visits.
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth periodic noise over the angle, used for the collarette and pupil edge. */
function angularNoise(rnd: () => number, octaves: number[]) {
  const parts = octaves.map((f, i) => ({ f, p: rnd() * Math.PI * 2, a: 1 / (i + 1.4) }));
  const norm = parts.reduce((s, x) => s + x.a, 0);
  return (a: number) => parts.reduce((s, x) => s + Math.sin(a * x.f + x.p) * x.a, 0) / norm;
}

/** Fraction of R (canvas radius) the iris occupies; the SVG overlay shares it. */
export const IRIS_FRACTION = 0.6;
/** Pupil radius at rest, fraction of the iris radius. */
export const PUPIL_REST = 0.355;
/** Smallest pupil the canvas paints; the SVG pupil sits on top of it. */
const PUPIL_MIN = 0.29;

export function renderIris(canvas: HTMLCanvasElement, sizePx: number, seed = 23) {
  canvas.width = sizePx;
  canvas.height = sizePx;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const rnd = mulberry32(seed);
  const c = sizePx / 2;
  const R = c * IRIS_FRACTION;
  const P = R * PUPIL_MIN;
  const u = R / 300; // 1 unit ≈ 1px on a 300px iris

  ctx.clearRect(0, 0, sizePx, sizePx);
  ctx.save();
  ctx.translate(c, c);

  // 1. Stroma base: warm core, grey-blue body, darker limbus.
  const base = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
  base.addColorStop(0, '#120d0a');
  base.addColorStop(PUPIL_MIN, '#2a1d14');
  base.addColorStop(0.39, '#4a3a2e');
  base.addColorStop(0.46, '#7c6a58');
  base.addColorStop(0.53, '#7d8e9c');
  base.addColorStop(0.64, '#a4b7c7');
  base.addColorStop(0.8, '#98aec1');
  base.addColorStop(0.91, '#7890a6');
  base.addColorStop(0.975, '#5d7185');
  base.addColorStop(1, '#55687b');
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(0, 0, R * 1.02, 0, Math.PI * 2);
  ctx.fill();

  const collar = angularNoise(rnd, [9, 17, 29, 47, 71]);
  const collarR = (a: number) => R * (0.49 + 0.05 * collar(a));
  ctx.lineCap = 'round';

  // 2. Radial fibres of the ciliary zone: light trabeculae and dark gaps.
  const fibre = (a0: number, r0: number, r1: number, style: string, w: number, wobble: number) => {
    const steps = 14;
    const phase = rnd() * Math.PI * 2;
    const k = 6 + rnd() * 10;
    ctx.strokeStyle = style;
    ctx.lineWidth = w;
    ctx.beginPath();
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const r = r0 + (r1 - r0) * t;
      const a = a0 + Math.sin(t * k + phase) * wobble * (0.4 + t);
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  for (let i = 0; i < 1100; i++) {
    const a = rnd() * Math.PI * 2;
    const start = collarR(a) * (0.94 + rnd() * 0.1);
    const end = R * (0.84 + rnd() * 0.15);
    fibre(a, start, end, `hsla(208, 26%, ${26 + rnd() * 16}%, ${0.08 + rnd() * 0.16})`, (0.8 + rnd() * 1.8) * u, 0.018);
  }
  for (let i = 0; i < 3600; i++) {
    const a = rnd() * Math.PI * 2;
    const start = collarR(a) * (0.96 + rnd() * 0.12);
    const end = R * (0.78 + rnd() * 0.2);
    const l = 78 + rnd() * 19;
    fibre(a, start, end, `hsla(${200 + rnd() * 14}, ${18 + rnd() * 18}%, ${l}%, ${0.08 + rnd() * 0.34})`, (0.45 + rnd() * 1.3) * u, 0.014);
  }

  // 3. Crypts: dark lacunae between the fibres, with a pale rim.
  if ('filter' in ctx) ctx.filter = `blur(${1.6 * u}px)`;
  for (let i = 0; i < 46; i++) {
    const a = rnd() * Math.PI * 2;
    const r = R * (0.58 + rnd() * 0.3);
    const len = R * (0.03 + rnd() * 0.07);
    const wid = R * (0.006 + rnd() * 0.014);
    ctx.save();
    ctx.rotate(a);
    ctx.translate(r, 0);
    ctx.fillStyle = `hsla(212, 34%, ${20 + rnd() * 14}%, ${0.12 + rnd() * 0.16})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, len, wid, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `hsla(205, 40%, 88%, ${0.08 + rnd() * 0.12})`;
    ctx.lineWidth = 0.8 * u;
    ctx.stroke();
    ctx.restore();
  }
  if ('filter' in ctx) ctx.filter = 'none';

  // 4. Contraction furrows: faint concentric arcs near the limbus.
  for (const f of [0.74, 0.83, 0.9]) {
    for (let k = 0; k < 5; k++) {
      const a0 = rnd() * Math.PI * 2;
      ctx.strokeStyle = `rgba(30, 44, 60, ${0.08 + rnd() * 0.08})`;
      ctx.lineWidth = (1 + rnd() * 1.5) * u;
      ctx.beginPath();
      ctx.arc(0, 0, R * (f + (rnd() - 0.5) * 0.02), a0, a0 + 0.4 + rnd() * 0.9);
      ctx.stroke();
    }
  }

  // 5. Pupillary zone: amber collarette fibres out to a jagged ring.
  for (let i = 0; i < 1800; i++) {
    const a = rnd() * Math.PI * 2;
    const end = collarR(a) * (0.9 + rnd() * 0.14);
    const warm = rnd();
    const style =
      warm > 0.55
        ? `hsla(${24 + rnd() * 12}, ${34 + rnd() * 22}%, ${40 + rnd() * 24}%, ${0.14 + rnd() * 0.3})`
        : warm > 0.25
          ? `hsla(205, 18%, ${60 + rnd() * 25}%, ${0.1 + rnd() * 0.25})`
          : `hsla(24, 35%, ${14 + rnd() * 12}%, ${0.18 + rnd() * 0.26})`;
    fibre(a, P * (0.98 + rnd() * 0.08), end, style, (0.5 + rnd() * 1.4) * u, 0.03);
  }
  const ring = (rOf: (a: number) => number) => {
    ctx.beginPath();
    for (let s = 0; s <= 720; s++) {
      const a = (s / 720) * Math.PI * 2;
      const r = rOf(a);
      if (s === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
  };
  ctx.strokeStyle = 'rgba(120, 78, 40, 0.45)';
  ctx.lineWidth = 1.6 * u;
  ring(collarR);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(232, 196, 150, 0.28)';
  ctx.lineWidth = 1 * u;
  ring((a) => collarR(a) + 2.4 * u);
  ctx.stroke();

  // 6. Pupil (smallest size) with a pigmented ruff.
  const ruff = angularNoise(rnd, [31, 53, 89]);
  ctx.fillStyle = '#231710';
  ring((a) => P * (1.05 + 0.025 * ruff(a)));
  ctx.fill();
  const pupil = ctx.createRadialGradient(0, 0, 0, 0, 0, P);
  pupil.addColorStop(0, '#050505');
  pupil.addColorStop(1, '#0c0b0a');
  ctx.fillStyle = pupil;
  ctx.beginPath();
  ctx.arc(0, 0, P, 0, Math.PI * 2);
  ctx.fill();

  // 7. Limbal ring.
  const limbus = ctx.createRadialGradient(0, 0, R * 0.86, 0, 0, R);
  limbus.addColorStop(0, 'rgba(38, 52, 68, 0)');
  limbus.addColorStop(0.75, 'rgba(38, 52, 68, 0.16)');
  limbus.addColorStop(1, 'rgba(38, 52, 68, 0.32)');
  ctx.fillStyle = limbus;
  ctx.beginPath();
  ctx.arc(0, 0, R * 1.02, 0, Math.PI * 2);
  ctx.fill();

  // 8. Fine grain.
  for (let i = 0; i < 9000; i++) {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * R;
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
    ctx.fillRect(Math.cos(a) * r, Math.sin(a) * r, 1.2 * u, 1.2 * u);
  }

  // 9. Soft edge into the paper, like a shallow depth of field.
  ctx.globalCompositeOperation = 'destination-in';
  const edge = ctx.createRadialGradient(0, 0, R * 0.86, 0, 0, R * 1.06);
  edge.addColorStop(0, 'rgba(0,0,0,1)');
  edge.addColorStop(0.5, 'rgba(0,0,0,0.82)');
  edge.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = edge;
  ctx.fillRect(-c, -c, sizePx, sizePx);
  ctx.globalCompositeOperation = 'source-over';

  // 10. Halo: the iris sits in a slightly lighter pool of paper.
  ctx.globalCompositeOperation = 'destination-over';
  const halo = ctx.createRadialGradient(0, 0, R, 0, 0, R * 1.5);
  halo.addColorStop(0, 'rgba(255,255,255,0.55)');
  halo.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(-c, -c, sizePx, sizePx);
  ctx.restore();
}
