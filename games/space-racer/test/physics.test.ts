import { describe, it, expect } from 'vitest';
import { HighwaySpeedPhysics } from '../src/HighwaySpeedPhysics';

describe('HighwaySpeedPhysics', () => {
  it('calculates speed ramping smoothly based on distance', () => {
    const startSpeed = HighwaySpeedPhysics.calculateSpeed(0);
    const midSpeed = HighwaySpeedPhysics.calculateSpeed(5000);
    const maxSpeed = HighwaySpeedPhysics.calculateSpeed(100000);

    expect(startSpeed).toBe(300);
    expect(midSpeed).toBeGreaterThan(startSpeed);
    expect(maxSpeed).toBeLessThanOrEqual(900);
  });

  it('multiplies speed during boost mode', () => {
    const normalSpeed = HighwaySpeedPhysics.calculateSpeed(2000, 300, 900, false);
    const boostSpeed = HighwaySpeedPhysics.calculateSpeed(2000, 300, 900, true);

    expect(boostSpeed).toBeGreaterThan(normalSpeed);
    expect(boostSpeed).toBe(normalSpeed * 1.5);
  });

  it('calculates speed score multiplier correctly', () => {
    const mult1 = HighwaySpeedPhysics.getSpeedMultiplier(300);
    const mult2 = HighwaySpeedPhysics.getSpeedMultiplier(600);
    const mult3 = HighwaySpeedPhysics.getSpeedMultiplier(900);

    expect(mult1).toBe(1.0);
    expect(mult2).toBe(2.0);
    expect(mult3).toBe(3.0);
  });

  it('detects near-miss events accurately at camera depth', () => {
    // Ship at x = 400, width = 60. Hitbox is 370..430
    // Obstacle at x = 440, width = 40. Hitbox is 420..460. Direct collision!
    const directHit = HighwaySpeedPhysics.checkNearMiss(400, 60, 410, 40, 0.02);
    expect(directHit).toBe(false); // Collided, not near-miss

    // Obstacle passing just outside hitbox (e.g. x = 470, near miss window within 80px)
    const nearMiss = HighwaySpeedPhysics.checkNearMiss(400, 60, 470, 40, 0.02);
    expect(nearMiss).toBe(true);

    // Obstacle too far away (e.g. x = 650)
    const farAway = HighwaySpeedPhysics.checkNearMiss(400, 60, 650, 40, 0.02);
    expect(farAway).toBe(false);

    // Obstacle not at camera depth (z = 0.5)
    const wrongZ = HighwaySpeedPhysics.checkNearMiss(400, 60, 470, 40, 0.5);
    expect(wrongZ).toBe(false);
  });
});
