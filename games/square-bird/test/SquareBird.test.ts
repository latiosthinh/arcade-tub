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
      expect(egg1).not.toBeNull();
      expect(bird.eggs.length).toBe(1);
      expect(bird.y).toBe(groundY - 72);
      expect(egg1?.y).toBe(groundY - 36);
      expect(bird.getTotalHeight()).toBe(72);
      expect(bird.getBottomY()).toBe(groundY);

      bird.eggCooldownTimer = 0;
      const egg2 = bird.layEgg();
      expect(egg2).not.toBeNull();
      expect(bird.eggs.length).toBe(2);
      expect(bird.y).toBe(groundY - 108);
      expect(bird.getTotalHeight()).toBe(108);
      expect(bird.getBottomY()).toBe(groundY);
    });

    it('enforces max egg stack and anti-spam limits', () => {
      for (let i = 0; i < 7; i++) {
        bird.eggCooldownTimer = 0;
        const egg = bird.layEgg();
        expect(egg).not.toBeNull();
      }
      expect(bird.eggs.length).toBe(7);

      // Attempt 8th egg -> rejected by max stack limit
      bird.eggCooldownTimer = 0;
      const overflowEgg = bird.layEgg();
      expect(overflowEgg).toBeNull();
      expect(bird.eggs.length).toBe(7);
    });

    it('removes bottom eggs correctly when obstacle trims stack', () => {
      bird.layEgg();
      bird.eggCooldownTimer = 0;
      bird.layEgg();
      bird.eggCooldownTimer = 0;
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

    it('tracks egg block lifetime and expires after duration', () => {
      const egg = bird.layEgg(3.0);
      expect(egg).not.toBeNull();
      expect(egg?.lifeTime).toBe(3.0);
      expect(egg?.maxLifeTime).toBe(3.0);

      const expiredEggs: any[] = [];
      bird.onEggExpire = (e) => expiredEggs.push(e);

      // Advance 1.5s -> egg still alive
      bird.update(1.5, groundY);
      expect(bird.eggs.length).toBe(1);
      expect(bird.eggs[0].lifeTime).toBeCloseTo(1.5);
      expect(expiredEggs.length).toBe(0);

      // Advance 1.6s -> total 3.1s -> egg expired and removed
      bird.update(1.6, groundY);
      expect(bird.eggs.length).toBe(0);
      expect(expiredEggs.length).toBe(1);
      expect(expiredEggs[0].id).toBe(egg?.id);
      expect(bird.y).toBe(groundY - 36); // Bird fell back to ground
    });

    it('handles multiple eggs expiring at different times and settles stack', () => {
      const egg1 = bird.layEgg(2.0); // bottom egg
      bird.eggCooldownTimer = 0;
      const egg2 = bird.layEgg(4.0); // top egg under bird
      expect(bird.eggs.length).toBe(2);

      // Advance 2.5s -> egg1 expired, egg2 remains
      bird.update(2.5, groundY);
      expect(bird.eggs.length).toBe(1);
      expect(bird.eggs[0].id).toBe(egg2?.id);
      // Bird and egg2 should fall to ground
      expect(bird.getBottomY()).toBe(groundY);
      expect(bird.y).toBe(groundY - 72);
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

    it('streams procedural obstacles ahead and culls passed obstacles in infinite mode', () => {
      const gen = new ObstacleGenerator({ blockSize: 36 });
      gen.reset();

      // Initially empty
      expect(gen.obstacles.length).toBe(0);

      // Generate initial chunk ahead
      const spawned = gen.generateAhead(0, 1800);
      expect(spawned.length).toBeGreaterThan(2);
      expect(gen.obstacles.length).toBe(spawned.length);

      const firstObsX = gen.obstacles[0].x;
      expect(firstObsX).toBeGreaterThanOrEqual(600);

      // Advance player to 3000px and generate more
      const nextChunk = gen.generateAhead(3000, 1800);
      expect(nextChunk.length).toBeGreaterThan(0);
      expect(gen.furthestGeneratedX).toBeGreaterThanOrEqual(4800);

      // Cull obstacles behind 2000px
      const totalBeforeCull = gen.obstacles.length;
      gen.cullBehind(2000, 300);
      expect(gen.obstacles.length).toBeLessThan(totalBeforeCull);
      expect(gen.obstacles[0].x + gen.obstacles[0].width).toBeGreaterThanOrEqual(1700);
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

    it('supports switching to infinite mode and stream progression', () => {
      state.startMode('infinite');
      expect(state.mode).toBe('infinite');
      expect(state.totalDistance).toBe(Infinity);
      expect(state.obstacles.length).toBeGreaterThan(0);
      expect(state.getProgress()).toBe(0);

      // Advance game loop in infinite mode
      state.update(1.0);
      expect(state.distanceTraveled).toBeGreaterThan(0);
      expect(state.status).toBe('playing'); // Never triggers victory in infinite mode
    });

    it('tracks and persists infinite high score', () => {
      state.startMode('infinite');
      state.score = 500;
      state.layEgg();
      expect(state.infiniteHighScore).toBe(505);
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
      state.bird.eggCooldownTimer = 0;
      state.layEgg();
      state.bird.eggCooldownTimer = 0;
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

    it('handles startMode validation and switches correctly between levels and infinite', () => {
      state.startMode('levels', 3);
      expect(state.mode).toBe('levels');
      expect(state.currentLevel).toBe(3);

      state.startMode('infinite');
      expect(state.mode).toBe('infinite');
      expect(state.totalDistance).toBe(Infinity);
    });
  });
});
