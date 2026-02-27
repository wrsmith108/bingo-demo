import { Button } from './ui/Button';

interface Props {
  onStart: () => void;
}

export function LandingPage({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold text-blue-600 mb-3">Meeting Bingo</h1>
        <p className="text-xl text-gray-600 mb-8">
          Turn boring meetings into a game
        </p>

        <div className="text-left bg-white rounded-xl shadow-md p-6 mb-8 space-y-3">
          <Feature icon={"🎤"} text="Auto-detects buzzwords via your microphone" />
          <Feature icon={"🎲"} text="3 category packs to choose from" />
          <Feature icon={"🎉"} text="Get BINGO and celebrate (silently)" />
        </div>

        <Button size="lg" onClick={onStart}>
          Start Game
        </Button>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <span className="text-gray-700">{text}</span>
    </div>
  );
}
