import { useState, useEffect } from 'react';
import { CategoryId } from './types';
import { GameProvider, useGameContext } from './context/GameContext';
import { LandingPage } from './components/LandingPage';
import { CategorySelect } from './components/CategorySelect';
import { GameBoard } from './components/GameBoard';
import { WinScreen } from './components/WinScreen';

type Screen = 'landing' | 'category' | 'game' | 'win';

function AppContent() {
  const { game, startGame, resetGame } = useGameContext();
  const [screen, setScreen] = useState<Screen>(() => {
    // Restore screen from persisted game state
    if (game.status === 'won') return 'win';
    if (game.status === 'playing') return 'game';
    return 'landing';
  });

  // Watch for win transition
  useEffect(() => {
    if (game.status === 'won' && screen === 'game') {
      setScreen('win');
    }
  }, [game.status, screen]);

  const handleStart = () => setScreen('category');

  const handleCategorySelect = (categoryId: CategoryId) => {
    startGame(categoryId);
    setScreen('game');
  };

  const handlePlayAgain = () => setScreen('category');

  const handleBackToHome = () => {
    resetGame();
    setScreen('landing');
  };

  return (
    <>
      {screen === 'landing' && (
        <LandingPage onStart={handleStart} />
      )}
      {screen === 'category' && (
        <CategorySelect
          onSelect={handleCategorySelect}
          onBack={handleBackToHome}
        />
      )}
      {screen === 'game' && game.card && (
        <GameBoard />
      )}
      {screen === 'win' && (
        <WinScreen
          game={game}
          onPlayAgain={handlePlayAgain}
          onHome={handleBackToHome}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
