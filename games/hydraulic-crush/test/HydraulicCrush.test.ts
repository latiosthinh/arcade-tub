import { describe, it, expect, beforeEach } from 'vitest';
import { PistonPhysics } from '../src/PistonPhysics';
import { CrushItemManager, CRUSH_ITEMS } from '../src/CrushItems';
import { CrushSplatterSystem } from '../src/CrushSplatter';

describe('Hydraulic Crush Engine', () => {
  describe('PistonPhysics', () => {
    let piston: PistonPhysics;

    beforeEach(() => {
      piston = new PistonPhysics(300, 1000);
    });

    it('starts at resting top position with 0 pressure', () => {
      expect(piston.getY()).toBe(0);
      expect(piston.getDisplacement()).toBe(0);
      expect(piston.getPressure()).toBe(0);
    });

    it('advances downward when holding and retracts when released', () => {
      piston.applyPressure(true, 0.2, 0.1);
      expect(piston.getY()).toBeGreaterThan(0);
      expect(piston.getDisplacement()).toBeGreaterThan(0);

      const advancedY = piston.getY();
      piston.applyPressure(false, 0.2, 0.1);
      expect(piston.getY()).toBeLessThan(advancedY);
    });

    it('builds higher pressure against high stiffness items', () => {
      const softPiston = new PistonPhysics(300, 1000);
      const hardPiston = new PistonPhysics(300, 1000);

      for (let i = 0; i < 5; i++) {
        softPiston.applyPressure(true, 0.1, 0.1);
        hardPiston.applyPressure(true, 0.9, 0.1);
      }

      expect(hardPiston.getPressure()).toBeGreaterThan(softPiston.getPressure());
    });

    it('clamps displacement within [0, maxStroke] bounds without NaN (T-44-03)', () => {
      for (let i = 0; i < 100; i++) {
        piston.applyPressure(true, 0.0, 0.5);
      }
      expect(piston.getY()).toBeLessThanOrEqual(300);
      expect(piston.getDisplacement()).toBeCloseTo(1.0, 5);

      for (let i = 0; i < 100; i++) {
        piston.applyPressure(false, 0.0, 0.5);
      }
      expect(piston.getY()).toBeGreaterThanOrEqual(0);
      expect(piston.getDisplacement()).toBe(0);
    });
  });

  describe('CrushItems', () => {
    let itemManager: CrushItemManager;

    beforeEach(() => {
      itemManager = new CrushItemManager();
    });

    it('contains all required items with correct characteristics', () => {
      const ids = ['duck', 'can', 'clock', 'watermelon', 'slime', 'diamond'];
      ids.forEach((id) => {
        const item = itemManager.getItem(id);
        expect(item).toBeDefined();
        expect(item.name).toBeTruthy();
        expect(item.stiffness).toBeGreaterThanOrEqual(0);
        expect(item.yieldThreshold).toBeGreaterThan(0);
      });
    });

    it('calculates volume-preserving accordion deformation scaleX and scaleY', () => {
      const duck = itemManager.getItem('duck');
      const defInitial = itemManager.getDeformation(duck, 0.0);
      expect(defInitial.scaleY).toBe(1.0);
      expect(defInitial.scaleX).toBe(1.0);
      expect(defInitial.isCrushed).toBe(false);

      const defCompressed = itemManager.getDeformation(duck, 0.4);
      expect(defCompressed.scaleY).toBeLessThan(1.0);
      expect(defCompressed.scaleX).toBeGreaterThan(1.0);
      expect(defCompressed.scaleX * defCompressed.scaleY).toBeCloseTo(1.0, 1);
    });

    it('detects catastrophic yield collapse when pressure/displacement exceeds threshold', () => {
      const watermelon = itemManager.getItem('watermelon');
      expect(itemManager.checkYieldCollapse(watermelon, 50, 0.2)).toBe(false);
      expect(itemManager.checkYieldCollapse(watermelon, 500, 0.7)).toBe(true);
    });

    it('diamond never yields and stalls hydraulic press', () => {
      const diamond = itemManager.getItem('diamond');
      expect(diamond.stiffness).toBe(1.0);
      expect(diamond.unbreakable).toBe(true);
      expect(itemManager.checkYieldCollapse(diamond, 1000, 1.0)).toBe(false);
    });
  });

  describe('CrushSplatter', () => {
    let splatter: CrushSplatterSystem;

    beforeEach(() => {
      splatter = new CrushSplatterSystem(800, 600);
    });

    it('spawns splatter particles radiating outwards with velocity and lifetime', () => {
      splatter.spawnSplatter(400, 300, '#ff0000', 30, 8.0, true);
      expect(splatter.particles.length).toBe(30);

      const p0 = splatter.particles[0];
      expect(p0.x).toBe(400);
      expect(p0.y).toBe(300);
      expect(p0.life).toBe(1.0);

      splatter.update(0.1);
      expect(p0.life).toBeLessThan(1.0);
      expect(p0.y).not.toBe(300);
    });

    it('caps particles and wall stains within bounds (T-44-04)', () => {
      for (let i = 0; i < 20; i++) {
        splatter.spawnSplatter(400, 300, '#00ff00', 50, 15.0, true);
      }
      expect(splatter.particles.length).toBeLessThanOrEqual(250);

      // Force boundary impacts to create stains
      for (let i = 0; i < 50; i++) {
        splatter.update(0.1);
      }
      expect(splatter.stains.length).toBeLessThanOrEqual(30);
    });
  });
});
