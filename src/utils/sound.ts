/** Tiny WebAudio sound effects. The app works fully without sound. */
type SoundName = 'detect' | 'confirm' | 'complete' | 'error';

let ctx: AudioContext | null = null;
let enabled = readEnabled();

function readEnabled() {
  try {
    return localStorage.getItem('vm:sound') !== 'off';
  } catch {
    return true;
  }
}

export function isSoundEnabled() {
  return enabled;
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem('vm:sound', on ? 'on' : 'off');
  } catch {
    /* ignore */
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.07) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + dur + 0.02);
}

export function playSound(name: SoundName) {
  if (!enabled) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    switch (name) {
      case 'detect':
        tone(880, 0, 0.12);
        break;
      case 'confirm':
        tone(660, 0, 0.12);
        tone(990, 0.09, 0.18);
        break;
      case 'complete':
        tone(523, 0, 0.16);
        tone(659, 0.12, 0.16);
        tone(784, 0.24, 0.28);
        break;
      case 'error':
        tone(220, 0, 0.2, 'triangle', 0.05);
        break;
    }
  } catch {
    /* audio is optional */
  }
}
