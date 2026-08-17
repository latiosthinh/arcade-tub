import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as adapter from '@arcade-carnival/playables-adapter';
import { GameState } from '../src/GameState';

describe('GameState', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('initializes with score = 0, lives = 3, level = 1, status = ready or playing on start', () => {
    const state = new GameState();
    expect(state.score).toBe(0);
    expect(state.lives).toBe(3);
    expect(state.level).toBe(1);
    expect(state.status).toBe('ready');

    state.start();
    expect(state.status).toBe('playing');
  });

  it('increments score and updates high score', () => {
    const state = new GameState();
    state.start();
    state.addScore(100);
    expect(state.score).toBe(100);
    expect(state.highScore).toBe(100);

    state.addScore(50);
    expect(state.score).toBe(150);
    expect(state.highScore).toBe(150);
  });

  it('adds lives up to maxLives (5)', () => {
    const state = new GameState();
    state.start();
    expect(state.lives).toBe(3);

    state.addLife();
    expect(state.lives).toBe(4);

    state.addLife();
    expect(state.lives).toBe(5);

    state.addLife();
    expect(state.lives).toBe(5);
  });

  it('loses lives and transitions to gameover when lives reach 0, saving data and reporting score', () => {
    const saveSpy = vi.spyOn(adapter, 'saveData');
    const reportSpy = vi.spyOn(adapter, 'reportScore');

    const state = new GameState();
    state.start();
    state.addScore(250);

    state.loseLife();
    expect(state.lives).toBe(2);
    expect(state.status).toBe('playing');

    state.loseLife();
    expect(state.lives).toBe(1);
    expect(state.status).toBe('playing');

    state.loseLife();
    expect(state.lives).toBe(0);
    expect(state.status).toBe('gameover');

    expect(saveSpy).toHaveBeenCalledWith('brick-blitz-highscore', '250');
    expect(reportSpy).toHaveBeenCalledWith(250);
  });

  it('completeLevel awards +500 points and increments level counter', () => {
    const state = new GameState();
    state.start();
    state.addScore(100);
    state.completeLevel();

    expect(state.score).toBe(600);
    expect(state.level).toBe(2);
    expect(state.lives).toBe(3);
  });

  it('pause and resume toggle status when playing/paused', () => {
    const state = new GameState();
    state.start();
    expect(state.status).toBe('playing');

    state.pause();
    expect(state.status).toBe('paused');

    state.resume();
    expect(state.status).toBe('playing');
  });

  it('restarts game state cleanly', () => {
    const state = new GameState();
    state.start();
    state.addScore(300);
    state.loseLife();
    state.loseLife();
    state.loseLife();
    expect(state.status).toBe('gameover');

    state.restart();
    expect(state.score).toBe(0);
    expect(state.lives).toBe(3);
    expect(state.level).toBe(1);
    expect(state.status).toBe('playing');
    expect(state.highScore).toBe(300);
  });

  it('loads saved high score on construction', () => {
    vi.spyOn(adapter, 'loadData').mockReturnValue('999');
    const state = new GameState();
    expect(state.highScore).toBe(999);
  });
});
