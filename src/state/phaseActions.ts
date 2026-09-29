import { PROFILE_QUESTIONS } from '../data/profile';
import type { AnyTest } from '../tests';
import type { Gesture } from '../vision/types';
import type { MachineState } from './testMachine';

export interface PhaseAction {
  gesture: Gesture;
  label: string;
  primary?: boolean;
  disabled?: boolean;
}

export interface PhaseGuide {
  /** One line: what to do right now. */
  hint: string;
  actions: PhaseAction[];
  /** Extra non-clickable gestures shown as a group (answer directions, finger counts). */
  choose?: { gestures: Gesture[]; label: string };
}

/**
 * What the user can do on the current screen. Rendered in the always-visible
 * action bar, so the next gesture is never below the fold.
 */
export function phaseGuide(tests: AnyTest[], s: MachineState): PhaseGuide {
  const test = tests[s.testIndex];
  switch (s.phase) {
    case 'CAMERA_SETUP':
      return { hint: 'Когда рука и лицо в кадре, покажите палец вверх.', actions: [{ gesture: 'THUMBS_UP', label: 'Продолжить', primary: true }] };
    case 'PROFILE': {
      const q = PROFILE_QUESTIONS[s.cardIndex];
      const chosen = s.selected !== null;
      return {
        hint: chosen ? `Выбрано: ${q.options[Number(s.selected)]}. Покажите кулак, чтобы подтвердить.` : `${q.question} Покажите столько пальцев, какой номер у ответа.`,
        choose: { gestures: ['POINT_UP', 'TWO', 'THREE', 'FOUR'], label: 'Выбрать' },
        actions: [
          { gesture: 'FIST', label: 'Подтвердить', primary: true, disabled: !chosen },
          ...(s.cardIndex > 0 ? [{ gesture: 'POINT_LEFT' as Gesture, label: 'Назад' }] : []),
        ],
      };
    }
    case 'PREPARATION':
    case 'TEST_INTRO':
      return {
        hint: s.phase === 'PREPARATION' ? 'Прочитайте карточки. Покажите палец вверх, чтобы начать тесты.' : `${test.title}. Прочитайте инструкцию и покажите палец вверх, чтобы начать тест.`,
        actions: [
          { gesture: 'THUMBS_UP', label: s.phase === 'PREPARATION' ? 'Начать тесты' : 'Начать тест', primary: true },
          { gesture: 'POINT_RIGHT', label: 'Далее' },
          { gesture: 'POINT_LEFT', label: 'Назад' },
        ],
      };
    case 'TEST_ACTIVE':
    case 'ANSWER_SELECTED':
    case 'ANSWER_CONFIRMED': {
      const trial = s.trials[s.testIndex]?.[s.trialIndex];
      const opts = trial !== undefined ? test.options(trial) : [];
      const chosen = s.phase === 'ANSWER_SELECTED';
      return {
        hint:
          s.phase === 'ANSWER_CONFIRMED'
            ? 'Ответ принят.'
            : chosen
              ? 'Покажите кулак, чтобы подтвердить ответ. Ладонь — отменить.'
              : 'Укажите пальцем на ответ, затем покажите кулак.',
        choose: { gestures: opts.map((o) => o.gesture), label: 'Ответ' },
        actions: [
          { gesture: 'FIST', label: 'Подтвердить', primary: true, disabled: !chosen },
          { gesture: 'OPEN_PALM', label: 'Отменить', disabled: !chosen },
        ],
      };
    }
    case 'TEST_RESULT': {
      const last = s.testIndex >= tests.length - 1;
      return {
        hint: last ? 'Все пять тестов пройдены. Покажите палец вверх.' : 'Готовы к следующему тесту? Покажите палец вверх.',
        actions: [{ gesture: 'THUMBS_UP', label: last ? 'Завершить скрининг' : 'Следующий тест', primary: true }],
      };
    }
    case 'COMPLETE':
      return { hint: 'Скрининг завершён. Хотите увидеть результаты? Покажите палец вверх.', actions: [{ gesture: 'THUMBS_UP', label: 'Смотреть результаты', primary: true }] };
    case 'DETAILS': {
      const last = s.cardIndex >= tests.length - 1;
      return {
        hint: 'Покажите знак «ОК», чтобы перейти дальше. Укажите влево, чтобы вернуться.',
        actions: [
          { gesture: 'OK', label: last ? 'К карте зрения' : 'Дальше', primary: true },
          { gesture: 'POINT_LEFT', label: 'Назад', disabled: s.cardIndex === 0 },
        ],
      };
    }
    case 'VISION_MAP':
      return {
        hint: 'Это карта зрения. Покажите знак «ОК», чтобы открыть итог.',
        actions: [
          { gesture: 'OK', label: 'К итогу', primary: true },
          { gesture: 'POINT_LEFT', label: 'Назад' },
        ],
      };
    case 'FINAL_RESULT':
      return {
        hint: 'Скрининг завершён. Чтобы пройти его заново, покажите «палец вверх».',
        actions: [
          { gesture: 'THUMBS_UP', label: 'Пройти заново', primary: true },
          { gesture: 'POINT_LEFT', label: 'Назад' },
        ],
      };
    default:
      return { hint: '', actions: [] };
  }
}

/** Sentence spoken aloud when a screen opens (null = stay quiet). */
export function spokenGuide(tests: AnyTest[], s: MachineState): string | null {
  const test = tests[s.testIndex];
  if (s.phase === 'LANDING') return 'Здравствуйте! Покажите палец вверх, чтобы начать проверку зрения.';
  if (s.phase === 'TEST_ACTIVE') {
    if (s.trialIndex !== 0) return null;
    const trial = s.trials[s.testIndex]?.[0];
    return trial !== undefined ? `${test.prompt(trial)} Укажите пальцем на ответ, затем покажите кулак.` : null;
  }
  if (s.phase === 'ANSWER_CONFIRMED' || (s.phase === 'ANSWER_SELECTED' && s.trialIndex > 0)) return null;
  return phaseGuide(tests, s).hint || null;
}
