import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../src/GameState';

describe('GameState', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = new GameState();
    gameState.reset();
  });

  it('initializes in ready state', () => {
    expect(gameState.status).toBe('ready');
    expect(gameState.score).toBe(0);
    expect(gameState.basketsScored).toBe(0);
    expect(gameState.swishStreak).toBe(0);
  });

  it('starts game correctly', () => {
    expect(gameState.startGame()).toBe(true);
    expect(gameState.status).toBe('playing');
  });

  it('handles pause and resume', () => {
    gameState.startGame();
    expect(gameState.pause()).toBe(true);
    expect(gameState.status).toBe('paused');

    expect(gameState.resume()).toBe(true);
    expect(gameState.status).toBe('playing');
  });

  it('calculates regular vs swish streak scores', () => {
    gameState.startGame();

    // Regular score (no swish)
    const reg = gameState.addScore(false);
    expect(reg.points).toBe(100);
    expect(reg.streak).toBe(0);
    expect(gameState.score).toBe(100);

    // First swish
    const swish1 = gameState.addScore(true);
    expect(swish1.points).toBe(400); // 200 * (1 + 1) = 400
    expect(swish1.streak).toBe(1);
    expect(gameState.score).toBe(500);

    // Second consecutive swish
    const swish2 = gameState.addScore(true);
    expect(swish2.points).toBe(600); // 200 * (1 + 2) = 600
    expect(swish2.streak).toBe(2);
    expect(gameState.score).toBe(1100);
  });

  it('ends game and updates high score', () => {
    gameState.startGame();
    gameState.addScore(false);
    expect(gameState.endGame('floor')).toBe(true);
    expect(gameState.status).toBe('gameover');
    expect(gameState.gameOverReason).toBe('floor');
    expect(gameState.highScore).toBeGreaterThanOrEqual(100);
  });
});
