import { BingoCard, WinningLine } from '../types';

/**
 * Check all possible winning lines
 * Returns the first winning line found, or null
 */
export function checkForBingo(card: BingoCard): WinningLine | null {
  const { squares } = card;

  // Check rows (5 possible)
  for (let row = 0; row < 5; row++) {
    if (squares[row].every(sq => sq.isFilled)) {
      return {
        type: 'row',
        index: row,
        squares: squares[row].map(sq => sq.id),
      };
    }
  }

  // Check columns (5 possible)
  for (let col = 0; col < 5; col++) {
    const columnFilled = squares.every(row => row[col].isFilled);
    if (columnFilled) {
      return {
        type: 'column',
        index: col,
        squares: squares.map(row => row[col].id),
      };
    }
  }

  // Check diagonal (top-left to bottom-right)
  const diagonal1Filled = [0, 1, 2, 3, 4].every(i => squares[i][i].isFilled);
  if (diagonal1Filled) {
    return {
      type: 'diagonal',
      index: 0,
      squares: [0, 1, 2, 3, 4].map(i => `${i}-${i}`),
    };
  }

  // Check diagonal (top-right to bottom-left)
  const diagonal2Filled = [0, 1, 2, 3, 4].every(i => squares[i][4 - i].isFilled);
  if (diagonal2Filled) {
    return {
      type: 'diagonal',
      index: 1,
      squares: [0, 1, 2, 3, 4].map(i => `${i}-${4 - i}`),
    };
  }

  return null;
}

/**
 * Count filled squares
 */
export function countFilled(card: BingoCard): number {
  return card.squares.flat().filter(sq => sq.isFilled).length;
}

/**
 * Check how close to bingo (for UI hints)
 */
export function getClosestToWin(card: BingoCard): { needed: number; line: string } | null {
  const { squares } = card;
  let closest = { needed: 5, line: '' };

  const lines = [
    // Rows
    ...squares.map((row, i) => ({
      squares: row,
      name: `Row ${i + 1}`,
    })),
    // Columns
    ...[0, 1, 2, 3, 4].map(col => ({
      squares: squares.map(row => row[col]),
      name: `Column ${col + 1}`,
    })),
    // Diagonals
    {
      squares: [0, 1, 2, 3, 4].map(i => squares[i][i]),
      name: 'Diagonal \u2198',
    },
    {
      squares: [0, 1, 2, 3, 4].map(i => squares[i][4 - i]),
      name: 'Diagonal \u2199',
    },
  ];

  for (const line of lines) {
    const filled = line.squares.filter(sq => sq.isFilled).length;
    const needed = 5 - filled;
    if (needed < closest.needed && needed > 0) {
      closest = { needed, line: line.name };
    }
  }

  return closest.needed < 5 ? closest : null;
}
