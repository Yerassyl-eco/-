import type { Phase } from '../state/testMachine';
import type { Gesture } from '../vision/types';

export interface PromptItem {
  gesture: Gesture;
  label: string;
}

/** Which gestures are meaningful in each phase (for on-screen hints & fallback buttons). */
export const PHASE_PROMPTS: Partial<Record<Phase, PromptItem[]>> = {
  LANDING: [{ gesture: 'THUMBS_UP', label: 'Начать' }],
  CAMERA_SETUP: [{ gesture: 'THUMBS_UP', label: 'Продолжить' }],
  PREPARATION: [
    { gesture: 'THUMBS_UP', label: 'Начать тестирование' },
    { gesture: 'OPEN_PALM', label: 'Повторить инструкцию' },
  ],
  TEST_INTRO: [
    { gesture: 'THUMBS_UP', label: 'Начать тест' },
    { gesture: 'OPEN_PALM', label: 'Повторить инструкцию' },
  ],
  TEST_RESULT: [{ gesture: 'THUMBS_UP', label: 'Следующий шаг' }],
  FINAL_RESULT: [{ gesture: 'OPEN_PALM', label: 'Пройти ещё раз' }],
};

export const SCREENING_STEPS = ['Подготовка', '01', '02', '03', '04', '05'];
