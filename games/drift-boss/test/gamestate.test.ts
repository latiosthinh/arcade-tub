import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameState } from '../src/GameState.js';

describe('GameState', () => {
  let state: GameState;
  const mockStorage: Record<string, string> = {};

  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => mockStorage[k] || null,
      setItem: (k: string, v: string) => { mockStorage[k] = v; },
      removeItem: (k: string) => { delete mockStorage[k]; },
      clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
    });
    localStorage.clear();
    state = new GameState();
  });

  it('initializes with ready status, 0 score, and loads high scores safely', () => {
    expect(state.status).toBe('ready');
    expect(state.score).toBe(0);
    expect(state.coins).toBe(0);
    expect(state.highScore).toBe(0);
  });

  it('mitigates malformed localStorage tamperings', () => {
    localStorage.setItem('drift_boss_highscore', 'MALFORMED_NaN');
    localStorage.setItem('drift_boss_coins', '-500');
    const newState = new GameState();
    expect(newState.highScore).toBe(0);
    expect(newState.totalCoins).toBe(0);
  });

  it('updates score based on distance and applies combo multiplier', () => {
    state.start();
    expect(state.status).toBe('playing');

    state.addScore(10);
    expect(state.score).toBe(10);

    state.increaseMultiplier(0.5);
    state.addScore(10);
    expect(state.score).toBe(25); // 10 + 10 * 1.5
  });

  it('collects coins and updates persistent coin balance', () => {
    state.start();
    state.collectCoin(5);
    expect(state.coins).toBe(5);
    expect(state.totalCoins).toBe(5);

    state.gameOver();
    expect(state.status).toBe('gameover');
    expect(Number(localStorage.getItem('drift_boss_total_coins'))).toBe(5);
  });

  it('saves new high score on game over', () => {
    state.start();
    state.addScore(100);
    state.gameOver();
    expect(state.highScore).toBe(100);
    expect(Number(localStorage.getItem('drift_boss_highscore'))).toBe(100);
  });
});
