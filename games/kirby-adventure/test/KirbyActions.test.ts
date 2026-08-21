import { describe, it, expect, beforeEach } from 'vitest';
import { KirbyActions, MAX_FLOAT_PUFFS } from '../src/KirbyActions';
import { KirbyPhysics } from '../src/KirbyPhysics';
import { ProjectileManager } from '../src/Projectile';
import { TileMap } from '../src/TileMap';
import { TileType } from '../src/types';

describe('KirbyActions', () => {
  let actions: KirbyActions;
  let physics: KirbyPhysics;
  let projectiles: ProjectileManager;
  let tileMap: TileMap;

  beforeEach(() => {
    actions = new KirbyActions();
    physics = new KirbyPhysics({ x: 50, y: 50 });
    projectiles = new ProjectileManager();
    tileMap = new TileMap(10, 10, 16, new Array(100).fill(TileType.AIR));
  });

  it('manages inhale cone and line of sight', () => {
    const cone = actions.getInhaleCone(physics);
    expect(cone.direction).toBe(1);

    // Target inside unobstructed cone
    const inCone = actions.isInInhaleCone(cone, { x: 90, y: 50, width: 16, height: 16 }, tileMap);
    expect(inCone).toBe(true);

    // Add solid wall in between
    tileMap.setTile(4, 3, TileType.SOLID);
    const blocked = actions.isInInhaleCone(cone, { x: 90, y: 50, width: 16, height: 16 }, tileMap);
    expect(blocked).toBe(false);
  });

  it('captures in mouth and spits star', () => {
    actions.captureInMouth({ type: 'enemy', abilityGrant: 'sword' });
    expect(actions.mouthContent).not.toBeNull();

    actions.spit(physics, projectiles);
    expect(actions.mouthContent).toBeNull();
    expect(projectiles.getProjectiles().length).toBe(1);
    expect(projectiles.getProjectiles()[0].type).toBe('star');
  });

  it('limits float puffs to 6 max and exhales air bullet', () => {
    for (let i = 0; i < MAX_FLOAT_PUFFS; i++) {
      expect(actions.puffFloat(physics)).toBe(true);
    }
    expect(actions.puffFloat(physics)).toBe(false); // Exceeded max
    expect(actions.isFloating).toBe(true);

    actions.exhaleAirBullet(physics, projectiles);
    expect(actions.isFloating).toBe(false);
    expect(actions.floatPuffCount).toBe(0);
    expect(projectiles.getProjectiles().length).toBe(1);
    expect(projectiles.getProjectiles()[0].type).toBe('air_bullet');
  });

  it('performs low profile slide attack', () => {
    physics.grounded = true;
    expect(actions.startSlide(physics)).toBe(true);
    expect(actions.isSliding).toBe(true);

    actions.update(0.35, physics);
    expect(actions.isSliding).toBe(false);
  });

  it('handles stable ducking and mid-air inhale', () => {
    physics.grounded = true;
    actions.setDucking(true, physics);
    expect(actions.isDucking).toBe(true);
    expect(physics.vx).toBe(0);

    actions.setDucking(false, physics);
    expect(actions.isDucking).toBe(false);

    // Mid-air inhale
    physics.grounded = false;
    actions.startInhale();
    expect(actions.isInhaling).toBe(true);

    actions.update(0.1, physics);
    expect(physics.vy).toBeLessThanOrEqual(100);
  });
});
