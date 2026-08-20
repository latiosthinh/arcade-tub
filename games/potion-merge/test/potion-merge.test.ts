import { describe, it, expect, beforeEach } from 'vitest';
import { FlaskPhysics } from '../src/FlaskPhysics';
import { GameState, GEM_TIERS } from '../src/GameState';
import { PotionMergeEngine } from '../src/PotionMergeEngine';

describe('Gem Merge Mechanics', () => {
  describe('GameState', () => {
    let state: GameState;

    beforeEach(() => {
      state = new GameState();
    });

    it('has 11 distinct faceted gem tiers', () => {
      expect(GEM_TIERS.length).toBe(11);
      expect(GEM_TIERS[0].name).toBe('Quartz Shard');
      expect(GEM_TIERS[10].name).toBe('Grand Diamond Crown');
    });

    it('initializes in ready state with base values', () => {
      expect(state.status).toBe('ready');
      expect(state.score).toBe(0);
      expect(state.multiplier).toBe(1);
      expect(state.mergesCount).toBe(0);
    });

    it('starts game correctly and sets status to playing', () => {
      state.start();
      expect(state.status).toBe('playing');
      expect(state.score).toBe(0);
      expect(state.nextTier).toBeGreaterThanOrEqual(1);
      expect(state.nextTier).toBeLessThanOrEqual(4);
    });

    it('calculates score multipliers on consecutive merges', () => {
      state.start();
      // 1-2 merges -> 1x multiplier
      const pts1 = state.recordMerge(2);
      expect(pts1).toBe(GEM_TIERS[1].points * 1);
      expect(state.multiplier).toBe(1);

      // 3 merges -> 2x multiplier
      state.recordMerge(2);
      state.recordMerge(2);
      expect(state.multiplier).toBe(2);

      // 6 merges -> 3x multiplier
      state.recordMerge(2);
      state.recordMerge(2);
      state.recordMerge(2);
      expect(state.multiplier).toBe(3);

      // 10 merges -> 4x multiplier
      state.recordMerge(2);
      state.recordMerge(2);
      state.recordMerge(2);
      state.recordMerge(2);
      expect(state.multiplier).toBe(4);
    });

    it('resets combo when combo window expires', () => {
      state.start();
      state.recordMerge(2);
      state.recordMerge(2);
      state.recordMerge(2);
      expect(state.combo).toBe(3);
      expect(state.multiplier).toBe(2);

      // Fast-forward combo timer
      state.update(2.5, false);
      expect(state.combo).toBe(0);
      expect(state.multiplier).toBe(1);
    });

    it('triggers game over when overflow duration exceeds limit', () => {
      state.start();
      expect(state.status).toBe('playing');

      // Overflow for 3.1 seconds
      state.update(3.1, true);
      expect(state.status).toBe('gameover');
    });
  });

  describe('FlaskPhysics', () => {
    let physics: FlaskPhysics;

    beforeEach(() => {
      physics = new FlaskPhysics();
    });

    it('adds potion within flask vessel horizontal bounds', () => {
      const p1 = physics.addPotion(100, 200, 1); // out of left bound
      expect(p1.x).toBeGreaterThanOrEqual(physics.flaskLeft);

      const p2 = physics.addPotion(900, 200, 1); // out of right bound
      expect(p2.x).toBeLessThanOrEqual(physics.flaskRight);
    });

    it('merges two colliding potions of identical tier', () => {
      // Place two tier 1 potions at overlapping positions
      physics.addPotion(350, 400, 1, 0, 0);
      physics.addPotion(355, 400, 1, 0, 0);

      const events = physics.update(0.1);
      expect(events.length).toBe(1);
      expect(events[0].mergedTier).toBe(2);
      // New merged potion should be present
      expect(physics.potions.length).toBe(1);
      expect(physics.potions[0].tier).toBe(2);
    });

    it('does not merge potions of different tiers', () => {
      physics.addPotion(350, 400, 1, 0, 0);
      physics.addPotion(355, 400, 2, 0, 0);

      const events = physics.update(0.1);
      expect(events.length).toBe(0);
      expect(physics.potions.length).toBe(2);
    });

    it('detects overflow when potion is above danger line', () => {
      expect(physics.checkOverflow()).toBe(false);

      // Add settled potion above ceiling
      const p = physics.addPotion(350, physics.dangerCeilingY - 10, 1, 0, 0);
      p.vy = 0;
      expect(physics.checkOverflow()).toBe(true);
    });
  });

  describe('PotionMergeEngine', () => {
    let engine: PotionMergeEngine;

    beforeEach(() => {
      engine = new PotionMergeEngine();
      engine.state.start();
    });

    it('clamps dropper position inside flask width', () => {
      engine.moveDropper(50);
      expect(engine.dropperX).toBeGreaterThanOrEqual(engine.physics.flaskLeft);

      engine.moveDropper(750);
      expect(engine.dropperX).toBeLessThanOrEqual(engine.physics.flaskRight);
    });

    it('drops potion and applies drop cooldown', () => {
      expect(engine.canDrop).toBe(true);
      const dropped = engine.dropPotion();
      expect(dropped).not.toBeNull();
      expect(engine.canDrop).toBe(false);
      expect(engine.dropCooldown).toBeGreaterThan(0);

      // Dropping again immediately returns null
      const secondDrop = engine.dropPotion();
      expect(secondDrop).toBeNull();

      // Update past cooldown
      engine.update(0.6);
      expect(engine.canDrop).toBe(true);
    });
  });
});
