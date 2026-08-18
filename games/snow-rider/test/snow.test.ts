import { describe, it, expect, beforeEach } from 'vitest';
import { SledPhysics } from '../src/SledPhysics.js';
import { GameState } from '../src/GameState.js';
import { SlopeGenerator } from '../src/SlopeGenerator.js';

describe('SnowRider Core Mechanics', () => {
  describe('SledPhysics', () => {
    let sled: SledPhysics;

    beforeEach(() => {
      sled = new SledPhysics();
    });

    it('initializes at track center and grounded', () => {
      expect(sled.x).toBe(0);
      expect(sled.y).toBe(0);
      expect(sled.isGrounded).toBe(true);
      expect(sled.tilt).toBe(0);
    });

    it('steers laterally and clamps within track boundaries', () => {
      sled.steer(1);
      for (let i = 0; i < 60; i++) {
        sled.update(1 / 60);
      }
      expect(sled.x).toBeGreaterThan(0);
      expect(sled.x).toBeLessThanOrEqual(0.92);
      expect(sled.tilt).toBeGreaterThan(0);

      sled.steer(-1);
      for (let i = 0; i < 120; i++) {
        sled.update(1 / 60);
      }
      expect(sled.x).toBeLessThan(0);
      expect(sled.x).toBeGreaterThanOrEqual(-0.92);
      expect(sled.tilt).toBeLessThan(0);
    });

    it('jumps and falls back down to snow slope under gravity', () => {
      const jumped = sled.jump();
      expect(jumped).toBe(true);
      expect(sled.isGrounded).toBe(false);
      expect(sled.vy).toBeGreaterThan(0);

      sled.update(0.1);
      expect(sled.y).toBeGreaterThan(0);

      // Simulate full arc
      for (let i = 0; i < 60; i++) {
        sled.update(1 / 60);
      }

      expect(sled.isGrounded).toBe(true);
      expect(sled.y).toBe(0);
      expect(sled.vy).toBe(0);
    });
  });

  describe('GameState', () => {
    let state: GameState;

    beforeEach(() => {
      state = new GameState();
      state.reset();
    });

    it('initializes with 0 distance and 0 gifts', () => {
      expect(state.distance).toBe(0);
      expect(state.giftsCollected).toBe(0);
      expect(state.score).toBe(0);
      expect(state.currentSpeed).toBe(state.baseSpeed);
    });

    it('accumulates distance and accelerates speed multiplier', () => {
      state.update(5);
      expect(state.distance).toBeGreaterThan(0);
      expect(state.score).toBeGreaterThan(0);
      expect(state.currentSpeed).toBeGreaterThan(state.baseSpeed);
      expect(state.currentSpeed).toBeLessThanOrEqual(state.maxSpeed);
    });

    it('collects gifts and awards bonus score', () => {
      state.collectGift();
      expect(state.giftsCollected).toBe(1);
      expect(state.score).toBe(50);

      state.collectGift();
      expect(state.giftsCollected).toBe(2);
      expect(state.score).toBe(100);
    });
  });

  describe('SlopeGenerator', () => {
    let generator: SlopeGenerator;

    beforeEach(() => {
      generator = new SlopeGenerator({ maxZ: 800, minSpacing: 60 });
    });

    it('generates items with valid lateral ranges and forward distances', () => {
      expect(generator.items.length).toBeGreaterThan(0);
      for (const item of generator.items) {
        expect(item.x).toBeGreaterThanOrEqual(-1.0);
        expect(item.x).toBeLessThanOrEqual(1.0);
        expect(item.z).toBeGreaterThan(0);
      }
    });

    it('moves items closer to player as speed progresses', () => {
      const firstItem = generator.items[0];
      const initialZ = firstItem.z;

      generator.update(0.5, 200);
      expect(firstItem.z).toBeLessThan(initialZ);
    });

    it('recycles items and spawns new ones to maintain stream', () => {
      const initialCount = generator.items.length;
      generator.update(10, 400); // 10 seconds rapid descent
      expect(generator.items.length).toBeGreaterThanOrEqual(initialCount - 2);
    });
  });
});
