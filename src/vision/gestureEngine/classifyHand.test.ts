import { describe, expect, it } from 'vitest';
import fixtures from './__fixtures__/hands.json';
import { classifyHand } from './classifyHand';
import type { Landmark } from '../types';

/**
 * Fixtures are real MediaPipe landmarks extracted from MediaPipe's public test
 * photos. Rotating the landmarks simulates rotating the hand in front of the
 * camera, which lets us check all four pointing directions.
 */
type Fixture = { aspect: number; hands: { landmarks: Landmark[]; score: number }[] };
const fx = fixtures as Record<string, Fixture>;

function rotate(lms: Landmark[], aspect: number, deg: number) {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const newAspect = deg % 180 === 0 ? aspect : 1 / aspect;
  const H = deg % 180 === 0 ? 1 : aspect;
  const out = lms.map((p) => {
    const x = (p.x - 0.5) * aspect;
    const y = p.y - 0.5;
    const rx = x * c - y * s;
    const ry = x * s + y * c;
    return { x: rx / (newAspect * H) + 0.5, y: ry / H + 0.5, z: (p.z * aspect) / (newAspect * H) };
  });
  return { lms: out, aspect: newAspect };
}

function classify(name: string, deg = 0, hand = 0) {
  const f = fx[name];
  const { lms, aspect } = rotate(f.hands[hand].landmarks, f.aspect, deg);
  return classifyHand(lms, aspect);
}

describe('classifyHand (real MediaPipe landmarks)', () => {
  it('recognises thumbs up', () => {
    const c = classify('thumb_up');
    expect(c.gesture).toBe('THUMBS_UP');
    expect(c.confidence).toBeGreaterThan(0.8);
  });

  it('explains a sideways thumb instead of silently failing', () => {
    expect(classify('thumb_up', 90).hint).toBe('THUMB_NOT_UP');
    expect(classify('thumb_up', 180).gesture).not.toBe('THUMBS_UP');
  });

  it('recognises a fist in any orientation', () => {
    for (const d of [0, 90, 180, 270]) expect(classify('fist', d).gesture).toBe('FIST');
  });

  it('recognises all four pointing directions (mirrored user space)', () => {
    expect(classify('pointing_up', 0).gesture).toBe('POINT_UP');
    expect(classify('pointing_up', 180).gesture).toBe('POINT_DOWN');
    // image rotated clockwise → finger points to image-right → user's left (mirror)
    expect(classify('pointing_up', 90).gesture).toBe('POINT_LEFT');
    expect(classify('pointing_up', 270).gesture).toBe('POINT_RIGHT');
    expect(classify('pointing_up_rotated', 0).gesture).toBe('POINT_LEFT');
    expect(classify('pointing_up_rotated', 180).gesture).toBe('POINT_RIGHT');
  });

  it('flags a diagonal point as ambiguous', () => {
    const c = classify('pointing_up', 45);
    expect(c.gesture).toBe('UNKNOWN');
    expect(c.hint).toBe('DIRECTION_AMBIGUOUS');
  });

  it('asks to keep only the index finger for a V sign', () => {
    const c = classify('victory');
    expect(c.gesture).toBe('UNKNOWN');
    expect(c.hint).toBe('EXTRA_FINGERS');
  });

  it('recognises an open palm', () => {
    expect(classify('right_hands', 0, 0).gesture).toBe('OPEN_PALM');
    expect(classify('left_hands', 0, 1).gesture).toBe('OPEN_PALM');
  });
});
