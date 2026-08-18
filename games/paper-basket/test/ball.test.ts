import { describe, it, expect, beforeEach } from 'vitest';
import { Ball } from '../src/Ball';

describe('Ball Physics', () => {
  let ball: Ball;

  beforeEach(() => {
    ball = new Ball(200, 300);
  });

  it('initializes with correct starting position and parameters', () => {
    expect(ball.x).toBe(200);
    expect(ball.y).toBe(300);
    expect(ball.vx).toBe(0);
    expect(ball.vy).toBe(0);
    expect(ball.radius).toBe(18);
    expect(ball.rotation).toBe(0);
  });

  it('applies upward and forward impulse on flap', () => {
    ball.flap(true);
    expect(ball.vy).toBe(Ball.JUMP_IMPULSE_Y);
    expect(ball.vx).toBe(Ball.JUMP_IMPULSE_X);
    expect(ball.vRot).toBeGreaterThan(0);

    ball.flap(false);
    expect(ball.vy).toBe(Ball.JUMP_IMPULSE_Y);
    expect(ball.vx).toBe(-Ball.JUMP_IMPULSE_X);
    expect(ball.vRot).toBeLessThan(0);
  });

  it('applies gravity and integrates movement over time', () => {
    ball.update(0.1, 800, 600);
    expect(ball.vy).toBeCloseTo(Ball.GRAVITY * 0.1, 1);
    expect(ball.y).toBeGreaterThan(300);
  });

  it('bounces off left and right canvas walls', () => {
    ball.x = 5;
    ball.vx = -100;
    ball.update(0.01, 800, 600);
    expect(ball.x).toBe(ball.radius);
    expect(ball.vx).toBeGreaterThan(0);

    ball.x = 795;
    ball.vx = 100;
    ball.update(0.01, 800, 600);
    expect(ball.x).toBe(800 - ball.radius);
    expect(ball.vx).toBeLessThan(0);
  });

  it('detects floor collision', () => {
    ball.y = 590;
    const res = ball.update(0.01, 800, 600);
    expect(res.hitFloor).toBe(true);
  });

  it('resets correctly to initial coordinates', () => {
    ball.vx = 100;
    ball.vy = -200;
    ball.rotation = 2.5;
    ball.reset(200, 300);

    expect(ball.x).toBe(200);
    expect(ball.y).toBe(300);
    expect(ball.vx).toBe(0);
    expect(ball.vy).toBe(0);
    expect(ball.rotation).toBe(0);
  });
});
