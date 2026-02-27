import { Button } from './ui/Button';

interface Props {
  isListening: boolean;
  isSupported: boolean;
  onToggleListen: () => void;
  onReset: () => void;
}

export function GameControls({ isListening, isSupported, onToggleListen, onReset }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 mt-4">
      <Button
        variant={isListening ? 'primary' : 'secondary'}
        onClick={onToggleListen}
        disabled={!isSupported}
      >
        {!isSupported
          ? 'Speech Not Supported'
          : isListening
            ? '🔴 Stop Listening'
            : '🎤 Start Listening'}
      </Button>
      <Button variant="ghost" onClick={onReset}>
        New Game
      </Button>
    </div>
  );
}
