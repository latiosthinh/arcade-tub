import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameState } from '../src/GameState';
import * as adapter from '@arcade-carnival/playables-adapter';

vi.mock('@arcade-carnival/playables-adapter', () => ({
  loadData: vi.fn(),
  saveData: vi.fn(),
  reportScore: vi.fn(),
}));

describe('GameState', () => {
  let state: GameState;

  beforeEach(() => {
    vi.clearAllMocks();
    state = new GameState();
  });

  it('starts with ready status and 0 initial metrics', () => {
    expect(state.status).toBe('ready');
    expect(state.score).toBe(0);
    expect(state.distance).toBe(0);
    expect(state.carsDodged).toBe(0);
  });

  it('transitions through game lifecycle (start, pause, resume, endGame)', () => {
    state.startGame();
    expect(state.status).toBe('playing');

    state.pause();
    expect(state.status).toBe('paused');

    state.resume();
    expect(state.status).toBe('playing');

    state.endGame();
    expect(state.status).toBe('gameover');
  });

  it('accumulates distance and calculates speed multiplier and drafting score', () => {
    state.startGame();
    // 180 km/h = 50 m/s. Over 2 seconds -> +100m
    state.update(2.0, 180, false);
    expect(state.distance).toBeCloseTo(100, 1);
    expect(state.score).toBeGreaterThan(0);
    expect(state.speedMultiplier).toBeGreaterThan(1.0);

    const prevScore = state.score;
    // Update while drafting (2x multiplier)
    state.update(2.0, 180, true);
    expect(state.draftTime).toBe(2.0);
    expect(state.score - prevScore).toBeGreaterThan(prevScore);
  });

  it('increments dodged cars and applies bonus score', () => {
    state.startGame();
    state.speedMultiplier = 2.0;
    const initialScore = state.score;
    state.addDodgedCar(2);

    expect(state.carsDodged).toBe(2);
    expect(state.score).toBe(initialScore + 2 * Math.floor(25 * 2.0));
  });

  it('saves high score via playables adapter on game over when score is higher', () => {
    state.startGame();
    state.score = 5400;
    state.endGame();

    expect(state.highScore).toBe(5400);
    expect(adapter.saveData).toHaveBeenCalledWith(
      'arcade-carnival-car-race-highscore',
      '5400'
    );
    expect(adapter.reportScore).toHaveBeenCalledWith(5400);
  });

  it('sanitizes and handles corrupted or missing high score safely', () => {
    vi.mocked(adapter.loadData).mockReturnValue('invalid-corrupted-json');
    state.loadHighScore();
    expect(state.highScore).toBe(0);
  });
});
