import { useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from '../types';
import { shareGame } from '../lib/shareUtils';
import { Button } from './ui/Button';
import { Toast } from './ui/Toast';

interface Props {
  game: GameState;
  onPlayAgain: () => void;
  onHome: () => void;
}

export function WinScreen({ game, onPlayAgain, onHome }: Props) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Fire confetti on mount
  useEffect(() => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    const timer = setTimeout(() => {
      confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } });
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleShare = useCallback(async () => {
    const result = await shareGame(game);
    if (result === 'shared') {
      setToast({ message: 'Shared successfully!', type: 'success' });
    } else if (result === 'copied') {
      setToast({ message: 'Copied to clipboard!', type: 'success' });
    } else {
      setToast({ message: 'Could not share. Try again.', type: 'warning' });
    }
  }, [game]);

  // Compute elapsed time
  let timeStr = '';
  if (game.startedAt && game.completedAt) {
    const elapsed = game.completedAt - game.startedAt;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }

  const winLineLabel =
    game.winningLine?.type === 'row' ? `Row ${game.winningLine.index + 1}` :
    game.winningLine?.type === 'column' ? `Column ${game.winningLine.index + 1}` :
    'Diagonal';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-white mb-4 animate-bounce-in">
          BINGO!
        </h1>

        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-8 max-w-sm mx-auto">
          <div className="space-y-2 text-white">
            <p className="text-lg font-semibold">{winLineLabel}</p>
            {game.winningWord && (
              <p className="text-sm opacity-90">
                Winning word: <span className="font-semibold">"{game.winningWord}"</span>
              </p>
            )}
            <p className="text-sm opacity-90">
              {game.filledCount}/25 squares filled
            </p>
            {timeStr && (
              <p className="text-sm opacity-90">
                Time: {timeStr}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleShare}
            className="bg-white text-green-600 hover:bg-gray-100 focus:ring-white"
          >
            Share Result
          </Button>
          <Button
            onClick={onPlayAgain}
            className="bg-white/20 text-white hover:bg-white/30 focus:ring-white"
          >
            Play Again
          </Button>
          <Button
            variant="ghost"
            onClick={onHome}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            Home
          </Button>
        </div>
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
