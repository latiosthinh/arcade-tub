import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameState } from '../src/GameState.js';

describe('GameState', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('initializes in ready status with 60s timer and 3 shields', () => {
    const state = new GameState();
    expect(state.status).toBe('ready');
    expect(state.roundDuration).toBe(60);
    expect(state.timeRemaining).toBe(60);
    expect(state.shields).toBe(3);
    expect(state.maxShields).toBe(3);
    expect(state.score).toBe(0);
    expect(state.wordsDestroyed).toBe(0);
    expect(state.gameOverReason).toBeNull();
  });

  it('start() transitions to playing and resets counters', () => {
    const state = new GameState();
    state.start();
    expect(state.status).toBe('playing');
    expect(state.timeRemaining).toBe(60);
    expect(state.shields).toBe(3);
    expect(state.score).toBe(0);
    expect(state.wordsDestroyed).toBe(0);
    expect(state.gameOverReason).toBeNull();
  });

  it('update(dt) decays round timer and triggers time_up game over at 0', () => {
    const state = new GameState();
    state.start();
    state.update(30);
    expect(state.timeRemaining).toBe(30);
    expect(state.status).toBe('playing');

    state.update(35);
    expect(state.timeRemaining).toBe(0);
    expect(state.status).toBe('gameover');
    expect(state.gameOverReason).toBe('time_up');
  });

  it('damageShield() reduces shields and triggers shields_breached game over at 0', () => {
    const state = new GameState();
    state.start();

    state.damageShield(1);
    expect(state.shields).toBe(2);
    expect(state.status).toBe('playing');

    state.damageShield(2);
    expect(state.shields).toBe(0);
    expect(state.status).toBe('gameover');
    expect(state.gameOverReason).toBe('shields_breached');
  });

  it('addScore() increases score, increments wordsDestroyed, and tracks high score', () => {
    const state = new GameState();
    state.start();

    state.addScore(500);
    expect(state.score).toBe(500);
    expect(state.wordsDestroyed).toBe(1);
    expect(state.highScore).toBe(500);

    state.addScore(250);
    expect(state.score).toBe(750);
    expect(state.wordsDestroyed).toBe(2);
    expect(state.highScore).toBe(750);
  });

  it('triggerGameOver() saves high score and sets gameover status', () => {
    const state = new GameState();
    state.start();
    state.addScore(1200);
    state.triggerGameOver('shields_breached');

    expect(state.status).toBe('gameover');
    expect(state.gameOverReason).toBe('shields_breached');

    // Reload new state from storage
    const nextState = new GameState();
    expect(nextState.highScore).toBe(1200);
  });

  it('pause() and resume() toggle playing/paused state and restart() resets', () => {
    const state = new GameState();
    state.start();
    state.pause();
    expect(state.status).toBe('paused');

    state.update(10);
    expect(state.timeRemaining).toBe(60);

    state.resume();
    expect(state.status).toBe('playing');

    state.update(5);
    expect(state.timeRemaining).toBe(55);

    state.restart();
    expect(state.status).toBe('playing');
    expect(state.timeRemaining).toBe(60);
  });
});
