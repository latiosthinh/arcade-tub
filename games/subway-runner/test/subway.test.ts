import { describe, it, expect, beforeEach } from 'vitest';
import { LaneRunnerEngine } from '../src/LaneRunnerEngine.js';
import { TrainTrackGenerator } from '../src/TrainTrackGenerator.js';
import { GameState } from '../src/GameState.js';

describe('Subway Runner Engine', () => {
  describe('LaneRunnerEngine', () => {
    let runner: LaneRunnerEngine;

    beforeEach(() => {
      runner = new LaneRunnerEngine();
    });

    it('initializes in the middle lane (lane 1 of 3)', () => {
      expect(runner.currentLane).toBe(1);
      expect(runner.targetLane).toBe(1);
      expect(runner.laneOffset).toBe(0);
      expect(runner.actionState).toBe('running');
    });

    it('shifts left and right within 3-lane bounds', () => {
      expect(runner.moveLeft()).toBe(true);
      expect(runner.targetLane).toBe(0);
      expect(runner.moveLeft()).toBe(false); // bounded at 0

      expect(runner.moveRight()).toBe(true);
      expect(runner.targetLane).toBe(1);
      expect(runner.moveRight()).toBe(true);
      expect(runner.targetLane).toBe(2);
      expect(runner.moveRight()).toBe(false); // bounded at 2
    });

    it('handles jump kinematics and landing', () => {
      expect(runner.jump()).toBe(true);
      expect(runner.actionState).toBe('jumping');
      expect(runner.vy).toBeGreaterThan(0);

      // Step forward
      runner.update(0.1);
      expect(runner.yOffset).toBeGreaterThan(0);

      // Advance through full jump arc
      for (let i = 0; i < 60; i++) {
        runner.update(1 / 60);
      }
      expect(runner.actionState).toBe('running');
      expect(runner.yOffset).toBe(0);
    });

    it('handles slide mechanics and timeout', () => {
      expect(runner.slide()).toBe(true);
      expect(runner.actionState).toBe('sliding');
      expect(runner.slideTimer).toBeGreaterThan(0);

      const hitbox = runner.getHitbox();
      expect(hitbox.isSlidingLow).toBe(true);
      expect(hitbox.height).toBeLessThan(40);

      // Advance past slide timer
      for (let i = 0; i < 60; i++) {
        runner.update(1 / 60);
      }
      expect(runner.actionState).toBe('running');
    });

    it('manages hoverboard shield life cycle', () => {
      expect(runner.hasHoverboard).toBe(false);
      runner.activateHoverboard(10);
      expect(runner.hasHoverboard).toBe(true);
      expect(runner.hoverboardTimer).toBe(10);

      const absorbed = runner.consumeHoverboardShield();
      expect(absorbed).toBe(true);
      expect(runner.hasHoverboard).toBe(false);
      expect(runner.consumeHoverboardShield()).toBe(false);
    });
  });

  describe('TrainTrackGenerator', () => {
    let track: TrainTrackGenerator;

    beforeEach(() => {
      track = new TrainTrackGenerator();
    });

    it('generates oncoming obstacles and items', () => {
      expect(track.obstacles.length).toBeGreaterThan(0);
      expect(track.items.length).toBeGreaterThan(0);
    });

    it('scrolls obstacles and recycles track segments', () => {
      const initialCount = track.obstacles.length;
      track.update(2.0, 500); // 1000 units forward
      expect(track.obstacles.length).toBeGreaterThanOrEqual(initialCount - 2);
    });

    it('detects jump clearance over low barrier', () => {
      track.obstacles = [
        {
          id: 99,
          lane: 1,
          z: 20,
          type: 'barrier_low',
          lengthZ: 30,
          height: 35,
          passableBy: 'jump'
        }
      ];

      // Player running into low barrier -> Collided
      const runningCheck = track.checkCollision(0, 0, 'running');
      expect(runningCheck.collided).toBe(true);

      // Player jumping over low barrier -> Clear
      const jumpingCheck = track.checkCollision(0, 50, 'jumping');
      expect(jumpingCheck.collided).toBe(false);
    });

    it('detects slide clearance under high barrier', () => {
      track.obstacles = [
        {
          id: 100,
          lane: 1,
          z: 20,
          type: 'barrier_high',
          lengthZ: 30,
          height: 70,
          passableBy: 'slide'
        }
      ];

      // Player running into high barrier -> Collided
      const runningCheck = track.checkCollision(0, 0, 'running');
      expect(runningCheck.collided).toBe(true);

      // Player sliding under high barrier -> Clear
      const slidingCheck = track.checkCollision(0, 0, 'sliding');
      expect(slidingCheck.collided).toBe(false);
    });

    it('attracts and collects coins', () => {
      track.items = [
        { id: 1, lane: 0, z: 100, type: 'coin', collected: false, yOffset: 0 },
        { id: 2, lane: 2, z: 150, type: 'coin', collected: false, yOffset: 0 }
      ];

      track.attractCoins(1, 0, 300, 1/60);
      expect(track.items[0].lane).toBe(1);
      expect(track.items[1].lane).toBe(1);
    });
  });

  describe('GameState', () => {
    let state: GameState;

    beforeEach(() => {
      state = new GameState();
      state.startGame();
    });

    it('progresses score and distance with speed ramp', () => {
      state.update(2.0, false);
      expect(state.distance).toBeGreaterThan(0);
      expect(state.score).toBeGreaterThan(0);
      expect(state.currentSpeed).toBeGreaterThan(state.baseSpeed);
    });

    it('multiplies coin scores when 2x powerup active', () => {
      state.addCoin(false);
      expect(state.coinsCollected).toBe(1);
      expect(state.score).toBe(10);

      state.addCoin(true);
      expect(state.coinsCollected).toBe(2);
      expect(state.score).toBe(30); // 10 + 20
    });
  });
});
