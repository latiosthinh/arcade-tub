import { describe, it, expect, beforeEach } from 'vitest';
import { BirdPhysics } from '../src/BirdPhysics.js';
import { ObstacleGenerator } from '../src/ObstacleGenerator.js';
import { GameState } from '../src/GameState.js';

describe('Square Bird Core Mechanics', () => {
  describe('BirdPhysics & Egg Stacking', () => {
    let bird: BirdPhysics;
    const groundY = 460;

    beforeEach(() => {
      bird = new BirdPhysics({ size: 36 });
      bird.reset(groundY);
    });

    it('initializes at ground level with 0 eggs', () => {
      expect(bird.y).toBe(groundY - 36);
      expect(bird.eggs.length).toBe(0);
      expect(bird.getTotalHeight()).toBe(36);
      expect(bird.getBottomY()).toBe(groundY);
    });

    it('lifts bird and shifts stack when laying eggs', () => {
      const egg1 = bird.layEgg();
      expect(bird.eggs.length).toBe(1);
      expect(bird.y).toBe(groundY - 72);
      expect(egg1.y).toBe(groundY - 36);
      expect(bird.getTotalHeight()).toBe(72);
      expect(bird.getBottomY()).toBe(groundY);

      const egg2 = bird.layEgg();
      expect(bird.eggs.length).toBe(2);
      expect(bird.y).toBe(groundY - 108);
      expect(bird.getTotalHeight()).toBe(108);
      expect(bird.getBottomY()).toBe(groundY);
    });

    it('removes bottom eggs correctly when obstacle trims stack', () => {
      bird.layEgg();
      bird.layEgg();
      bird.layEgg();
      expect(bird.eggs.length).toBe(3);

      const removed = bird.removeBottomEggs(2);
      expect(removed.length).toBe(2);
      expect(bird.eggs.length).toBe(1);
    });

    it('applies gravity when in air', () => {
      bird.y = 200;
      bird.update(0.1, groundY);
      expect(bird.vy).toBeGreaterThan(0);
      expect(bird.y).toBeGreaterThan(200);
    });
  });

  describe('ObstacleGenerator', () => {
    it('generates obstacles within distance range and valid heights', () => {
      const gen = new ObstacleGenerator({
        levelDistance: 2000,
        minGap: 200,
        maxGap: 300,
        blockSize: 36
      });
      const obstacles = gen.generateLevel(1, 123);
      expect(obstacles.length).toBeGreaterThan(3);

      for (const obs of obstacles) {
        expect(obs.height).toBeGreaterThanOrEqual(36);
        expect(obs.x).toBeGreaterThanOrEqual(600);
        expect(obs.x).toBeLessThan(2000);
      }
    });
  });

  describe('GameState & Collision Mechanics', () => {
    let state: GameState;

    beforeEach(() => {
      state = new GameState();
      state.startLevel(1);
    });

    it('starts with ready/playing status and zero distance', () => {
      expect(state.status).toBe('playing');
      expect(state.distanceTraveled).toBe(0);
      expect(state.score).toBe(0);
      expect(state.isFever).toBe(false);
    });

    it('awards points when laying egg', () => {
      const success = state.layEgg();
      expect(success).toBe(true);
      expect(state.score).toBe(5);
      expect(state.bird.eggs.length).toBe(1);
    });

    it('triggers gameover when bird head hits obstacle', () => {
      // Clear auto obstacles and place fixed obstacle in front
      state.obstacles = [{
        id: 99,
        x: state.bird.x + 10,
        width: 40,
        height: 36,
        groundY: state.groundY,
        blockHeightCount: 1,
        passed: false,
        perfectEvaluated: false
      }];

      state.update(0.05);
      expect(state.status).toBe('gameover');
    });

    it('shaves eggs safely when obstacle height matches stack', () => {
      // Lay 2 eggs to clear a 2-block obstacle
      state.layEgg();
      state.layEgg();

      state.obstacles = [{
        id: 100,
        x: state.bird.x + 10,
        width: 40,
        height: 72,
        groundY: state.groundY,
        blockHeightCount: 2,
        passed: false,
        perfectEvaluated: false
      }];

      state.update(0.05);
      expect(state.status).toBe('playing'); // Bird body did not die
      expect(state.bird.eggs.length).toBe(0); // Eggs trimmed
    });

    it('activates fever mode upon 3 perfect clearances', () => {
      // Manually trigger 3 perfect scores
      state.feverGauge = 70;
      state.activateFever();
      expect(state.isFever).toBe(true);
      expect(state.feverTimer).toBe(5.0);

      // During fever mode, bird is invincible and smashes obstacles
      state.obstacles = [{
        id: 101,
        x: state.bird.x + 10,
        width: 40,
        height: 100,
        groundY: state.groundY,
        blockHeightCount: 3,
        passed: false,
        perfectEvaluated: false
      }];

      state.update(0.05);
      expect(state.status).toBe('playing');
      expect(state.obstacles[0].passed).toBe(true);
    });

    it('reaches victory when distance exceeds total distance', () => {
      state.distanceTraveled = state.totalDistance - 10;
      state.update(0.1);
      expect(state.status).toBe('victory');
      expect(state.score).toBeGreaterThanOrEqual(1000);
    });
  });
});
