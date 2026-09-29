import { ClipboardList, Eye, Glasses, Hand, HandFist, ScanEye, type LucideIcon } from 'lucide-react';
import { InstructionDeck } from '../components/Deck/InstructionDeck';
import type { AnyTest } from '../tests';

interface Props {
  test: AnyTest;
  cardIndex: number;
  onIndex: (i: number) => void;
}

/** Pick an icon for an instruction line from its wording. */
function iconFor(line: string, i: number): LucideIcon {
  const l = line.toLowerCase();
  if (l.includes('кулак')) return HandFist;
  if (l.includes('очк')) return Glasses;
  if (l.includes('укаж') || l.includes('жест') || l.includes('влево') || l.includes('прикройте')) return Hand;
  if (l.includes('смотрите') || l.includes('центр') || l.includes('точк')) return Eye;
  return i === 0 ? ScanEye : ClipboardList;
}

export function TestIntroPage({ test, cardIndex, onIndex }: Props) {
  const cards = [
    { title: 'Что проверяем', text: test.checks, icon: ScanEye },
    ...test.intro.map((line: string, i: number) => ({ title: `Шаг ${i + 1}`, text: line, icon: iconFor(line, i + 1) })),
  ];
  return (
    <InstructionDeck
      kicker={
        <span>
          <span className="num text-accent">{String(test.number).padStart(2, '0')}/05</span> · {test.titleEn}
        </span>
      }
      title={test.title}
      cards={cards}
      index={cardIndex}
      onIndex={onIndex}
    />
  );
}
