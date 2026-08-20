import { describe, it, expect, beforeEach } from 'vitest';
import { SnowballPhysics, Snowball } from '../src/SnowballPhysics.js';
import { TargetStructure, StructureBlock } from '../src/TargetStructure.js';

describe('Snow Smash Mechanics', () => {
  describe('SnowballPhysics', () => {
    let physics: SnowballPhysics;

    beforeEach(() => {
      physics = new SnowballPhysics(800, 600);
    });

    it('launches snowball from slingshot drag vector', () => {
      // Slingshot anchor at (120, 450), pull back to (70, 480)
      const ball = physics.launchFromSlingshot(120, 450, 70, 480, 10.0);
      expect(ball.x).toBe(120);
      expect(ball.y).toBe(450);
      expect(ball.vx).toBeGreaterThan(0); // Fired rightward
      expect(ball.vy).toBeLessThan(0);    // Fired upward
      expect(physics.snowballs.length).toBe(1);
    });

    it('updates ballistic trajectory with gravity', () => {
      const ball = physics.launchDirect(100, 400, 300, -200);
      const initX = ball.x;
      const initY = ball.y;
      physics.update(0.1);
      expect(ball.x).toBeCloseTo(initX + 30, 1);
      expect(ball.y).toBeGreaterThan(initY - 20);
      expect(ball.vy).toBeGreaterThan(-200); // Gravity pulled down
    });

    it('calculates trajectory prediction points', () => {
      const trajectory = physics.predictTrajectory(120, 450, 400, -300, 15, 0.05);
      expect(trajectory.length).toBe(15);
      expect(trajectory[0].x).toBe(120);
      expect(trajectory[trajectory.length - 1].x).toBeGreaterThan(120);
    });

    it('culls off-screen snowballs', () => {
      physics.launchDirect(950, 700, 100, 100);
      physics.update(0.1);
      expect(physics.snowballs.length).toBe(0);
    });
  });

  describe('TargetStructure & Collision Damage', () => {
    let structure: TargetStructure;
    let physics: SnowballPhysics;

    beforeEach(() => {
      structure = new TargetStructure(800, 600);
      physics = new SnowballPhysics(800, 600);
    });

    it('generates preset cardboard pyramid structure', () => {
      structure.buildPyramid(550, 480);
      expect(structure.blocks.length).toBeGreaterThan(3);
      expect(structure.blocks.length).toBeLessThanOrEqual(30);
      for (const block of structure.blocks) {
        expect(block.health).toBe(block.maxHealth);
        expect(block.broken).toBe(false);
      }
    });

    it('detects collision between snowball and block', () => {
      structure.blocks = [{
        id: 1,
        x: 500,
        y: 400,
        width: 60,
        height: 60,
        health: 50,
        maxHealth: 50,
        broken: false,
        color: '#D7CCC8',
        layer: 0
      }];

      // Ball at (480, 420) moving rightward into block
      const hit = structure.checkCircleBlockCollision(480, 420, 25, structure.blocks[0]);
      expect(hit).toBe(true);

      const miss = structure.checkCircleBlockCollision(300, 100, 20, structure.blocks[0]);
      expect(miss).toBe(false);
    });

    it('applies damage, cracks block, and breaks when health reaches zero', () => {
      structure.blocks = [{
        id: 1,
        x: 500,
        y: 400,
        width: 60,
        height: 60,
        health: 40,
        maxHealth: 40,
        broken: false,
        color: '#D7CCC8',
        layer: 0
      }];

      const broken1 = structure.damageBlock(structure.blocks[0], 25);
      expect(broken1).toBe(false);
      expect(structure.blocks[0].health).toBe(15);
      expect(structure.blocks[0].broken).toBe(false);

      const broken2 = structure.damageBlock(structure.blocks[0], 20);
      expect(broken2).toBe(true);
      expect(structure.blocks[0].health).toBe(0);
      expect(structure.blocks[0].broken).toBe(true);
      expect(structure.debris.length).toBeGreaterThan(4);
    });

    it('collapses unsupported overhead blocks when foundation is destroyed', () => {
      structure.blocks = [
        { id: 1, x: 500, y: 450, width: 60, height: 50, health: 0, maxHealth: 50, broken: true, color: '#D7CCC8', layer: 0 },
        { id: 2, x: 500, y: 400, width: 60, height: 50, health: 50, maxHealth: 50, broken: false, color: '#D7CCC8', layer: 1 }
      ];

      structure.updatePhysics(0.1);
      // Block 2 should begin falling due to no support beneath
      expect(structure.blocks[1].y).toBeGreaterThan(400);
    });
  });
});
