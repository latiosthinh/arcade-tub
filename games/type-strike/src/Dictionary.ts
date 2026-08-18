export type WordTier = 'short' | 'medium' | 'long';
export type GameMode = 'words' | 'arrows';
export type ArrowDir = 'U' | 'D' | 'L' | 'R';

export const ARROW_DIRS: ArrowDir[] = ['U', 'D', 'L', 'R'];

export function arrowCharToSymbol(char: string): string {
  switch (char.toUpperCase()) {
    case 'U': return '↑';
    case 'D': return '↓';
    case 'L': return '←';
    case 'R': return '→';
    default: return char;
  }
}

export function formatArrowSequence(seq: string): string {
  return seq.split('').map(arrowCharToSymbol).join(' ');
}

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
  'LASER', 'RADAR', 'SERVO', 'PATCH', 'CIRCUIT', 'REACTOR', 'ROUTING',
  'CONSOLE', 'NETWORK', 'CLUSTER', 'COMMAND', 'VECTOR', 'BUFFER', 'SOCKET'
];

export const LONG_WORDS = [
  'MAINFRAME', 'OVERLOAD', 'PROTOCOL', 'SYNTHESIS', 'ALGORITHM', 'INTERFACE',
  'BANDWIDTH', 'FIREWALL', 'ENCRYPTION', 'CORRUPTION', 'SUBROUTINE',
  'AUTONOMOUS', 'PROCESSOR', 'CYBERSPACE', 'HYPERDRIVE', 'TERMINAL', 'SECURITY', 'FIRMWARE'
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

  static generateArrowSequence(tier: WordTier): string {
    let len: number;
    switch (tier) {
      case 'short':
        len = 3 + Math.floor(Math.random() * 2); // 3-4
        break;
      case 'medium':
        len = 5 + Math.floor(Math.random() * 3); // 5-7
        break;
      case 'long':
        len = 8 + Math.floor(Math.random() * 3); // 8-10
        break;
    }
    let seq = '';
    for (let i = 0; i < len; i++) {
      seq += ARROW_DIRS[Math.floor(Math.random() * ARROW_DIRS.length)];
    }
    return seq;
  }

  getRandomWord(
    activeWords: Set<string> | string[] = [],
    preferredTier?: WordTier,
    mode: GameMode = 'words'
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

    if (mode === 'arrows') {
      let seq = Dictionary.generateArrowSequence(tier);
      let attempts = 0;
      while (activeSet.has(seq) && attempts < 10) {
        seq = Dictionary.generateArrowSequence(tier);
        attempts++;
      }
      return { word: seq, tier, basePoints: Dictionary.getPointsForTier(tier) };
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
