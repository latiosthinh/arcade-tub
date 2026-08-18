import { describe, it, expect, beforeEach } from 'vitest';
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
    expect(state.branchesDodged).toBe(0);
    expect(state.multiplier).toBe(1);
  });

  it('transitions through status lifecycle: ready -> playing -> paused -> playing -> gameover', () => {
    expect(state.startGame()).toBe(true);
    expect(state.status).toBe('playing');

    expect(state.pause()).toBe(true);
    expect(state.status).toBe('paused');

    expect(state.resume()).toBe(true);
    expect(state.status).toBe('playing');

    expect(state.endGame()).toBe(true);
    expect(state.status).toBe('gameover');
  });

  it('increments altitude and score based on climber speed over time', () => {
    state.startGame();
    state.update(1.0, 250);

    expect(state.altitude).toBeCloseTo(10, 0); // 250 / 25
    expect(state.score).toBeGreaterThan(0);
  });

  it('adds bonus points on dodging branches', () => {
    state.startGame();
    state.addDodgedBranches(2);
    expect(state.branchesDodged).toBe(2);
    expect(state.score).toBe(100);
  });

  it('persists and updates high score', () => {
    state.startGame();
    state.addDodgedBranches(5);
    expect(state.score).toBe(250);
    expect(state.highScore).toBe(250);

    state.reset();
    expect(state.score).toBe(0);
    expect(state.highScore).toBe(250);
  });
});
