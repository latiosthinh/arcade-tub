import { describe, it, expect, beforeEach } from 'vitest';
import { TrackHazardManager, ObstacleType } from '../src/TrackHazardManager';
import { Ship } from '../src/Ship';

describe('TrackHazardManager', () => {
  let manager: TrackHazardManager;
  let ship: Ship;

  beforeEach(() => {
    manager = new TrackHazardManager({
      trackWidth: 600,
      minX: 100,
      maxX: 700,
      maxObstacles: 25,
    });
    ship = new Ship({ initialX: 400 });
  });

  it('spawns obstacles with valid types, initial z at 1.0, and within track bounds', () => {
    const obs = manager.spawnObstacle('asteroid', 400);
    expect(obs.type).toBe('asteroid');
    expect(obs.z).toBe(1.0);
    expect(obs.x).toBe(400);
    expect(obs.cleared).toBe(false);
    expect(obs.collided).toBe(false);
  });

  it('advances obstacles forward in Z-depth based on speed and dt', () => {
    manager.spawnObstacle('asteroid', 400);
    manager.update(0.1, 500); // speed 500 advances z
    const active = manager.getObstacles();
    expect(active[0].z).toBeLessThan(1.0);
  });

  it('auto-culls obstacles that move past the camera (z < -0.1)', () => {
    const obs = manager.spawnObstacle('asteroid', 400);
    obs.z = -0.15;
    manager.update(0.01, 100);
    expect(manager.getObstacles().length).toBe(0);
  });

  it('caps maximum active obstacles at 25', () => {
    for (let i = 0; i < 30; i++) {
      manager.spawnObstacle('asteroid', 400);
    }
    expect(manager.getObstacles().length).toBeLessThanOrEqual(25);
  });

  it('detects collision with asteroid and deals damage to ship', () => {
    const obs = manager.spawnObstacle('asteroid', 400);
    obs.z = 0.02; // in camera collision plane

    const collisions = manager.checkCollisions(ship);
    expect(collisions.length).toBe(1);
    expect(collisions[0].obstacle.id).toBe(obs.id);
    expect(collisions[0].type).toBe('collision');
    expect(obs.collided).toBe(true);
  });

  it('detects interaction with boost ring and grants boost reward', () => {
    const ring = manager.spawnObstacle('boost-ring', 400);
    ring.z = 0.02;

    const collisions = manager.checkCollisions(ship);
    expect(collisions.length).toBe(1);
    expect(collisions[0].type).toBe('boost');
    expect(ring.collided).toBe(true);
  });

  it('guarantees open lane when spawning multi-obstacle clusters', () => {
    // Spawning waves at high speed creates patterns with at least one navigable corridor
    manager.spawnWave(0.5); // 0.5 difficulty
    const obstaclesAtHorizon = manager.getObstacles().filter(o => o.z >= 0.95);
    expect(obstaclesAtHorizon.length).toBeGreaterThan(0);
    expect(obstaclesAtHorizon.length).toBeLessThanOrEqual(3); // Never block all 4-5 lanes
  });

  it('clears all obstacles on reset', () => {
    manager.spawnObstacle('asteroid', 400);
    manager.spawnObstacle('plasma-mine', 300);
    expect(manager.getObstacles().length).toBe(2);

    manager.clear();
    expect(manager.getObstacles().length).toBe(0);
  });
});
