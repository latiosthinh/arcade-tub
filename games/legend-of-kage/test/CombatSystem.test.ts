import { describe, it, expect, beforeEach } from 'vitest';
import { CombatSystem } from '../src/CombatSystem';
import { ProjectileManager } from '../src/ProjectileManager';

describe('CombatSystem (CMBT-01, CMBT-02, CMBT-04, CMBT-05)', () => {
  let combat: CombatSystem;
  let projectiles: ProjectileManager;

  beforeEach(() => {
    combat = new CombatSystem();
    projectiles = new ProjectileManager();
  });

  it('triggers 140° sword slash melee attack (CMBT-02)', () => {
    expect(combat.triggerSlash()).toBe(true);
    expect(combat.isSlashing).toBe(true);

    const hitbox = combat.getSwordHitbox(100, 200, 18, 24, 1);
    expect(hitbox).not.toBeNull();
    expect(hitbox?.x).toBe(118);
  });

  it('fires 8-directional shurikens based on input (CMBT-01)', () => {
    // Diagonal Up-Right
    const fired = combat.triggerShuriken(100, 200, 1, {
      left: false,
      right: true,
      up: true,
      down: false,
      jump: false,
      jumpJustPressed: false,
      shuriken: true,
      shurikenJustPressed: true,
      sword: false,
      swordJustPressed: false,
    }, projectiles);

    expect(fired).toBe(true);
    const p = projectiles.getProjectiles()[0];
    expect(p.vx).toBeGreaterThan(0);
    expect(p.vy).toBeLessThan(0); // Diagonal up-right
  });

  it('handles 1-hit kill, lives deduction, and respawn i-frames (CMBT-05)', () => {
    expect(combat.lives).toBe(3);
    combat.takeHit();
    expect(combat.isDead).toBe(true);
    expect(combat.lives).toBe(2);

    combat.respawn();
    expect(combat.isDead).toBe(false);
    expect(combat.isInvulnerable).toBe(true);
  });
});
