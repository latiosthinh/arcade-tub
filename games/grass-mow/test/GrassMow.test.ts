import { describe, it, expect, beforeEach } from 'vitest';
import { LawnGrid } from '../src/LawnGrid';
import { MowerVehicle } from '../src/MowerVehicle';
import { GrassConfetti } from '../src/GrassConfetti';

describe('Grass Mow Game Logic', () => {
  describe('LawnGrid', () => {
    let grid: LawnGrid;

    beforeEach(() => {
      grid = new LawnGrid(20, 15, 16);
      grid.loadLevel(0);
    });

    it('initializes with cuttable grass cells', () => {
      expect(grid.cols).toBe(20);
      expect(grid.rows).toBe(15);
      expect(grid.totalCuttableCells).toBeGreaterThan(0);
      expect(grid.totalCutCells).toBe(0);
      expect(grid.getCutPercentage()).toBe(0);
      expect(grid.isCleared()).toBe(false);
    });

    it('cuts grass within radius and updates cut percentage', () => {
      const cutCount = grid.cutRadius(5 * 16, 5 * 16, 24);
      expect(cutCount).toBeGreaterThan(0);
      expect(grid.totalCutCells).toBe(cutCount);
      expect(grid.getCutPercentage()).toBeGreaterThan(0);
    });

    it('does not double count already cut cells', () => {
      const cut1 = grid.cutRadius(5 * 16, 5 * 16, 24);
      const cut2 = grid.cutRadius(5 * 16, 5 * 16, 24);
      expect(cut1).toBeGreaterThan(0);
      expect(cut2).toBe(0);
    });

    it('detects yard cleared state when >= 99.5%', () => {
      // Cut all area
      for (let r = 0; r < grid.rows; r++) {
        for (let c = 0; c < grid.cols; c++) {
          grid.cutRadius(c * 16 + 8, r * 16 + 8, 16);
        }
      }
      expect(grid.getCutPercentage()).toBe(100);
      expect(grid.isCleared()).toBe(true);
    });

    it('supports multiple level yard layouts with obstacles', () => {
      grid.loadLevel(1);
      expect(grid.totalCuttableCells).toBeGreaterThan(0);
      grid.loadLevel(2);
      expect(grid.totalCuttableCells).toBeGreaterThan(0);
    });
  });

  describe('MowerVehicle', () => {
    let vehicle: MowerVehicle;
    let grid: LawnGrid;

    beforeEach(() => {
      grid = new LawnGrid(20, 15, 16);
      grid.loadLevel(0);
      vehicle = new MowerVehicle(100, 100);
    });

    it('initializes with default position and heading', () => {
      expect(vehicle.x).toBe(100);
      expect(vehicle.y).toBe(100);
      expect(vehicle.speed).toBe(0);
    });

    it('accelerates and updates heading on input', () => {
      // Move right (dx: 1, dy: 0)
      vehicle.update({ x: 1, y: 0 }, 0.1, grid);
      expect(vehicle.speed).toBeGreaterThan(0);
      expect(vehicle.x).toBeGreaterThan(100);
    });

    it('decelerates to stop when input is zero', () => {
      vehicle.update({ x: 1, y: 0 }, 0.5, grid);
      const speedMoving = vehicle.speed;
      expect(speedMoving).toBeGreaterThan(50);
      
      vehicle.update({ x: 0, y: 0 }, 1.0, grid);
      expect(vehicle.speed).toBeLessThan(speedMoving);
    });

    it('provides cutting deck position in front of vehicle', () => {
      vehicle.heading = 0; // facing right (+X)
      vehicle.x = 100;
      vehicle.y = 100;
      const deck = vehicle.getCuttingDeck();
      expect(deck.deckX).toBeGreaterThan(100);
      expect(deck.deckY).toBe(100);
      expect(deck.radius).toBeGreaterThan(5);
    });

    it('restricts vehicle within lawn boundary and avoids obstacles', () => {
      vehicle.x = 10;
      vehicle.y = 10;
      // drive into left/top border
      for (let i = 0; i < 20; i++) {
        vehicle.update({ x: -1, y: -1 }, 0.1, grid);
      }
      expect(vehicle.x).toBeGreaterThanOrEqual(16);
      expect(vehicle.y).toBeGreaterThanOrEqual(16);
    });
  });

  describe('GrassConfetti', () => {
    let confetti: GrassConfetti;

    beforeEach(() => {
      confetti = new GrassConfetti();
    });

    it('spawns particles capped by max pool size', () => {
      confetti.spawn(100, 100, 0, 30, '#4CAF50');
      expect(confetti.particles.length).toBe(30);

      // Spawn over pool limit (120)
      confetti.spawn(100, 100, 0, 150, '#81C784');
      expect(confetti.particles.length).toBeLessThanOrEqual(120);
    });

    it('updates particle life and removes dead particles', () => {
      confetti.spawn(100, 100, 0, 10, '#4CAF50');
      confetti.update(2.0); // 2s is enough to decay all life
      expect(confetti.particles.length).toBe(0);
    });
  });
});
