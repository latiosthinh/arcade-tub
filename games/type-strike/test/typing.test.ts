import { describe, it, expect, beforeEach } from 'vitest';
import { TypingEngine, TypingResult } from '../src/TypingEngine.js';
import { Enemy } from '../src/Enemy.js';

describe('TypingEngine', () => {
  let engine: TypingEngine;

  beforeEach(() => {
    engine = new TypingEngine();
  });

  it('initializes with default state: no target, 0 streak, 1x multiplier', () => {
    expect(engine.getActiveTarget()).toBeNull();
    expect(engine.getStreak()).toBe(0);
    expect(engine.getMultiplier()).toBe(1);
    expect(engine.totalWordsCompleted).toBe(0);
    expect(engine.totalTypos).toBe(0);
  });

  it('ignores non-alpha keys without changing state', () => {
    const enemy = new Enemy({
      id: 'e1',
      word: 'NODE',
      tier: 'short',
      basePoints: 100,
      lane: 0
    });

    const res1 = engine.handleKey('Shift', [enemy]);
    expect(res1.status).toBe('ignored');
    expect(res1.targetId).toBeNull();
    expect(engine.getActiveTarget()).toBeNull();

    const res2 = engine.handleKey('1', [enemy]);
    expect(res2.status).toBe('ignored');
    expect(res2.targetId).toBeNull();
  });

  it('locks onto closest matching enemy when no target is active', () => {
    const enemyFar = new Enemy({
      id: 'e-far',
      word: 'NODE',
      tier: 'short',
      basePoints: 100,
      lane: 0,
      x: 700
    });
    const enemyNear = new Enemy({
      id: 'e-near',
      word: 'NETWORK',
      tier: 'medium',
      basePoints: 250,
      lane: 1,
      x: 350
    });

    const res = engine.handleKey('n', [enemyFar, enemyNear]);
    expect(res.status).toBe('locked');
    expect(res.targetId).toBe('e-near');
    expect(res.matchedLetter).toBe('N');
    expect(engine.getActiveTarget()).toBe(enemyNear);
    expect(enemyNear.matchedIndex).toBe(1);
    expect(enemyFar.matchedIndex).toBe(0);
  });

  it('advances prefix on matching subsequent letters', () => {
    const enemy = new Enemy({
      id: 'e1',
      word: 'CHIP',
      tier: 'short',
      basePoints: 100,
      lane: 0
    });

    engine.handleKey('C', [enemy]);
    expect(enemy.matchedIndex).toBe(1);

    const res = engine.handleKey('H', [enemy]);
    expect(res.status).toBe('progress');
    expect(res.targetId).toBe('e1');
    expect(res.matchedLetter).toBe('H');
    expect(enemy.matchedIndex).toBe(2);
  });

  it('destroys enemy, increments streak and multiplier, and awards points on completion', () => {
    const enemy = new Enemy({
      id: 'e1',
      word: 'RAM',
      tier: 'short',
      basePoints: 100,
      lane: 0
    });

    engine.handleKey('R', [enemy]);
    engine.handleKey('A', [enemy]);
    const res = engine.handleKey('M', [enemy]);

    expect(res.status).toBe('completed');
    expect(res.targetId).toBe('e1');
    expect(res.completedWord).toBe('RAM');
    expect(res.pointsEarned).toBe(200); // basePoints 100 * multiplier 2 (1 + streak 1)
    expect(res.multiplier).toBe(2);
    expect(res.streak).toBe(1);
    expect(enemy.alive).toBe(false);
    expect(engine.getActiveTarget()).toBeNull();
    expect(engine.totalWordsCompleted).toBe(1);
  });

  it('scales multiplier up to max 8x with consecutive words', () => {
    for (let i = 0; i < 10; i++) {
      const enemy = new Enemy({
        id: `e-${i}`,
        word: 'KEY',
        tier: 'short',
        basePoints: 100,
        lane: 0
      });
      engine.handleKey('K', [enemy]);
      engine.handleKey('E', [enemy]);
      const res = engine.handleKey('Y', [enemy]);
      expect(res.status).toBe('completed');
    }

    expect(engine.getStreak()).toBe(10);
    expect(engine.getMultiplier()).toBe(8); // Capped at 8
  });

  it('resets target progress, clears target, and resets streak/multiplier to 1x on typo', () => {
    // First build a streak of 1
    const enemy1 = new Enemy({
      id: 'e1',
      word: 'BOT',
      tier: 'short',
      basePoints: 100,
      lane: 0
    });
    engine.handleKey('B', [enemy1]);
    engine.handleKey('O', [enemy1]);
    engine.handleKey('T', [enemy1]);
    expect(engine.getMultiplier()).toBe(2);
    expect(engine.getStreak()).toBe(1);

    // Target a second enemy and make a typo
    const enemy2 = new Enemy({
      id: 'e2',
      word: 'LASER',
      tier: 'medium',
      basePoints: 250,
      lane: 1
    });
    engine.handleKey('L', [enemy2]);
    expect(enemy2.matchedIndex).toBe(1);

    const typoRes = engine.handleKey('X', [enemy2]);
    expect(typoRes.status).toBe('typo');
    expect(typoRes.targetId).toBe('e2');
    expect(typoRes.multiplier).toBe(1);
    expect(typoRes.streak).toBe(0);
    expect(enemy2.matchedIndex).toBe(0);
    expect(engine.getActiveTarget()).toBeNull();
    expect(engine.totalTypos).toBe(1);
  });

  it('handles unmatched first key when no target is locked', () => {
    const enemy = new Enemy({
      id: 'e1',
      word: 'SYNC',
      tier: 'short',
      basePoints: 100,
      lane: 0
    });

    const res = engine.handleKey('Z', [enemy]);
    expect(res.status).toBe('typo');
    expect(res.targetId).toBeNull();
    expect(engine.getActiveTarget()).toBeNull();
  });

  it('handles handleTargetLost() to reset state on external enemy death/breach', () => {
    const enemy = new Enemy({
      id: 'e1',
      word: 'CORE',
      tier: 'short',
      basePoints: 100,
      lane: 0
    });

    engine.handleKey('C', [enemy]);
    expect(engine.getActiveTarget()).toBe(enemy);
    expect(enemy.matchedIndex).toBe(1);

    engine.handleTargetLost('e1');
    expect(engine.getActiveTarget()).toBeNull();
    expect(enemy.matchedIndex).toBe(0);
    expect(engine.getStreak()).toBe(0);
    expect(engine.getMultiplier()).toBe(1);
  });
});
