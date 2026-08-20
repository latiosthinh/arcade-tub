import { describe, it, expect, beforeEach } from 'vitest';
import { GridMap } from '../src/GridMap';
import { BulletManager } from '../src/BulletManager';
import { EnemySpawner } from '../src/EnemySpawner';
import { EnemyType, SPAWN_PORTALS, ENEMY_CONFIGS } from '../src/types';

describe('EnemySpawner Unit Tests', () => {
  let grid: GridMap;
  let bulletManager: BulletManager;
  let spawner: EnemySpawner;

  beforeEach(() => {
    grid = new GridMap();
    bulletManager = new BulletManager(grid);
    spawner = new EnemySpawner(grid, bulletManager, {
      spawnInterval: 0.1, // Fast spawn interval for deterministic unit tests
      maxConcurrent: 4,
    });
  });

  describe('1. Wave Queue Initialization & Concurrency Enforcing', () => {
    it('initializes default 20-tank wave queue', () => {
      const defaultQueue = EnemySpawner.getDefaultWaveQueue();
      expect(defaultQueue.length).toBe(20);

      spawner.initWave(defaultQueue);
      expect(spawner.getQueueRemaining()).toBe(20);
      expect(spawner.getTotalRemaining()).toBe(20);
      expect(spawner.isWaveComplete()).toBe(false);
    });

    it('enforces maximum 4 concurrent active enemy tanks limit', () => {
      const queue = [
        EnemyType.BASIC,
        EnemyType.BASIC,
        EnemyType.BASIC,
        EnemyType.BASIC,
        EnemyType.BASIC,
        EnemyType.BASIC,
      ];
      spawner.initWave(queue);

      // Advance time to spawn tanks
      for (let i = 0; i < 30; i++) {
        spawner.update(0.1, 194, 386, []);
      }

      // Max concurrent should cap active tanks at 4
      const active = spawner.getActiveEnemies();
      expect(active.length).toBe(4);
      expect(spawner.getQueueRemaining()).toBe(2);
      expect(spawner.getTotalRemaining()).toBe(6);
    });
  });

  describe('2. 3-Portal Spawn Rotation (Left, Center, Right)', () => {
    it('spawns tanks cycling across the 3 top portals (col 0, 12, 24)', () => {
      spawner.initWave([
        EnemyType.BASIC,
        EnemyType.BASIC,
        EnemyType.BASIC,
      ]);

      // 1st spawn (Portal 0: col 0 -> x = 2) - initial delay is 0.5s (6 ticks of 0.1)
      for (let i = 0; i < 6; i++) {
        spawner.update(0.1, 194, 386, []);
      }
      let active = spawner.getActiveEnemies();
      expect(active.length).toBe(1);
      // Spawned at Portal 0 (col 0: x = 2) and moved downwards/towards goal
      expect(active[0]?.direction).toBeDefined();

      // Move 1st tank far down to clear portal
      active[0]!.x = 2;
      active[0]!.y = 100;

      // 2nd spawn (Portal 1: col 12 -> x = 194) - spawnInterval is 0.1s (1 tick)
      spawner.update(0.1, 194, 386, []);
      active = spawner.getActiveEnemies();
      expect(active.length).toBe(2);

      active[1]!.x = 194;
      active[1]!.y = 100;

      // 3rd spawn (Portal 2: col 24 -> x = 386)
      spawner.update(0.1, 194, 386, []);
      active = spawner.getActiveEnemies();
      expect(active.length).toBe(3);
    });
  });

  describe('3. Flashing Bonus Tank Spawning (4th, 11th, 18th)', () => {
    it('sets isFlashing = true on 4th spawned tank', () => {
      const queue = [
        EnemyType.BASIC,
        EnemyType.BASIC,
        EnemyType.BASIC,
        EnemyType.BASIC, // 4th
      ];
      spawner.initWave(queue);

      for (let i = 0; i < 20; i++) {
        // Move any active tanks down so portals don't block
        for (const e of spawner.getActiveEnemies()) {
          e.y = 100 + e.hp * 10;
        }
        spawner.update(0.1, 194, 386, []);
      }

      const active = spawner.getActiveEnemies();
      expect(active.length).toBe(4);

      expect(active[0]?.isFlashing).toBe(false);
      expect(active[1]?.isFlashing).toBe(false);
      expect(active[2]?.isFlashing).toBe(false);
      expect(active[3]?.isFlashing).toBe(true);
    });
  });

  describe('4. Bulk Operations: freezeAll() and killAll()', () => {
    it('freezeAll() freezes all currently active enemy tanks for specified duration', () => {
      spawner.initWave([EnemyType.BASIC, EnemyType.FAST]);
      for (let i = 0; i < 15; i++) {
        for (const e of spawner.getActiveEnemies()) e.y = 100;
        spawner.update(0.1, 194, 386, []);
      }

      const active = spawner.getActiveEnemies();
      expect(active.length).toBe(2);

      spawner.freezeAll(10.0);
      expect(active[0]?.isFrozen).toBe(true);
      expect(active[0]?.freezeTimer).toBe(10.0);
      expect(active[1]?.isFrozen).toBe(true);
      expect(active[1]?.freezeTimer).toBe(10.0);
    });

    it('killAll() destroys all active enemies, tallies score, and clears active list', () => {
      spawner.initWave([EnemyType.BASIC, EnemyType.FAST, EnemyType.ARMOR]);
      for (let i = 0; i < 20; i++) {
        for (const e of spawner.getActiveEnemies()) e.y = 100;
        spawner.update(0.1, 194, 386, []);
      }

      const active = spawner.getActiveEnemies();
      expect(active.length).toBe(3);

      let callbackScore = 0;
      const points = spawner.killAll((pts) => {
        callbackScore += pts;
      });

      // Basic (100) + Fast (200) + Armor (400) = 700
      expect(points).toBe(700);
      expect(callbackScore).toBe(700);
      expect(spawner.getActiveEnemies().length).toBe(0);
    });
  });
});
