import { describe, it, expect } from 'vitest';
import { SeasonManager } from '../src/stages/SeasonManager';

describe('SeasonManager (STAG-05)', () => {
  it('cycles across 4 seasons per loop', () => {
    const seasons = new SeasonManager();
    expect(seasons.currentSeason).toBe('spring');
    expect(seasons.getTheme().particleType).toBe('sakura');

    seasons.advanceLoop();
    expect(seasons.currentSeason).toBe('summer');

    seasons.advanceLoop();
    expect(seasons.currentSeason).toBe('autumn');

    seasons.advanceLoop();
    expect(seasons.currentSeason).toBe('winter');

    seasons.advanceLoop();
    expect(seasons.currentSeason).toBe('spring'); // Wraps back
  });
});
