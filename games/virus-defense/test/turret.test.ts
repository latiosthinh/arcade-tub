import { describe, it, expect, beforeEach } from 'vitest';
import { Turret } from '../src/Turret';

describe('Turret', () => {
  let turret: Turret;

  beforeEach(() => {
    turret = new Turret(400, 300);
  });

  it('initializes at given coordinates with defaults', () => {
    expect(turret.x).toBe(400);
    expect(turret.y).toBe(300);
    expect(turret.angle).toBe(0);
    expect(turret.cooldown).toBe(0);
    expect(turret.projectiles.length).toBe(0);
  });

  it('calculates 360-degree aim angles in all four quadrants', () => {
    // Quadrant 1 (Right-Down): target (500, 400) -> atan2(100, 100) = PI/4
    turret.aimAt(500, 400);
    expect(turret.angle).toBeCloseTo(Math.PI / 4);

    // Quadrant 2 (Left-Down): target (300, 400) -> atan2(100, -100) = 3*PI/4
    turret.aimAt(300, 400);
    expect(turret.angle).toBeCloseTo((3 * Math.PI) / 4);

    // Quadrant 3 (Left-Up): target (300, 200) -> atan2(-100, -100) = -3*PI/4
    turret.aimAt(300, 200);
    expect(turret.angle).toBeCloseTo((-3 * Math.PI) / 4);

    // Quadrant 4 (Right-Up): target (500, 200) -> atan2(-100, 100) = -PI/4
    turret.aimAt(500, 200);
    expect(turret.angle).toBeCloseTo(-Math.PI / 4);
  });

  it('fires projectile along aiming vector when off cooldown', () => {
    turret.aimAt(500, 300); // Angle = 0 (rightwards)
    const p = turret.fire();

    expect(p).not.toBeNull();
    if (p) {
      expect(p.active).toBe(true);
      expect(p.damage).toBe(1);
      expect(p.vx).toBeCloseTo(turret.projectileSpeed);
      expect(p.vy).toBeCloseTo(0);
      expect(turret.projectiles.length).toBe(1);
    }
  });

  it('throttles rapid firing via cooldown timer', () => {
    const p1 = turret.fire();
    expect(p1).not.toBeNull();

    // Immediate second shot fails because cooldown > 0
    const p2 = turret.fire();
    expect(p2).toBeNull();

    // Advance time by cooldown duration
    turret.update(turret.fireRate);
    expect(turret.cooldown).toBe(0);

    const p3 = turret.fire();
    expect(p3).not.toBeNull();
  });

  it('updates projectile positions and deactivates when exceeding maxDistance', () => {
    turret.aimAt(500, 300);
    turret.fire();

    // Step 0.5s with 600 px/s = 300px moved
    turret.update(0.5);
    expect(turret.projectiles[0].distanceTraveled).toBeCloseTo(300);
    expect(turret.projectiles[0].active).toBe(true);

    // Step another 0.6s -> total 660px > 600px maxDistance
    turret.update(0.6);
    expect(turret.projectiles.length).toBe(0);
  });

  it('removes inactive projectiles when cleaned up', () => {
    turret.aimAt(500, 300);
    const p = turret.fire();
    if (p) {
      p.active = false;
    }
    turret.update(0.016);
    expect(turret.projectiles.length).toBe(0);
  });
});
