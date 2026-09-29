import { TriangleAlert } from 'lucide-react';
import { GesturePrompt } from '../components/Cue/GesturePrompt';
import { GestureIcon } from '../components/GestureIcon/GestureIcon';
import { StatusToken } from '../components/Report/ReportRow';
import { PROFILE_QUESTIONS, profileLabel, type Profile } from '../data/profile';
import { THEMES } from '../data/themes';
import type { AnyTest } from '../tests';
import type { TestSummary } from '../tests/types';
import { formatDate, formatDuration } from '../utils/format';

interface Props {
  tests: AnyTest[];
  results: (TestSummary | null)[];
  profile: Profile;
  durationMs: number | null;
  sessionCode: string;
  finishedAt: number;
  onRestart: () => void;
  onBack: () => void;
}

const PROFILE_SHORT: Record<string, string> = { age: 'Возраст', glasses: 'Очки / линзы', visit: 'Последний осмотр' };

/** The closing report: everything on one screen, no scrolling. */
export function FinalResultPage({ tests, results, profile, durationMs, sessionCode, finishedAt, onRestart, onBack }: Props) {
  const done = results.filter(Boolean).length;
  const attention = results.some((r) => r?.attention);
  return (
    <article className="animate-enter grid h-full min-h-0 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" aria-labelledby="report-title">
      <div className="flex min-h-0 flex-col">
        <h1 id="report-title" className="text-[clamp(30px,4.6vh,48px)] leading-[1.05] text-ink">
          Итог скрининга
        </h1>
        <p className="num mt-2 text-[14px] text-graphite">
          {String(done).padStart(2, '0')} / 05 тестов · {formatDuration(durationMs)} · {formatDate(finishedAt)} · {sessionCode}
        </p>

        <table className="mt-[clamp(10px,2.4vh,24px)] w-full border-collapse text-left">
          <caption className="sr-only">Результаты по тестам</caption>
          <thead className="sr-only">
            <tr>
              <th>№</th>
              <th>Тест</th>
              <th>Результат</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t, i) => {
              const r = results[i];
              return (
                <tr key={t.id} className="border-b border-rule">
                  <td className="w-12 py-[clamp(4px,1vh,12px)]">
                    <span className="num flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium" style={{ background: THEMES[t.id].base, color: THEMES[t.id].on }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="py-[clamp(4px,1vh,12px)] pr-4">
                    <span className="block text-[clamp(16px,2.3vh,20px)] font-medium leading-tight text-ink">{t.title}</span>
                    <span className="block text-[14px] text-graphite">{r?.short ?? 'Не пройден'}</span>
                  </td>
                  <td className="py-[clamp(4px,1vh,12px)] text-right">{r ? <StatusToken attention={r.attention} /> : null}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {attention && (
          <p className="mt-[clamp(10px,2vh,20px)] flex gap-2 text-[15px] leading-snug text-ink">
            <TriangleAlert size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-amber" aria-hidden />
            Некоторые ответы отличаются от ожидаемых. Если вы замечаете проблемы со зрением или результат повторяется, обратитесь к офтальмологу.
          </p>
        )}
        <div className="mt-auto flex flex-col items-start gap-2 pt-3">
          <GesturePrompt gesture="THUMBS_UP" action="чтобы пройти скрининг заново" size="md" onTrigger={onRestart} />
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-[16px] text-graphite hover:text-ink">
            <GestureIcon gesture="POINT_LEFT" size={22} strokeWidth={1.7} className="text-accent" /> Укажите влево, чтобы вернуться к карте зрения
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-col gap-4">
        <section className="bg-accent p-[clamp(18px,3vh,28px)]" style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)' }} aria-labelledby="profile-title">
          <h2 id="profile-title" className="text-[20px]">
            О вас
          </h2>
          <dl className="mt-3 grid gap-2">
            {PROFILE_QUESTIONS.map((q) => (
              <div key={q.key} className="flex items-baseline justify-between gap-4 border-t pt-2" style={{ borderColor: 'color-mix(in srgb, var(--accent-on) 25%, transparent)' }}>
                <dt className="text-[14px] opacity-85">{PROFILE_SHORT[q.key]}</dt>
                <dd className="text-right text-[15px] font-medium">{profileLabel(q.key, profile) ?? '—'}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="bg-field p-[clamp(18px,3vh,28px)]" style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)' }} aria-labelledby="important">
          <h2 id="important" className="text-[20px] text-ink">
            Важно
          </h2>
          <p className="mt-2 text-[clamp(14px,1.9vh,16px)] leading-[1.5] text-ink">
            Это предварительный скрининг, а не медицинский диагноз. Он не заменяет осмотр у офтальмолога.
          </p>
          <p className="mt-2 text-[clamp(14px,1.9vh,16px)] leading-[1.5] text-graphite">
            При боли, вспышках, «плавающих» точках или резком ухудшении зрения сразу обратитесь к врачу.
          </p>
          <p className="mt-3 text-[13px] text-graphite">Результаты сохранены только в этом браузере.</p>
        </section>

      </div>
    </article>
  );
}
