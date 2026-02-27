import { createContext, useContext, ReactNode } from 'react';
import { useGame } from '../hooks/useGame';

type GameContextType = ReturnType<typeof useGame>;

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const gameValue = useGame();
  return (
    <GameContext.Provider value={gameValue}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
