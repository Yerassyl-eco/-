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

  it('reads a V sign as two raised fingers (option 2)', () => {
    const c = classify('victory');
    expect(c.gesture).toBe('TWO');
    expect(c.confidence).toBeGreaterThan(0.5);
  });

  it('does not mistake real poses for the OK sign', () => {
    for (const name of ['thumb_up', 'fist', 'victory', 'pointing_up']) {
      expect(classify(name).gesture).not.toBe('OK');
    }
    expect(classify('right_hands', 0, 0).gesture).not.toBe('OK');
  });

  it('recognises an open palm', () => {
    expect(classify('right_hands', 0, 0).gesture).toBe('OPEN_PALM');
    expect(classify('left_hands', 0, 1).gesture).toBe('OPEN_PALM');
  });
});

describe('OK sign and finger counting (built from a real open palm)', () => {
  const palm = fx.right_hands.hands[0].landmarks;
  const aspect = fx.right_hands.aspect;
  const lerp = (a: Landmark, b: Landmark, t: number): Landmark => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t });

  /** Curl a finger: move pip→tip onto the line from its knuckle toward the wrist. */
  function curl(lms: Landmark[], [mcp, pip, dip, tip]: number[]) {
    const out = lms.map((p) => ({ ...p }));
    const w = lms[0];
    out[pip] = lerp(lms[mcp], w, -0.05);
    out[dip] = lerp(lms[mcp], w, 0.15);
    out[tip] = lerp(lms[mcp], w, 0.3);
    return out;
  }

  it('recognises 👌 when the index tip meets the thumb tip', () => {
    const lms = palm.map((p) => ({ ...p }));
    const thumbTip = lms[4];
    lms[8] = { ...thumbTip };
    lms[7] = lerp(lms[6], thumbTip, 0.6);
    lms[6] = lerp(lms[5], lms[6], 0.8);
    expect(classifyHand(lms, aspect).gesture).toBe('OK');
  });

  it('counts two and three raised fingers', () => {
    const two = curl(curl(palm, [13, 14, 15, 16]), [17, 18, 19, 20]);
    expect(classifyHand(two, aspect).gesture).toBe('TWO');
    const three = curl(palm, [17, 18, 19, 20]);
    expect(classifyHand(three, aspect).gesture).toBe('THREE');
  });
});

describe('finger counting on real photos (one to five fingers)', () => {
  it('reads 1, 2, 3, 4 raised fingers and tells four from an open palm', () => {
    expect(classify('count_1').gesture).toBe('POINT_UP');
    expect(classify('count_2').gesture).toBe('TWO');
    expect(classify('count_3').gesture).toBe('THREE');
    expect(classify('count_4').gesture).toBe('FOUR');
    expect(classify('count_5').gesture).toBe('OPEN_PALM');
  });
});
