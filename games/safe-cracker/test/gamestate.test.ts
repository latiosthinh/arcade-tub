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
    vi.spyOn(adapter, 'loadData').mockReturnValue('5000');
    const state = new GameState();

    expect(state.score).toBe(0);
    expect(state.highScore).toBe(5000);
    expect(state.timeRemaining).toBe(30.0);
    expect(state.pickCooldown).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.difficultyLevel).toBe(0);
    expect(state.status).toBe('ready');
  });

  it('handles invalid or NaN high score gracefully', () => {
    vi.spyOn(adapter, 'loadData').mockReturnValue('invalid-score');
    const state = new GameState();
    expect(state.highScore).toBe(0);

    vi.spyOn(adapter, 'loadData').mockReturnValue('-200');
    const state2 = new GameState();
    expect(state2.highScore).toBe(0);
  });

  it('starts game and resets state', () => {
    const state = new GameState();
    state.score = 2000;
    state.streak = 3;
    state.timeRemaining = 10.0;
    state.difficultyLevel = 2;
    state.pickCooldown = 0.2;

    state.start();
    expect(state.status).toBe('playing');
    expect(state.score).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.timeRemaining).toBe(30.0);
    expect(state.difficultyLevel).toBe(0);
    expect(state.pickCooldown).toBe(0);
  });

  it('records yellow hit: adds 1000 points, increments streak and difficulty', () => {
    const state = new GameState();
    state.start();

    const res = state.recordPick({ hit: true, type: 'score' });
    expect(res).toEqual({
      outcome: 'yellow',
      pointsAwarded: 1000,
      timeAwarded: 0,
    });
    expect(state.score).toBe(1000);
    expect(state.streak).toBe(1);
    expect(state.difficultyLevel).toBe(1);
  });

  it('records blue hit: adds 1.5s time (capped at 60s), increments streak and difficulty', () => {
    const state = new GameState();
    state.start();

    const res = state.recordPick({ hit: true, type: 'time' });
    expect(res).toEqual({
      outcome: 'blue',
      pointsAwarded: 0,
      timeAwarded: 1.5,
    });
    expect(state.score).toBe(0);
    expect(state.timeRemaining).toBe(31.5);
    expect(state.streak).toBe(1);
    expect(state.difficultyLevel).toBe(1);

    // Test 60s cap
    state.timeRemaining = 59.5;
    state.recordPick({ hit: true, type: 'time' });
    expect(state.timeRemaining).toBe(60.0);
  });

  it('records miss: resets streak, triggers 0.4s cooldown lockout', () => {
    const state = new GameState();
    state.start();
    state.streak = 5;

    const res = state.recordPick({ hit: false });
    expect(res).toEqual({
      outcome: 'miss',
      pointsAwarded: 0,
      timeAwarded: 0,
    });
    expect(state.streak).toBe(0);
    expect(state.pickCooldown).toBeCloseTo(0.4, 5);
    expect(state.isLockedOut).toBe(true);

    // Pick while locked out returns cooldown outcome
    const lockoutRes = state.recordPick({ hit: true, type: 'score' });
    expect(lockoutRes).toEqual({
      outcome: 'cooldown',
      pointsAwarded: 0,
      timeAwarded: 0,
    });
    expect(state.score).toBe(0);
  });

  it('computes speed multiplier scaling with score and streak', () => {
    const state = new GameState();
    state.start();

    // Base: 1.0 + floor(0 / 3000)*0.35 + 0*0.05 = 1.0
    expect(state.speedMultiplier).toBeCloseTo(1.0, 4);

    state.score = 2000;
    state.streak = 4;
    // 1.0 + 0 + 4 * 0.05 = 1.20
    expect(state.speedMultiplier).toBeCloseTo(1.20, 4);

    state.score = 6500;
    state.streak = 2;
    // 1.0 + floor(6500/3000)*0.35 + 2*0.05 = 1.0 + 2*0.35 + 0.1 = 1.80
    expect(state.speedMultiplier).toBeCloseTo(1.80, 4);
  });

  it('decrements timer and pickCooldown in update, transitions to gameover at 0 timer', () => {
    const saveSpy = vi.spyOn(adapter, 'saveData');
    const reportSpy = vi.spyOn(adapter, 'reportScore');

    const state = new GameState();
    state.start();
    state.score = 4000;
    state.pickCooldown = 0.4;

    state.update(0.1);
    expect(state.timeRemaining).toBeCloseTo(29.9, 4);
    expect(state.pickCooldown).toBeCloseTo(0.3, 4);
    expect(state.status).toBe('playing');

    // Run down clock
    state.update(30.0);
    expect(state.timeRemaining).toBe(0);
    expect(state.status).toBe('gameover');
    expect(state.highScore).toBe(4000);
    expect(saveSpy).toHaveBeenCalledWith('safe-cracker-highscore', '4000');
    expect(reportSpy).toHaveBeenCalledWith(4000);
  });

  it('supports pause and resume', () => {
    const state = new GameState();
    state.start();

    state.pause();
    expect(state.status).toBe('paused');

    state.update(1.0);
    expect(state.timeRemaining).toBe(30.0); // No time decrement while paused

    state.resume();
    expect(state.status).toBe('playing');

    state.update(1.0);
    expect(state.timeRemaining).toBe(29.0);
  });
});
