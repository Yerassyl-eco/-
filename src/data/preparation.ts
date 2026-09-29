/** Preparation instructions, shown one card at a time. */
export const PREPARATION_STEPS: { title: string; text: string; icon: 'distance' | 'light' | 'eye' | 'read' | 'hand' }[] = [
  { icon: 'distance', title: 'Расстояние', text: 'Сядьте на расстоянии вытянутой руки от экрана — примерно 50–70 см.' },
  { icon: 'light', title: 'Свет', text: 'Лицо должно быть хорошо освещено и целиком видно в камере.' },
  { icon: 'eye', title: 'Взгляд', text: 'Смотрите прямо на экран. Если носите очки для дали — оставайтесь в них.' },
  { icon: 'read', title: 'Инструкции', text: 'Перед каждым тестом появятся карточки с инструкцией — прочитайте их.' },
  { icon: 'hand', title: 'Ответы', text: 'Указательный палец выбирает ответ, кулак подтверждает, ладонь отменяет.' },
];
