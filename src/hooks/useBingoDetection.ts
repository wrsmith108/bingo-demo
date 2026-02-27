import { useMemo } from 'react';
import { BingoCard, WinningLine } from '../types';
import { checkForBingo, countFilled } from '../lib/bingoChecker';

interface BingoDetectionResult {
  winningLine: WinningLine | null;
  filledCount: number;
  isWinner: boolean;
}

export function useBingoDetection(card: BingoCard | null): BingoDetectionResult {
  return useMemo(() => {
    if (!card) {
      return { winningLine: null, filledCount: 0, isWinner: false };
    }
    const winningLine = checkForBingo(card);
    return {
      winningLine,
      filledCount: countFilled(card),
      isWinner: winningLine !== null,
    };
  }, [card]);
}
