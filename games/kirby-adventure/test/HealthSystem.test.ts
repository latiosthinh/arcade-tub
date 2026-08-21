import { describe, it, expect, beforeEach } from 'vitest';
import { HealthSystem, MAX_HP, INITIAL_LIVES } from '../src/HealthSystem';

describe('HealthSystem', () => {
  let health: HealthSystem;

  beforeEach(() => {
    health = new HealthSystem();
  });

  it('initializes with full HP and 3 lives', () => {
    expect(health.hp).toBe(MAX_HP);
    expect(health.lives).toBe(INITIAL_LIVES);
    expect(health.isDead).toBe(false);
  });

  it('takes damage and activates i-frames', () => {
    const res = health.takeDamage(2);
    expect(res.tookDamage).toBe(true);
    expect(res.knockedBack).toBe(true);
    expect(health.hp).toBe(4);
    expect(health.isInvulnerable()).toBe(true);

    // Second hit during i-frames is ignored
    const res2 = health.takeDamage(1);
    expect(res2.tookDamage).toBe(false);
    expect(health.hp).toBe(4);
  });

  it('heals up to max HP', () => {
    health.takeDamage(4);
    health.heal(2);
    expect(health.hp).toBe(4);

    health.healFull();
    expect(health.hp).toBe(MAX_HP);
  });

  it('handles death and respawn', () => {
    health.takeDamage(6);
    expect(health.hp).toBe(0);
    expect(health.isDead).toBe(true);
    expect(health.lives).toBe(2);

    health.respawn();
    expect(health.hp).toBe(MAX_HP);
    expect(health.isDead).toBe(false);
    expect(health.isInvulnerable()).toBe(true);
  });

  it('triggers game over when lives reach 0', () => {
    health.die(); // lives 2
    health.die(); // lives 1
    health.die(); // lives 0
    expect(health.isGameOver).toBe(true);
  });
});
