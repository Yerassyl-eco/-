import { GesturePrompt } from '../components/Cue/GesturePrompt';
import { THEMES } from '../data/themes';
import type { AnyTest } from '../tests';

/** End of the tests: a single question before the results. */
export function CompletePage({ tests, onNext }: { tests: AnyTest[]; onNext: () => void }) {
  return (
    <div className="flex h-full min-h-0 items-center justify-center">
      <section className="animate-card-in w-full max-w-[760px] text-center" aria-labelledby="done-title">
        <div className="mx-auto flex w-fit gap-2" aria-hidden>
          {tests.map((t) => (
            <span key={t.id} className="h-2.5 w-12 rounded-full" style={{ background: THEMES[t.id].base }} />
          ))}
        </div>
        <h1 id="done-title" className="mt-[clamp(20px,4vh,40px)] text-[clamp(40px,7vh,72px)] leading-[1.04] text-ink">
          Скрининг завершён
        </h1>
        <p className="mx-auto mt-4 max-w-[30ch] text-[clamp(20px,2.8vh,26px)] leading-snug text-ink/80">Хотите увидеть свои результаты?</p>
        <div className="mt-[clamp(24px,5vh,48px)] flex justify-center">
          <GesturePrompt gesture="THUMBS_UP" action="чтобы увидеть результаты" onTrigger={onNext} />
        </div>
      </section>
    </div>
  );
}
