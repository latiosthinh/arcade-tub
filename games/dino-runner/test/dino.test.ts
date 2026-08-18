import { describe, it, expect, beforeEach } from 'vitest';
import { DinoPhysics } from '../src/DinoPhysics.js';
import { GameState } from '../src/GameState.js';
import { ObstacleSpawner } from '../src/ObstacleSpawner.js';

describe('DinoRunner Core Mechanics', () => {
  describe('DinoPhysics', () => {
    let dino: DinoPhysics;

    beforeEach(() => {
      dino = new DinoPhysics({ groundY: 300 });
    });

    it('initializes at ground height and standing state', () => {
      expect(dino.isGrounded).toBe(true);
      expect(dino.isDucking).toBe(false);
      expect(dino.y).toBe(300 - dino.standHeight);
    });

    it('applies vertical velocity on jump when grounded', () => {
      const result = dino.jump();
      expect(result).toBe(true);
      expect(dino.isGrounded).toBe(false);
      expect(dino.vy).toBeLessThan(0);
    });

    it('prevents double jump in air', () => {
      dino.jump();
      const secondJump = dino.jump();
      expect(secondJump).toBe(false);
    });

    it('falls back to ground under gravity after jump', () => {
      dino.jump();
      expect(dino.isGrounded).toBe(false);

      // Simulate 1.5 seconds of airtime
      for (let i = 0; i < 90; i++) {
        dino.update(1 / 60);
      }

      expect(dino.isGrounded).toBe(true);
      expect(dino.y).toBe(300 - dino.standHeight);
      expect(dino.vy).toBe(0);
    });

    it('switches to duck hitbox with smaller height', () => {
      const standBounds = dino.getBounds();
      dino.duck(true);
      const duckBounds = dino.getBounds();

      expect(dino.isDucking).toBe(true);
      expect(duckBounds.height).toBeLessThan(standBounds.height);
      expect(duckBounds.y).toBeGreaterThan(standBounds.y);
    });

    it('accelerates downward when ducking in mid-air', () => {
      dino.jump();
      const initialVy = dino.vy;
      dino.duck(true);
      expect(dino.vy).toBeGreaterThan(initialVy);
    });
  });

  describe('GameState', () => {
    let state: GameState;

    beforeEach(() => {
      state = new GameState();
      state.reset();
    });

    it('starts with 0 score and default speed', () => {
      expect(state.score).toBe(0);
      expect(state.currentSpeed).toBe(state.baseSpeed);
      expect(state.status).toBe('playing');
    });

    it('increases score and accelerates as distance accumulates', () => {
      state.update(10); // 10 seconds of gameplay
      expect(state.distanceTraveled).toBeGreaterThan(0);
      expect(state.score).toBeGreaterThan(0);
      expect(state.currentSpeed).toBeGreaterThan(state.baseSpeed);
      expect(state.currentSpeed).toBeLessThanOrEqual(state.maxSpeed);
    });

    it('transitions day to night based on cycle progression', () => {
      state.distanceTraveled = 300;
      state.update(0.1);
      expect(state.isNight).toBe(false);

      state.distanceTraveled = 700;
      state.update(0.1);
      expect(state.isNight).toBe(true);
    });

    it('triggers milestone pending on every 100 points', () => {
      state.distanceTraveled = 95;
      state.update(0.1);
      expect(state.milestonePending).toBe(false);

      state.distanceTraveled = 105;
      state.update(0.1);
      expect(state.milestonePending).toBe(true);
    });
  });

  describe('ObstacleSpawner', () => {
    let spawner: ObstacleSpawner;

    beforeEach(() => {
      spawner = new ObstacleSpawner({ groundY: 300 });
    });

    it('spawns only cacti in the early distance range', () => {
      for (let i = 0; i < 20; i++) {
        const obs = spawner.spawnObstacle(200);
        expect(obs.type.startsWith('cactus')).toBe(true);
        expect(obs.y + obs.height).toBe(300);
      }
    });

    it('spawns pterodactyls after distance threshold', () => {
      let hasPterodactyl = false;
      for (let i = 0; i < 50; i++) {
        const obs = spawner.spawnObstacle(800);
        if (obs.type.startsWith('pterodactyl')) {
          hasPterodactyl = true;
          break;
        }
      }
      expect(hasPterodactyl).toBe(true);
    });

    it('moves obstacles left and culls offscreen ones', () => {
      const obs = spawner.spawnObstacle(100);
      obs.x = 50;
      spawner.update(0.5, 360, 100);

      expect(obs.x).toBeLessThan(50);

      // Move completely past left boundary
      obs.x = -200;
      spawner.update(0.1, 360, 100);
      expect(spawner.obstacles.find(o => o.id === obs.id)).toBeUndefined();
    });
  });
});
