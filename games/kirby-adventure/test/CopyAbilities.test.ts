import { describe, it, expect, beforeEach } from 'vitest';
import { AbilityRegistry } from '../src/abilities/AbilityRegistry';
import { KirbyPhysics } from '../src/KirbyPhysics';
import { ProjectileManager } from '../src/Projectile';
import { AbilityStar } from '../src/abilities/AbilityStar';
import { TileMap } from '../src/TileMap';
import { TileType } from '../src/types';

describe('Copy Abilities', () => {
  let physics: KirbyPhysics;
  let projectiles: ProjectileManager;
  let tileMap: TileMap;

  beforeEach(() => {
    physics = new KirbyPhysics({ x: 50, y: 50 });
    projectiles = new ProjectileManager();
    tileMap = new TileMap(10, 10, 16, new Array(100).fill(TileType.AIR));
  });

  it('creates and executes Sword ability combo', () => {
    const sword = AbilityRegistry.create('sword');
    expect(sword.displayName).toBe('Sword');

    sword.activate(physics, projectiles);
    expect(sword.isAttacking()).toBe(true);

    const hit = sword.update(0.1, physics, projectiles);
    expect(hit).not.toBeNull();
    expect(hit?.damage).toBe(2);
    expect(hit?.element).toBe('sword');
  });

  it('creates and executes Fire ability breath and dash', () => {
    const fire = AbilityRegistry.create('fire');
    fire.activate(physics, projectiles);
    expect(fire.isAttacking()).toBe(true);

    const breathHit = fire.update(0.1, physics, projectiles);
    expect(breathHit?.element).toBe('fire');
  });

  it('creates and executes Ice ability', () => {
    const ice = AbilityRegistry.create('ice');
    ice.activate(physics, projectiles);
    const hit = ice.update(0.1, physics, projectiles);
    expect(hit?.element).toBe('ice');
  });

  it('creates and executes Beam ability whip', () => {
    const beam = AbilityRegistry.create('beam');
    beam.activate(physics, projectiles);
    const hit = beam.update(0.1, physics, projectiles);
    expect(hit?.element).toBe('beam');
  });

  it('creates and executes Cutter ability boomerang', () => {
    const cutter = AbilityRegistry.create('cutter');
    cutter.activate(physics, projectiles);
    expect(projectiles.getProjectiles().length).toBe(1);
    expect(projectiles.getProjectiles()[0].type).toBe('cutter');
  });

  it('creates and executes Stone ability invulnerable crush', () => {
    const stone = AbilityRegistry.create('stone');
    stone.activate(physics, projectiles);
    expect(stone.isAttacking()).toBe(true);

    const hit = stone.update(0.1, physics, projectiles);
    expect(hit?.isInvulnerable).toBe(true);
    expect(hit?.element).toBe('stone');
  });

  it('creates and executes Spark and Needle abilities', () => {
    const spark = AbilityRegistry.create('spark');
    spark.activate(physics, projectiles);
    const sparkHit = spark.update(0.1, physics, projectiles);
    expect(sparkHit?.element).toBe('spark');

    const needle = AbilityRegistry.create('needle');
    needle.activate(physics, projectiles);
    const needleHit = needle.update(0.1, physics, projectiles);
    expect(needleHit?.element).toBe('needle');
  });

  it('handles AbilityStar bouncing and lifespan', () => {
    const star = new AbilityStar(50, 50, 'sword', 1);
    expect(star.ability).toBe('sword');
    expect(star.isDead).toBe(false);

    star.update(3.5, tileMap);
    expect(star.isDead).toBe(true);
  });
});
