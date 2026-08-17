import { describe, it, expect, beforeEach } from 'vitest';
import { Ship } from '../src/Ship';

describe('Ship Kinematics and State', () => {
  let ship: Ship;

  beforeEach(() => {
    ship = new Ship({
      minX: 100,
      maxX: 700,
      initialX: 400,
      maxSpeed: 600,
      acceleration: 2000,
      friction: 8,
      maxShieldHp: 3,
    });
  });

  it('initializes with default values and center position', () => {
    expect(ship.x).toBe(400);
    expect(ship.vx).toBe(0);
    expect(ship.shieldHp).toBe(3);
    expect(ship.maxShieldHp).toBe(3);
    expect(ship.isInvulnerable).toBe(false);
    expect(ship.isBoosting).toBe(false);
    expect(ship.tilt).toBe(0);
  });

  it('shifts lanes with shiftLane and smoothly glides towards lane position', () => {
    expect(ship.currentLane).toBe(1); // 400 defaults to lane index 1 (325)
    ship.shiftLane(1);
    expect(ship.currentLane).toBe(2);
    expect(ship.targetX).toBe(475);

    ship.update(0.1);
    expect(ship.x).toBeGreaterThan(400);

    ship.shiftLane(-1);
    expect(ship.currentLane).toBe(1);
    expect(ship.targetX).toBe(325);
  });

  it('clamps ship position strictly within track boundaries', () => {
    for (let i = 0; i < 5; i++) {
      ship.shiftLane(1);
    }
    expect(ship.currentLane).toBe(3);
    expect(ship.targetX).toBe(625);

    for (let i = 0; i < 5; i++) {
      ship.shiftLane(-1);
    }
    expect(ship.currentLane).toBe(0);
    expect(ship.targetX).toBe(175);
  });

  it('smoothly follows target X coordinate with setTargetX', () => {
    ship.setTargetX(600, 0.1);
    expect(ship.targetX).toBe(625);
    ship.update(0.1);
    expect(ship.x).toBeGreaterThan(400);
    expect(ship.x).toBeLessThanOrEqual(625);
    expect(ship.tilt).toBeGreaterThan(0);
  });

  it('takes damage and activates invulnerability flash timer', () => {
    const damaged = ship.takeDamage(1);
    expect(damaged).toBe(true);
    expect(ship.shieldHp).toBe(2);
    expect(ship.isInvulnerable).toBe(true);
    expect(ship.invulnerabilityTimer).toBeGreaterThan(0);

    // Further damage ignored while invulnerable
    const repeatDamaged = ship.takeDamage(1);
    expect(repeatDamaged).toBe(false);
    expect(ship.shieldHp).toBe(2);

    // Advance timer past invulnerability
    ship.update(2.0);
    expect(ship.isInvulnerable).toBe(false);

    // Can take damage again
    const secondDamaged = ship.takeDamage(1);
    expect(secondDamaged).toBe(true);
    expect(ship.shieldHp).toBe(1);
  });

  it('activates boost, granting invulnerability and timer', () => {
    ship.activateBoost(3.0);
    expect(ship.isBoosting).toBe(true);
    expect(ship.boostTimer).toBe(3.0);
    expect(ship.isInvulnerable).toBe(true);

    // Cannot take damage while boosting
    const damaged = ship.takeDamage(1);
    expect(damaged).toBe(false);
    expect(ship.shieldHp).toBe(3);

    ship.update(3.5);
    expect(ship.isBoosting).toBe(false);
    expect(ship.isInvulnerable).toBe(false);
  });

  it('repairs shield up to maxShieldHp', () => {
    ship.takeDamage(2);
    ship.update(2.0); // Clear invulnerability
    expect(ship.shieldHp).toBe(1);

    ship.repairShield(1);
    expect(ship.shieldHp).toBe(2);

    ship.repairShield(5);
    expect(ship.shieldHp).toBe(3);
  });
});
