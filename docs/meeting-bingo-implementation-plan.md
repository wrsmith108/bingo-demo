# Meeting Bingo — Implementation Plan

## Context

The repo has three detailed docs (PRD, UX Research, Architecture) but zero source code. This plan converts those docs into a working React app. The architecture doc contains near-final type definitions, logic implementations, and component designs that can be translated directly into source files.

**Files to preserve (do not modify):** `.env`, `.env.schema`, `env.d.ts`, `CLAUDE.md`, `docs/`

---

## Phase 0: Bootstrap & Configuration

**Goal:** `npm run dev` serves a page with Tailwind active.

| File | Purpose |
|------|---------|
| `package.json` | React 18, Vite, Tailwind, canvas-confetti, TypeScript deps. Scripts: dev, build, preview, typecheck |
| `tsconfig.json` | Strict mode, react-jsx transform, ES2020 target, include `src/` |
| `vite.config.ts` | React plugin, port 3000, sourcemaps |
| `tailwind.config.js` | Content globs, custom bounceIn keyframe animation |
| `postcss.config.js` | Tailwind + autoprefixer plugins |
| `index.html` | Vite entry HTML, mounts `#root`, loads `/src/main.tsx` |
| `.gitignore` | node_modules, dist, .DS_Store, *.log |
| `public/favicon.svg` | Simple bingo icon |
| `src/index.css` | Three Tailwind directives |
| `src/main.tsx` | React 18 createRoot, imports App |
| `src/App.tsx` | Placeholder — replaced in Phase 2 |

**Verify:** `npm install && npm run dev` opens without errors.

---

## Phase 1: Types, Data & Pure Logic

**Goal:** All non-UI code passes `npm run typecheck`. Card generation works.

| File | Purpose |
|------|---------|
| `src/types/index.ts` | CategoryId, Category, BingoSquare, BingoCard, GameStatus, WinningLine, GameState, SpeechRecognitionState, Toast — verbatim from architecture doc |
| `src/data/categories.ts` | 3 categories (Agile 48 words, Corporate 45, Tech 45) — from architecture doc |
| `src/lib/cardGenerator.ts` | Fisher-Yates shuffle, generateCard(), getCardWords() |
| `src/lib/bingoChecker.ts` | checkForBingo() (12 lines), countFilled(), getClosestToWin() |
| `src/lib/wordDetector.ts` | normalizeText(), detectWords() (word-boundary + substring), WORD_ALIASES map, detectWordsWithAliases() |
| `src/lib/shareUtils.ts` | buildShareText(), shareGame() (Web Share API + clipboard fallback) |
| `src/lib/utils.ts` | `cn()` — className concatenation helper (filters falsy, joins with space) |

**Verify:** `npm run typecheck` passes. Console-log `generateCard('agile')` — 25 squares, FREE at [2][2].

---

## Phase 2: Core Game UI (Manual Play)

**Goal:** Full manual bingo game loop — landing, category pick, card, click squares, BINGO detection with green highlight.

| File | Purpose |
|------|---------|
| `src/hooks/useLocalStorage.ts` | Generic hook: read/write JSON to localStorage |
| `src/hooks/useBingoDetection.ts` | Wraps checkForBingo + countFilled in useMemo |
| `src/hooks/useGame.ts` | Central state hook: startGame(), fillSquare(), resetGame(), markWon(). Calls checkForBingo after each fill. Persists to localStorage |
| `src/context/GameContext.tsx` | GameProvider + useGameContext() — exposes useGame to component tree |
| `src/components/ui/Button.tsx` | Reusable button: primary/secondary/ghost variants |
| `src/components/ui/Card.tsx` | Container wrapper: rounded, shadow, padding |
| `src/components/ui/Toast.tsx` | Auto-dismiss notification: success/info/warning, fixed position |
| `src/components/LandingPage.tsx` | Welcome screen: headline, feature list, "Start Game" CTA |
| `src/components/CategorySelect.tsx` | Category picker: card per category with icon, name, sample words |
| `src/components/BingoSquare.tsx` | Square button: 5 visual states (default, filled, auto-filled, free, winning) |
| `src/components/BingoCard.tsx` | 5x5 CSS grid of BingoSquare components |
| `src/components/GameControls.tsx` | Mic toggle + New Game button |
| `src/components/GameBoard.tsx` | Main game screen: header, card, controls |
| `src/App.tsx` | Screen routing via `useState<Screen>`, wraps tree in GameProvider |

**Verify:** Landing -> pick category -> card renders -> click 5 in a row -> green winning line highlight.

---

## Phase 3: Speech Recognition & Auto-Fill

**Goal:** Microphone activates live transcription; spoken buzzwords auto-fill squares.

| File | Purpose |
|------|---------|
| `src/hooks/useSpeechRecognition.ts` | Web Speech API wrapper: continuous mode, interim results, auto-restart on silence, isSupported check |
| Update `src/hooks/useGame.ts` | Add `handleTranscript(text)` — runs detectWordsWithAliases, auto-fills matching squares. Uses ref for already-filled words to prevent double-fill race condition |
| `src/components/TranscriptPanel.tsx` | Shows listening indicator (pulsing dot), last 100 chars of transcript, interim text in grey italic, last 5 detected words as green pills |
| Update `src/components/GameBoard.tsx` | Wire useSpeechRecognition, pass handleTranscript as callback, render TranscriptPanel |

**Verify:** Chrome, Corporate mode, say "synergy" — square auto-fills with pulse animation. Transcript panel shows spoken text.

---

## Phase 4: Polish — Win Screen, Confetti, Share

**Goal:** Celebration on win, share results, localStorage persistence works across refresh.

| File | Purpose |
|------|---------|
| `src/components/WinScreen.tsx` | Victory screen: "BINGO!" headline, gradient bg, game stats (time, filled count, winning line), confetti on mount via canvas-confetti, Share + Play Again + Home buttons |
| Update `src/App.tsx` | Watch game.status for 'won' transition to win screen |
| Update `src/hooks/useGame.ts` | Restore state from localStorage on init; clear on reset |

**Verify:** Win a game -> confetti fires, stats shown, share copies to clipboard. Refresh mid-game -> state restored.

---

## Phase 5: Final QA & Deploy

**Goal:** Live URL, mobile-tested, edge cases handled.

| Item | Detail |
|------|--------|
| Speech API unavailable | Mic button disabled with "Requires Chrome" message; game playable manually |
| Mic permission denied | Toast: "Microphone access denied. Tap squares manually." |
| Long words in small squares | `break-words leading-tight text-xs` handles phrases |
| Update `readme.md` | Project name, tech stack, dev/build instructions |
| Deploy | `npm run build` -> deploy `dist/` to Vercel |

---

## Verification

After each phase, run:
1. `npm run typecheck` — zero errors
2. `npm run dev` — visual check in browser
3. `npm run build` — production build succeeds

Final end-to-end test:
1. Open in Chrome, click Start Game
2. Pick "Corporate Speak" category
3. Enable microphone, speak buzzwords — squares auto-fill
4. Manually tap remaining squares to complete a line
5. BINGO triggers: confetti, green highlight, win screen with stats
6. Click Share — clipboard contains share text
7. Click Play Again — new card generated
8. Refresh mid-game — state restored from localStorage
