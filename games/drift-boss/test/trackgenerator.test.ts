import { describe, it, expect, beforeEach } from 'vitest';
import { TrackGenerator, TrackTile, Coin } from '../src/TrackGenerator.js';

describe('TrackGenerator', () => {
  let generator: TrackGenerator;

  beforeEach(() => {
    generator = new TrackGenerator({ maxActiveTiles: 30 });
  });

  it('initializes with a starting runway of tiles', () => {
    const tiles = generator.getTiles();
    expect(tiles.length).toBeGreaterThanOrEqual(10);
    expect(tiles[0].x).toBe(0);
    expect(tiles[0].y).toBe(0);
  });

  it('generates isometric zigzag tiles in alternating or continuous X/Y directions', () => {
    // Generate more tiles
    generator.update(50);
    const tiles = generator.getTiles();
    expect(tiles.length).toBeLessThanOrEqual(35);

    for (let i = 1; i < tiles.length; i++) {
      const prev = tiles[i - 1];
      const curr = tiles[i];
      if (!curr.isGap) {
        // Tile connects along X or Y
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        expect(Math.abs(dx) > 0 || Math.abs(dy) > 0).toBe(true);
      }
    }
  });

  it('places coins on track tiles', () => {
    generator.update(200);
    const coins = generator.getCoins();
    expect(coins.length).toBeGreaterThan(0);
    for (const coin of coins) {
      expect(coin.collected).toBe(false);
      expect(coin.value).toBeGreaterThanOrEqual(1);
    }
  });

  it('culls old tiles and coins behind player to prevent memory leak', () => {
    generator.update(100);
    const initialTileCount = generator.getTiles().length;
    expect(initialTileCount).toBeLessThanOrEqual(30);

    // Progress player further
    generator.cullBehind(80);
    const tilesAfterCull = generator.getTiles();
    expect(tilesAfterCull.length).toBeLessThanOrEqual(30);
  });

  it('supports narrow bridge tiles and gap/ramp markers', () => {
    generator.update(300);
    const tiles = generator.getTiles();
    const hasNarrowOrRamp = tiles.some(t => t.isNarrow || t.isRamp || t.isGap);
    expect(hasNarrowOrRamp).toBe(true);
  });
});
