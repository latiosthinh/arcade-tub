import { describe, it, expect } from 'vitest';
import { Snake, Direction } from '../src/Snake';

describe('Snake', () => {
  it('initializes with default segments and direction', () => {
    const snake = new Snake(10, 10, 3, Direction.RIGHT);
    expect(snake.body).toEqual([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ]);
    expect(snake.currentDirection).toBe(Direction.RIGHT);
    expect(snake.alive).toBe(true);
  });

  it('steps forward on accumulated dt and moves segments', () => {
    const snake = new Snake(10, 10, 3, Direction.RIGHT);
    const interval = snake.getStepInterval();

    const noStep = snake.update(interval / 2);
    expect(noStep.stepped).toBe(false);
    expect(snake.body[0]).toEqual({ x: 10, y: 10 });

    const didStep = snake.update(interval / 2 + 0.001);
    expect(didStep.stepped).toBe(true);
    expect(didStep.head).toEqual({ x: 11, y: 10 });
    expect(snake.body).toEqual([
      { x: 11, y: 10 },
      { x: 10, y: 10 },
      { x: 9, y: 10 },
    ]);
    expect(didStep.tailRemoved).toEqual({ x: 8, y: 10 });
  });

  it('queues direction without immediate 180 reverse', () => {
    const snake = new Snake(10, 10, 3, Direction.RIGHT);
    // Cannot directly queue LEFT when current is RIGHT
    snake.queueDirection(Direction.LEFT);
    expect(snake.directionQueue.length).toBe(0);

    // Can queue UP
    snake.queueDirection(Direction.UP);
    expect(snake.directionQueue).toEqual([Direction.UP]);

    // Cannot queue DOWN immediately after queued UP
    snake.queueDirection(Direction.DOWN);
    expect(snake.directionQueue).toEqual([Direction.UP]);

    // Can queue LEFT after UP
    snake.queueDirection(Direction.LEFT);
    expect(snake.directionQueue).toEqual([Direction.UP, Direction.LEFT]);

    // Queue limit is 2
    snake.queueDirection(Direction.DOWN);
    expect(snake.directionQueue.length).toBe(2);
  });

  it('processes queued directions on steps', () => {
    const snake = new Snake(10, 10, 3, Direction.RIGHT);
    snake.queueDirection(Direction.UP);

    const stepRes = snake.update(snake.getStepInterval() + 0.01);
    expect(stepRes.stepped).toBe(true);
    expect(snake.currentDirection).toBe(Direction.UP);
    expect(snake.body[0]).toEqual({ x: 10, y: 9 });
  });

  it('grows snake when growPending > 0', () => {
    const snake = new Snake(10, 10, 3, Direction.RIGHT);
    snake.grow(1);
    expect(snake.growPending).toBe(1);

    const res = snake.update(snake.getStepInterval() + 0.01);
    expect(res.stepped).toBe(true);
    expect(snake.body.length).toBe(4);
    expect(snake.growPending).toBe(0);
    expect(res.tailRemoved).toBeUndefined();
    expect(snake.body).toEqual([
      { x: 11, y: 10 },
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ]);
  });

  it('detects self collision', () => {
    const snake = new Snake(10, 10, 5, Direction.RIGHT);
    expect(snake.checkSelfCollision()).toBe(false);

    // Manually force head to overlap body segment
    snake.body[0] = { x: 9, y: 10 };
    expect(snake.checkSelfCollision()).toBe(true);
  });

  it('scales speed (step interval decreases) as length grows', () => {
    const snake = new Snake(10, 10, 3, Direction.RIGHT);
    const initialInterval = snake.getStepInterval();

    snake.body = new Array(25).fill(null).map((_, i) => ({ x: 25 - i, y: 10 }));
    const fasterInterval = snake.getStepInterval();

    expect(fasterInterval).toBeLessThan(initialInterval);
    expect(fasterInterval).toBeGreaterThanOrEqual(0.065);
  });

  it('checks occupies coordinate correctly', () => {
    const snake = new Snake(5, 5, 3, Direction.RIGHT);
    expect(snake.occupies(5, 5)).toBe(true);
    expect(snake.occupies(4, 5)).toBe(true);
    expect(snake.occupies(3, 5)).toBe(true);
    expect(snake.occupies(2, 5)).toBe(false);
  });

  it('resets state properly', () => {
    const snake = new Snake(10, 10, 3, Direction.RIGHT);
    snake.grow(5);
    snake.update(snake.getStepInterval() + 0.01);
    snake.alive = false;

    snake.reset(5, 5, 3, Direction.UP);
    expect(snake.alive).toBe(true);
    expect(snake.growPending).toBe(0);
    expect(snake.currentDirection).toBe(Direction.UP);
    expect(snake.body).toEqual([
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 5, y: 7 },
    ]);
  });
});
