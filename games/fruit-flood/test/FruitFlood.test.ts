import { describe, it, expect, beforeEach } from 'vitest';
import { FruitPhysics, FruitType } from '../src/FruitPhysics.js';
import { BladeEngine } from '../src/BladeEngine.js';

describe('Fruit Flood Mechanics', () => {
  describe('FruitPhysics', () => {
    let physics: FruitPhysics;

    beforeEach(() => {
      physics = new FruitPhysics(800, 600);
    });

    it('spawns fruits within bounds with initial velocities', () => {
      const fruit = physics.spawnFruit('watermelon', 400, 600, 50, -600);
      expect(fruit.type).toBe('watermelon');
      expect(fruit.radius).toBeGreaterThan(15);
      expect(fruit.sliced).toBe(false);
      expect(physics.fruits.length).toBe(1);
    });

    it('caps max fruits count to prevent memory / DOS overload', () => {
      for (let i = 0; i < 35; i++) {
        physics.spawnFruit('orange', 400, 600, (i - 17) * 10, -500);
      }
      expect(physics.fruits.length).toBeLessThanOrEqual(25);
    });

    it('updates position based on gravity and velocity', () => {
      const fruit = physics.spawnFruit('banana', 400, 300, 100, -200);
      const startX = fruit.x;
      const startY = fruit.y;
      physics.update(0.1);
      expect(fruit.x).toBeCloseTo(startX + 10, 1);
      expect(fruit.y).toBeGreaterThan(startY - 25);
      expect(fruit.vy).toBeGreaterThan(-200); // Gravity accelerated downward
    });

    it('slices fruit into two half pieces with opposing impulse', () => {
      const fruit = physics.spawnFruit('kiwi', 400, 300, 0, 0);
      const halves = physics.sliceFruit(fruit, Math.PI / 4);
      expect(halves.length).toBe(2);
      expect(fruit.sliced).toBe(true);
      expect(physics.fruitHalves.length).toBe(2);
      expect(halves[0].vx).toBeLessThan(0);
      expect(halves[1].vx).toBeGreaterThan(0);
      expect(halves[0].type).toBe('kiwi');
    });

    it('generates juice particles on fruit slice', () => {
      const fruit = physics.spawnFruit('strawberry', 400, 300, 0, 0);
      physics.sliceFruit(fruit, 0);
      expect(physics.particles.length).toBeGreaterThan(5);
    });

    it('culls offscreen fruits and halves', () => {
      physics.spawnFruit('apple', 400, 750, 0, 100);
      physics.update(0.5);
      expect(physics.fruits.length).toBe(0);
    });
  });

  describe('BladeEngine & Collision', () => {
    let blade: BladeEngine;
    let physics: FruitPhysics;

    beforeEach(() => {
      blade = new BladeEngine();
      physics = new FruitPhysics(800, 600);
    });

    it('records and prunes trail points over time', () => {
      blade.addPoint(100, 100, 1000);
      blade.addPoint(150, 150, 1050);
      expect(blade.points.length).toBe(2);
      blade.update(1150); // 1000 is 150ms old (>120ms -> pruned), 1050 is 100ms old (kept)
      expect(blade.points.length).toBe(1);
      expect(blade.points[0].x).toBe(150);
    });

    it('detects line segment intersection with circle hitbox', () => {
      const fruit = physics.spawnFruit('watermelon', 300, 300, 0, 0);
      const hit = blade.checkSegmentCircle(200, 300, 400, 300, fruit.x, fruit.y, fruit.radius);
      expect(hit).toBe(true);

      const miss = blade.checkSegmentCircle(200, 100, 400, 100, fruit.x, fruit.y, fruit.radius);
      expect(miss).toBe(false);
    });

    it('slices multiple fruits and awards combos for 3+ slices in single swipe', () => {
      const f1 = physics.spawnFruit('watermelon', 200, 300, 0, 0);
      const f2 = physics.spawnFruit('orange', 300, 300, 0, 0);
      const f3 = physics.spawnFruit('banana', 400, 300, 0, 0);

      blade.startSwipe(100, 300, 1000);
      const sliced1 = blade.processSwipeMove(250, 300, 1020, physics);
      expect(sliced1.length).toBe(1);
      expect(sliced1[0].id).toBe(f1.id);

      const sliced2 = blade.processSwipeMove(450, 300, 1040, physics);
      expect(sliced2.length).toBe(2);

      const result = blade.endSwipe();
      expect(result.totalSliced).toBe(3);
      expect(result.isCombo).toBe(true);
      expect(result.comboMultiplier).toBeGreaterThanOrEqual(2);
    });
  });
});
