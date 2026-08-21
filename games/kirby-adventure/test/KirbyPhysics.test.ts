import { describe, it, expect } from 'vitest';
import { TileMap } from '../src/TileMap';
import {
  KirbyPhysics,
  RUN_SPEED,
  DASH_SPEED,
  JUMP_VELOCITY,
  MIN_JUMP_VELOCITY,
  COYOTE_TIME,
  JUMP_BUFFER_TIME,
} from '../src/KirbyPhysics';
import { InputState } from '../src/types';

function createDummyInput(overrides: Partial<InputState> = {}): InputState {
  return {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    jumpJustPressed: false,
    jumpJustReleased: false,
    ...overrides,
  };
}

describe('KirbyPhysics - Task 2: Axis-Separated AABB Collision Solver', () => {
  it('pushes player right out of solid wall and zeroes horizontal velocity', () => {
    const map = TileMap.fromString([
      '..#',
      '..#',
      '..#',
    ], 16);

    const physics = new KirbyPhysics({ x: 10, y: 0, width: 16, height: 16 });
    physics.vx = 100;
    physics.resolveCollisionX(map, 0.1);
    expect(physics.x).toBe(16);
    expect(physics.vx).toBe(0);
  });

  it('pushes player left out of solid wall and zeroes horizontal velocity', () => {
    const map = TileMap.fromString([
      '#..',
      '#..',
      '#..',
    ], 16);

    const physics = new KirbyPhysics({ x: 10, y: 0, width: 16, height: 16 });
    physics.vx = -100;
    physics.resolveCollisionX(map, 0.1);
    expect(physics.x).toBe(16);
    expect(physics.vx).toBe(0);
  });

  it('falls onto solid floor, zeroes vy, and sets grounded = true', () => {
    const map = TileMap.fromString([
      '...',
      '###',
    ], 16);

    const physics = new KirbyPhysics({ x: 0, y: 5, width: 16, height: 16 });
    physics.vy = 200;
    const prevY = physics.y;
    physics.resolveCollisionY(map, 0.1, prevY);
    expect(physics.y).toBe(0);
    expect(physics.vy).toBe(0);
    expect(physics.grounded).toBe(true);
  });

  it('jumping into ceiling pushes player down and zeroes upward velocity', () => {
    const map = TileMap.fromString([
      '###',
      '...',
      '...',
    ], 16);

    const physics = new KirbyPhysics({ x: 0, y: 20, width: 16, height: 16 });
    physics.vy = -200;
    const prevY = physics.y;
    physics.resolveCollisionY(map, 0.1, prevY);
    expect(physics.y).toBe(16);
    expect(physics.vy).toBe(0);
  });

  it('axis-separated resolution prevents corner-catching along seams', () => {
    const map = TileMap.fromString([
      '..',
      '##',
    ], 16);

    const physics = new KirbyPhysics({ x: 0, y: 0, width: 16, height: 16 });
    physics.grounded = true;
    physics.vx = 120;
    physics.vy = 0;

    for (let i = 0; i < 5; i++) {
      physics.update(1 / 60, createDummyInput({ right: true }), map);
      expect(physics.grounded).toBe(true);
    }
    expect(physics.x).toBeGreaterThan(0);
  });

  it('allows upward jump pass-through on one-way platforms', () => {
    const map = TileMap.fromString([
      '...',
      '===',
      '...',
    ], 16);

    const physics = new KirbyPhysics({ x: 0, y: 20, width: 16, height: 16 });
    physics.vy = -200;
    const prevY = physics.y;
    physics.resolveCollisionY(map, 0.05, prevY);
    expect(physics.y).toBe(10);
    expect(physics.vy).toBe(-200);
    expect(physics.grounded).toBe(false);
  });

  it('lands on top of one-way platform when falling from above', () => {
    const map = TileMap.fromString([
      '...',
      '===',
      '...',
    ], 16);

    const physics = new KirbyPhysics({ x: 0, y: 0, width: 16, height: 16 });
    physics.vy = 200;
    const prevY = physics.y;
    physics.resolveCollisionY(map, 0.1, prevY);
    expect(physics.y).toBe(0);
    expect(physics.vy).toBe(0);
    expect(physics.grounded).toBe(true);
  });
});

