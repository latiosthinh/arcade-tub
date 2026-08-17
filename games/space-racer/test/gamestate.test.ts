import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameState } from '../src/GameState';
import { Ship } from '../src/Ship';
import { TrackHazardManager } from '../src/TrackHazardManager';

describe('GameState lifecycle and scoring', () => {
  let state: GameState;
  let ship: Ship;
  let hazardManager: TrackHazardManager;

  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, val: string) => { store[key] = val; },
    });

    state = new GameState();
    ship = new Ship();
    hazardManager = new TrackHazardManager();
  });

  it('initializes in ready state with default metrics', () => {
    expect(state.status).toBe('ready');
    expect(state.score).toBe(0);
    expect(state.distance).toBe(0);
    expect(state.gatesCleared).toBe(0);
    expect(state.asteroidsDodged).toBe(0);
    expect(state.nearMisses).toBe(0);
  });

  it('starts game and transitions to playing state', () => {
    state.start();
    expect(state.status).toBe('playing');
  });

  it('accumulates distance and calculates speed on update', () => {
    state.start();
    state.update(0.1, ship, hazardManager);
    expect(state.distance).toBeGreaterThan(0);
    expect(state.speed).toBeGreaterThanOrEqual(300);
    expect(state.score).toBeGreaterThan(0);
  });

  it('handles pause and resume', () => {
    state.start();
    state.pause();
    expect(state.status).toBe('paused');

    state.update(0.1, ship, hazardManager);
    const distBefore = state.distance;
    expect(distBefore).toBe(0); // paused, no update

    state.resume();
    expect(state.status).toBe('playing');
  });

  it('processes collision with asteroid: deducts shield and causes gameover when 0', () => {
    state.start();
    const obs = hazardManager.spawnObstacle('asteroid', 400);

    // Hit 1
    state.processCollision(obs, ship);
    expect(ship.shieldHp).toBe(2);
    expect(state.status).toBe('playing');

    // Hit 2
    ship.update(2.0); // clear invulnerability
    state.processCollision(obs, ship);
    expect(ship.shieldHp).toBe(1);

    // Hit 3 -> fatal
    ship.update(2.0);
    state.processCollision(obs, ship);
    expect(ship.shieldHp).toBe(0);
    expect(state.status).toBe('gameover');
  });

  it('processes boost ring: awards 500 pts, clears gate, activates boost, repairs shield', () => {
    state.start();
    ship.takeDamage(1);
    ship.update(2.0);
    expect(ship.shieldHp).toBe(2);

    const ring = hazardManager.spawnObstacle('boost-ring', 400);
    state.processCollision(ring, ship);

    expect(state.gatesCleared).toBe(1);
    expect(state.score).toBeGreaterThanOrEqual(500);
    expect(ship.isBoosting).toBe(true);
    expect(ship.shieldHp).toBe(3);
  });

  it('awards near-miss points when dodging obstacle close by', () => {
    state.start();
    state.addNearMiss();
    expect(state.nearMisses).toBe(1);
    expect(state.score).toBeGreaterThanOrEqual(150);
  });

  it('persists and updates high score upon gameover', () => {
    state.start();
    state.score = 5400;
    state.triggerGameOver();

    expect(state.status).toBe('gameover');
    expect(state.highScore).toBe(5400);
    expect(localStorage.getItem('arcade-carnival-space-racer-highscore')).toBe('5400');
  });

  it('restarts game cleanly resetting metrics', () => {
    state.start();
    state.score = 1200;
    state.distance = 800;
    state.restart(ship, hazardManager);

    expect(state.status).toBe('playing');
    expect(state.score).toBe(0);
    expect(state.distance).toBe(0);
    expect(ship.shieldHp).toBe(3);
    expect(hazardManager.getObstacles().length).toBe(0);
  });
});
