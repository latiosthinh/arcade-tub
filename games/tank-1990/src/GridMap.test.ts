import { describe, it, expect, beforeEach } from 'vitest';
import { GridMap, GRID_COLS, GRID_ROWS, CELL_SIZE, ARENA_SIZE } from './GridMap';
import { TileType, SubTileMask } from './types';

describe('GridMap', () => {
  let grid: GridMap;

  beforeEach(() => {
    grid = new GridMap();
  });

  it('initializes 26x26 grid and 416x416 arena dimensions', () => {
    expect(GRID_COLS).toBe(26);
    expect(GRID_ROWS).toBe(26);
    expect(CELL_SIZE).toBe(16);
    expect(ARENA_SIZE).toBe(416);

    const cell = grid.getCell(0, 0);
    expect(cell).not.toBeNull();
    expect(cell?.type).toBe(TileType.EMPTY);
    expect(cell?.mask).toBe(SubTileMask.EMPTY);
  });

  it('places intact Eagle HQ at bottom-center (12..13, 24..25)', () => {
    expect(grid.isEagleDestroyed()).toBe(false);
    expect(grid.getCell(12, 24)?.type).toBe(TileType.EAGLE);
    expect(grid.getCell(13, 24)?.type).toBe(TileType.EAGLE);
    expect(grid.getCell(12, 25)?.type).toBe(TileType.EAGLE);
    expect(grid.getCell(13, 25)?.type).toBe(TileType.EAGLE);
  });

  it('chips brick quadrants accurately per cardinal direction', () => {
    grid.setCell(5, 5, TileType.BRICK, SubTileMask.FULL);

    // Bullet moving UP strikes bottom half
    const res1 = grid.damageBrick(5, 5, 'UP');
    expect(res1.destroyed).toBe(false);
    expect(res1.newMask).toBe(SubTileMask.TOP_LEFT | SubTileMask.TOP_RIGHT);

    // Second UP shot strikes remaining top half -> fully destroyed
    const res2 = grid.damageBrick(5, 5, 'UP');
    expect(res2.destroyed).toBe(true);
    expect(res2.newMask).toBe(SubTileMask.EMPTY);
    expect(grid.getCell(5, 5)?.type).toBe(TileType.EMPTY);
  });

  it('tier 4 heavy shot instantly destroys brick and steel', () => {
    grid.setCell(2, 2, TileType.BRICK, SubTileMask.FULL);
    grid.setCell(3, 3, TileType.STEEL, SubTileMask.FULL);

    const brickRes = grid.damageBrick(2, 2, 'DOWN', true);
    expect(brickRes.destroyed).toBe(true);
    expect(grid.getCell(2, 2)?.type).toBe(TileType.EMPTY);

    // Standard bullet cannot damage steel
    expect(grid.damageSteel(3, 3, false)).toBe(false);
    expect(grid.getCell(3, 3)?.type).toBe(TileType.STEEL);

    // Tier 4 destroys steel
    expect(grid.damageSteel(3, 3, true)).toBe(true);
    expect(grid.getCell(3, 3)?.type).toBe(TileType.EMPTY);
  });

  it('fortifies Eagle perimeter with steel and restores cached cells cleanly', () => {
    grid.setCell(11, 23, TileType.BRICK, SubTileMask.FULL);
    grid.setCell(12, 23, TileType.EMPTY, SubTileMask.EMPTY);

    grid.fortifyEagle(true);
    expect(grid.getCell(11, 23)?.type).toBe(TileType.STEEL);
    expect(grid.getCell(12, 23)?.type).toBe(TileType.STEEL);

    grid.fortifyEagle(false);
    expect(grid.getCell(11, 23)?.type).toBe(TileType.BRICK);
    expect(grid.getCell(12, 23)?.type).toBe(TileType.EMPTY);
  });

  it('queries terrain correctly for solids, bullet-solids, water, ice, trees', () => {
    grid.setCell(4, 4, TileType.WATER, SubTileMask.FULL);
    grid.setCell(6, 6, TileType.TREES, SubTileMask.FULL);
    grid.setCell(8, 8, TileType.ICE, SubTileMask.FULL);

    const waterQ = grid.queryRect({ x: 4 * 16, y: 4 * 16, width: 16, height: 16 });
    expect(waterQ.solid).toBe(true);
    expect(waterQ.bulletSolid).toBe(false);
    expect(waterQ.isWater).toBe(true);

    const treeQ = grid.queryRect({ x: 6 * 16, y: 6 * 16, width: 16, height: 16 });
    expect(treeQ.solid).toBe(false);
    expect(treeQ.bulletSolid).toBe(false);
    expect(treeQ.isTrees).toBe(true);

    const iceQ = grid.queryRect({ x: 8 * 16, y: 8 * 16, width: 16, height: 16 });
    expect(iceQ.solid).toBe(false);
    expect(iceQ.bulletSolid).toBe(false);
    expect(iceQ.isIce).toBe(true);
  });
});
