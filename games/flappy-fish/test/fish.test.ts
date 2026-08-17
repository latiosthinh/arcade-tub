import { describe, it, expect, beforeEach } from 'vitest';
import { Fish } from '../src/Fish';

describe('Fish physics model', () => {
  let fish: Fish;

  beforeEach(() => {
    fish = new Fish({ x: 160, y: 300 });
  });

  it('initializes with default parameters and initial position', () => {
    expect(fish.x).toBe(160);
    expect(fish.y).toBe(300);
    expect(fish.vy).toBe(0);
    expect(fish.radius).toBe(18);
    expect(fish.width).toBe(44);
    expect(fish.height).toBe(32);
    expect(fish.rotation).toBeCloseTo(0, 2);
    expect(fish.finPhase).toBe(0);
  });

  it('applies upward impulse when flapping and clamps rise speed', () => {
    fish.vy = 200; // falling
    fish.flap();
    expect(fish.vy).toBe(-380);

    // If already flapping fast upward, clamp to maxRiseSpeed
    const fastFish = new Fish({ flapImpulse: -500, maxRiseSpeed: -450 });
    fastFish.flap();
    expect(fastFish.vy).toBe(-450);
  });

  it('updates gravity, water drag, and position over dt', () => {
    fish.vy = 0;
    fish.update(0.1); // dt = 0.1s
    // Gravity should increase vy downward (positive vy)
    expect(fish.vy).toBeGreaterThan(0);
    expect(fish.y).toBeGreaterThan(300);
  });

  it('clamps terminal fall speed', () => {
    fish.vy = 590;
    fish.update(0.5); // large timestep with gravity
    expect(fish.vy).toBeLessThanOrEqual(600); // maxFallSpeed default
  });

  it('calculates pitch angle rotation from vertical velocity', () => {
    fish.vy = -380; // rising
    fish.update(0.016);
    expect(fish.rotation).toBeLessThan(0); // tilted upwards

    fish.vy = 500; // falling fast
    fish.update(0.016);
    expect(fish.rotation).toBeGreaterThan(0); // diving downward
  });

  it('advances finPhase during update', () => {
    expect(fish.finPhase).toBe(0);
    fish.update(0.1);
    expect(fish.finPhase).toBeGreaterThan(0);
  });

  it('checks top and bottom boundary collisions', () => {
    fish.y = 15;
    fish.radius = 18;
    expect(fish.checkBounds(0, 600)).toBe('top');

    fish.y = 590;
    expect(fish.checkBounds(0, 600)).toBe('bottom');

    fish.y = 300;
    expect(fish.checkBounds(0, 600)).toBeNull();
  });

  it('resets to starting coordinates and zeroes velocities', () => {
    fish.vy = 350;
    fish.y = 450;
    fish.rotation = 0.8;
    fish.finPhase = 15;

    fish.reset(160, 300);
    expect(fish.x).toBe(160);
    expect(fish.y).toBe(300);
    expect(fish.vy).toBe(0);
    expect(fish.rotation).toBe(0);
    expect(fish.finPhase).toBe(0);
  });
});
