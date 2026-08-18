import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameState } from '../src/GameState';
import * as playables from '@arcade-carnival/playables-adapter';

describe('GameState', () => {
  let state: GameState;

  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    state = new GameState();
  });

  it('initializes with default status ready and score 0', () => {
    expect(state.status).toBe('ready');
    expect(state.score).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.multiplier).toBe(1);
    expect(state.foodEaten).toBe(0);
    expect(state.goldenEaten).toBe(0);
  });

  it('handles state transitions', () => {
    state.startGame();
    expect(state.status).toBe('playing');

    state.pause();
    expect(state.status).toBe('paused');

    state.resume();
    expect(state.status).toBe('playing');

    state.endGame();
    expect(state.status).toBe('gameover');
  });

  it('calculates score and increases combo streaks and multipliers', () => {
    state.startGame();

    // 1st food: base 10 * 1 = 10 (streak 1)
    const pts1 = state.addFoodScore(10, false);
    expect(pts1).toBe(10);
    expect(state.score).toBe(10);
    expect(state.streak).toBe(1);
    expect(state.multiplier).toBe(1);

    // 2nd food (streak 2)
    state.addFoodScore(10, false);
    expect(state.streak).toBe(2);
    expect(state.multiplier).toBe(1);

    // 3rd food (streak 3 -> multiplier becomes 2)
    state.addFoodScore(10, false);
    expect(state.streak).toBe(3);
    expect(state.multiplier).toBe(2);

    // 4th food (streak 4) -> 10 * 2 = 20 pts
    const pts4 = state.addFoodScore(10, false);
    expect(pts4).toBe(20);
    expect(state.score).toBe(50);
  });

  it('resets streak when streak timer expires', () => {
    state.startGame();
    state.addFoodScore(10, false);
    expect(state.streak).toBe(1);
    expect(state.streakTimer).toBeGreaterThan(0);

    state.update(4.0); // combo window is 3.5s
    expect(state.streak).toBe(0);
    expect(state.multiplier).toBe(1);
  });

  it('updates high score and calls reportScore on gameover', () => {
    const reportSpy = vi.spyOn(playables, 'reportScore');
    state.startGame();
    state.addFoodScore(100, true);

    expect(state.score).toBe(100);
    expect(state.highScore).toBe(100);

    state.endGame();
    expect(reportSpy).toHaveBeenCalledWith(100);
  });

  it('loads and saves high score gracefully with corrupt data fallback', () => {
    vi.spyOn(playables, 'loadData').mockReturnValue('corrupted_string');
    const corruptState = new GameState();
    expect(corruptState.highScore).toBe(0);
  });
});
