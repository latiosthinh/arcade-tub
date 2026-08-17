import { describe, it, expect, beforeEach } from 'vitest';
import { BrickGrid, BrickType } from '../src/BrickGrid';
import { Ball } from '../src/Ball';

describe('BrickGrid', () => {
  let grid: BrickGrid;

  beforeEach(() => {
    grid = new BrickGrid();
  });

  it('generates multi-level layouts for levels 1, 2, and 3+', () => {
    grid.loadLevel(1);
    expect(grid.bricks.length).toBeGreaterThan(0);
    const standardBricks = grid.bricks.filter(b => b.type === 'standard');
    const bonusBricks = grid.bricks.filter(b => b.type === 'bonus');
    const lifeBricks = grid.bricks.filter(b => b.type === 'life');
    expect(standardBricks.length).toBeGreaterThan(0);
    expect(bonusBricks.length).toBe(2);
    expect(lifeBricks.length).toBe(1);

    grid.loadLevel(2);
    const durableBricksL2 = grid.bricks.filter(b => b.type === 'durable');
    expect(durableBricksL2.length).toBeGreaterThan(0);
    expect(durableBricksL2.every(b => b.maxHp === 2 && b.hp === 2)).toBe(true);

    grid.loadLevel(3);
    const durableBricksL3 = grid.bricks.filter(b => b.type === 'durable');
    expect(durableBricksL3.some(b => b.maxHp === 3 && b.hp === 3)).toBe(true);
  });

  it('handles vertical and horizontal AABB ball collisions', () => {
    grid.loadLevel(1);
    const brick = grid.bricks[0]; // first brick at (x: 15, y: 70, width: 70, height: 24)
    const ball = new Ball();

    // Hit from bottom (vertical collision)
    ball.x = brick.x + brick.width / 2;
    ball.y = brick.y + brick.height + ball.radius;
    ball.vx = 0;
    ball.vy = -300; // moving upwards into bottom of brick

    const resBottom = grid.checkBallCollision(ball);
    expect(resBottom.hit).toBe(true);
    expect(ball.vy).toBe(300); // inverted vertically
    expect(resBottom.pointsAwarded).toBe(5);

    // Durable brick multi-hit
    grid.loadLevel(2);
    const durableBrick = grid.bricks.find(b => b.type === 'durable')!;
    ball.x = durableBrick.x + durableBrick.width / 2;
    ball.y = durableBrick.y + durableBrick.height + ball.radius;
    ball.vy = -300;

    const hit1 = grid.checkBallCollision(ball);
    expect(hit1.hit).toBe(true);
    expect(hit1.isDestroyed).toBe(false);
    expect(durableBrick.hp).toBe(1);

    ball.y = durableBrick.y + durableBrick.height + ball.radius;
    ball.vy = -300;
    const hit2 = grid.checkBallCollision(ball);
    expect(hit2.hit).toBe(true);
    expect(hit2.isDestroyed).toBe(true);
    expect(durableBrick.destroyed).toBe(true);
  });

  it('awards points and flags for bonus and life bricks', () => {
    grid.loadLevel(1);
    const bonusBrick = grid.bricks.find(b => b.type === 'bonus')!;
    const ball = new Ball();
    ball.x = bonusBrick.x + bonusBrick.width / 2;
    ball.y = bonusBrick.y + bonusBrick.height + ball.radius;
    ball.vy = -300;

    const bonusRes = grid.checkBallCollision(ball);
    expect(bonusRes.hit).toBe(true);
    expect(bonusRes.isBonus).toBe(true);
    expect(bonusRes.pointsAwarded).toBe(50);

    const lifeBrick = grid.bricks.find(b => b.type === 'life')!;
    ball.x = lifeBrick.x + lifeBrick.width / 2;
    ball.y = lifeBrick.y + lifeBrick.height + ball.radius;
    ball.vy = -300;

    const lifeRes = grid.checkBallCollision(ball);
    expect(lifeRes.hit).toBe(true);
    expect(lifeRes.isLife).toBe(true);
    expect(lifeRes.pointsAwarded).toBe(10);
  });

  it('tracks level clear and remaining brick count accurately', () => {
    grid.loadLevel(1);
    expect(grid.isLevelCleared()).toBe(false);
    const initialCount = grid.getRemainingBrickCount();
    expect(initialCount).toBe(grid.bricks.length);

    grid.bricks.forEach(b => {
      b.destroyed = true;
    });

    expect(grid.isLevelCleared()).toBe(true);
    expect(grid.getRemainingBrickCount()).toBe(0);
  });
});
