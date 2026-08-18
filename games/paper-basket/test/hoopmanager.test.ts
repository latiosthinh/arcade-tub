import { describe, it, expect, beforeEach } from 'vitest';
import { HoopManager } from '../src/HoopManager';
import { Ball } from '../src/Ball';

describe('HoopManager', () => {
  let manager: HoopManager;

  beforeEach(() => {
    manager = new HoopManager(800);
  });

  it('creates initial hoop on the right side', () => {
    expect(manager.currentHoop.isRightSide).toBe(true);
    expect(manager.currentHoop.x).toBe(800 - 110);
    expect(manager.currentHoop.scored).toBe(false);
  });

  it('alternates side and scales difficulty after score', () => {
    const ball = new Ball(manager.currentHoop.x, manager.currentHoop.y);
    ball.vy = 100; // falling through hoop

    const scoreResult = manager.checkScore(ball, 800);
    expect(scoreResult.scored).toBe(true);
    expect(manager.hoopScoreCount).toBe(1);
    expect(manager.currentHoop.isRightSide).toBe(false);
    expect(manager.currentHoop.x).toBe(110);
  });

  it('detects rim collision and swish cleanly', () => {
    // 1. Clean swish straight through middle
    const hoop = manager.currentHoop;
    const ballSwish = new Ball(hoop.x, hoop.y);
    ballSwish.vy = 150;
    const resSwish = manager.checkScore(ballSwish, 800);
    expect(resSwish.scored).toBe(true);
    expect(resSwish.isSwish).toBe(true);

    // 2. Score with rim hit
    manager.reset(800);
    const hoop2 = manager.currentHoop;
    const hoopLeft = hoop2.x - hoop2.width / 2;
    // Hit left rim peg
    const ballRim = new Ball(hoopLeft, hoop2.y);
    manager.checkScore(ballRim, 800);

    // Then drop through net
    ballRim.x = hoop2.x;
    ballRim.y = hoop2.y;
    ballRim.vy = 100;
    const resRim = manager.checkScore(ballRim, 800);
    expect(resRim.scored).toBe(true);
    expect(resRim.isSwish).toBe(false);
  });

  it('counts down shot timer and triggers timeout', () => {
    const updateRes = manager.update(7.0, 800);
    expect(updateRes.timeout).toBe(true);
    expect(manager.shotTimeRemaining).toBe(0);
  });

  it('resets manager state', () => {
    manager.hoopScoreCount = 5;
    manager.shotTimeRemaining = 1.0;
    manager.reset(800);

    expect(manager.hoopScoreCount).toBe(0);
    expect(manager.shotTimeRemaining).toBe(6.0);
    expect(manager.currentHoop.isRightSide).toBe(true);
  });
});
