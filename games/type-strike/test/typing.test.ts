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

  describe('Arrows Mode', () => {
    it('normalizes Arrow keys and WASD inputs correctly', () => {
      engine.setMode('arrows');

      expect(engine.normalizeKey('ArrowUp')).toBe('U');
      expect(engine.normalizeKey('ArrowDown')).toBe('D');
      expect(engine.normalizeKey('ArrowLeft')).toBe('L');
      expect(engine.normalizeKey('ArrowRight')).toBe('R');

      expect(engine.normalizeKey('w')).toBe('U');
      expect(engine.normalizeKey('W')).toBe('U');
      expect(engine.normalizeKey('s')).toBe('D');
      expect(engine.normalizeKey('S')).toBe('D');
      expect(engine.normalizeKey('a')).toBe('L');
      expect(engine.normalizeKey('A')).toBe('L');
      expect(engine.normalizeKey('d')).toBe('R');
      expect(engine.normalizeKey('D')).toBe('R');

      expect(engine.normalizeKey('q')).toBeNull();
      expect(engine.normalizeKey('Enter')).toBeNull();
    });

    it('ignores regular letters in arrows mode and ignores arrow keys in words mode', () => {
      const enemyWords = new Enemy({
        id: 'e1',
        word: 'UP',
        tier: 'short',
        basePoints: 100,
        lane: 0
      });
      // Words mode -> ArrowUp ignored
      const resWords = engine.handleKey('ArrowUp', [enemyWords]);
      expect(resWords.status).toBe('ignored');

      engine.setMode('arrows');
      const enemyArrows = new Enemy({
        id: 'e2',
        word: 'UDLR',
        tier: 'short',
        basePoints: 100,
        lane: 0,
        mode: 'arrows'
      });
      // Arrows mode -> 'x' ignored
      const resArrows = engine.handleKey('x', [enemyArrows]);
      expect(resArrows.status).toBe('ignored');
    });

    it('locks onto closest matching arrow sequence and advances', () => {
      engine.setMode('arrows');

      const enemyFar = new Enemy({
        id: 'e-far',
        word: 'UDLR',
        tier: 'short',
        basePoints: 100,
        lane: 0,
        mode: 'arrows',
        x: 700
      });
      const enemyNear = new Enemy({
        id: 'e-near',
        word: 'UUDD',
        tier: 'short',
        basePoints: 100,
        lane: 1,
        mode: 'arrows',
        x: 350
      });

      // Press ArrowUp
      const res1 = engine.handleKey('ArrowUp', [enemyFar, enemyNear]);
      expect(res1.status).toBe('locked');
      expect(res1.targetId).toBe('e-near');
      expect(res1.matchedLetter).toBe('U');
      expect(enemyNear.matchedIndex).toBe(1);

      // Press 'w' (WASD equivalent of Up)
      const res2 = engine.handleKey('w', [enemyFar, enemyNear]);
      expect(res2.status).toBe('progress');
      expect(res2.targetId).toBe('e-near');
      expect(enemyNear.matchedIndex).toBe(2);

      // Press ArrowDown
      const res3 = engine.handleKey('ArrowDown', [enemyFar, enemyNear]);
      expect(res3.status).toBe('progress');
      expect(enemyNear.matchedIndex).toBe(3);

      // Press 's' (WASD equivalent of Down)
      const res4 = engine.handleKey('s', [enemyFar, enemyNear]);
      expect(res4.status).toBe('completed');
      expect(res4.targetId).toBe('e-near');
      expect(enemyNear.alive).toBe(false);
      expect(engine.getStreak()).toBe(1);
      expect(engine.getMultiplier()).toBe(2);
      expect(engine.getActiveTarget()).toBeNull();
    });

    it('triggers typo penalty in arrows mode on wrong directional input', () => {
      engine.setMode('arrows');

      const enemy = new Enemy({
        id: 'e1',
        word: 'UDLR',
        tier: 'short',
        basePoints: 100,
        lane: 0,
        mode: 'arrows'
      });

      engine.handleKey('ArrowUp', [enemy]); // 'U' match
      expect(enemy.matchedIndex).toBe(1);

      const typoRes = engine.handleKey('ArrowLeft', [enemy]); // Expected 'D', received 'L'
      expect(typoRes.status).toBe('typo');
      expect(typoRes.targetId).toBe('e1');
      expect(enemy.matchedIndex).toBe(0);
      expect(engine.getActiveTarget()).toBeNull();
      expect(engine.getStreak()).toBe(0);
      expect(engine.getMultiplier()).toBe(1);
    });

    it('resets cleanly when switching mode', () => {
      const enemy = new Enemy({
        id: 'e1',
        word: 'NODE',
        tier: 'short',
        basePoints: 100,
        lane: 0
      });

      engine.handleKey('N', [enemy]);
      expect(engine.getActiveTarget()).toBe(enemy);

      engine.setMode('arrows');
      expect(engine.mode).toBe('arrows');
      expect(engine.getActiveTarget()).toBeNull();
      expect(engine.getStreak()).toBe(0);
    });
  });
});