describe('KirbyPhysics - Task 3: Kinematics, Dash, Variable Jump, Coyote & Buffer', () => {
  const floorMap = TileMap.fromString([
    '....................',
    '####################',
  ], 16);

  it('walk left/right applies horizontal velocity at RUN_SPEED (120 px/s) and updates facing', () => {
    const physics = new KirbyPhysics({ x: 16, y: 0, width: 16, height: 16 });
    physics.grounded = true;

    // Walk right
    physics.update(1 / 60, createDummyInput({ right: true }), floorMap);
    expect(physics.vx).toBe(RUN_SPEED);
    expect(physics.facing).toBe(1);
    expect(physics.getFacing()).toBe(1);

    // Stop
    physics.update(1 / 60, createDummyInput(), floorMap);
    expect(physics.vx).toBe(0);

    // Walk left
    physics.update(1 / 60, createDummyInput({ left: true }), floorMap);
    expect(physics.vx).toBe(-RUN_SPEED);
    expect(physics.facing).toBe(-1);
    expect(physics.getFacing()).toBe(-1);
  });

  it('double-tapping right within 250ms triggers DASH state at DASH_SPEED (180 px/s)', () => {
    const physics = new KirbyPhysics({ x: 16, y: 0, width: 16, height: 16 });
    physics.grounded = true;

    // First tap
    physics.update(0.05, createDummyInput({ right: true }), floorMap);
    expect(physics.isDashing).toBe(false);
    expect(physics.vx).toBe(RUN_SPEED);

    // Release
    physics.update(0.05, createDummyInput(), floorMap);
    expect(physics.vx).toBe(0);

    // Second tap within 250ms (total dt elapsed: 0.10s)
    physics.update(0.05, createDummyInput({ right: true }), floorMap);
    expect(physics.isDashing).toBe(true);
    expect(physics.vx).toBe(DASH_SPEED);

    // Continue holding right maintains dash
    physics.update(0.05, createDummyInput({ right: true }), floorMap);
    expect(physics.isDashing).toBe(true);
    expect(physics.vx).toBe(DASH_SPEED);

    // Release stops dash
    physics.update(0.05, createDummyInput(), floorMap);
    expect(physics.isDashing).toBe(false);
    expect(physics.vx).toBe(0);
  });

  it('pressing jump when grounded triggers full jump velocity (-280 px/s)', () => {
    const physics = new KirbyPhysics({ x: 16, y: 0, width: 16, height: 16 });
    physics.grounded = true;

    physics.update(1 / 60, createDummyInput({ jump: true, jumpJustPressed: true }), floorMap);
    expect(physics.vy).toBeLessThan(0);
    expect(physics.vy).toBeCloseTo(JUMP_VELOCITY + 600 * (1 / 60), 1);
    expect(physics.isGrounded()).toBe(false);
  });

  it('releasing jump while ascending cuts upward velocity to MIN_JUMP_VELOCITY (-120 px/s)', () => {
    const emptyMap = TileMap.fromString([
      '....',
      '....',
      '....',
      '....',
    ], 16);

    const physics = new KirbyPhysics({ x: 16, y: 32, width: 16, height: 16 });
    physics.grounded = true;

    // Full jump initiation
    physics.update(1 / 60, createDummyInput({ jump: true, jumpJustPressed: true }), emptyMap);
    expect(physics.vy).toBeLessThan(MIN_JUMP_VELOCITY);

    // Release jump while ascending
    physics.update(1 / 60, createDummyInput({ jump: false, jumpJustReleased: true }), emptyMap);
    // Should be clamped to MIN_JUMP_VELOCITY + gravity*dt
    expect(physics.vy).toBeGreaterThanOrEqual(MIN_JUMP_VELOCITY);
  });

  it('walking off a ledge allows jumping within COYOTE_TIME (100ms)', () => {
    // Map with floor only on the left: col 0 has solid, rest is air
    const ledgeMap = TileMap.fromString([
      '....',
      '#...',
    ], 16);

    const physics = new KirbyPhysics({ x: 0, y: 0, width: 16, height: 16 });
    physics.grounded = true;

    // Step off the ledge
    physics.x = 24; // now suspended over air
    physics.update(0.04, createDummyInput(), ledgeMap); // 40ms off ledge
    expect(physics.grounded).toBe(false);
    expect(physics.coyoteTimer).toBeGreaterThan(0);

    // Jump within coyote window
    physics.update(0.02, createDummyInput({ jump: true, jumpJustPressed: true }), ledgeMap);
    expect(physics.vy).toBeLessThan(0);
    expect(physics.coyoteTimer).toBe(0);
  });

  it('pressing jump within JUMP_BUFFER_TIME (120ms) before landing triggers immediate jump upon landing', () => {
    const physics = new KirbyPhysics({ x: 16, y: 0, width: 16, height: 16 });
    physics.grounded = false;
    physics.y = -5; // in the air above floor at y=0
    physics.vy = 200;

    // Press jump while in air (landing on floor in this step)
    physics.update(0.05, createDummyInput({ jump: true, jumpJustPressed: true }), floorMap);
    expect(physics.grounded).toBe(true);
    expect(physics.jumpBufferTimer).toBeGreaterThan(0);

    // Next step consumes buffer to immediately jump
    physics.update(0.05, createDummyInput({ jump: true }), floorMap);
    expect(physics.vy).toBeLessThan(0); // Jump triggered
  });
});
