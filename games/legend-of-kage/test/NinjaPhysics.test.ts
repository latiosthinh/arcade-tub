import { describe, it, expect, beforeEach } from 'vitest';
import { NinjaPhysics, SUPER_JUMP_IMPULSE } from '../src/NinjaPhysics';
import { TreeCanopy } from '../src/TreeCanopy';

describe('NinjaPhysics (PHYS-01, PHYS-02, PHYS-03, PHYS-04)', () => {
  let physics: NinjaPhysics;
  let canopy: TreeCanopy;

  beforeEach(() => {
    physics = new NinjaPhysics(100, 536);
    canopy = new TreeCanopy();
  });

  it('launches into super-jump on jump input (PHYS-01)', () => {
    physics.grounded = true;
    physics.update(0.016, {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: true,
      jumpJustPressed: true,
      shuriken: false,
      shurikenJustPressed: false,
      sword: false,
      swordJustPressed: false,
    }, canopy, 560);

    expect(physics.vy).toBeLessThanOrEqual(-800);
    expect(physics.grounded).toBe(false);
  });

  it('steers mid-air horizontally during jump (PHYS-02)', () => {
    physics.grounded = false;
    physics.update(0.016, {
      left: false,
      right: true,
      up: false,
      down: false,
      jump: false,
      jumpJustPressed: false,
      shuriken: false,
      shurikenJustPressed: false,
      sword: false,
      swordJustPressed: false,
    }, canopy, 560);

    expect(physics.vx).toBeGreaterThan(0);
    expect(physics.facing).toBe(1);
  });

  it('lands cleanly on one-way tree branch platforms (PHYS-03)', () => {
    // Position directly above branch b_1 (x: 160..250, y: 420)
    physics.x = 180;
    physics.y = 390;
    physics.vy = 200; // falling

    physics.update(0.05, {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      jumpJustPressed: false,
      shuriken: false,
      shurikenJustPressed: false,
      sword: false,
      swordJustPressed: false,
    }, canopy, 560);

    expect(physics.onBranch).toBe(true);
    expect(physics.vy).toBe(0);
    expect(physics.y + physics.height).toBe(420);
  });
});
