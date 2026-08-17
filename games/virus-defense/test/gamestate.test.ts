import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../src/GameState';

describe('GameState', () => {
  let gameState: GameState;

  beforeEach(() => {
    localStorage.clear();
    gameState = new GameState();
  });

  it('initializes in ready state with zero scores and 1x multiplier', () => {
    expect(gameState.status).toBe('ready');
    expect(gameState.score).toBe(0);
    expect(gameState.wave).toBe(1);
    expect(gameState.combo).toBe(0);
    expect(gameState.multiplier).toBe(1);
    expect(gameState.virusesDestroyed).toBe(0);
    expect(gameState.accuracyShotsFired).toBe(0);
    expect(gameState.accuracyHits).toBe(0);
  });

  it('starts game and transitions to playing', () => {
    gameState.start();
    expect(gameState.status).toBe('playing');
  });

  it('increments score, combo, and multiplier on hit', () => {
    gameState.start();
    gameState.recordShot();
    gameState.recordHit(100);

    expect(gameState.score).toBe(100);
    expect(gameState.combo).toBe(1);
    expect(gameState.multiplier).toBe(1);
    expect(gameState.accuracyShotsFired).toBe(1);
    expect(gameState.accuracyHits).toBe(1);

    // Chaining hits within combo window increases multiplier up to 5x
    for (let i = 0; i < 5; i++) {
      gameState.recordShot();
      gameState.recordHit(100);
    }
    expect(gameState.combo).toBe(6);
    expect(gameState.multiplier).toBeGreaterThanOrEqual(2);
  });

  it('resets combo when combo timer expires', () => {
    gameState.start();
    gameState.recordShot();
    gameState.recordHit(100);
    expect(gameState.combo).toBe(1);

    // Step 2.0s (> 1.5s combo window)
    gameState.update(2.0);
    expect(gameState.combo).toBe(0);
    expect(gameState.multiplier).toBe(1);
  });

  it('awards wave clear bonus on completing wave', () => {
    gameState.start();
    gameState.completeWave();
    expect(gameState.score).toBe(500);
    expect(gameState.wave).toBe(2);
  });

  it('handles game over and persists high score', () => {
    gameState.start();
    gameState.recordShot();
    gameState.recordHit(500);

    gameState.gameOver();
    expect(gameState.status).toBe('gameover');
    expect(gameState.highScore).toBe(500);

    // Starting new game retains high score
    const newGame = new GameState();
    expect(newGame.highScore).toBe(500);
  });

  it('handles pause and resume toggle', () => {
    gameState.start();
    gameState.togglePause();
    expect(gameState.status).toBe('paused');

    gameState.togglePause();
    expect(gameState.status).toBe('playing');
  });

  it('calculates accuracy percentage safely (no NaN on 0 shots)', () => {
    expect(gameState.accuracyPercentage).toBe(0);

    gameState.start();
    gameState.recordShot();
    gameState.recordShot();
    gameState.recordHit(100);
    expect(gameState.accuracyPercentage).toBe(50);
  });
});
