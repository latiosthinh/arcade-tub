import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectileManager } from '../src/ProjectileManager';

describe('ProjectileManager & Sword Deflection (CMBT-03)', () => {
  let projectiles: ProjectileManager;

  beforeEach(() => {
    projectiles = new ProjectileManager();
  });

  it('spawns and updates shuriken projectiles', () => {
    projectiles.spawnShuriken(100, 100, 1, 0, 'player');
    expect(projectiles.getProjectiles().length).toBe(1);

    projectiles.update(0.1, { x: 0, y: 0, width: 800, height: 600 });
    expect(projectiles.getProjectiles()[0].x).toBeGreaterThan(100);
  });

  it('deflects and reverses incoming enemy shurikens (CMBT-03)', () => {
    // Enemy fires shuriken leftward at player
    const enemyShuriken = projectiles.spawnShuriken(140, 200, -1, 0, 'enemy');
    expect(enemyShuriken.owner).toBe('enemy');

    // Player sword slash intersects
    const res = projectiles.checkSwordDeflection({ x: 120, y: 190, width: 30, height: 30 });
    expect(res.deflectedCount).toBe(1);
    expect(enemyShuriken.owner).toBe('player');
    expect(enemyShuriken.vx).toBeGreaterThan(0); // Reversed
    expect(enemyShuriken.isDeflected).toBe(true);
  });
});
