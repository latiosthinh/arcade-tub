import { describe, it, expect, beforeEach } from 'vitest';
import { GridMap, GRID_COLS, GRID_ROWS, CELL_SIZE, ARENA_SIZE, SUB_TILE_SIZE } from '../src/GridMap';
import { TileType, SubTileMask } from '../src/types';
import { loadStage, STAGE_MAPS, TOTAL_STAGES } from '../src/stages';

describe('GridMap & Sub-Tile Destruction Engine', () => {
  let grid: GridMap;

  beforeEach(() => {
    grid = new GridMap();
  });

  describe('1. Grid Initialization & Bounds Checking', () => {
    it('initializes 26x26 cells with 416x416px total dimensions', () => {
      expect(GRID_COLS).toBe(26);
      expect(GRID_ROWS).toBe(26);
      expect(CELL_SIZE).toBe(16);
      expect(ARENA_SIZE).toBe(416);
      expect(SUB_TILE_SIZE).toBe(8);

      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          if ((r === 24 || r === 25) && (c === 12 || c === 13)) {
            expect(grid.getCell(c, r)?.type).toBe(TileType.EAGLE);
          } else {
            expect(grid.getCell(c, r)?.type).toBe(TileType.EMPTY);
            expect(grid.getCell(c, r)?.mask).toBe(SubTileMask.EMPTY);
          }
        }
      }
    });

    it('safely handles out-of-bounds queries for getCell and setCell', () => {
      expect(grid.getCell(-1, 0)).toBeNull();
      expect(grid.getCell(26, 0)).toBeNull();
      expect(grid.getCell(0, -1)).toBeNull();
      expect(grid.getCell(0, 26)).toBeNull();

      // setCell out of bounds should not throw
      expect(() => grid.setCell(-5, 10, TileType.BRICK)).not.toThrow();
      expect(() => grid.setCell(30, 10, TileType.BRICK)).not.toThrow();
      expect(() => grid.setCell(10, -5, TileType.BRICK)).not.toThrow();
      expect(() => grid.setCell(10, 30, TileType.BRICK)).not.toThrow();
    });
  });

  describe('2. Sub-Tile Destruction Bitmasks (4 Quadrants)', () => {
    it('chips brick on UP projectile: removes bottom half, then removes top half', () => {
      grid.setCell(5, 5, TileType.BRICK, SubTileMask.FULL);

      // Hit 1: UP bullet hits bottom face
      const hit1 = grid.damageBrick(5, 5, 'UP');
      expect(hit1.destroyed).toBe(false);
      expect(hit1.newMask).toBe(SubTileMask.TOP_LEFT | SubTileMask.TOP_RIGHT);
      expect(hit1.hitQuadrant).toBe(SubTileMask.BOTTOM_LEFT | SubTileMask.BOTTOM_RIGHT);
      expect(grid.getCell(5, 5)?.type).toBe(TileType.BRICK);

      // Hit 2: UP bullet strikes remaining top half
      const hit2 = grid.damageBrick(5, 5, 'UP');
      expect(hit2.destroyed).toBe(true);
      expect(hit2.newMask).toBe(SubTileMask.EMPTY);
      expect(hit2.hitQuadrant).toBe(SubTileMask.TOP_LEFT | SubTileMask.TOP_RIGHT);
      expect(grid.getCell(5, 5)?.type).toBe(TileType.EMPTY);
    });

    it('chips brick on DOWN projectile: removes top half, then removes bottom half', () => {
      grid.setCell(6, 6, TileType.BRICK, SubTileMask.FULL);

      // Hit 1: DOWN bullet hits top face
      const hit1 = grid.damageBrick(6, 6, 'DOWN');
      expect(hit1.destroyed).toBe(false);
      expect(hit1.newMask).toBe(SubTileMask.BOTTOM_LEFT | SubTileMask.BOTTOM_RIGHT);
      expect(hit1.hitQuadrant).toBe(SubTileMask.TOP_LEFT | SubTileMask.TOP_RIGHT);

      // Hit 2: DOWN bullet strikes remaining bottom half
      const hit2 = grid.damageBrick(6, 6, 'DOWN');
      expect(hit2.destroyed).toBe(true);
      expect(hit2.newMask).toBe(SubTileMask.EMPTY);
      expect(hit2.hitQuadrant).toBe(SubTileMask.BOTTOM_LEFT | SubTileMask.BOTTOM_RIGHT);
      expect(grid.getCell(6, 6)?.type).toBe(TileType.EMPTY);
    });

    it('chips brick on LEFT projectile: removes right half, then removes left half', () => {
      grid.setCell(7, 7, TileType.BRICK, SubTileMask.FULL);

      // Hit 1: LEFT bullet hits right face
      const hit1 = grid.damageBrick(7, 7, 'LEFT');
      expect(hit1.destroyed).toBe(false);
      expect(hit1.newMask).toBe(SubTileMask.TOP_LEFT | SubTileMask.BOTTOM_LEFT);
      expect(hit1.hitQuadrant).toBe(SubTileMask.TOP_RIGHT | SubTileMask.BOTTOM_RIGHT);

      // Hit 2: LEFT bullet strikes remaining left half
      const hit2 = grid.damageBrick(7, 7, 'LEFT');
      expect(hit2.destroyed).toBe(true);
      expect(hit2.newMask).toBe(SubTileMask.EMPTY);
      expect(hit2.hitQuadrant).toBe(SubTileMask.TOP_LEFT | SubTileMask.BOTTOM_LEFT);
      expect(grid.getCell(7, 7)?.type).toBe(TileType.EMPTY);
    });

    it('chips brick on RIGHT projectile: removes left half, then removes right half', () => {
      grid.setCell(8, 8, TileType.BRICK, SubTileMask.FULL);

      // Hit 1: RIGHT bullet hits left face
      const hit1 = grid.damageBrick(8, 8, 'RIGHT');
      expect(hit1.destroyed).toBe(false);
      expect(hit1.newMask).toBe(SubTileMask.TOP_RIGHT | SubTileMask.BOTTOM_RIGHT);
      expect(hit1.hitQuadrant).toBe(SubTileMask.TOP_LEFT | SubTileMask.BOTTOM_LEFT);

      // Hit 2: RIGHT bullet strikes remaining right half
      const hit2 = grid.damageBrick(8, 8, 'RIGHT');
      expect(hit2.destroyed).toBe(true);
      expect(hit2.newMask).toBe(SubTileMask.EMPTY);
      expect(hit2.hitQuadrant).toBe(SubTileMask.TOP_RIGHT | SubTileMask.BOTTOM_RIGHT);
      expect(grid.getCell(8, 8)?.type).toBe(TileType.EMPTY);
    });

    it('generates accurate sub-tile bounding boxes for partial bitmasks', () => {
      grid.setCell(2, 3, TileType.BRICK, SubTileMask.TOP_LEFT | SubTileMask.BOTTOM_RIGHT);
      const boxes = grid.getSubTileBoxes(2, 3);
      expect(boxes).toHaveLength(2);

      // Top-Left quadrant: (2*16, 3*16) = (32, 48)
      expect(boxes[0]).toEqual({ x: 32, y: 48, width: 8, height: 8 });
      // Bottom-Right quadrant: (2*16 + 8, 3*16 + 8) = (40, 56)
      expect(boxes[1]).toEqual({ x: 40, y: 56, width: 8, height: 8 });
    });
  });

  describe('3. Material & Tier Damage Properties', () => {
    it('resists standard projectile hits on steel tiles', () => {
      grid.setCell(10, 10, TileType.STEEL, SubTileMask.FULL);
      expect(grid.damageSteel(10, 10, false)).toBe(false);
      expect(grid.getCell(10, 10)?.type).toBe(TileType.STEEL);
      expect(grid.getCell(10, 10)?.mask).toBe(SubTileMask.FULL);
    });

    it('tier 4 heavy bullet obliterates steel tile in one shot', () => {
      grid.setCell(10, 10, TileType.STEEL, SubTileMask.FULL);
      expect(grid.damageSteel(10, 10, true)).toBe(true);
      expect(grid.getCell(10, 10)?.type).toBe(TileType.EMPTY);
      expect(grid.getCell(10, 10)?.mask).toBe(SubTileMask.EMPTY);
    });

    it('tier 4 heavy bullet instantly destroys brick cell in one shot regardless of mask', () => {
      grid.setCell(11, 11, TileType.BRICK, SubTileMask.FULL);
      const res = grid.damageBrick(11, 11, 'UP', true);
      expect(res.destroyed).toBe(true);
      expect(res.newMask).toBe(SubTileMask.EMPTY);
      expect(grid.getCell(11, 11)?.type).toBe(TileType.EMPTY);
    });
  });

  describe('4. Terrain Queries & Collision Filtering', () => {
    it('detects boundary collisions outside arena', () => {
      const oobLeft = grid.queryRect({ x: -5, y: 50, width: 16, height: 16 });
      expect(oobLeft.solid).toBe(true);
      expect(oobLeft.bulletSolid).toBe(true);

      const oobBottom = grid.queryRect({ x: 50, y: 410, width: 16, height: 16 });
      expect(oobBottom.solid).toBe(true);
      expect(oobBottom.bulletSolid).toBe(true);
    });

    it('correctly reports water collision: solid for tanks, passable for bullets', () => {
      grid.setCell(4, 4, TileType.WATER, SubTileMask.FULL);
      const query = grid.queryRect({ x: 4 * 16, y: 4 * 16, width: 16, height: 16 });
      expect(query.solid).toBe(true);
      expect(query.bulletSolid).toBe(false);
      expect(query.isWater).toBe(true);
    });

    it('correctly reports ice and trees modifiers without blocking movement or bullets', () => {
      grid.setCell(5, 5, TileType.TREES, SubTileMask.FULL);
      grid.setCell(6, 6, TileType.ICE, SubTileMask.FULL);

      const treeQuery = grid.queryRect({ x: 5 * 16, y: 5 * 16, width: 16, height: 16 });
      expect(treeQuery.solid).toBe(false);
      expect(treeQuery.bulletSolid).toBe(false);
      expect(treeQuery.isTrees).toBe(true);

      const iceQuery = grid.queryRect({ x: 6 * 16, y: 6 * 16, width: 16, height: 16 });
      expect(iceQuery.solid).toBe(false);
      expect(iceQuery.bulletSolid).toBe(false);
      expect(iceQuery.isIce).toBe(true);
    });

    it('handles precise sub-quadrant collision on partially damaged brick', () => {
      // Brick at (3, 3) has only TOP_LEFT (0b0001) quadrant
      grid.setCell(3, 3, TileType.BRICK, SubTileMask.TOP_LEFT);

      // Querying bottom half of cell (x: 48..64, y: 56..64) should NOT collide
      const bottomQuery = grid.queryRect({ x: 3 * 16, y: 3 * 16 + 8, width: 16, height: 8 });
      expect(bottomQuery.solid).toBe(false);
      expect(bottomQuery.bulletSolid).toBe(false);

      // Querying top-left of cell (x: 48..56, y: 48..56) SHOULD collide
      const topLeftQuery = grid.queryRect({ x: 3 * 16, y: 3 * 16, width: 8, height: 8 });
      expect(topLeftQuery.solid).toBe(true);
      expect(topLeftQuery.bulletSolid).toBe(true);
    });
  });

  describe('5. Eagle HQ Lifecycle & Shovel Fortification', () => {
    it('places 2x2 intact Eagle HQ and responds to damage', () => {
      expect(grid.isEagleDestroyed()).toBe(false);
      expect(grid.getCell(12, 24)?.type).toBe(TileType.EAGLE);
      expect(grid.getCell(13, 24)?.type).toBe(TileType.EAGLE);
      expect(grid.getCell(12, 25)?.type).toBe(TileType.EAGLE);
      expect(grid.getCell(13, 25)?.type).toBe(TileType.EAGLE);

      const destroyed = grid.damageEagle();
      expect(destroyed).toBe(true);
      expect(grid.isEagleDestroyed()).toBe(true);

      // Subsequent damage calls return false
      expect(grid.damageEagle()).toBe(false);
    });

    it('shovel fortification transforms perimeter to steel and restores original terrain', () => {
      grid.setCell(11, 23, TileType.BRICK, SubTileMask.FULL);
      grid.setCell(12, 23, TileType.BRICK, SubTileMask.TOP_LEFT); // Damaged brick
      grid.setCell(13, 23, TileType.EMPTY, SubTileMask.EMPTY);
      grid.setCell(14, 23, TileType.WATER, SubTileMask.FULL);

      // Activate Shovel fortification
      grid.fortifyEagle(true);

      expect(grid.getCell(11, 23)?.type).toBe(TileType.STEEL);
      expect(grid.getCell(12, 23)?.type).toBe(TileType.STEEL);
      expect(grid.getCell(13, 23)?.type).toBe(TileType.STEEL);
      expect(grid.getCell(14, 23)?.type).toBe(TileType.STEEL);

      // Deactivate Shovel fortification (time expires)
      grid.fortifyEagle(false);

      expect(grid.getCell(11, 23)?.type).toBe(TileType.BRICK);
      expect(grid.getCell(11, 23)?.mask).toBe(SubTileMask.FULL);

      expect(grid.getCell(12, 23)?.type).toBe(TileType.BRICK);
      expect(grid.getCell(12, 23)?.mask).toBe(SubTileMask.TOP_LEFT);

      expect(grid.getCell(13, 23)?.type).toBe(TileType.EMPTY);
      expect(grid.getCell(14, 23)?.type).toBe(TileType.WATER);
    });
  });

  describe('6. Campaign Stage Loader (All 35 Stages)', () => {
    it('loads all 35 authentic stage maps into GridMap cleanly', () => {
      expect(TOTAL_STAGES).toBe(35);
      expect(Object.keys(STAGE_MAPS).length).toBe(35);

      for (let s = 1; s <= TOTAL_STAGES; s++) {
        const ok = loadStage(grid, s);
        expect(ok).toBe(true);

        // Verify Eagle HQ intact
        expect(grid.isEagleDestroyed()).toBe(false);
        expect(grid.getCell(12, 24)?.type).toBe(TileType.EAGLE);
        expect(grid.getCell(13, 24)?.type).toBe(TileType.EAGLE);
        expect(grid.getCell(12, 25)?.type).toBe(TileType.EAGLE);
        expect(grid.getCell(13, 25)?.type).toBe(TileType.EAGLE);

        // Verify no undefined or NaN tile states
        for (let r = 0; r < GRID_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            const cell = grid.getCell(c, r);
            expect(cell).not.toBeNull();
            expect(typeof cell?.type).toBe('number');
            expect(cell?.type).toBeGreaterThanOrEqual(TileType.EMPTY);
            expect(cell?.type).toBeLessThanOrEqual(TileType.EAGLE);
          }
        }
      }
    });

    it('wraps/clamps invalid stage numbers safely', () => {
      expect(loadStage(grid, 0)).toBe(true);
      expect(loadStage(grid, 99)).toBe(true);
      expect(loadStage(grid, -10)).toBe(true);
      expect(loadStage(grid, NaN)).toBe(true);
    });
  });
});
