import { describe, it, expect, beforeEach } from 'vitest';
import { StackPhysics } from '../src/StackPhysics.js';

describe('StackPhysics', () => {
  let stack: StackPhysics;

  beforeEach(() => {
    stack = new StackPhysics();
  });

  it('starts with empty stack and zero wobble', () => {
    expect(stack.crates).toEqual([]);
    expect(stack.crates.length).toBe(0);
    expect(stack.getTotalHeight()).toBe(0);
    expect(stack.wobbleAngle).toBe(0);
    expect(stack.wobbleVelocity).toBe(0);
    expect(stack.isShieldActive()).toBe(false);
  });

  it('adds crates and computes total height correctly', () => {
    stack.addCrate({
      id: 'c1',
      type: 'crate_small',
      width: 32,
      height: 24,
      basePoints: 100,
    }, 5);

    expect(stack.crates.length).toBe(1);
    expect(stack.getTotalHeight()).toBe(24);
    expect(stack.crates[0].offsetX).toBe(5);

    stack.addCrate({
      id: 'c2',
      type: 'crate_medium',
      width: 44,
      height: 30,
      basePoints: 150,
    }, -20); // Clamped to -15

    expect(stack.crates.length).toBe(2);
    expect(stack.getTotalHeight()).toBe(54);
    expect(stack.crates[1].offsetX).toBe(-15);
    expect(stack.getStackTopY(520)).toBe(520 - 54);
  });

  it('scales multiplier from 1 to 10 based on crate count', () => {
    expect(stack.getMultiplier()).toBe(1);

    for (let i = 1; i <= 5; i++) {
      stack.addCrate({
        id: `c${i}`,
        type: 'crate_small',
        width: 32,
        height: 24,
        basePoints: 100,
      });
    }
    expect(stack.getMultiplier()).toBe(5);

    for (let i = 6; i <= 15; i++) {
      stack.addCrate({
        id: `c${i}`,
        type: 'crate_small',
        width: 32,
        height: 24,
        basePoints: 100,
      });
    }
    expect(stack.getMultiplier()).toBe(10);
  });

  it('banks points with multiplier and clears stack', () => {
    const emptyResult = stack.bank();
    expect(emptyResult).toEqual({
      totalPoints: 0,
      crateCount: 0,
      multiplier: 1,
    });

    stack.addCrate({ id: 'c1', type: 'crate_small', width: 32, height: 24, basePoints: 100 });
    stack.addCrate({ id: 'c2', type: 'crate_medium', width: 44, height: 30, basePoints: 150 });
    stack.addCrate({ id: 'c3', type: 'crate_golden', width: 40, height: 30, basePoints: 500 });

    // Multiplier is 3, total base = 750, banked = 2250
    const result = stack.bank();
    expect(result.multiplier).toBe(3);
    expect(result.crateCount).toBe(3);
    expect(result.totalPoints).toBe(2250);
    expect(stack.crates.length).toBe(0);
    expect(stack.getTotalHeight()).toBe(0);
    expect(stack.wobbleAngle).toBe(0);
  });

  it('activates magnetic shield and counts down timer', () => {
    stack.activateShield(10.0);
    expect(stack.isShieldActive()).toBe(true);

    stack.update(4.0, 0);
    expect(stack.isShieldActive()).toBe(true);
    expect(stack.shieldTimer).toBeCloseTo(6.0, 2);

    stack.update(7.0, 0);
    expect(stack.isShieldActive()).toBe(false);
  });

  it('calculates wobble torque on cart acceleration and collapses when tipped', () => {
    // Add multiple crates for wobble mass
    for (let i = 0; i < 8; i++) {
      stack.addCrate({ id: `c${i}`, type: 'crate_medium', width: 44, height: 30, basePoints: 150 });
    }

    // Direct angular acceleration or high inertial jerk
    stack.wobbleAngle = 0.5; // Exceeds 0.45 max tipping angle
    const res = stack.update(0.016, 0);

    expect(res.collapsed).toBe(true);
    expect(res.lostCrates.length).toBe(8);
    expect(stack.crates.length).toBe(0);
  });

  it('magnetic shield prevents wobble collapse even under violent motion', () => {
    for (let i = 0; i < 10; i++) {
      stack.addCrate({ id: `c${i}`, type: 'crate_large', width: 56, height: 36, basePoints: 200 });
    }

    stack.activateShield(10.0);

    for (let step = 0; step < 50; step++) {
      const vx = step % 2 === 0 ? 600 : -600;
      const res = stack.update(0.016, vx);
      expect(res.collapsed).toBe(false);
      expect(Math.abs(stack.wobbleAngle)).toBeLessThan(stack.maxTippingAngle);
    }
  });

  it('explodeScatter clears stack and returns scattered crates', () => {
    stack.addCrate({ id: 'c1', type: 'crate_small', width: 32, height: 24, basePoints: 100 });
    stack.addCrate({ id: 'c2', type: 'crate_medium', width: 44, height: 30, basePoints: 150 });

    const scattered = stack.explodeScatter();
    expect(scattered.length).toBe(2);
    expect(scattered[0].id).toBe('c1');
    expect(scattered[1].id).toBe('c2');
    expect(stack.crates.length).toBe(0);
    expect(stack.wobbleAngle).toBe(0);
  });
});
