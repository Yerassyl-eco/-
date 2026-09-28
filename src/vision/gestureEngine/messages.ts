import type { Gesture, GestureOrNone, IssueCode } from '../types';

export interface GestureMeta {
  emoji: string;
  /** Short label shown on the camera (upper-case, like a HUD). */
  label: string;
  /** Russian name for text. */
  name: string;
}

export const GESTURE_META: Record<Gesture, GestureMeta> = {
  THUMBS_UP: { emoji: '👍', label: 'THUMBS UP', name: 'Палец вверх' },
  FIST: { emoji: '✊', label: 'FIST', name: 'Кулак' },
  POINT_LEFT: { emoji: '👈', label: 'LEFT', name: 'Влево' },
  POINT_RIGHT: { emoji: '👉', label: 'RIGHT', name: 'Вправо' },
  POINT_UP: { emoji: '☝️', label: 'UP', name: 'Вверх' },
  POINT_DOWN: { emoji: '👇', label: 'DOWN', name: 'Вниз' },
  OPEN_PALM: { emoji: '✋', label: 'OPEN PALM', name: 'Открытая ладонь' },
};

export function gestureMeta(g: GestureOrNone): GestureMeta | null {
  return g === 'NONE' || g === 'UNKNOWN' ? null : GESTURE_META[g];
}

export type IssueKind = 'hand' | 'pose' | 'face' | 'timing';

/** Instrument category shown above an Error Mode message. */
export type SignalCategory = 'HAND POSITION' | 'DISTANCE' | 'GESTURE' | 'TIMING' | 'FACE POSITION' | 'CAMERA';

export interface IssueMessage {
  kind: IssueKind;
  category: SignalCategory;
  /** What the system sees. */
  title: string;
  /** What exactly to do to fix it. */
  hint: string;
  icon: string;
}

