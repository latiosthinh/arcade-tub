export type WordTier = 'short' | 'medium' | 'long';

export interface WordEntry {
  word: string;
  tier: WordTier;
  basePoints: number;
}

export const SHORT_WORDS = [
  'BYTE', 'CODE', 'NODE', 'CHIP', 'SYNC', 'CORE', 'DATA', 'GRID',
  'LINK', 'PORT', 'ROOT', 'HOST', 'PING', 'RAM', 'BIT', 'CPU',
  'NET', 'KEY', 'BOT', 'BUG', 'LOG', 'HACK', 'SCAN', 'BOOT', 'LOAD', 'WIRE'
];

export const MEDIUM_WORDS = [
  'TURBO', 'CYBER', 'PIXEL', 'PROXY', 'ARRAY', 'STACK', 'QUEUE', 'LOGIC',
  'LASER', 'RADAR', 'SERVO', 'PATCH', 'CIRCUIT', 'TERMINAL', 'REACTOR', 'ROUTING',
  'SECURITY', 'CONSOLE', 'NETWORK', 'CLUSTER', 'FIRMWARE', 'COMMAND'
];

export const LONG_WORDS = [
  'QUANTUM', 'OVERLOAD', 'PROTOCOL', 'SYNTHESIS', 'ALGORITHM', 'INTERFACE',
  'MAINFRAME', 'BANDWIDTH', 'FIREWALL', 'ENCRYPTION', 'CORRUPTION', 'SUBROUTINE',
  'AUTONOMOUS', 'PROCESSOR', 'CYBERSPACE', 'HYPERDRIVE'
];

export class Dictionary {
  shortWords: string[];
  mediumWords: string[];
  longWords: string[];

  constructor(
    shortWords = SHORT_WORDS,
    mediumWords = MEDIUM_WORDS,
    longWords = LONG_WORDS
  ) {
    this.shortWords = [...shortWords];
    this.mediumWords = [...mediumWords];
    this.longWords = [...longWords];
  }

  static getTierForLength(length: number): WordTier {
    if (length <= 4) return 'short';
    if (length <= 7) return 'medium';
    return 'long';
  }

  static getPointsForTier(tier: WordTier): number {
    switch (tier) {
      case 'short':
        return 100;
      case 'medium':
        return 250;
      case 'long':
        return 500;
    }
  }

  getRandomWord(
    activeWords: Set<string> | string[] = [],
    preferredTier?: WordTier
  ): WordEntry {
    const activeSet = activeWords instanceof Set ? activeWords : new Set(activeWords);

    let tier = preferredTier;
    if (!tier) {
      const rand = Math.random();
      if (rand < 0.5) {
        tier = 'short';
      } else if (rand < 0.85) {
        tier = 'medium';
      } else {
        tier = 'long';
      }
    }

    const wordsForTier = this.getWordsByTier(tier);
    const available = wordsForTier.filter((w) => !activeSet.has(w));

    if (available.length > 0) {
      const word = available[Math.floor(Math.random() * available.length)]!;
      return { word, tier, basePoints: Dictionary.getPointsForTier(tier) };
    }

    // Search other tiers if requested tier has no available words
    const otherTiers: WordTier[] = (['short', 'medium', 'long'] as WordTier[]).filter((t) => t !== tier);
    for (const altTier of otherTiers) {
      const altAvailable = this.getWordsByTier(altTier).filter((w) => !activeSet.has(w));
      if (altAvailable.length > 0) {
        const word = altAvailable[Math.floor(Math.random() * altAvailable.length)]!;
        return { word, tier: altTier, basePoints: Dictionary.getPointsForTier(altTier) };
      }
    }

    // Fallback if all words active: pick random word from requested tier or short
    const fallbackList = wordsForTier.length > 0 ? wordsForTier : this.shortWords;
    const word = fallbackList[Math.floor(Math.random() * fallbackList.length)] || 'CYBER';
    return { word, tier, basePoints: Dictionary.getPointsForTier(tier) };
  }

  private getWordsByTier(tier: WordTier): string[] {
    switch (tier) {
      case 'short':
        return this.shortWords;
      case 'medium':
        return this.mediumWords;
      case 'long':
        return this.longWords;
    }
  }
}
