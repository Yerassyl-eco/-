import { DECK_ICONS, InstructionDeck } from '../components/Deck/InstructionDeck';
import { PREPARATION_STEPS } from '../data/preparation';

interface Props {
  cardIndex: number;
  onIndex: (i: number) => void;
  onBegin: () => void;
  onReplay: () => void;
}

export function PreparationPage({ cardIndex, onIndex, onBegin, onReplay }: Props) {
  return (
    <InstructionDeck
      kicker="Калибровка · 5 условий точного скрининга"
      title="Подготовка"
      cards={PREPARATION_STEPS.map((s) => ({ title: s.title, text: s.text, icon: DECK_ICONS[s.icon] }))}
      index={cardIndex}
      onIndex={onIndex}
      startLabel="Готов — начать тестирование"
      onStart={onBegin}
      onReplay={onReplay}
    />
  );
}
