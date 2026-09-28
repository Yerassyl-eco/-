import { ISSUE_MESSAGES } from '../../vision/gestureEngine/messages';
import type { IssueCode } from '../../vision/types';

export interface Flash {
  id: number;
  kind: 'ok' | 'hint';
  text: string;
}

/**
 * Error Mode banner. Explains *what* is wrong and *how* to fix it, and
 * confirms with a green check once the gesture is recognised.
 */
export function ErrorMessage({ issue, flash, compact = false }: { issue: IssueCode | null; flash: Flash | null; compact?: boolean }) {
  let content: { tone: 'ok' | 'warn' | 'info'; icon: string; title: string; hint?: string; key: string } | null = null;

  if (flash?.kind === 'ok') {
    content = { tone: 'ok', icon: '✓', title: flash.text, key: `f${flash.id}` };
  } else if (flash?.kind === 'hint') {
    content = { tone: 'warn', icon: '⚠️', title: 'Этот жест сейчас не подходит', hint: flash.text, key: `f${flash.id}` };
  } else if (issue) {
    const m = ISSUE_MESSAGES[issue];
    content = {
      tone: issue === 'NO_HAND' ? 'info' : 'warn',
      icon: issue === 'NO_HAND' ? m.icon : '⚠️',
      title: m.title,
      hint: m.hint,
      key: issue,
    };
  }

  const styles = {
    ok: 'border-success-500/30 bg-success-50 text-success-700',
    warn: 'border-warning-500/35 bg-warning-50 text-warning-700',
    info: 'border-accent-200 bg-accent-50 text-accent-700',
  };

  return (
    <div className={compact ? 'min-h-0' : 'lg:min-h-[76px]'} role="status" aria-live="polite" aria-atomic="true">
      {content && (
        <div
          key={content.key}
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${styles[content.tone]} ${content.tone === 'warn' ? 'animate-shake' : 'animate-rise'}`}
        >
          <span
            className={`emoji mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-black ${content.tone === 'ok' ? 'bg-success-500 text-white' : 'bg-white/80'}`}
            aria-hidden
          >
            {content.icon}
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-bold leading-snug text-slate-900">{content.title}</p>
            {content.hint && <p className="mt-0.5 text-sm font-medium leading-snug text-slate-700">{content.hint}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
