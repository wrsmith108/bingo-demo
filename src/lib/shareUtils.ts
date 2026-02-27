import { GameState } from '../types';

/**
 * Build a plain-text share message
 */
export function buildShareText(game: GameState): string {
  const categoryName = game.category
    ? { agile: 'Agile & Scrum', corporate: 'Corporate Speak', tech: 'Tech & Engineering', olympics: 'Olympics', videogames: 'Video Games', fruits: 'Fruits' }[game.category]
    : 'Meeting';

  let timeStr = '';
  if (game.startedAt && game.completedAt) {
    const elapsed = game.completedAt - game.startedAt;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    timeStr = minutes > 0 ? ` in ${minutes}m ${seconds}s` : ` in ${seconds}s`;
  }

  return [
    `BINGO! I won ${categoryName} Meeting Bingo${timeStr}!`,
    `Filled ${game.filledCount}/25 squares.`,
    game.winningWord ? `Winning word: "${game.winningWord}"` : '',
    `Play at ${window.location.href}`,
  ].filter(Boolean).join('\n');
}

/**
 * Share game results via Web Share API or clipboard
 */
export async function shareGame(game: GameState): Promise<'shared' | 'copied' | 'failed'> {
  const text = buildShareText(game);

  // Try Web Share API (mobile)
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Meeting Bingo', text });
      return 'shared';
    } catch {
      // User cancelled or API failed — fall through to clipboard
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
