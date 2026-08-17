import { describe, it, expect, beforeEach } from 'vitest';
import { Ball } from '../src/Ball';

describe('Ball', () => {
  let ball: Ball;

  beforeEach(() => {
    ball = new Ball();
  });

  it('initializes attached to paddle', () => {
    ball.reset(350, 100, 550);
    expect(ball.x).toBe(400);
    expect(ball.y).toBe(550 - ball.radius);
    expect(ball.vx).toBe(0);
    expect(ball.vy).toBe(0);
    expect(ball.launched).toBe(false);
    expect(ball.trail).toEqual([]);
  });

  it('tracks paddle position when not launched', () => {
    ball.reset(350, 100, 550);
    ball.update(0.016, 200, 100, 550);
    expect(ball.x).toBe(250);
    expect(ball.y).toBe(550 - ball.radius);
  });

  it('sets launch velocity given angle and speed', () => {
    ball.launch(0, 400);
    expect(ball.launched).toBe(true);
    expect(ball.vx).toBeCloseTo(0);
    expect(ball.vy).toBeCloseTo(-400);

    ball.launch(Math.PI / 4, 400);
    expect(ball.vx).toBeCloseTo(400 * Math.sin(Math.PI / 4));
    expect(ball.vy).toBeCloseTo(-400 * Math.cos(Math.PI / 4));
  });

  it('advances position and records trail when launched', () => {
    ball.reset(350, 100, 550);
    ball.launch(0, 400);
    const startX = ball.x;
    const startY = ball.y;

    ball.update(0.05); // 0.05s at vy = -400 -> y decreases by 20
    expect(ball.x).toBeCloseTo(startX);
    expect(ball.y).toBeCloseTo(startY - 20);
    expect(ball.trail.length).toBe(1);
    expect(ball.trail[0]).toEqual({ x: startX, y: startY });

    for (let i = 0; i < 10; i++) {
      ball.update(0.01);
    }
    expect(ball.trail.length).toBe(ball.maxTrailLength);
  });

  it('handles left, right, and top wall collisions and bottom loss', () => {
    ball.reset(350, 100, 550);
    ball.launch(0, 400);

    // Left wall bounce
    ball.x = ball.radius - 2;
    ball.vx = -200;
    const leftRes = ball.checkWallCollisions(800, 600);
    expect(leftRes.bounced).toBe(true);
    expect(leftRes.lost).toBe(false);
    expect(ball.x).toBe(ball.radius);
    expect(ball.vx).toBe(200);

    // Right wall bounce
    ball.x = 800 - ball.radius + 2;
    ball.vx = 200;
    const rightRes = ball.checkWallCollisions(800, 600);
    expect(rightRes.bounced).toBe(true);
    expect(rightRes.lost).toBe(false);
    expect(ball.x).toBe(800 - ball.radius);
    expect(ball.vx).toBe(-200);

    // Top wall bounce
    ball.y = ball.radius - 2;
    ball.vy = -300;
    const topRes = ball.checkWallCollisions(800, 600);
    expect(topRes.bounced).toBe(true);
    expect(topRes.lost).toBe(false);
    expect(ball.y).toBe(ball.radius);
    expect(ball.vy).toBe(300);

    // Bottom loss
    ball.y = 600 + ball.radius + 1;
    const bottomRes = ball.checkWallCollisions(800, 600);
    expect(bottomRes.bounced).toBe(false);
    expect(bottomRes.lost).toBe(true);
  });
});