/** Error Mode dictionary: every problem has a concrete correction. */
export const ISSUE_MESSAGES: Record<IssueCode, IssueMessage> = {
  NO_HAND: {
    category: 'HAND POSITION',
    kind: 'hand',
    icon: '✋',
    title: 'Я пока не вижу вашу руку',
    hint: 'Покажите ладонь в камеру на уровне груди, на расстоянии вытянутой руки.',
  },
  MULTIPLE_HANDS: {
    category: 'HAND POSITION',
    kind: 'hand',
    icon: '🤲',
    title: 'В кадре две руки',
    hint: 'Оставьте в кадре только одну руку — вторую опустите.',
  },
  HAND_OUT_LEFT: {
    category: 'HAND POSITION',
    kind: 'hand',
    icon: '↔️',
    title: 'Рука частично выходит за левый край кадра',
    hint: 'Сдвиньте руку немного вправо, чтобы в кадре была вся ладонь.',
  },
  HAND_OUT_RIGHT: {
    category: 'HAND POSITION',
    kind: 'hand',
    icon: '↔️',
    title: 'Рука частично выходит за правый край кадра',
    hint: 'Сдвиньте руку немного влево, чтобы в кадре была вся ладонь.',
  },
  HAND_OUT_TOP: {
    category: 'HAND POSITION',
    kind: 'hand',
    icon: '↕️',
    title: 'Пальцы выходят за верхний край кадра',
    hint: 'Опустите руку немного ниже — покажите всю ладонь в кадре.',
  },
  HAND_OUT_BOTTOM: {
    category: 'HAND POSITION',
    kind: 'hand',
    icon: '↕️',
    title: 'Рука частично ниже кадра',
    hint: 'Поднимите руку немного выше — покажите всю ладонь в кадре.',
  },
  HAND_TOO_FAR: {
    category: 'DISTANCE',
    kind: 'hand',
    icon: '🔍',
    title: 'Рука слишком далеко',
    hint: 'Поднесите руку ближе к камере — ладонь должна быть крупнее.',
  },
  HAND_TOO_CLOSE: {
    category: 'DISTANCE',
    kind: 'hand',
    icon: '📏',
    title: 'Рука слишком близко к камере',
    hint: 'Отодвиньте руку немного назад.',
  },
  LOW_CONFIDENCE: {
    category: 'GESTURE',
    kind: 'pose',
    icon: '🔄',
    title: 'Я плохо различаю пальцы',
    hint: 'Поверните ладонь к камере и проверьте, что рука хорошо освещена.',
  },
  HAND_MOVING: {
    category: 'TIMING',
    kind: 'timing',
    icon: '🫸',
    title: 'Рука двигается слишком быстро',
    hint: 'Держите руку неподвижно около секунды.',
  },
  TOO_QUICK: {
    category: 'TIMING',
    kind: 'timing',
    icon: '⏱️',
    title: 'Жест показан слишком быстро',
    hint: 'Задержите жест на секунду, пока линия под ним не заполнится.',
  },
  FINGERS_UNCLEAR: {
    category: 'GESTURE',
    kind: 'pose',
    icon: '🖐️',
    title: 'Не получается распознать положение пальцев',
    hint: 'Разведите пальцы и держите руку неподвижно, затем покажите нужный жест.',
  },
  FINGER_FORESHORTENED: {
    category: 'GESTURE',
    kind: 'pose',
    icon: '👉',
    title: 'Палец направлен прямо в камеру',
    hint: 'Поверните руку боком: указательный палец должен смотреть вверх, вниз, влево или вправо.',
  },
  DIRECTION_AMBIGUOUS: {
    category: 'GESTURE',
    kind: 'pose',
    icon: '🧭',
    title: 'Направление пальца неоднозначное (по диагонали)',
    hint: 'Покажите направление чётче — строго вверх, вниз, влево или вправо.',
  },
  EXTRA_FINGERS: {
    category: 'GESTURE',
    kind: 'pose',
    icon: '☝️',
    title: 'Вытянуто несколько пальцев',
    hint: 'Для направления оставьте вытянутым только указательный палец, остальные согните.',
  },
  FIST_LOOSE: {
    category: 'GESTURE',
    kind: 'pose',
    icon: '✊',
    title: 'Пальцы согнуты не до конца',
    hint: 'Сожмите кулак плотнее — или, наоборот, выпрямите нужный палец полностью.',
  },
  THUMB_NOT_UP: {
    category: 'GESTURE',
    kind: 'pose',
    icon: '👍',
    title: 'Большой палец смотрит в сторону',
    hint: 'Направьте большой палец строго вверх, остальные пальцы сожмите.',
  },
  FACE_NOT_VISIBLE: {
    category: 'FACE POSITION',
    kind: 'face',
    icon: '🙂',
    title: 'Камера не видит ваше лицо',
    hint: 'Сядьте так, чтобы лицо полностью оказалось в кадре.',
  },
  FACE_TOO_LOW: {
    category: 'FACE POSITION',
    kind: 'face',
    icon: '⬆️',
    title: 'Лицо слишком низко в кадре',
    hint: 'Поднимите голову немного выше или наклоните экран.',
  },
  FACE_TOO_HIGH: {
    category: 'FACE POSITION',
    kind: 'face',
    icon: '⬇️',
    title: 'Лицо у верхнего края кадра',
    hint: 'Опуститесь немного ниже или наклоните камеру вверх.',
  },
  FACE_TOO_CLOSE: {
    category: 'DISTANCE',
    kind: 'face',
    icon: '↩️',
    title: 'Вы слишком близко к экрану',
    hint: 'Отодвиньтесь немного назад. Рекомендуемое расстояние — около 50–70 см, на вытянутую руку.',
  },
  FACE_TOO_FAR: {
    category: 'DISTANCE',
    kind: 'face',
    icon: '↪️',
    title: 'Вы далеко от экрана',
    hint: 'Подойдите немного ближе. Рекомендуемое расстояние — около 50–70 см, на вытянутую руку.',
  },
  FACE_OFF_CENTER: {
    category: 'FACE POSITION',
    kind: 'face',
    icon: '🎯',
    title: 'Лицо у края кадра',
    hint: 'Сядьте по центру экрана и смотрите прямо.',
  },
};
