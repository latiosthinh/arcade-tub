import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameState } from '../src/GameState';

describe('GameState', () => {
  let gameState: GameState;

  beforeEach(() => {
    // Clear localStorage mockup
    localStorage.clear();
    gameState = new GameState();
  });

  it('initializes with default ready state, zero score and none medal', () => {
    expect(gameState.status).toBe('ready');
    expect(gameState.score).toBe(0);
    expect(gameState.pearls).toBe(0);
    expect(gameState.totalScore).toBe(0);
    expect(gameState.medal).toBe('none');
    expect(gameState.highScore).toBe(0);
  });

  it('transitions through status lifecycle states', () => {
    expect(gameState.status).toBe('ready');
    gameState.start();
    expect(gameState.status).toBe('playing');

    gameState.pause();
    expect(gameState.status).toBe('paused');

    gameState.resume();
    expect(gameState.status).toBe('playing');

    gameState.gameOver();
    expect(gameState.status).toBe('gameover');
  });

  it('increments score and calculates total score correctly with pearl multipliers', () => {
    gameState.start();
    gameState.addScore(5);
    expect(gameState.score).toBe(5);
    expect(gameState.pearls).toBe(0);
    expect(gameState.totalScore).toBe(5);

    gameState.addPearls(2); // 2 pearls * 3 pts each = 6 bonus
    expect(gameState.pearls).toBe(2);
    expect(gameState.totalScore).toBe(11);
  });

  it('calculates correct medal tier based on total score', () => {
    gameState.start();
    gameState.addScore(8);
    gameState.gameOver();
    expect(gameState.medal).toBe('none');

    gameState.reset();
    gameState.start();
    gameState.addScore(10); // >= 10
    gameState.gameOver();
    expect(gameState.medal).toBe('bronze');

    gameState.reset();
    gameState.start();
    gameState.addScore(25); // >= 25
    gameState.gameOver();
    expect(gameState.medal).toBe('silver');

    gameState.reset();
    gameState.start();
    gameState.addScore(50); // >= 50
    gameState.gameOver();
    expect(gameState.medal).toBe('gold');

    gameState.reset();
    gameState.start();
    gameState.addScore(100); // >= 100
    gameState.gameOver();
    expect(gameState.medal).toBe('platinum');
  });

  it('persists and reports high score on game over', () => {
    gameState.start();
    gameState.addScore(30);
    gameState.gameOver();

    expect(gameState.highScore).toBe(30);
    expect(localStorage.getItem('arcade-carnival-flappy-fish-highscore')).toBe('30');

    // Subsequent lower score should not lower high score
    gameState.reset();
    gameState.start();
    gameState.addScore(15);
    gameState.gameOver();

    expect(gameState.highScore).toBe(30);
  });

  it('gracefully handles corrupt or NaN saved data', () => {
    localStorage.setItem('arcade-carnival-flappy-fish-highscore', 'invalid-nan-data');
    const newState = new GameState();
    expect(newState.highScore).toBe(0);
  });
});
