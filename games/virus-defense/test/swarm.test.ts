import { describe, it, expect, beforeEach } from 'vitest';
import { PathogenSwarm, Pathogen } from '../src/PathogenSwarm';
import { NucleusState } from '../src/NucleusState';
import { Projectile } from '../src/Turret';

describe('PathogenSwarm', () => {
  let swarm: PathogenSwarm;
  let nucleus: NucleusState;

  beforeEach(() => {
    swarm = new PathogenSwarm(400, 300);
    nucleus = new NucleusState(400, 300);
  });

  it('spawns pathogen from perimeter outside center with velocity homing toward nucleus', () => {
    const p = swarm.spawn('spiker', 1.0, 0); // angle 0 (rightwards, x=400+500=900, y=300)
    expect(p).toBeDefined();
    expect(p.type).toBe('spiker');
    expect(p.x).toBeCloseTo(900);
    expect(p.y).toBeCloseTo(300);
    expect(p.hp).toBe(1);
    expect(p.active).toBe(true);

    // Homing velocity should point towards center (400, 300) -> vx < 0, vy approx 0
    expect(p.vx).toBeLessThan(0);
    expect(p.vy).toBeCloseTo(0);
  });

  it('spawns speedster, splitter, and shield-carrier with correct attributes', () => {
    const speedster = swarm.spawn('speedster', 1.0);
    expect(speedster.speed).toBeGreaterThan(90);
    expect(speedster.hp).toBe(1);

    const splitter = swarm.spawn('splitter', 1.0);
    expect(splitter.hp).toBe(2);
    expect(splitter.radius).toBeGreaterThan(speedster.radius);

    const shieldCarrier = swarm.spawn('shield-carrier', 1.0);
    expect(shieldCarrier.hp).toBe(3);
    expect(shieldCarrier.damage).toBe(20);
  });

  it('limits max concurrent active pathogens to 60 (T-17-02 mitigation)', () => {
    for (let i = 0; i < 70; i++) {
      swarm.spawn('spiker', 1.0);
    }
    expect(swarm.activePathogens.length).toBeLessThanOrEqual(60);
  });

  it('detects projectile collisions and deals damage', () => {
    const p = swarm.spawn('spiker', 1.0, 0); // x=900, y=300, radius 14
    const projectile: Projectile = {
      id: 1,
      x: 900,
      y: 300,
      vx: 600,
      vy: 0,
      radius: 4,
      damage: 1,
      distanceTraveled: 0,
      maxDistance: 600,
      active: true,
    };

    const hits = swarm.checkProjectileCollisions([projectile]);
    expect(hits.length).toBe(1);
    expect(hits[0].pathogen.id).toBe(p.id);
    expect(hits[0].killed).toBe(true);
    expect(p.active).toBe(false);
    expect(projectile.active).toBe(false);
  });

  it('splits splitter into two micro-spikers when destroyed', () => {
    const splitter = swarm.spawn('splitter', 1.0, 0); // 2 HP
    const p1: Projectile = {
      id: 1,
      x: splitter.x,
      y: splitter.y,
      vx: 600,
      vy: 0,
      radius: 4,
      damage: 1,
      distanceTraveled: 0,
      maxDistance: 600,
      active: true,
    };

    // Hit 1: hp goes 2 -> 1, not killed
    const res1 = swarm.checkProjectileCollisions([p1]);
    expect(res1[0].killed).toBe(false);
    expect(splitter.hp).toBe(1);
    expect(splitter.active).toBe(true);

    // Hit 2: hp goes 1 -> 0, killed, spawns 2 children
    const p2: Projectile = {
      id: 2,
      x: splitter.x,
      y: splitter.y,
      vx: 600,
      vy: 0,
      radius: 4,
      damage: 1,
      distanceTraveled: 0,
      maxDistance: 600,
      active: true,
    };
    const res2 = swarm.checkProjectileCollisions([p2]);
    expect(res2[0].killed).toBe(true);
    expect(splitter.active).toBe(false);
    expect(res2[0].splitChildren.length).toBe(2);

    // 2 children are now in activePathogens
    const microSpikers = swarm.activePathogens.filter((e) => e.isMicroSpiker);
    expect(microSpikers.length).toBe(2);
  });

  it('detects nucleus breach collision and inflicts nucleus damage', () => {
    const p = swarm.spawn('spiker', 1.0);
    // Move pathogen right onto nucleus perimeter (center 400, 300, radius 45)
    p.x = 440;
    p.y = 300;

    const breaches = swarm.checkNucleusCollisions(nucleus);
    expect(breaches.length).toBe(1);
    expect(nucleus.hp).toBe(90); // 100 - 10 = 90
    expect(p.active).toBe(false);
  });

  it('updates kinematics towards center with organic wobble', () => {
    const p = swarm.spawn('spiker', 1.0, 0); // x=900, y=300
    const startX = p.x;
    swarm.update(0.1);
    expect(p.x).toBeLessThan(startX);
  });
});
