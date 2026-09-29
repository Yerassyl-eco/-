import type { Gesture } from '../vision/types';

export type ProfileKey = 'age' | 'glasses' | 'visit';

export interface ProfileQuestion {
  key: ProfileKey;
  question: string;
  /** Exactly four options: chosen by raising 1, 2, 3 or 4 fingers. */
  options: [string, string, string, string];
}

/** Short questionnaire answered with the hand: no keyboard, no name. */
export const PROFILE_QUESTIONS: ProfileQuestion[] = [
  { key: 'age', question: 'Сколько вам лет?', options: ['До 18', '18–39', '40–59', '60 и старше'] },
  { key: 'glasses', question: 'Вы носите очки или линзы?', options: ['Нет', 'Очки', 'Контактные линзы', 'И то и другое'] },
  {
    key: 'visit',
    question: 'Когда вы последний раз проверяли зрение у врача?',
    options: ['Меньше года назад', '1–3 года назад', 'Больше 3 лет назад', 'Не помню или никогда'],
  },
];

export type Profile = Partial<Record<ProfileKey, number>>;

/** Raised fingers → option index: ☝️ 1, ✌️ 2, three 3, four 4. */
export const COUNT_GESTURES: Gesture[] = ['POINT_UP', 'TWO', 'THREE', 'FOUR'];

export const profileLabel = (key: ProfileKey, profile: Profile) => {
  const q = PROFILE_QUESTIONS.find((x) => x.key === key)!;
  const i = profile[key];
  return i === undefined ? null : q.options[i];
};
