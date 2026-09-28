/**
 * Procedurally generated pseudo-isochromatic plates (own artwork, inspired by
 * the Ishihara principle — no copyrighted scans are used).
 */
export interface PlatePalette {
  figure: string[];
  background: string[];
}

export interface Dot {
  x: number;
  y: number;
  r: number;
  color: string;
}

/** Deterministic PRNG so a plate always looks the same. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cache = new Map<string, Dot[]>();

/** Generates non-overlapping dots inside a circle; dots over the digit use figure colours. */
export function generatePlate(digit: string, palette: PlatePalette, seed: number, size = 400): Dot[] {
  const key = `${digit}|${seed}|${size}|${palette.figure.join()}|${palette.background.join()}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const mask = document.createElement('canvas');
  mask.width = size;
  mask.height = size;
  const mctx = mask.getContext('2d', { willReadFrequently: true })!;
  mctx.fillStyle = '#000';
  mctx.textAlign = 'center';
  mctx.textBaseline = 'middle';
  mctx.font = `900 ${Math.round(size * 0.62)}px Arial, Helvetica, sans-serif`;
  mctx.fillText(digit, size / 2, size / 2 + size * 0.03);
  const data = mctx.getImageData(0, 0, size, size).data;
  const inFigure = (x: number, y: number) => {
    const xi = Math.min(size - 1, Math.max(0, Math.round(x)));
    const yi = Math.min(size - 1, Math.max(0, Math.round(y)));
    return data[(yi * size + xi) * 4 + 3] > 128;
  };

  const rnd = mulberry32(seed);
  const R = size / 2 - 4;
  const c = size / 2;
  const dots: Dot[] = [];
  // Spatial hash for fast overlap checks.
  const cell = 16;
  const grid = new Map<string, Dot[]>();
  const keyOf = (x: number, y: number) => `${Math.floor(x / cell)},${Math.floor(y / cell)}`;

  const radii = [9.5, 8, 6.8, 5.6, 4.6, 3.6, 2.8];
  for (const target of radii) {
    const attempts = target > 6 ? 2600 : 4200;
    for (let i = 0; i < attempts; i++) {
      const r = target * (0.85 + rnd() * 0.3);
      const ang = rnd() * Math.PI * 2;
      const dist = Math.sqrt(rnd()) * (R - r);
      const x = c + Math.cos(ang) * dist;
      const y = c + Math.sin(ang) * dist;
      let ok = true;
      const gx = Math.floor(x / cell);
      const gy = Math.floor(y / cell);
      for (let dx = -1; dx <= 1 && ok; dx++) {
        for (let dy = -1; dy <= 1 && ok; dy++) {
          const bucket = grid.get(`${gx + dx},${gy + dy}`);
          if (!bucket) continue;
          for (const d of bucket) {
            if (Math.hypot(d.x - x, d.y - y) < d.r + r + 1.2) {
              ok = false;
              break;
            }
          }
        }
      }
      if (!ok) continue;
      const fig = inFigure(x, y);
      const pal = fig ? palette.figure : palette.background;
      const dot = { x, y, r, color: pal[Math.floor(rnd() * pal.length)] };
      dots.push(dot);
      const k = keyOf(x, y);
      const b = grid.get(k);
      if (b) b.push(dot);
      else grid.set(k, [dot]);
    }
  }
  cache.set(key, dots);
  return dots;
}

export function drawPlate(canvas: HTMLCanvasElement, dots: Dot[], size = 400) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#f6f1e7';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  for (const d of dots) {
    ctx.beginPath();
    ctx.fillStyle = d.color;
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  }
}
