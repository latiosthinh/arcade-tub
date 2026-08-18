import { describe, it, expect, beforeEach } from 'vitest';
import { TowerGenerator } from '../src/TowerGenerator.js';
import { DropletPhysics } from '../src/DropletPhysics.js';
import { CollisionDetector } from '../src/CollisionDetector.js';
import { GameState } from '../src/GameState.js';

describe('TowerGenerator', () => {
  it('generates specified number of tiers', () => {
    const generator = new TowerGenerator({ totalTiers: 15, tierSpacing: 100 });
    const tiers = generator.generate(42);
    expect(tiers.length).toBe(15);
    expect(tiers[0].y).toBe(0);
    expect(tiers[1].y).toBe(100);
    expect(tiers[14].y).toBe(1400);
  });

  it('generates starting tier with a gap and goal tier fully safe', () => {
    const generator = new TowerGenerator({ totalTiers: 10 });
    const tiers = generator.generate(99);
    
    // First tier has a gap
    const hasGapInTier0 = tiers[0].sectors.some(s => s.type === 'gap');
    expect(hasGapInTier0).toBe(true);

    // Last tier is all safe
    expect(tiers[9].sectors.length).toBe(1);
    expect(tiers[9].sectors[0].type).toBe('safe');
    expect(tiers[9].sectors[0].endAngle - tiers[9].sectors[0].startAngle).toBeCloseTo(Math.PI * 2);
  });
});

describe('DropletPhysics', () => {
  let physics: DropletPhysics;

  beforeEach(() => {
    physics = new DropletPhysics({
      gravity: 1000,
      bounceImpulse: -400,
      maxFallVelocity: 800,
      fireVelocityThreshold: 600
    });
  });

  it('accelerates downwards under gravity', () => {
    physics.update(0.1);
    expect(physics.vy).toBe(100);
    expect(physics.y).toBe(10);
  });

  it('clamps velocity at maxFallVelocity', () => {
    physics.update(2.0); // 2000 velocity without clamp
    expect(physics.vy).toBe(800);
  });

  it('triggers fireball mode at speed threshold or streak >= 3', () => {
    expect(physics.isFireball).toBe(false);
    physics.update(0.7); // 700 vy >= 600
    expect(physics.isFireball).toBe(true);

    physics.reset();
    expect(physics.isFireball).toBe(false);
    physics.registerTierPass();
    physics.registerTierPass();
    physics.registerTierPass();
    expect(physics.isFireball).toBe(true);
  });

  it('bounces and resets velocity with impulse', () => {
    physics.vy = 500;
    physics.bounce(100);
    expect(physics.vy).toBe(-400);
    expect(physics.isFireball).toBe(false);
    expect(physics.comboStreak).toBe(0);
  });
});

describe('CollisionDetector', () => {
  it('detects safe landing on platform tier', () => {
    const droplet = new DropletPhysics();
    droplet.y = 95;
    droplet.vy = 200;

    const tiers = [
      {
        id: 0,
        y: 100,
        sectors: [{ startAngle: 0, endAngle: Math.PI * 2, type: 'safe' as const }]
      }
    ];

    const res = CollisionDetector.checkCollision(droplet, 80, tiers, 0, Math.PI * 0.5);
    expect(res.hit).toBe(true);
    expect(res.sectorType).toBe('safe');
    expect(res.smashed).toBe(false);
  });

  it('passes through gap sector without collision', () => {
    const droplet = new DropletPhysics();
    droplet.y = 105;
    droplet.vy = 300;

    const tiers = [
      {
        id: 0,
        y: 100,
        sectors: [{ startAngle: 0, endAngle: Math.PI * 2, type: 'gap' as const }]
      }
    ];

    const res = CollisionDetector.checkCollision(droplet, 80, tiers, 0, Math.PI * 0.5);
    expect(res.hit).toBe(false);
    expect(res.sectorType).toBe('gap');
    expect(droplet.comboStreak).toBe(1);
  });

  it('smashes platform when in fireball mode', () => {
    const droplet = new DropletPhysics();
    droplet.isFireball = true;
    droplet.y = 105;
    droplet.vy = 800;

    const tiers = [
      {
        id: 0,
        y: 100,
        sectors: [{ startAngle: 0, endAngle: Math.PI * 2, type: 'hazard' as const }],
        isSmashed: false
      }
    ];

    const res = CollisionDetector.checkCollision(droplet, 80, tiers, 0, Math.PI * 0.5);
    expect(res.hit).toBe(true);
    expect(res.smashed).toBe(true);
    expect(tiers[0].isSmashed).toBe(true);
  });
});

describe('GameState', () => {
  it('manages game lifecycle and progress', () => {
    const state = new GameState({ totalTiers: 10, tierSpacing: 100 });
    expect(state.status).toBe('ready');

    state.startLevel(1);
    expect(state.status).toBe('playing');
    expect(state.droplet.y).toBe(0);

    state.rotateTower(Math.PI / 4);
    expect(state.towerRotation).toBeCloseTo(Math.PI / 4);

    state.droplet.y = 450;
    const progress = state.getProgress();
    expect(progress).toBeCloseTo(0.5, 1);
  });
});
