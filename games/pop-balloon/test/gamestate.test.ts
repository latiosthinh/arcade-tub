import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameState } from '../src/GameState';
import { Balloon } from '../src/Balloon';
import { PopResult } from '../src/PopEngine';
import * as playablesAdapter from '@arcade-carnival/playables-adapter';

vi.mock('@arcade-carnival/playables-adapter', () => ({
  saveData: vi.fn(),
  loadData: vi.fn().mockReturnValue(null),
  reportScore: vi.fn(),
}));

describe('GameState', () => {
  let state: GameState;

  beforeEach(() => {
    vi.clearAllMocks();
    state = new GameState();
  });

  it('initializes with ready status and 60s round duration', () => {
    expect(state.status).toBe('ready');
    expect(state.timeRemaining).toBe(60);
    expect(state.score).toBe(0);
    expect(state.highScore).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.maxStreak).toBe(0);
  });

  it('starts round and ticks down time', () => {
    state.start();
    expect(state.status).toBe('playing');

    state.update(1.5);
    expect(state.timeRemaining).toBeCloseTo(58.5, 2);
  });

  it('ends game when timer reaches 0 and saves high score', () => {
    state.start();
    state.recordPop({
      balloon: new Balloon('b1', 'cyan', 100, 100),
      pointsAwarded: 500,
      streak: 3,
      multiplier: 2.0,
      isBomb: false,
      isRainbow: false,
    });

    expect(state.score).toBe(500);

    state.update(60.0);
    expect(state.timeRemaining).toBe(0);
    expect(state.status).toBe('gameover');
    expect(state.highScore).toBe(500);

    expect(playablesAdapter.saveData).toHaveBeenCalledWith('pop-balloon-highscore', '500');
    expect(playablesAdapter.reportScore).toHaveBeenCalledWith(500);
  });

  it('applies bomb score and time penalties', () => {
    state.start();
    state.recordPop({
      balloon: new Balloon('b1', 'cyan', 100, 100),
      pointsAwarded: 500,
      streak: 1,
      multiplier: 1.0,
      isBomb: false,
      isRainbow: false,
    });

    state.recordPop({
      balloon: new Balloon('b2', 'bomb', 100, 100),
      pointsAwarded: -300,
      streak: 0,
      multiplier: 1.0,
      isBomb: true,
      isRainbow: false,
    });

    expect(state.score).toBe(200); // 500 - 300
    expect(state.bombsHit).toBe(1);
    expect(state.timeRemaining).toBe(55); // 60s - 5s bomb penalty
  });

  it('handles pause, resume, and restart cycles', () => {
    state.start();
    state.pause();
    expect(state.status).toBe('paused');

    state.update(5.0);
    expect(state.timeRemaining).toBe(60); // doesn't decrement while paused

    state.resume();
    expect(state.status).toBe('playing');
    state.update(1.0);
    expect(state.timeRemaining).toBe(59);

    state.restart();
    expect(state.status).toBe('playing');
    expect(state.timeRemaining).toBe(60);
    expect(state.score).toBe(0);
  });
});
