import { BingoCard as BingoCardType } from '../types';
import { BingoSquare } from './BingoSquare';

interface Props {
  card: BingoCardType;
  winningSquares: Set<string>;
  onSquareClick: (squareId: string) => void;
}

export function BingoCard({ card, winningSquares, onSquareClick }: Props) {
  return (
    <div className="grid grid-cols-5 gap-1 sm:gap-2 max-w-md mx-auto">
      {card.squares.flat().map(square => (
        <BingoSquare
          key={square.id}
          square={square}
          isWinningSquare={winningSquares.has(square.id)}
          onClick={() => onSquareClick(square.id)}
        />
      ))}
    </div>
  );
}
