import { describe, it, expect, beforeEach } from 'vitest';
import { BubbleGrid } from '../src/BubbleGrid';

describe('BubbleGrid', () => {
  let grid: BubbleGrid;

  beforeEach(() => {
    grid = new BubbleGrid(5, 5, 0.2); // 5 cols, 5 rows, 20% golden
  });

  it('initializes grid with correct dimensions and unpopped state', () => {
    expect(grid.cols).toBe(5);
    expect(grid.rows).toBe(5);
    expect(grid.totalBubbles).toBe(25);

    const stats = grid.getStats();
    expect(stats.total).toBe(25);
    expect(stats.popped).toBe(0);
    expect(stats.percent).toBe(0);

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const cell = grid.getCell(c, r);
        expect(cell).toBeDefined();
        expect(cell?.col).toBe(c);
        expect(cell?.row).toBe(r);
        expect(cell?.popped).toBe(false);
        expect(typeof cell?.isGolden).toBe('boolean');
      }
    }
  });

  it('handles out of bounds getCell safely', () => {
    expect(grid.getCell(-1, 0)).toBeNull();
    expect(grid.getCell(0, -1)).toBeNull();
    expect(grid.getCell(5, 0)).toBeNull();
    expect(grid.getCell(0, 5)).toBeNull();
  });

  it('pops individual cell correctly and ignores repeated pop', () => {
    const res1 = grid.popCell(2, 2);
    expect(res1).toBe(true);

    const cell = grid.getCell(2, 2);
    expect(cell?.popped).toBe(true);

    const statsAfter1 = grid.getStats();
    expect(statsAfter1.popped).toBe(1);

    const res2 = grid.popCell(2, 2);
    expect(res2).toBe(false);
    expect(grid.getStats().popped).toBe(1);
  });

  it('pops bubbles intersecting coordinates in popAt', () => {
    // Assuming default cell size / spacing layout configured in grid
    grid.setLayout(100, 100, 40, 40); // originX, originY, cellWidth, cellHeight
    // cell (0,0) center is ~ 120, 120
    const popped = grid.popAt(120, 120, 25);
    expect(popped.length).toBeGreaterThanOrEqual(1);
    expect(popped[0].col).toBe(0);
    expect(popped[0].row).toBe(0);
    expect(popped[0].popped).toBe(true);
  });

  it('pops bubbles along trajectory in sweepLine', () => {
    grid.setLayout(0, 0, 50, 50); // origin(0,0), size 50x50. Centers at (25, 25), (75, 25), (125, 25)...
    // Sweep line across row 0 from x=10 to x=180 at y=25
    const popped = grid.sweepLine(10, 25, 180, 25, 20);
    expect(popped.length).toBeGreaterThanOrEqual(3);
    popped.forEach(cell => {
      expect(cell.popped).toBe(true);
      expect(cell.row).toBe(0);
    });
  });

  it('reloads fresh sheet resetting popped states', () => {
    grid.popCell(0, 0);
    grid.popCell(1, 1);
    expect(grid.getStats().popped).toBe(2);

    grid.reload(6, 6, 0.1);
    expect(grid.cols).toBe(6);
    expect(grid.rows).toBe(6);
    expect(grid.totalBubbles).toBe(36);
    expect(grid.getStats().popped).toBe(0);
  });

  it('handles golden chance accurately (0% vs 100%)', () => {
    const noGolden = new BubbleGrid(3, 3, 0);
    expect(noGolden.getStats().goldenCount).toBe(0);

    const allGolden = new BubbleGrid(3, 3, 1.0);
    expect(allGolden.getStats().goldenCount).toBe(9);
  });
});
