/**
 * Escape special regex characters
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalize text for comparison
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .trim();
}

/**
 * Check if transcript contains any card words
 * Returns array of detected words
 */
export function detectWords(
  transcript: string,
  cardWords: string[],
  alreadyFilled: Set<string>,
): string[] {
  const normalizedTranscript = normalizeText(transcript);
  const detected: string[] = [];

  for (const word of cardWords) {
    if (alreadyFilled.has(word.toLowerCase())) continue;

    const normalizedWord = normalizeText(word);

    if (normalizedWord.includes(' ')) {
      // Direct substring match for phrases
      if (normalizedTranscript.includes(normalizedWord)) {
        detected.push(word);
      }
    } else {
      // Word boundary match for single words
      const regex = new RegExp(`\\b${escapeRegex(normalizedWord)}\\b`, 'i');
      if (regex.test(normalizedTranscript)) {
        detected.push(word);
      }
    }
  }

  return detected;
}

/**
 * Common variations/synonyms mapping
 */
export const WORD_ALIASES: Record<string, string[]> = {
  'ci/cd': ['ci cd', 'cicd', 'continuous integration'],
  'mvp': ['minimum viable product', 'm.v.p.'],
  'roi': ['return on investment', 'r.o.i.'],
  'api': ['a.p.i.', 'interface'],
  'devops': ['dev ops', 'dev-ops'],
  'sla': ['s.l.a.', 'service level agreement'],
};

/**
 * Enhanced detection with aliases
 */
export function detectWordsWithAliases(
  transcript: string,
  cardWords: string[],
  alreadyFilled: Set<string>,
): string[] {
  const detected = detectWords(transcript, cardWords, alreadyFilled);

  for (const word of cardWords) {
    if (alreadyFilled.has(word.toLowerCase())) continue;
    if (detected.includes(word)) continue;

    const aliases = WORD_ALIASES[word.toLowerCase()];
    if (aliases) {
      for (const alias of aliases) {
        if (normalizeText(transcript).includes(alias)) {
          detected.push(word);
          break;
        }
      }
    }
  }

  return detected;
}
