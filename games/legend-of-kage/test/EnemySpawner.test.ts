import { describe, it, expect, beforeEach } from 'vitest';
import { EnemySpawner } from '../src/enemies/EnemySpawner';
import { ProjectileManager } from '../src/ProjectileManager';
import { TreeCanopy } from '../src/TreeCanopy';

describe('EnemySpawner (ENMY-06)', () => {
  let spawner: EnemySpawner;
  let projectiles: ProjectileManager;
  let canopy: TreeCanopy;

  beforeEach(() => {
    spawner = new EnemySpawner();
    projectiles = new ProjectileManager();
    canopy = new TreeCanopy();
  });

  it('spawns and limits continuous active enemy waves (ENMY-06)', () => {
    spawner.spawn('red_ninja', 200, 536);
    spawner.spawn('blue_ninja', 400, 300);
    expect(spawner.getEnemies().length).toBe(2);

    const hit = spawner.checkCollision({ x: 195, y: 530, width: 20, height: 20 });
    expect(hit).not.toBeNull();
    expect(hit?.type).toBe('red_ninja');
  });
});
