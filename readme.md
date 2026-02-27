# Meeting Bingo

A browser-based bingo game that auto-detects corporate buzzwords via live speech recognition. Get a randomized 5x5 card, join a meeting, and let the app listen for buzzwords to fill your squares automatically.

## Tech Stack

- **React 18** + **TypeScript** — UI framework
- **Vite** — Build tool with HMR
- **Tailwind CSS** — Utility-first styling
- **Web Speech API** — Browser-native speech recognition (Chrome recommended)
- **canvas-confetti** — Win celebration effects

## Getting Started

```bash
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Run TypeScript type checking |

## How to Play

1. Choose a buzzword category (Agile, Corporate, or Tech)
2. Click "Start Listening" to enable microphone auto-detection
3. Squares fill automatically when buzzwords are spoken — or tap manually
4. Get 5 in a row (horizontal, vertical, or diagonal) for BINGO!
5. Share your result with colleagues
