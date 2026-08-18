import { TrackTile, Coin } from './TrackGenerator.js';

export class CollisionDetector {
  /**
   * Checks whether the car point (x, y) lies on a specific track tile.
   * Isometric track tiles are centered along their axis with width.
   */
  public static isPointOnTile(carX: number, carY: number, tile: TrackTile): boolean {
    if (tile.isGap) {
      return false;
    }

    const halfWidth = tile.width / 2;
    const length = tile.length;

    if (tile.axis === 'X') {
      const minX = tile.x - 0.2;
      const maxX = tile.x + length + 0.2;
      const minY = tile.y - halfWidth;
      const maxY = tile.y + halfWidth;
      return carX >= minX && carX <= maxX && carY >= minY && carY <= maxY;
    } else {
      const minX = tile.x - halfWidth;
      const maxX = tile.x + halfWidth;
      const minY = tile.y - 0.2;
      const maxY = tile.y + length + 0.2;
      return carX >= minX && carX <= maxX && carY >= minY && carY <= maxY;
    }
  }

  /**
   * Checks if car is currently supported by ANY active track tile.
   */
  public static checkOnTrack(carX: number, carY: number, tiles: TrackTile[]): boolean {
    for (const tile of tiles) {
      if (this.isPointOnTile(carX, carY, tile)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if car collects a coin item.
   */
  public static checkCoinOverlap(carX: number, carY: number, coin: Coin, pickupRadius = 0.4): boolean {
    if (coin.collected) return false;
    const dx = carX - coin.x;
    const dy = carY - coin.y;
    return Math.sqrt(dx * dx + dy * dy) <= pickupRadius;
  }

  /**
   * Checks if car is driving close to the edge of a tile (within threshold) for bonus multiplier.
   */
  public static isNearEdge(carX: number, carY: number, tile: TrackTile, edgeThreshold = 0.15): boolean {
    const halfWidth = tile.width / 2;
    if (tile.axis === 'X') {
      const distToEdge = halfWidth - Math.abs(carY - tile.y);
      return distToEdge >= 0 && distToEdge <= edgeThreshold;
    } else {
      const distToEdge = halfWidth - Math.abs(carX - tile.x);
      return distToEdge >= 0 && distToEdge <= edgeThreshold;
    }
  }
}
