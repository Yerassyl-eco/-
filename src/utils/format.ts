export function formatDuration(ms: number | null | undefined) {
  if (!ms || ms < 0) return '—';
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m ? `${m} мин ${r.toString().padStart(2, '0')} с` : `${r} с`;
}

export function formatDate(ts: number) {
  return new Date(ts).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}
