import { describe, it, expect, beforeEach } from 'vitest';
import { EnemyManager } from '../src/enemies/EnemyManager';
import { TileMap } from '../src/TileMap';
import { TileType } from '../src/types';

describe('EnemyManager', () => {
  let manager: EnemyManager;
  let tileMap: TileMap;

  beforeEach(() => {
    manager = new EnemyManager();
    tileMap = new TileMap(10, 10, 16, new Array(100).fill(TileType.AIR));
  });

  it('spawns, updates, and collides enemies', () => {
    manager.spawn('waddle_dee', 50, 50);
    manager.spawn('blade_knight', 100, 50);

    expect(manager.getEnemies().length).toBe(2);

    const hit = manager.checkCollision({ x: 45, y: 45, width: 20, height: 20 });
    expect(hit).not.toBeNull();
    expect(hit?.type).toBe('waddle_dee');
  });
});
