import { describe, it, expect, beforeEach } from 'vitest';
import { Paddle } from '../src/Paddle';
import { Ball } from '../src/Ball';

describe('Paddle', () => {
  let paddle: Paddle;

  beforeEach(() => {
    paddle = new Paddle();
  });

  it('initializes with default values', () => {
    expect(paddle.x).toBe(350);
    expect(paddle.y).toBe(550);
    expect(paddle.width).toBe(100);
    expect(paddle.height).toBe(16);
    expect(paddle.speed).toBe(500);
    expect(paddle.boundsWidth).toBe(800);
  });

  it('moves left and right within boundaries', () => {
    paddle.moveLeft(0.1); // moves left by 50px -> 300
    expect(paddle.x).toBe(300);

    paddle.moveLeft(10.0); // should clamp to 0
    expect(paddle.x).toBe(0);

    paddle.moveRight(0.1); // moves right by 50px -> 50
    expect(paddle.x).toBe(50);

    paddle.moveRight(10.0); // should clamp to 800 - 100 = 700
    expect(paddle.x).toBe(700);
  });

  it('centers paddle on target X clamped within canvas bounds', () => {
    paddle.setPositionX(400); // center is 400 -> x is 350
    expect(paddle.x).toBe(350);

    paddle.setPositionX(0); // center 0 -> x clamped to 0
    expect(paddle.x).toBe(0);

    paddle.setPositionX(900); // center 900 -> x clamped to 700
    expect(paddle.x).toBe(700);
  });

  it('detects ball bounce on paddle top and calculates angular deflection', () => {
    const ball = new Ball();
    ball.reset(350, 100, 550);
    ball.launch(0, 400);
    ball.vy = 400; // moving downward

    // Hit exact center: x = 400, y = 550 - 7
    ball.x = 400;
    ball.y = 550 - ball.radius;
    const bouncedCenter = paddle.checkBallBounce(ball);
    expect(bouncedCenter).toBe(true);
    expect(ball.vx).toBeCloseTo(0);
    expect(ball.vy).toBeCloseTo(-400);
    expect(ball.y).toBe(550 - ball.radius);

    // Hit right edge: x = 450 (offset = 1.0 -> 60 deg = PI/3)
    ball.vy = 400;
    ball.x = 450;
    ball.y = 550;
    const bouncedRight = paddle.checkBallBounce(ball);
    expect(bouncedRight).toBe(true);
    expect(ball.vx).toBeCloseTo(400 * Math.sin(Math.PI / 3));
    expect(ball.vy).toBeCloseTo(-400 * Math.cos(Math.PI / 3));

    // Hit left edge: x = 350 (offset = -1.0 -> -60 deg = -PI/3)
    ball.vx = 0;
    ball.vy = 400;
    ball.x = 350;
    ball.y = 550;
    const bouncedLeft = paddle.checkBallBounce(ball);
    expect(bouncedLeft).toBe(true);
    expect(ball.vx).toBeCloseTo(400 * Math.sin(-Math.PI / 3));
    expect(ball.vy).toBeCloseTo(-400 * Math.cos(-Math.PI / 3));

    // Ball moving upwards should not trigger bounce
    ball.vy = -400;
    ball.x = 400;
    ball.y = 550;
    const bouncedUp = paddle.checkBallBounce(ball);
    expect(bouncedUp).toBe(false);
  });
});
