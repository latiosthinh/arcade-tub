import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectileManager } from '../src/Projectile';
import { TileMap } from '../src/TileMap';
import { TileType } from '../src/types';

describe('ProjectileManager', () => {
  let projectiles: ProjectileManager;
  let tileMap: TileMap;

  beforeEach(() => {
    projectiles = new ProjectileManager();
    tileMap = new TileMap(10, 10, 16, new Array(100).fill(TileType.AIR));
  });

  it('spawns star and air bullet', () => {
    projectiles.spawnStar(100, 100, 1);
    projectiles.spawnAirBullet(100, 100, -1);

    const active = projectiles.getProjectiles();
    expect(active.length).toBe(2);
    expect(active[0].type).toBe('star');
    expect(active[1].type).toBe('air_bullet');
  });

  it('bounces star off solid tiles up to 3 times', () => {
    // Put solid ground at row 8 (y = 128)
    for (let c = 0; c < 10; c++) {
      tileMap.setTile(c, 8, TileType.SOLID);
    }

    const star = projectiles.spawnStar(30, 120, 1);
    expect(star.bouncesRemaining).toBe(3);

    // Update with delta to hit ground
    for (let i = 0; i < 5; i++) {
      projectiles.update(0.1, tileMap);
    }

    expect(star.bouncesRemaining).toBeLessThan(3);
  });
});
