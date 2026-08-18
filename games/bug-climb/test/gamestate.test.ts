import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameState } from '../src/GameState';

describe('GameState', () => {
  let state: GameState;

  beforeEach(() => {
    state = new GameState();
  });

  it('initializes in ready status with 0 score and altitude', () => {
    expect(state.status).toBe('ready');
    expect(state.score).toBe(0);
    expect(state.altitude).toBe(0);
    expect(state.stepsClimbed).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.multiplier).toBe(1);
  });

  it('transitions through status lifecycle: ready -> playing -> paused -> playing -> gameover', () => {
    expect(state.startGame()).toBe(true);
    expect(state.status).toBe('playing');

    expect(state.pause()).toBe(true);
    expect(state.status).toBe('paused');

    expect(state.resume()).toBe(true);
    expect(state.status).toBe('playing');

    expect(state.endGame('collision')).toBe(true);
    expect(state.status).toBe('gameover');
    expect(state.gameOverReason).toBe('collision');
  });

  it('increments score and streak multipliers on climb steps', () => {
    state.startGame();

    // First climb step
    state.addClimbScore();
    expect(state.altitude).toBe(1);
    expect(state.stepsClimbed).toBe(1);
    expect(state.streak).toBe(1);
    expect(state.score).toBe(10); // 10 * 1

    // 5 climb steps in total reach x2 multiplier
    // Step 1: streak=1, mult=1, pts=10, score=10
    // Steps 2-4: streak=2,3,4, mult=1, pts=10 each -> score=40
    // Step 5: streak=5, mult=2, pts=20 -> score=60
    for (let i = 0; i < 4; i++) {
      state.addClimbScore();
    }
    expect(state.streak).toBe(5);
    expect(state.multiplier).toBe(2);
    expect(state.score).toBe(60);

    state.addClimbScore(); // step 6: streak=6, mult=2, pts=20 -> score=80
    expect(state.score).toBe(80);
  });

  it('resets streak combo when streak timer expires', () => {
    state.startGame();
    state.addClimbScore();
    expect(state.streak).toBe(1);

    state.update(0.5);
    expect(state.streak).toBe(1);

    state.update(0.4); // total dt = 0.9s > 0.8s
    expect(state.streak).toBe(0);
    expect(state.multiplier).toBe(1);
  });

  it('persists and updates high score', async () => {
    state.startGame();
    state.addClimbScore();
    state.addClimbScore();
    expect(state.score).toBe(20);
    expect(state.highScore).toBe(20);

    state.reset();
    expect(state.score).toBe(0);
    expect(state.highScore).toBe(20);
  });
});
