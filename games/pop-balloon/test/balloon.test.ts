import { describe, it, expect, beforeEach } from 'vitest';
import { Balloon, BALLOON_CONFIGS, BalloonType } from '../src/Balloon';

describe('Balloon model', () => {
  it('initializes with default configs per type', () => {
    const cyan = new Balloon('b1', 'cyan', 100, 500);
    expect(cyan.type).toBe('cyan');
    expect(cyan.points).toBe(100);
    expect(cyan.radius).toBe(BALLOON_CONFIGS.cyan.radius);
    expect(cyan.isAlive).toBe(true);
    expect(cyan.popped).toBe(false);
    expect(cyan.escaped).toBe(false);

    const bomb = new Balloon('b2', 'bomb', 200, 500);
    expect(bomb.type).toBe('bomb');
    expect(bomb.points).toBe(BALLOON_CONFIGS.bomb.basePoints);
  });

  it('updates position ascending upwards with sine wobble', () => {
    const b = new Balloon('b1', 'pink', 200, 400, {
      speedY: 100,
      wobbleSpeed: 2,
      wobbleAmp: 15,
      wobblePhase: 0,
    });

    const initialX = b.x;
    const initialY = b.y;

    b.update(0.5); // dt = 0.5s

    // y moves upwards (decreases)
    expect(b.y).toBe(initialY - 100 * 0.5);
    // x oscillates around baseX
    expect(b.x).toBeCloseTo(200 + Math.sin(0.5 * 2) * 15, 4);
    expect(b.baseX).toBe(200);
  });

  it('detects point collisions accurately with generous radius margin', () => {
    const b = new Balloon('b1', 'yellow', 100, 100, { radius: 25 });
    // Inside center
    expect(b.containsPoint(100, 100)).toBe(true);
    // On edge / within forgiving hitbox (1.1 * 25 = 27.5)
    expect(b.containsPoint(126, 100)).toBe(true);
    // Outside boundary
    expect(b.containsPoint(135, 100)).toBe(false);
    expect(b.containsPoint(100, 135)).toBe(false);
  });

  it('handles pop and escape states', () => {
    const b = new Balloon('b1', 'rainbow', 100, 100);
    expect(b.isAlive).toBe(true);

    b.pop();
    expect(b.popped).toBe(true);
    expect(b.isAlive).toBe(false);
    expect(b.containsPoint(100, 100)).toBe(false);

    const b2 = new Balloon('b2', 'cyan', 100, -100);
    b2.markEscaped();
    expect(b2.escaped).toBe(true);
    expect(b2.isAlive).toBe(false);
  });
});
