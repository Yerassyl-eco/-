import type { TestSummary } from '../tests/types';

const KEY = 'vision-motion:v1';

export interface StoredScreening {
  id: string;
  startedAt: number;
  finishedAt: number | null;
  durationMs: number | null;
  completedTests: number;
  results: (TestSummary | null)[];
  /** Tests whose answers differ from the expected screening result. */
  attentionCount: number;
}

interface StoreShape {
  current: StoredScreening | null;
  history: StoredScreening[];
}

function read(): StoreShape {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as StoreShape;
  } catch {
    /* ignore corrupted / unavailable storage */
  }
  return { current: null, history: [] };
}

function write(s: StoreShape) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage may be unavailable (private mode) — the app keeps working */
  }
}

/** Save progress after every finished test (wall-clock timestamps). */
export function saveProgress(startedAtWall: number, results: (TestSummary | null)[], finished: boolean) {
  const store = read();
  const completedTests = results.filter(Boolean).length;
  const entry: StoredScreening = {
    id: String(startedAtWall),
    startedAt: startedAtWall,
    finishedAt: finished ? Date.now() : null,
    durationMs: finished ? Date.now() - startedAtWall : null,
    completedTests,
    results,
    attentionCount: results.filter((r) => r?.attention).length,
  };
  store.current = entry;
  if (finished) store.history = [entry, ...store.history.filter((h) => h.id !== entry.id)].slice(0, 10);
  write(store);
}

export function lastCompleted(): StoredScreening | null {
  return read().history[0] ?? null;
}

export function clearStorage() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
