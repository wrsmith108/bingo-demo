import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import { BingoCard } from './BingoCard';
import { GameControls } from './GameControls';
import { TranscriptPanel } from './TranscriptPanel';
import { Toast } from './ui/Toast';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { getClosestToWin } from '../lib/bingoChecker';
import { CATEGORIES } from '../data/categories';

export function GameBoard() {
  const { game, fillSquare, resetGame, handleTranscript } = useGameContext();
  const speech = useSpeechRecognition();
  const [detectedWords, setDetectedWords] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Show toast on speech error (e.g. mic permission denied)
  useEffect(() => {
    if (speech.error === 'not-allowed') {
      setToast({ message: 'Microphone access denied. Tap squares manually.', type: 'warning' });
    } else if (speech.error && speech.error !== 'no-speech') {
      setToast({ message: `Speech error: ${speech.error}`, type: 'warning' });
    }
  }, [speech.error]);

  // Keep handleTranscript in a ref so the speech callback always uses the latest
  const handleTranscriptRef = useRef(handleTranscript);
  handleTranscriptRef.current = handleTranscript;

  const onSpeechResult = useCallback((text: string) => {
    handleTranscriptRef.current(text);

    // We can't easily get detected words back from handleTranscript since it
    // updates state internally, so we'll track words by watching card changes.
    // For now, just show the transcript text.
  }, []);

  const handleToggleListen = useCallback(() => {
    if (speech.isListening) {
      speech.stopListening();
    } else {
      setDetectedWords([]);
      speech.startListening(onSpeechResult);
    }
  }, [speech, onSpeechResult]);

  // Track detected words by watching auto-filled squares
  const prevAutoFilledRef = useRef<Set<string>>(new Set());
  const currentAutoFilled = useMemo(() => {
    if (!game.card) return new Set<string>();
    return new Set(
      game.card.squares.flat()
        .filter(sq => sq.isAutoFilled)
        .map(sq => sq.word),
    );
  }, [game.card]);

  // Detect newly auto-filled words
  if (currentAutoFilled.size > prevAutoFilledRef.current.size) {
    const newWords: string[] = [];
    for (const word of currentAutoFilled) {
      if (!prevAutoFilledRef.current.has(word)) {
        newWords.push(word);
      }
    }
    if (newWords.length > 0) {
      // Use a functional approach to avoid stale state
      setDetectedWords(prev => [...prev, ...newWords]);
    }
  }
  prevAutoFilledRef.current = currentAutoFilled;

  const categoryName = useMemo(() => {
    return CATEGORIES.find(c => c.id === game.category)?.name ?? '';
  }, [game.category]);

  const winningSquares = useMemo(() => {
    return new Set(game.winningLine?.squares ?? []);
  }, [game.winningLine]);

  const closestToWin = useMemo(() => {
    return game.card ? getClosestToWin(game.card) : null;
  }, [game.card]);

  if (!game.card) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-lg mx-auto pt-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{categoryName}</h2>
          <div className="flex items-center justify-center gap-3 mt-1">
            <span className="text-sm text-gray-500">
              {game.filledCount}/25 filled
            </span>
            {closestToWin && closestToWin.needed <= 2 && (
              <span className="text-sm font-medium text-amber-600">
                {closestToWin.needed === 1
                  ? `One away! (${closestToWin.line})`
                  : `${closestToWin.needed} away (${closestToWin.line})`}
              </span>
            )}
          </div>
        </div>

        {/* Bingo Card */}
        <BingoCard
          card={game.card}
          winningSquares={winningSquares}
          onSquareClick={(id) => fillSquare(id)}
        />

        {/* Controls */}
        <GameControls
          isListening={speech.isListening}
          isSupported={speech.isSupported}
          onToggleListen={handleToggleListen}
          onReset={resetGame}
        />

        {/* Transcript */}
        <TranscriptPanel
          transcript={speech.transcript}
          interimTranscript={speech.interimTranscript}
          detectedWords={detectedWords}
          isListening={speech.isListening}
        />
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
