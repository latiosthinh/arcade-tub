import { describe, it, expect } from 'vitest';
import { SnakeGrid, GRID_COLS, GRID_ROWS, CELL_SIZE } from '../src/SnakeGrid';

describe('SnakeGrid', () => {
  it('has correct dimensions and constants', () => {
    expect(GRID_COLS).toBe(25);
    expect(GRID_ROWS).toBe(20);
    expect(CELL_SIZE).toBe(32);
    expect(GRID_COLS * CELL_SIZE).toBe(800);
    expect(GRID_ROWS * CELL_SIZE).toBe(640);
  });

  it('checks boundary bounds correctly', () => {
    expect(SnakeGrid.isInside(0, 0)).toBe(true);
    expect(SnakeGrid.isInside(24, 19)).toBe(true);
    expect(SnakeGrid.isInside(-1, 0)).toBe(false);
    expect(SnakeGrid.isInside(0, -1)).toBe(false);
    expect(SnakeGrid.isInside(25, 0)).toBe(false);
    expect(SnakeGrid.isInside(0, 20)).toBe(false);
  });

  it('converts grid coordinates to center pixel coordinates', () => {
    const p0 = SnakeGrid.gridToPixel(0, 0);
    expect(p0).toEqual({ x: 16, y: 16 });

    const p1 = SnakeGrid.gridToPixel(2, 3);
    expect(p1).toEqual({ x: 2 * 32 + 16, y: 3 * 32 + 16 });
  });

  it('converts pixel coordinates to grid coordinates', () => {
    expect(SnakeGrid.pixelToGrid(0, 0)).toEqual({ gx: 0, gy: 0 });
    expect(SnakeGrid.pixelToGrid(31, 31)).toEqual({ gx: 0, gy: 0 });
    expect(SnakeGrid.pixelToGrid(32, 64)).toEqual({ gx: 1, gy: 2 });
    expect(SnakeGrid.pixelToGrid(799, 639)).toEqual({ gx: 24, gy: 19 });
  });
});
