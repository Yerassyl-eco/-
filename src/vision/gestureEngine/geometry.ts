import type { Landmark } from '../types';

/** Point in "user space": mirrored horizontally (so it matches what the user
 * sees on screen), aspect-corrected, in units of frame height. */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** MediaPipe hand landmark indices. */
export const LM = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
} as const;

/** [mcp, pip, dip, tip] of the four long fingers. */
export const FINGERS = {
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
} as const;

export type FingerName = keyof typeof FINGERS;

/** Skeleton connections used for drawing. */
export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

export function toUserSpace(lms: Landmark[], aspect: number): Vec3[] {
  return lms.map((l) => ({ x: (1 - l.x) * aspect, y: l.y, z: l.z * aspect }));
}

export const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
export const len3 = (v: Vec3) => Math.hypot(v.x, v.y, v.z);
export const len2 = (v: Vec3) => Math.hypot(v.x, v.y);
export const dist3 = (a: Vec3, b: Vec3) => len3(sub(a, b));
export const dist2 = (a: Vec3, b: Vec3) => Math.hypot(a.x - b.x, a.y - b.y);

export function cos3(a: Vec3, b: Vec3): number {
  const la = len3(a);
  const lb = len3(b);
  if (la < 1e-9 || lb < 1e-9) return 0;
  return (a.x * b.x + a.y * b.y + a.z * b.z) / (la * lb);
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Hermite smoothstep between edge0 and edge1 (edge0 may be > edge1). */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Size of the palm (wrist → middle-finger knuckle, and knuckle width). */
export function palmScale(p: Vec3[]): number {
  return Math.max(dist3(p[LM.WRIST], p[LM.MIDDLE_MCP]), dist3(p[LM.INDEX_MCP], p[LM.PINKY_MCP]) * 1.15);
}

/** 2D bounding box of landmarks (normalised, non-mirrored). */
export function bbox(lms: Landmark[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const l of lms) {
    if (l.x < minX) minX = l.x;
    if (l.y < minY) minY = l.y;
    if (l.x > maxX) maxX = l.x;
    if (l.y > maxY) maxY = l.y;
  }
  return { minX, minY, maxX, maxY };
}
