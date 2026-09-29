import { isSoundEnabled } from './sound';

/**
 * Spoken instructions (Web Speech API, Russian voice). Older users hear which
 * gesture to show next. Silent when sound is off or the browser has no voice;
 * browsers may also stay silent until the page has had one user interaction.
 */
let voice: SpeechSynthesisVoice | null = null;
let lastText = '';
let lastAt = 0;

function pickVoice() {
  const all = window.speechSynthesis?.getVoices() ?? [];
  voice = all.find((v) => v.lang === 'ru-RU' && /milena|google/i.test(v.name)) ?? all.find((v) => v.lang.startsWith('ru')) ?? null;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice();
  window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export function speak(text: string, { force = false } = {}) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (!isSoundEnabled()) return;
  const now = Date.now();
  if (!force && text === lastText && now - lastAt < 8000) return;
  lastText = text;
  lastAt = now;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ru-RU';
    if (voice) u.voice = voice;
    u.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* speech is optional */
  }
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}
