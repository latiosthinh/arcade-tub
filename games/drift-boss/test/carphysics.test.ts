import { describe, it, expect, beforeEach } from 'vitest';
import { CarPhysics } from '../src/CarPhysics.js';

describe('CarPhysics', () => {
  let car: CarPhysics;

  beforeEach(() => {
    car = new CarPhysics();
  });

  it('starts at initial origin facing straight (along X direction)', () => {
    const state = car.getState();
    expect(state.x).toBe(0);
    expect(state.y).toBe(0);
    expect(state.z).toBe(0);
    expect(state.direction).toBe('X');
    expect(state.speed).toBeGreaterThan(0);
  });

  it('moves forward in +X direction when turning right is active (hold)', () => {
    car.update(0.1, true);
    const state = car.getState();
    expect(state.direction).toBe('X');
    expect(state.x).toBeGreaterThan(0);
    expect(state.y).toBe(0);
  });

  it('switches to +Y direction when turning right is released (hold=false)', () => {
    car.update(0.1, false);
    const state = car.getState();
    expect(state.direction).toBe('Y');
    expect(state.y).toBeGreaterThan(0);
  });

  it('smoothly interpolates visual rotation angle between X and Y axes', () => {
    car.update(0.016, true);
    const angleX = car.getState().rotationAngle;
    car.update(0.016, false);
    const angleMid = car.getState().rotationAngle;
    expect(angleMid).not.toBe(angleX);
  });

  it('handles ramp jumps with ballistic vertical trajectory', () => {
    car.launchJump(5);
    expect(car.getState().isJumping).toBe(true);
    expect(car.getState().verticalVelocity).toBe(5);

    // Step physics
    car.update(0.1, true);
    expect(car.getState().z).toBeGreaterThan(0);
  });

  it('applies fall acceleration when falling off track', () => {
    car.startFalling();
    expect(car.getState().isFalling).toBe(true);
    car.update(0.1, true);
    expect(car.getState().z).toBeLessThan(0);
  });
});
