import { describe, it, expect, beforeEach } from 'vitest';
import { BoxGrid, NEON_BOX_PALETTE, BOX_FREQUENCIES } from '../src/BoxGrid.js';

describe('BoxGrid', () => {
  let grid: BoxGrid;

  beforeEach(() => {
    grid = new BoxGrid();
  });

  it('initializes a default 3x3 grid with 9 boxes', () => {
    expect(grid.size).toBe(3);
    expect(grid.totalBoxes).toBe(9);
    expect(grid.boxes.length).toBe(9);

    for (let i = 0; i < 9; i++) {
      const box = grid.boxes[i];
      expect(box.id).toBe(i);
      expect(box.row).toBe(Math.floor(i / 3));
      expect(box.col).toBe(i % 3);
      expect(box.color).toBe(NEON_BOX_PALETTE[i]);
      expect(box.frequency).toBe(BOX_FREQUENCIES[i]);
      expect(box.activeIntensity).toBe(0);
    }
  });

  it('allows getting box by id and row/col coordinates', () => {
    const box4 = grid.getBox(4);
    expect(box4).toBeDefined();
    expect(box4?.id).toBe(4);
    expect(box4?.row).toBe(1);
    expect(box4?.col).toBe(1);

    const boxAtCoord = grid.getBoxAt(1, 1);
    expect(boxAtCoord).toBe(box4);

    expect(grid.getBox(-1)).toBeUndefined();
    expect(grid.getBox(10)).toBeUndefined();
    expect(grid.getBoxAt(-1, 0)).toBeUndefined();
    expect(grid.getBoxAt(3, 3)).toBeUndefined();
  });

  it('sets and updates box active intensity', () => {
    grid.setActive(2, 1.0);
    expect(grid.getBox(2)?.activeIntensity).toBe(1.0);

    // Update with decay dt
    grid.update(0.1, 5.0); // 1.0 - (0.1 * 5.0) = 0.5
    expect(grid.getBox(2)?.activeIntensity).toBeCloseTo(0.5, 2);

    grid.update(0.2, 5.0); // 0.5 - 1.0 = 0 (clamped)
    expect(grid.getBox(2)?.activeIntensity).toBe(0);
  });

  it('resets all active states', () => {
    grid.setActive(0, 1.0);
    grid.setActive(5, 0.8);
    grid.reset();

    expect(grid.boxes.every((b) => b.activeIntensity === 0)).toBe(true);
  });
});
