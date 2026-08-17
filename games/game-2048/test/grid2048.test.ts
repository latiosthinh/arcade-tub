import { describe, it, expect, vi } from 'vitest';
import { Grid2048, Direction } from '../src/Grid2048';

describe('Grid2048', () => {
  it('initializes 4x4 matrix and spawns 2 tiles', () => {
    const grid = new Grid2048();
    const cells = grid.getCells();
    expect(cells.length).toBe(4);
    expect(cells[0].length).toBe(4);

    let nonZeroCount = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (cells[r][c] > 0) nonZeroCount++;
      }
    }
    expect(nonZeroCount).toBe(2);
  });

  it('getCell and setCells work with defensive cloning', () => {
    const grid = new Grid2048();
    const custom = [
      [2, 0, 0, 0],
      [0, 4, 0, 0],
      [0, 0, 8, 0],
      [0, 0, 0, 16],
    ];
    grid.setCells(custom);
    expect(grid.getCell(0, 0)).toBe(2);
    expect(grid.getCell(1, 1)).toBe(4);
    expect(grid.getCell(2, 2)).toBe(8);
    expect(grid.getCell(3, 3)).toBe(16);

    const cells = grid.getCells();
    cells[0][0] = 999;
    expect(grid.getCell(0, 0)).toBe(2); // immutable return
  });

  it('spawns 2 with 90% probability and 4 with 10% probability', () => {
    const grid = new Grid2048();
    grid.setCells([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    // Mock RNG returning < 0.9 => 2
    const tile2 = grid.spawnTile(() => 0.5);
    expect(tile2).not.toBeNull();
    expect(tile2?.value).toBe(2);

    // Mock RNG returning >= 0.9 => 4
    const tile4 = grid.spawnTile(() => 0.95);
    expect(tile4).not.toBeNull();
    expect(tile4?.value).toBe(4);
  });

  it('returns null when spawnTile is called on full board', () => {
    const grid = new Grid2048();
    grid.setCells([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]);
    const spawned = grid.spawnTile();
    expect(spawned).toBeNull();
  });

  it('slides left correctly and merges matching adjacent tiles without double merge', () => {
    const grid = new Grid2048();
    grid.setCells([
      [2, 2, 0, 0],
      [2, 2, 2, 2],
      [4, 2, 2, 0],
      [0, 0, 2, 4],
    ]);

    const result = grid.slide('left', false);
    expect(result.moved).toBe(true);
    // row 0: 2+2 -> 4 (score 4)
    // row 1: 2+2=4, 2+2=4 -> [4, 4, 0, 0] (score 8)
    // row 2: 4, 2+2=4 -> [4, 4, 0, 0] (score 4)
    // row 3: [2, 4, 0, 0] (score 0)
    expect(result.scoreGained).toBe(16);
    expect(grid.getCells()).toEqual([
      [4, 0, 0, 0],
      [4, 4, 0, 0],
      [4, 4, 0, 0],
      [2, 4, 0, 0],
    ]);
  });

  it('slides right, up, and down symmetrically', () => {
    const grid = new Grid2048();

    // Right slide
    grid.setCells([
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const rRes = grid.slide('right', false);
    expect(rRes.moved).toBe(true);
    expect(grid.getCells()[0]).toEqual([0, 0, 0, 4]);

    // Up slide
    grid.setCells([
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [4, 0, 0, 0],
      [4, 0, 0, 0],
    ]);
    const uRes = grid.slide('up', false);
    expect(uRes.moved).toBe(true);
    expect(grid.getCell(0, 0)).toBe(4);
    expect(grid.getCell(1, 0)).toBe(8);
    expect(grid.getCell(2, 0)).toBe(0);
    expect(grid.getCell(3, 0)).toBe(0);

    // Down slide
    grid.setCells([
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const dRes = grid.slide('down', false);
    expect(dRes.moved).toBe(true);
    expect(grid.getCell(3, 0)).toBe(4);
  });

  it('rejects invalid moves when board cannot slide in that direction', () => {
    const grid = new Grid2048();
    grid.setCells([
      [2, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const res = grid.slide('left', false);
    expect(res.moved).toBe(false);
    expect(res.scoreGained).toBe(0);
    expect(res.moves.length).toBe(0);
  });

  it('tracks move and merge events for animation interpolation', () => {
    const grid = new Grid2048();
    grid.setCells([
      [0, 2, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    const res = grid.slide('left', false);
    expect(res.moved).toBe(true);
    expect(res.merges.length).toBe(1);
    expect(res.merges[0].row).toBe(0);
    expect(res.merges[0].col).toBe(0);
    expect(res.merges[0].value).toBe(4);
  });

  it('evaluates canMove and canMoveDirection accurately', () => {
    const grid = new Grid2048();
    grid.setCells([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]);
    expect(grid.canMove()).toBe(false);
    expect(grid.canMoveDirection('up')).toBe(false);
    expect(grid.canMoveDirection('down')).toBe(false);
    expect(grid.canMoveDirection('left')).toBe(false);
    expect(grid.canMoveDirection('right')).toBe(false);

    // If one merge is available
    grid.setCells([
      [2, 2, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]);
    expect(grid.canMove()).toBe(true);
    expect(grid.canMoveDirection('left')).toBe(true);
    expect(grid.canMoveDirection('right')).toBe(true);
  });

  it('detects win condition for 2048 tile and getMaxTile', () => {
    const grid = new Grid2048();
    grid.setCells([
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 0],
      [0, 0, 0, 0],
    ]);
    expect(grid.hasWon()).toBe(true);
    expect(grid.getMaxTile()).toBe(2048);
  });

  it('supports undo snapshot stack with bound limit', () => {
    const grid = new Grid2048();
    grid.setCells([
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    grid.saveSnapshot(10);
    grid.slide('right', false);
    expect(grid.getCell(0, 3)).toBe(2);

    const restoredScore = grid.undo();
    expect(restoredScore).toBe(10);
    expect(grid.getCell(0, 0)).toBe(2);
    expect(grid.getCell(0, 3)).toBe(0);

    // Undo on empty stack returns null
    expect(grid.undo()).toBeNull();
  });
});
