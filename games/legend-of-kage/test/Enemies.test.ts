import { describe, it, expect, beforeEach } from 'vitest';
import { RedNinja } from '../src/enemies/RedNinja';
import { BlueNinja } from '../src/enemies/BlueNinja';
import { WhiteNinja } from '../src/enemies/WhiteNinja';
import { FireMonk } from '../src/enemies/FireMonk';
import { SorcererBoss } from '../src/enemies/SorcererBoss';
import { ProjectileManager } from '../src/ProjectileManager';
import { TreeCanopy } from '../src/TreeCanopy';

describe('Enemy AI Hierarchy (ENMY-01..05)', () => {
  let projectiles: ProjectileManager;
  let canopy: TreeCanopy;

  beforeEach(() => {
    projectiles = new ProjectileManager();
    canopy = new TreeCanopy();
  });

  it('RedNinja runs and executes forward low leaps (ENMY-01)', () => {
    const red = new RedNinja('red_1', 300, 536);
    red.isGrounded = true;
    red.update(0.1, 100, 536, canopy, projectiles, 560);
    expect(red.facing).toBe(-1); // Facing player on left
  });

  it('BlueNinja throws shurikens and bounds across canopies (ENMY-02)', () => {
    const blue = new BlueNinja('blue_1', 300, 200);
    blue.update(1.5, 100, 200, canopy, projectiles, 560);
    expect(projectiles.getProjectiles().length).toBeGreaterThanOrEqual(1);
  });

  it('WhiteNinja spreads 3-way shuriken spread (ENMY-03)', () => {
    const white = new WhiteNinja('white_1', 400, 300);
    white.update(1.6, 200, 300, canopy, projectiles, 560);
    expect(projectiles.getProjectiles().length).toBe(3);
  });

  it('FireMonk breathes fireballs across ground (ENMY-04)', () => {
    const monk = new FireMonk('monk_1', 400, 534);
    monk.update(2.0, 200, 534, canopy, projectiles, 560);
    const p = projectiles.getProjectiles().find((item) => item.type === 'fireball');
    expect(p).toBeDefined();
  });

  it('SorcererBoss teleports and has 8 HP (ENMY-05)', () => {
    const boss = new SorcererBoss('boss_1', 600, 300);
    expect(boss.hp).toBe(8);
    expect(boss.takeHit(4)).toBe(false);
    expect(boss.hp).toBe(4);
    expect(boss.takeHit(4)).toBe(true); // Defeated
    expect(boss.isDead).toBe(true);
  });
});
