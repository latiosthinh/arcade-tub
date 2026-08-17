import { describe, it, expect } from 'vitest';
import { Dictionary, WordTier, WordEntry } from '../src/Dictionary.js';

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
