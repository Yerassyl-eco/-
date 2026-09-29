/**
 * Procedural macro iris, drawn once into a canvas. Geometry is in units of
 * the iris radius R so the picture is identical at every resolution; the seed
 * keeps it identical between visits.
 *
 * Built like the anatomy it imitates: a dark blue-grey stroma, bright
 * trabecular bundles with dark crypts between them, a gold collarette with
 * outward fibres, a pigmented ruff at the pupil, and a limbus that dissolves
 * into light rather than ending in an outline.
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

/** Smooth periodic noise over the angle. */
function angularNoise(rnd: () => number, octaves: number[]) {
  const parts = octaves.map((f, i) => ({ f, p: rnd() * Math.PI * 2, a: 1 / (i + 1.4) }));
  const norm = parts.reduce((s, x) => s + x.a, 0);
  return (a: number) => parts.reduce((s, x) => s + Math.sin(a * x.f + x.p) * x.a, 0) / norm;
}

/** Fraction of the canvas half-size the iris occupies; the SVG overlay shares it. */
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
  const TAU = Math.PI * 2;
  const blur = (px: number) => {
    if ('filter' in ctx) ctx.filter = px ? `blur(${px * u}px)` : 'none';
  };

  ctx.clearRect(0, 0, sizePx, sizePx);
  ctx.save();
  ctx.translate(c, c);
  ctx.lineCap = 'round';

  // 1. Stroma: deep blue-grey, darkest toward the pupil.
  const base = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
  base.addColorStop(0, '#0d0c0c');
  base.addColorStop(PUPIL_MIN, '#1f1a17');
  base.addColorStop(0.42, '#2e3842');
  base.addColorStop(0.55, '#3b5064');
  base.addColorStop(0.72, '#4f6a84');
  base.addColorStop(0.88, '#5f7b95');
  base.addColorStop(1, '#6f89a1');
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(0, 0, R * 1.04, 0, TAU);
  ctx.fill();

  const collar = angularNoise(rnd, [9, 17, 29, 47, 71]);
  const collarR = (a: number) => R * (0.5 + 0.05 * collar(a));

  /** A wavy radial fibre, drawn as two segments so it tapers outward. */
  const fibre = (a0: number, r0: number, r1: number, style: string, w: number, wobble: number) => {
    const phase = rnd() * TAU;
    const k = 5 + rnd() * 9;
    const pt = (t: number) => {
      const r = r0 + (r1 - r0) * t;
      const a = a0 + Math.sin(t * k + phase) * wobble * (0.3 + t);
      return [Math.cos(a) * r, Math.sin(a) * r];
    };
    ctx.strokeStyle = style;
    for (const [t0, t1, ww] of [
      [0, 0.55, w],
      [0.5, 1, w * 0.55],
    ]) {
      ctx.lineWidth = ww;
      ctx.beginPath();
      for (let s = 0; s <= 8; s++) {
        const [x, y] = pt(t0 + ((t1 - t0) * s) / 8);
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  };

  // 2. Crypts: dark, soft lacunae in the ciliary zone.
  blur(3);
  for (let i = 0; i < 90; i++) {
    const a = rnd() * TAU;
    const r = R * (0.56 + rnd() * 0.34);
    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = `rgba(14, 22, 32, ${0.25 + rnd() * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(r, 0, R * (0.03 + rnd() * 0.07), R * (0.01 + rnd() * 0.02), 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  blur(0);

  // 3. Trabeculae: bright fibres gathered into bundles, gaps left dark.
  const bundles = 150;
  for (let b = 0; b < bundles; b++) {
    const center = (b / bundles) * TAU + (rnd() - 0.5) * 0.03;
    const strength = 0.4 + rnd() * 0.6;
    const count = 10 + Math.floor(rnd() * 22);
    for (let i = 0; i < count; i++) {
      const a = center + (rnd() - 0.5) * 0.045;
      const start = collarR(a) * (0.98 + rnd() * 0.1);
      const end = R * (0.8 + rnd() * 0.22);
      const l = 72 + rnd() * 26;
      fibre(
        a,
        start,
        end,
        `hsla(${198 + rnd() * 16}, ${14 + rnd() * 22}%, ${l}%, ${(0.1 + rnd() * 0.45) * strength})`,
        (0.5 + rnd() * 1.5) * u,
        0.02,
      );
    }
  }
  // long bright strands for highlights
  for (let i = 0; i < 260; i++) {
    const a = rnd() * TAU;
    fibre(a, collarR(a), R * (0.9 + rnd() * 0.12), `rgba(236, 244, 250, ${0.25 + rnd() * 0.45})`, (0.6 + rnd() * 0.9) * u, 0.015);
  }

  // 4. Contraction furrows near the edge.
  for (const f of [0.78, 0.87]) {
    for (let k = 0; k < 6; k++) {
      const a0 = rnd() * TAU;
      ctx.strokeStyle = `rgba(20, 30, 42, ${0.06 + rnd() * 0.08})`;
      ctx.lineWidth = (1.2 + rnd() * 1.6) * u;
      ctx.beginPath();
      ctx.arc(0, 0, R * (f + (rnd() - 0.5) * 0.02), a0, a0 + 0.3 + rnd() * 0.8);
      ctx.stroke();
    }
  }

  // 5. Collarette: gold fibres from the ruff out past a jagged ring.
  for (let i = 0; i < 2200; i++) {
    const a = rnd() * TAU;
    const end = collarR(a) * (0.92 + rnd() * 0.2);
    const pick = rnd();
    const style =
      pick > 0.35
        ? `hsla(${27 + rnd() * 10}, ${52 + rnd() * 20}%, ${42 + rnd() * 20}%, ${0.2 + rnd() * 0.45})`
        : pick > 0.15
          ? `hsla(36, 70%, ${62 + rnd() * 14}%, ${0.2 + rnd() * 0.35})`
          : `hsla(22, 45%, ${10 + rnd() * 10}%, ${0.25 + rnd() * 0.3})`;
    fibre(a, P * (1.02 + rnd() * 0.06), end, style, (0.5 + rnd() * 1.3) * u, 0.035);
  }
  // outward gold flares that break the ring
  for (let i = 0; i < 180; i++) {
    const a = rnd() * TAU;
    const cr = collarR(a);
    fibre(a, cr * 0.95, cr * (1.12 + rnd() * 0.22), `hsla(30, 60%, ${45 + rnd() * 15}%, ${0.18 + rnd() * 0.3})`, (0.6 + rnd()) * u, 0.03);
  }
  const ring = (rOf: (a: number) => number) => {
    ctx.beginPath();
    for (let s = 0; s <= 720; s++) {
      const a = (s / 720) * TAU;
      const r = rOf(a);
      if (s === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
  };
  ctx.strokeStyle = 'rgba(70, 40, 18, 0.18)';
  ctx.lineWidth = 1.4 * u;
  ring((a) => collarR(a) * 1.01);
  ctx.stroke();

  // 6. Pigment ruff and pupil (smallest size).
  const ruff = angularNoise(rnd, [31, 53, 89]);
  blur(1.2);
  ctx.fillStyle = '#1a120d';
  ring((a) => P * (1.07 + 0.03 * ruff(a)));
  ctx.fill();
  blur(0);
  ctx.fillStyle = '#070606';
  ctx.beginPath();
  ctx.arc(0, 0, P, 0, TAU);
  ctx.fill();

  // 7. Fine grain.
  for (let i = 0; i < 7000; i++) {
    const a = rnd() * TAU;
    const r = P + Math.sqrt(rnd()) * (R - P);
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
    ctx.fillRect(Math.cos(a) * r, Math.sin(a) * r, 1.1 * u, 1.1 * u);
  }

  // 8. Limbus: no outline, the iris dissolves into light.
  ctx.globalCompositeOperation = 'destination-in';
  const edge = ctx.createRadialGradient(0, 0, R * 0.84, 0, 0, R * 1.07);
  edge.addColorStop(0, 'rgba(0,0,0,1)');
  edge.addColorStop(0.45, 'rgba(0,0,0,0.85)');
  edge.addColorStop(0.8, 'rgba(0,0,0,0.3)');
  edge.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = edge;
  ctx.fillRect(-c, -c, sizePx, sizePx);

  // 9. Halo: a lighter pool of paper around the eye.
  ctx.globalCompositeOperation = 'destination-over';
  const halo = ctx.createRadialGradient(0, 0, R * 0.95, 0, 0, R * 1.3);
  halo.addColorStop(0, 'rgba(255,255,255,0.35)');
  halo.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(-c, -c, sizePx, sizePx);
  ctx.restore();
}
