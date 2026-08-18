import { describe, it, expect } from 'vitest';
import {
  Dictionary,
  WordTier,
  WordEntry,
  arrowCharToSymbol,
  formatArrowSequence
} from '../src/Dictionary.js';

describe('Dictionary', () => {
  it('categorizes words into short, medium, and long tiers with correct points', () => {
    expect(Dictionary.getTierForLength(3)).toBe('short');
    expect(Dictionary.getTierForLength(4)).toBe('short');
    expect(Dictionary.getTierForLength(5)).toBe('medium');
    expect(Dictionary.getTierForLength(7)).toBe('medium');
    expect(Dictionary.getTierForLength(8)).toBe('long');
    expect(Dictionary.getTierForLength(12)).toBe('long');

    expect(Dictionary.getPointsForTier('short')).toBe(100);
    expect(Dictionary.getPointsForTier('medium')).toBe(250);
    expect(Dictionary.getPointsForTier('long')).toBe(500);
  });

  it('converts arrow characters to symbols correctly', () => {
    expect(arrowCharToSymbol('U')).toBe('↑');
    expect(arrowCharToSymbol('D')).toBe('↓');
    expect(arrowCharToSymbol('L')).toBe('←');
    expect(arrowCharToSymbol('R')).toBe('→');
    expect(arrowCharToSymbol('u')).toBe('↑');
    expect(arrowCharToSymbol('d')).toBe('↓');
    expect(arrowCharToSymbol('l')).toBe('←');
    expect(arrowCharToSymbol('r')).toBe('→');
    expect(arrowCharToSymbol('A')).toBe('A');
    expect(formatArrowSequence('UDLR')).toBe('↑ ↓ ← →');
  });

  it('generates arrow sequences of appropriate length for tiers in arrows mode', () => {
    const dict = new Dictionary();

    for (let i = 0; i < 20; i++) {
      const shortArrows = dict.getRandomWord([], 'short', 'arrows');
      expect(shortArrows.tier).toBe('short');
      expect(shortArrows.basePoints).toBe(100);
      expect(shortArrows.word.length).toBeGreaterThanOrEqual(3);
      expect(shortArrows.word.length).toBeLessThanOrEqual(4);
      expect(/^[UDLR]+$/.test(shortArrows.word)).toBe(true);

      const mediumArrows = dict.getRandomWord([], 'medium', 'arrows');
      expect(mediumArrows.tier).toBe('medium');
      expect(mediumArrows.basePoints).toBe(250);
      expect(mediumArrows.word.length).toBeGreaterThanOrEqual(5);
      expect(mediumArrows.word.length).toBeLessThanOrEqual(7);
      expect(/^[UDLR]+$/.test(mediumArrows.word)).toBe(true);

      const longArrows = dict.getRandomWord([], 'long', 'arrows');
      expect(longArrows.tier).toBe('long');
      expect(longArrows.basePoints).toBe(500);
      expect(longArrows.word.length).toBeGreaterThanOrEqual(8);
      expect(longArrows.word.length).toBeLessThanOrEqual(10);
      expect(/^[UDLR]+$/.test(longArrows.word)).toBe(true);
    }
  });

  it('provides random words matching requested tier and uppercase', () => {
    const dict = new Dictionary();
    const shortWord = dict.getRandomWord([], 'short');
    expect(shortWord.tier).toBe('short');
    expect(shortWord.basePoints).toBe(100);
    expect(shortWord.word).toBe(shortWord.word.toUpperCase());
    expect(shortWord.word.length).toBeLessThanOrEqual(4);

    const mediumWord = dict.getRandomWord([], 'medium');
    expect(mediumWord.tier).toBe('medium');
    expect(mediumWord.basePoints).toBe(250);
    expect(mediumWord.word.length).toBeGreaterThanOrEqual(5);
    expect(mediumWord.word.length).toBeLessThanOrEqual(7);

    const longWord = dict.getRandomWord([], 'long');
    expect(longWord.tier).toBe('long');
    expect(longWord.basePoints).toBe(500);
    expect(longWord.word.length).toBeGreaterThanOrEqual(8);
  });

  it('avoids active words when selecting random words', () => {
    const dict = new Dictionary();
    const active = new Set(dict.shortWords.slice(0, dict.shortWords.length - 1));
    const onlyAvailable = dict.shortWords[dict.shortWords.length - 1];

    const result = dict.getRandomWord(active, 'short');
    expect(result.word).toBe(onlyAvailable);
  });

  it('falls back gracefully when all words in requested tier are active', () => {
    const dict = new Dictionary();
    const allShort = new Set(dict.shortWords);
    const result = dict.getRandomWord(allShort, 'short');
    expect(result).toBeDefined();
    expect(typeof result.word).toBe('string');
    expect(result.word.length).toBeGreaterThan(0);
  });

  it('handles all words active in all tiers without throwing', () => {
    const dict = new Dictionary();
    const allWords = new Set([...dict.shortWords, ...dict.mediumWords, ...dict.longWords]);
    const result = dict.getRandomWord(allWords);
    expect(result).toBeDefined();
    expect(result.word).toBeDefined();
  });
});
