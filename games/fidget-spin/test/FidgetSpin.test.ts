import { describe, it, expect, beforeEach } from 'vitest';
import { SpinnerPhysics, BEARING_UPGRADES } from '../src/SpinnerPhysics';

describe('SpinnerPhysics', () => {
  let physics: SpinnerPhysics;

  beforeEach(() => {
    physics = new SpinnerPhysics();
  });

  it('initializes with default zero angular velocity and angle', () => {
    expect(physics.angle).toBe(0);
    expect(physics.angularVelocity).toBe(0);
    expect(physics.getRPM()).toBe(0);
    expect(physics.totalRevolutions).toBe(0);
    expect(physics.coins).toBe(0);
    expect(physics.bearingLevel).toBe(0);
  });

  it('applies direct torque impulse and respects max angular velocity clamp', () => {
    physics.applyTorque(20);
    expect(physics.angularVelocity).toBe(20);
    expect(physics.getRPM()).toBeCloseTo((20 / (2 * Math.PI)) * 60, 2);

    // Apply excessive torque
    physics.applyTorque(500);
    expect(physics.angularVelocity).toBe(physics.config.maxAngularVelocity);
  });

  it('converts tangential swipe vectors into angular velocity correctly', () => {
    const center = { x: 200, y: 200 };
    // Swipe from (200, 100) to (300, 100) -> r = (0, -100), delta = (100, 0)
    // Cross product (rx * vy - ry * vx) = 0 - (-100 * 100) = +10000
    // Torque should be positive (clockwise)
    physics.applySwipe({ x: 200, y: 100 }, { x: 300, y: 100 }, 0.05, center);
    expect(physics.angularVelocity).toBeGreaterThan(0);

    const ccwPhysics = new SpinnerPhysics();
    // Reverse swipe -> counter-clockwise
    ccwPhysics.applySwipe({ x: 200, y: 100 }, { x: 100, y: 100 }, 0.05, center);
    expect(ccwPhysics.angularVelocity).toBeLessThan(0);
  });

  it('decelerates rotational speed over time via bearing friction', () => {
    physics.applyTorque(50);
    const initialVel = physics.angularVelocity;
    
    physics.update(0.1);
    expect(physics.angularVelocity).toBeLessThan(initialVel);
    expect(physics.angularVelocity).toBeGreaterThan(0);
  });

  it('higher bearing upgrades result in lower friction and longer spin persistence', () => {
    physics.applyTorque(50);
    physics.update(0.5);
    const baseRemainingVel = physics.angularVelocity;

    const upgradedPhysics = new SpinnerPhysics();
    expect(upgradedPhysics.upgradeBearing(1000)).toBe(true); // Upgrade to level 1
    upgradedPhysics.applyTorque(50);
    upgradedPhysics.update(0.5);

    expect(upgradedPhysics.angularVelocity).toBeGreaterThan(baseRemainingVel);
  });

  it('accumulates revolutions and awards spin coins', () => {
    physics.applyTorque(2 * Math.PI * 10); // 10 rev/s
    physics.update(1.0);
    expect(physics.totalRevolutions).toBeGreaterThan(5);
    expect(physics.coins).toBeGreaterThanOrEqual(Math.floor(physics.totalRevolutions));
  });

  it('snaps angular velocity to 0 when near stop', () => {
    physics.applyTorque(0.005);
    physics.update(0.1);
    expect(physics.angularVelocity).toBe(0);
  });
});
