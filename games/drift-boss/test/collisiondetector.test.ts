import { describe, it, expect } from 'vitest';
import { CollisionDetector } from '../src/CollisionDetector.js';
import { TrackTile, Coin } from '../src/TrackGenerator.js';

describe('CollisionDetector', () => {
  it('identifies if car is safely inside a track tile bounds', () => {
    const tile: TrackTile = {
      index: 0,
      x: 0,
      y: 0,
      width: 1.0,
      length: 1.0,
      axis: 'X',
      isNarrow: false,
      isRamp: false,
      isGap: false
    };

    const inside = CollisionDetector.isPointOnTile(0.2, 0.2, tile);
    expect(inside).toBe(true);

    const outside = CollisionDetector.isPointOnTile(2.5, 2.5, tile);
    expect(outside).toBe(false);
  });

  it('detects coin collection when car is near coin position', () => {
    const coin: Coin = {
      id: 'c1',
      x: 1.0,
      y: 1.0,
      value: 1,
      collected: false
    };

    const hit = CollisionDetector.checkCoinOverlap(1.05, 0.95, coin, 0.3);
    expect(hit).toBe(true);

    const miss = CollisionDetector.checkCoinOverlap(3.0, 1.0, coin, 0.3);
    expect(miss).toBe(false);
  });

  it('determines if car is near track edge for combo drift bonus', () => {
    const tile: TrackTile = {
      index: 1,
      x: 0,
      y: 0,
      width: 1.0,
      length: 1.0,
      axis: 'X',
      isNarrow: false,
      isRamp: false,
      isGap: false
    };

    const isClose = CollisionDetector.isNearEdge(0.5, 0.45, tile, 0.1);
    expect(isClose).toBe(true);
  });
});
