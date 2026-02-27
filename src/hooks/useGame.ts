import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, CategoryId, WinningLine } from '../types';
import { generateCard } from '../lib/cardGenerator';
import { checkForBingo, countFilled } from '../lib/bingoChecker';
import { detectWordsWithAliases } from '../lib/wordDetector';

const STORAGE_KEY = 'meeting-bingo-game';

const INITIAL_STATE: GameState = {
  status: 'idle',
  category: null,
  card: null,
  isListening: false,
  startedAt: null,
  completedAt: null,
  winningLine: null,
  winningWord: null,
  filledCount: 0,
};

function loadPersistedState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.status === 'playing' || parsed.status === 'won') {
      return { ...parsed, isListening: false };
    }
    return null;
  } catch {
    return null;
  }
}

function persistState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}

function clearPersistedState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function useGame() {
  const [game, setGame] = useState<GameState>(() => {
    return loadPersistedState() ?? INITIAL_STATE;
  });

  // Persist on every state change
  useEffect(() => {
    if (game.status === 'playing' || game.status === 'won') {
      persistState(game);
    }
  }, [game]);

  const startGame = useCallback((categoryId: CategoryId) => {
    const card = generateCard(categoryId);
    setGame({
      status: 'playing',
      category: categoryId,
      card,
      isListening: false,
      startedAt: Date.now(),
      completedAt: null,
      winningLine: null,
      winningWord: null,
      filledCount: 1, // Free space
    });
  }, []);

  const fillSquare = useCallback((squareId: string, isAutoFilled = false, detectedWord?: string) => {
    setGame(prev => {
      if (!prev.card || prev.status !== 'playing') return prev;

      const [rowStr, colStr] = squareId.split('-');
      const targetRow = parseInt(rowStr, 10);
      const targetCol = parseInt(colStr, 10);

      const currentSquare = prev.card.squares[targetRow]?.[targetCol];
      if (!currentSquare || currentSquare.isFreeSpace) return prev;

      // Toggle: if already filled manually, unfill it (only for manual clicks)
      if (currentSquare.isFilled && !isAutoFilled) {
        const newSquares = prev.card.squares.map((row, r) =>
          r === targetRow
            ? row.map((sq, c) =>
                c === targetCol
                  ? { ...sq, isFilled: false, isAutoFilled: false, filledAt: null }
                  : sq,
              )
            : row,
        );
        const newCard = { ...prev.card, squares: newSquares };
        return {
          ...prev,
          card: newCard,
          filledCount: countFilled(newCard),
        };
      }

      // Don't re-fill already filled squares
      if (currentSquare.isFilled) return prev;

      const newSquares = prev.card.squares.map((row, r) =>
        r === targetRow
          ? row.map((sq, c) =>
              c === targetCol
                ? { ...sq, isFilled: true, isAutoFilled, filledAt: Date.now() }
                : sq,
            )
          : row,
      );
      const newCard = { ...prev.card, squares: newSquares };
      const winningLine = checkForBingo(newCard);

      if (winningLine) {
        return {
          ...prev,
          status: 'won',
          card: newCard,
          filledCount: countFilled(newCard),
          winningLine,
          winningWord: detectedWord ?? currentSquare.word,
          completedAt: Date.now(),
        };
      }

      return {
        ...prev,
        card: newCard,
        filledCount: countFilled(newCard),
      };
    });
  }, []);

  const markWon = useCallback((winningLine: WinningLine, winningWord: string | null) => {
    setGame(prev => ({
      ...prev,
      status: 'won',
      completedAt: Date.now(),
      winningLine,
      winningWord,
    }));
  }, []);

  // Track auto-filled words to prevent double-fill from rapid speech results
  const autoFilledWordsRef = useRef<Set<string>>(new Set());

  // Reset the ref when starting a new game
  const startGameWrapped = useCallback((categoryId: CategoryId) => {
    autoFilledWordsRef.current = new Set();
    startGame(categoryId);
  }, [startGame]);

  const handleTranscript = useCallback((text: string) => {
    setGame(prev => {
      if (!prev.card || prev.status !== 'playing') return prev;

      // Build set of already-filled words (using ref for sync + state for completeness)
      const alreadyFilled = new Set<string>(autoFilledWordsRef.current);
      for (const row of prev.card.squares) {
        for (const sq of row) {
          if (sq.isFilled && !sq.isFreeSpace) {
            alreadyFilled.add(sq.word.toLowerCase());
          }
        }
      }

      const detected = detectWordsWithAliases(text, prev.card.words, alreadyFilled);
      if (detected.length === 0) return prev;

      let currentCard = prev.card;
      let currentStatus: GameState['status'] = prev.status;
      let winningLine = prev.winningLine;
      let winningWord = prev.winningWord;
      let completedAt = prev.completedAt;

      for (const word of detected) {
        if (currentStatus === 'won') break;

        // Mark word as filled in ref synchronously
        autoFilledWordsRef.current.add(word.toLowerCase());

        // Find the square with this word
        const square = currentCard.squares.flat().find(
          sq => sq.word.toLowerCase() === word.toLowerCase() && !sq.isFilled,
        );
        if (!square) continue;

        const newSquares = currentCard.squares.map((row, r) =>
          r === square.row
            ? row.map((sq, c) =>
                c === square.col
                  ? { ...sq, isFilled: true, isAutoFilled: true, filledAt: Date.now() }
                  : sq,
              )
            : row,
        );
        currentCard = { ...currentCard, squares: newSquares };

        const result = checkForBingo(currentCard);
        if (result) {
          currentStatus = 'won';
          winningLine = result;
          winningWord = word;
          completedAt = Date.now();
        }
      }

      return {
        ...prev,
        status: currentStatus,
        card: currentCard,
        filledCount: countFilled(currentCard),
        winningLine,
        winningWord,
        completedAt,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    autoFilledWordsRef.current = new Set();
    clearPersistedState();
    setGame(INITIAL_STATE);
  }, []);

  return {
    game,
    startGame: startGameWrapped,
    fillSquare,
    markWon,
    resetGame,
    handleTranscript,
  };
}
