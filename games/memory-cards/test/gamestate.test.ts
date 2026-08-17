import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as adapter from '@arcade-carnival/playables-adapter';
import { GameState } from '../src/GameState.js';

describe('GameState', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('initializes with default values and loads saved high score', () => {
    vi.spyOn(adapter, 'loadData').mockReturnValue('7500');
    const state = new GameState();

    expect(state.score).toBe(0);
    expect(state.highScore).toBe(7500);
    expect(state.timeRemaining).toBe(60.0);
    expect(state.streak).toBe(0);
    expect(state.flipAttempts).toBe(0);
    expect(state.status).toBe('ready');
  });

  it('handles invalid or NaN high score gracefully', () => {
    vi.spyOn(adapter, 'loadData').mockReturnValue('bad_score');
    const state = new GameState();
    expect(state.highScore).toBe(0);

    vi.spyOn(adapter, 'loadData').mockReturnValue('-500');
    const state2 = new GameState();
    expect(state2.highScore).toBe(0);
  });

  it('starts game and resets round attributes', () => {
    const state = new GameState();
    state.score = 2500;
    state.timeRemaining = 15.0;
    state.streak = 4;
    state.flipAttempts = 8;

    state.start();
    expect(state.status).toBe('playing');
    expect(state.score).toBe(0);
    expect(state.timeRemaining).toBe(60.0);
    expect(state.streak).toBe(0);
    expect(state.flipAttempts).toBe(0);
  });

  it('calculates combo multiplier and score increments upon match', () => {
    const state = new GameState();
    state.start();

    // Match 1: streak=1, multiplier = 1 + 1*0.5 = 1.5, score = 500 * 1.5 = 750
    const res1 = state.recordMatch();
    expect(res1).toEqual({
      pointsAwarded: 750,
      streak: 1,
      multiplier: 1.5,
    });
    expect(state.score).toBe(750);
    expect(state.flipAttempts).toBe(1);

    // Match 2: streak=2, multiplier = 1 + 2*0.5 = 2.0, score = 500 * 2.0 = 1000
    const res2 = state.recordMatch();
    expect(res2).toEqual({
      pointsAwarded: 1000,
      streak: 2,
      multiplier: 2.0,
    });
    expect(state.score).toBe(1750);
    expect(state.flipAttempts).toBe(2);
  });

  it('resets streak upon mismatch but increments flipAttempts', () => {
    const state = new GameState();
    state.start();
    state.recordMatch();
    state.recordMatch();
    expect(state.streak).toBe(2);

    state.recordMismatch();
    expect(state.streak).toBe(0);
    expect(state.flipAttempts).toBe(3);
    expect(state.comboMultiplier).toBe(1.0);
  });

  it('decrements timer and triggers gameover when timer reaches 0', () => {
    const saveSpy = vi.spyOn(adapter, 'saveData');
    const reportSpy = vi.spyOn(adapter, 'reportScore');

    const state = new GameState();
    state.start();
    state.score = 3000;

    state.update(1.5);
    expect(state.timeRemaining).toBeCloseTo(58.5, 4);
    expect(state.status).toBe('playing');

    // Run out clock
    state.update(60.0);
    expect(state.timeRemaining).toBe(0);
    expect(state.status).toBe('gameover');
    expect(state.highScore).toBe(3000);
    expect(saveSpy).toHaveBeenCalledWith('memory-cards-highscore', '3000');
    expect(reportSpy).toHaveBeenCalledWith(3000);
  });

  it('awards time bonus upon win and triggers victory state', () => {
    const saveSpy = vi.spyOn(adapter, 'saveData');
    const reportSpy = vi.spyOn(adapter, 'reportScore');

    const state = new GameState();
    state.start();
    state.score = 2000;
    state.timeRemaining = 24.5;

    const won = state.checkWin(true);
    expect(won).toBe(true);
    expect(state.status).toBe('victory');
    // Bonus = 24.5 * 100 = 2450. Score = 2000 + 2450 = 4450
    expect(state.score).toBe(4450);
    expect(state.highScore).toBe(4450);
    expect(saveSpy).toHaveBeenCalledWith('memory-cards-highscore', '4450');
    expect(reportSpy).toHaveBeenCalledWith(4450);
  });

  it('handles pause and resume without timer decay while paused', () => {
    const state = new GameState();
    state.start();

    state.pause();
    expect(state.status).toBe('paused');

    state.update(5.0);
    expect(state.timeRemaining).toBe(60.0);

    state.resume();
    expect(state.status).toBe('playing');

    state.update(5.0);
    expect(state.timeRemaining).toBe(55.0);
  });
});
