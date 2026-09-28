import { describe, expect, it } from 'vitest';
import fixtures from './__fixtures__/hands.json';
import { GestureEngine } from './GestureEngine';
import type { Gesture, HandObservation, Landmark } from '../types';

type Fixture = { aspect: number; hands: HandObservation[] };
const fx = fixtures as Record<string, Fixture>;

const hand = (name: string, i = 0) => fx[name].hands[i];
const aspect = (name: string) => fx[name].aspect;

/** Feed `ms` of frames at 30 fps. */
function feed(engine: GestureEngine, t0: number, ms: number, hands: HandObservation[], a: number) {
  let t = t0;
  for (; t < t0 + ms; t += 33) engine.process({ t, aspect: a, hands });
  return t;
}

function setup() {
  const engine = new GestureEngine();
  const commits: Gesture[] = [];
  engine.onCommit((g) => commits.push(g));
  return { engine, commits };
}

describe('GestureEngine', () => {
  it('commits a gesture only after it is held', () => {
    const { engine, commits } = setup();
    let t = feed(engine, 1000, 300, [hand('thumb_up')], aspect('thumb_up'));
    expect(commits).toEqual([]);
    t = feed(engine, t, 700, [hand('thumb_up')], aspect('thumb_up'));
    expect(commits).toEqual(['THUMBS_UP']);
    expect(engine.getSnapshot().stable).toBe(true);
  });

  it('does not re-fire while the same gesture keeps being held', () => {
    const { engine, commits } = setup();
    feed(engine, 1000, 3000, [hand('fist')], aspect('fist'));
    expect(commits).toEqual(['FIST']);
  });

  it('fires again after the hand is released and shown again', () => {
    const { engine, commits } = setup();
    let t = feed(engine, 1000, 1200, [hand('fist')], aspect('fist'));
    t = feed(engine, t, 600, [], 1);
    feed(engine, t, 1200, [hand('fist')], aspect('fist'));
    expect(commits).toEqual(['FIST', 'FIST']);
  });

  it('reports TOO_QUICK when a gesture is dropped mid-hold', () => {
    const { engine, commits } = setup();
    let t = feed(engine, 1000, 380, [hand('thumb_up')], aspect('thumb_up'));
    t = feed(engine, t, 200, [], 1);
    expect(commits).toEqual([]);
    expect(engine.getSnapshot().issue).toBe('TOO_QUICK');
  });

  it('reports MULTIPLE_HANDS and blocks commits', () => {
    const { engine, commits } = setup();
    feed(engine, 1000, 1500, fx.right_hands.hands, aspect('right_hands'));
    expect(commits).toEqual([]);
    expect(engine.getSnapshot().issue).toBe('MULTIPLE_HANDS');
  });

  it('reports a hand partly outside the frame with the side to fix', () => {
    const { engine, commits } = setup();
    const h = hand('fist');
    // shift the hand so it crosses the raw left edge (= the user's right side)
    const minX = Math.min(...h.landmarks.map((l) => l.x));
    const shifted: HandObservation = {
      ...h,
      landmarks: h.landmarks.map((l: Landmark) => ({ ...l, x: l.x - minX - 0.05 })),
    };
    feed(engine, 1000, 1500, [shifted], aspect('fist'));
    expect(commits).toEqual([]);
    expect(engine.getSnapshot().issue).toBe('HAND_OUT_RIGHT');
  });

  it('reports a hand that is too far away', () => {
    const { engine } = setup();
    const h = hand('fist');
    const small: HandObservation = {
      ...h,
      landmarks: h.landmarks.map((l) => ({ x: 0.5 + (l.x - 0.5) * 0.15, y: 0.5 + (l.y - 0.5) * 0.15, z: l.z * 0.15 })),
    };
    feed(engine, 1000, 1500, [small], aspect('fist'));
    expect(engine.getSnapshot().issue).toBe('HAND_TOO_FAR');
  });

  it('reports a hand that is too close', () => {
    const { engine, commits } = setup();
    const h = hand('fist');
    const big: HandObservation = {
      ...h,
      landmarks: h.landmarks.map((l) => ({ x: 0.5 + (l.x - 0.5) * 1.5, y: 0.5 + (l.y - 0.5) * 1.5, z: l.z * 1.5 })),
    };
    feed(engine, 1000, 1500, [big], aspect('fist'));
    expect(commits).toEqual([]);
    expect(engine.getSnapshot().issue).toBe('HAND_TOO_CLOSE');
  });

  it('explains a V sign instead of saying "not recognised"', () => {
    const { engine } = setup();
    feed(engine, 1000, 1500, [hand('victory')], aspect('victory'));
    expect(engine.getSnapshot().issue).toBe('EXTRA_FINGERS');
  });

  it('reports NO_HAND after a while without a hand', () => {
    const { engine } = setup();
    feed(engine, 1000, 1600, [], 1);
    expect(engine.getSnapshot().issue).toBe('NO_HAND');
  });

  it('reports face problems when face checking is on', () => {
    const { engine } = setup();
    engine.options.faceCheck = true;
    let t = 1000;
    for (; t < 3000; t += 33) {
      engine.process({ t, aspect: 4 / 3, hands: [], faces: [{ x: 0.1, y: 0.05, width: 0.8, height: 0.9, score: 0.9 }] });
    }
    expect(engine.getSnapshot().face).toBe('too-close');
    expect(engine.getSnapshot().issue).toBe('FACE_TOO_CLOSE');
    for (; t < 6000; t += 33) engine.process({ t, aspect: 4 / 3, hands: [], faces: [] });
    expect(engine.getSnapshot().issue).toBe('FACE_NOT_VISIBLE');
  });
});
