import { describe, it, expect } from 'vitest';
import { TileMap } from '../src/TileMap';
import { TileType } from '../src/types';

describe('TileMap', () => {
  it('parses multi-line ASCII strings into 1D TileType array with correct dimensions', () => {
    const ascii = [
      '###',
      '#.#',
      '###',
    ];
    const map = TileMap.fromString(ascii, 16);
    expect(map.cols).toBe(3);
    expect(map.rows).toBe(3);
    expect(map.tileSize).toBe(16);
    expect(map.widthInPixels).toBe(48);
    expect(map.heightInPixels).toBe(48);
    expect(map.getTile(0, 0)).toBe(TileType.SOLID);
    expect(map.getTile(1, 1)).toBe(TileType.AIR);
  });

  it('resolves all character mappings correctly', () => {
    const ascii = '.#=^*D';
    const map = TileMap.fromString([ascii], 16);
    expect(map.getTile(0, 0)).toBe(TileType.AIR);
    expect(map.getTile(1, 0)).toBe(TileType.SOLID);
    expect(map.getTile(2, 0)).toBe(TileType.ONE_WAY);
    expect(map.getTile(3, 0)).toBe(TileType.HAZARD);
    expect(map.getTile(4, 0)).toBe(TileType.BREAKABLE);
    expect(map.getTile(5, 0)).toBe(TileType.DOOR);
  });

  it('handles out-of-bounds coordinates safely', () => {
    const map = TileMap.fromString(['#'], 16);
    expect(map.getTile(-1, 0)).toBe(TileType.AIR);
    expect(map.getTile(10, 10)).toBe(TileType.AIR);
    map.setTile(-1, 0, TileType.SOLID); // Should not throw
    map.setTile(10, 10, TileType.SOLID); // Should not throw
  });

  it('converts world coordinates to tile coordinates and vice-versa', () => {
    const map = TileMap.fromString(['##', '##'], 16);
    expect(map.worldToTile(20, 35)).toEqual({ col: 1, row: 2 });
    expect(map.tileToWorld(2, 3)).toEqual({ x: 32, y: 48 });
  });

  it('returns overlapping tile coordinates and types in queryRect', () => {
    const map = TileMap.fromString([
      '####',
      '#..#',
      '####',
    ], 16);

    const hits = map.queryRect({ x: 12, y: 12, width: 10, height: 10 });
    // Overlaps tile (0,0), (1,0), (0,1), (1,1)
    expect(hits.length).toBeGreaterThan(0);
    const coords = hits.map(h => `${h.col},${h.row}`);
    expect(coords).toContain('0,0');
    expect(coords).toContain('1,0');
    expect(coords).toContain('0,1');
    expect(coords).toContain('1,1');
  });

  it('returns correct boolean helper flags', () => {
    const map = TileMap.fromString(['.#=^*D'], 16);
    expect(map.isSolid(1, 0)).toBe(true);
    expect(map.isSolid(0, 0)).toBe(false);
    expect(map.isOneWay(2, 0)).toBe(true);
    expect(map.isHazard(3, 0)).toBe(true);
    expect(map.isBreakable(4, 0)).toBe(true);
  });
});
