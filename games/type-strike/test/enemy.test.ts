import { describe, it, expect } from 'vitest';
import { Enemy, EnemyConfig } from '../src/Enemy.js';

describe('Enemy', () => {
  it('initializes with default kinematics, dimensions, and alive state', () => {
    const config: EnemyConfig = {
      id: 'drone-1',
      word: 'CYBER',
      tier: 'medium',
      basePoints: 250,
      lane: 1
    };
    const enemy = new Enemy(config);

    expect(enemy.id).toBe('drone-1');
    expect(enemy.word).toBe('CYBER');
    expect(enemy.tier).toBe('medium');
    expect(enemy.basePoints).toBe(250);
    expect(enemy.lane).toBe(1);
    expect(enemy.x).toBe(820);
    expect(enemy.y).toBe(180); // 100 + 1 * 80
    expect(enemy.speed).toBe(45);
    expect(enemy.width).toBe(64);
    expect(enemy.height).toBe(36);
    expect(enemy.alive).toBe(true);
    expect(enemy.matchedIndex).toBe(0);
    expect(enemy.isCompleted()).toBe(false);
  });

  it('updates horizontal position and hover wobble over dt', () => {
    const enemy = new Enemy({
      id: 'drone-2',
      word: 'NODE',
      tier: 'short',
      basePoints: 100,
      lane: 0,
      x: 500,
      speed: 100
    });

    enemy.update(0.5);
    expect(enemy.x).toBe(450); // 500 - 100 * 0.5
    expect(enemy.hoverTime).toBeGreaterThan(0);
  });

  it('detects base shield breach when reaching boundary (x <= 60)', () => {
    const enemy = new Enemy({
      id: 'drone-3',
      word: 'BYTE',
      tier: 'short',
      basePoints: 100,
      lane: 2,
      x: 65,
      speed: 10
    });

    expect(enemy.isBreachingBase()).toBe(false);

    enemy.update(1.0); // x becomes 55 <= 60
    expect(enemy.isBreachingBase()).toBe(true);

    enemy.destroy();
    expect(enemy.isBreachingBase()).toBe(false); // Dead enemy does not breach
  });

  it('handles letter progress, prefix splits, next char, and completion', () => {
    const enemy = new Enemy({
      id: 'drone-4',
      word: 'PING',
      tier: 'short',
      basePoints: 100,
      lane: 0
    });

    expect(enemy.getNextChar()).toBe('P');
    expect(enemy.getMatchedPrefix()).toBe('');
    expect(enemy.getUnmatchedPrefix()).toBe('PING');

    expect(enemy.advanceLetter()).toBe(false); // 'P'
    expect(enemy.matchedIndex).toBe(1);
    expect(enemy.getNextChar()).toBe('I');
    expect(enemy.getMatchedPrefix()).toBe('P');
    expect(enemy.getUnmatchedPrefix()).toBe('ING');

    enemy.advanceLetter(); // 'I'
    enemy.advanceLetter(); // 'N'
    const isCompleted = enemy.advanceLetter(); // 'G'

    expect(isCompleted).toBe(true);
    expect(enemy.isCompleted()).toBe(true);
    expect(enemy.getNextChar()).toBe('');
    expect(enemy.getMatchedPrefix()).toBe('PING');
    expect(enemy.getUnmatchedPrefix()).toBe('');

    enemy.resetProgress();
    expect(enemy.matchedIndex).toBe(0);
    expect(enemy.getMatchedPrefix()).toBe('');
    expect(enemy.getNextChar()).toBe('P');
  });

  it('destroys enemy and returns base points', () => {
    const enemy = new Enemy({
      id: 'drone-5',
      word: 'QUANTUM',
      tier: 'long',
      basePoints: 500,
      lane: 3
    });

    const pts = enemy.destroy();
    expect(pts).toBe(500);
    expect(enemy.alive).toBe(false);
  });
});
