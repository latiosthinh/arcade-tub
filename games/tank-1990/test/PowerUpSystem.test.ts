import { describe, it, expect, beforeEach } from 'vitest';
import { GridMap } from '../src/GridMap';
import { PlayerTank } from '../src/PlayerTank';
import { BulletManager } from '../src/BulletManager';
import { EnemySpawner } from '../src/EnemySpawner';
import { PowerUpSystem, EAGLE_PERIMETER_COORDS, POWERUP_SCORE } from '../src/PowerUpSystem';
import { PowerUpType, TankTier, TileType, SubTileMask, EnemyType } from '../src/types';

describe('PowerUpSystem Unit Tests', () => {
  let grid: GridMap;
  let player: PlayerTank;
  let bulletManager: BulletManager;
  let spawner: EnemySpawner;
  let powerUpSystem: PowerUpSystem;

  beforeEach(() => {
    grid = new GridMap();
    player = new PlayerTank(grid, { spawnCol: 8, spawnRow: 24, lives: 3 });
    bulletManager = new BulletManager(grid);
    spawner = new EnemySpawner(grid, bulletManager);
    powerUpSystem = new PowerUpSystem(grid);
  });

  describe('1. PowerUp Spawning & Field Limits', () => {
    it('spawns a powerup item with specified type and coordinates', () => {
      const item = powerUpSystem.spawnPowerUp(PowerUpType.STAR, 100, 100);
      expect(item.type).toBe(PowerUpType.STAR);
      expect(item.x).toBe(100);
      expect(item.y).toBe(100);
      expect(item.alive).toBe(true);
      expect(powerUpSystem.getItemCount()).toBe(1);
    });

    it('spawns random powerup type when using spawnRandomPowerUp()', () => {
      const item = powerUpSystem.spawnRandomPowerUp(150, 150);
      expect(Object.values(PowerUpType)).toContain(item.type);
      expect(item.alive).toBe(true);
    });

    it('limits active field items to maxItems (1 by default, replaces old)', () => {
      powerUpSystem.spawnPowerUp(PowerUpType.STAR, 50, 50);
      expect(powerUpSystem.getItemCount()).toBe(1);

      powerUpSystem.spawnPowerUp(PowerUpType.HELMET, 100, 100);
      expect(powerUpSystem.getItemCount()).toBe(1);
      expect(powerUpSystem.getItems()[0]?.type).toBe(PowerUpType.HELMET);
    });
  });

  describe('2. AABB Collision & Collection Events', () => {
    it('collects item when PlayerTank bounding box overlaps powerup', () => {
      // Place player at (100, 100), item at (110, 110)
      player.x = 100;
      player.y = 100;
      powerUpSystem.spawnPowerUp(PowerUpType.TANK, 110, 110);

      let collectedEvent: any = null;
      powerUpSystem.onPowerUpCollected = (e) => {
        collectedEvent = e;
      };

      powerUpSystem.update(0.1, player, spawner);

      expect(collectedEvent).not.toBeNull();
      expect(collectedEvent.type).toBe(PowerUpType.TANK);
      expect(collectedEvent.points).toBe(POWERUP_SCORE);
      expect(powerUpSystem.getItemCount()).toBe(0);
      expect(player.lives).toBe(4);
    });

    it('does not collect item if player is dead', () => {
      // Expire player spawn shield first so kill() succeeds
      player.shieldTimer = 0;
      player.kill(); // Dead player
      expect(player.isDead).toBe(true);

      player.x = 100;
      player.y = 100;
      powerUpSystem.spawnPowerUp(PowerUpType.TANK, 100, 100);
      powerUpSystem.update(0.1, player, spawner);

      expect(powerUpSystem.getItemCount()).toBe(1);
    });
  });

  describe('3. Tactical PowerUp Item Effects', () => {
    it('STAR: upgrades player tank tier by +1', () => {
      player.x = 50;
      player.y = 50;
      powerUpSystem.spawnPowerUp(PowerUpType.STAR, 50, 50);

      expect(player.tier).toBe(TankTier.TIER_1);
      powerUpSystem.update(0.1, player, spawner);
      expect(player.tier).toBe(TankTier.TIER_2);
    });

    it('GUN: elevates player instantly to Tier 4 (armor piercing + tree cutter)', () => {
      player.x = 50;
      player.y = 50;
      powerUpSystem.spawnPowerUp(PowerUpType.GUN, 50, 50);

      expect(player.tier).toBe(TankTier.TIER_1);
      powerUpSystem.update(0.1, player, spawner);
      expect(player.tier).toBe(TankTier.TIER_4);
      expect(player.getStats().canDestroySteel).toBe(true);
      expect(player.getStats().canCutTrees).toBe(true);
    });

    it('HELMET: grants 10s invulnerability shield', () => {
      player.x = 50;
      player.y = 50;
      player.shieldTimer = 0;
      powerUpSystem.spawnPowerUp(PowerUpType.HELMET, 50, 50);

      powerUpSystem.update(0.1, player, spawner);
      expect(player.shieldTimer).toBe(10.0);
      expect(player.getState().isInvulnerable).toBe(true);
    });

    it('TANK: adds +1 life', () => {
      player.x = 50;
      player.y = 50;
      expect(player.lives).toBe(3);
      powerUpSystem.spawnPowerUp(PowerUpType.TANK, 50, 50);

      powerUpSystem.update(0.1, player, spawner);
      expect(player.lives).toBe(4);
    });

    it('BOAT: activates boatActive water traversing flag', () => {
      player.x = 50;
      player.y = 50;
      expect(player.boatActive).toBe(false);
      powerUpSystem.spawnPowerUp(PowerUpType.BOAT, 50, 50);

      powerUpSystem.update(0.1, player, spawner);
      expect(player.boatActive).toBe(true);
    });

    it('GRENADE: triggers spawner.killAll() and clears field enemies', () => {
      spawner.initWave([EnemyType.BASIC, EnemyType.FAST]);
      // Spawn 1st enemy (delay 0.5s)
      for (let i = 0; i < 6; i++) {
        spawner.update(0.1, 194, 386, []);
      }
      for (const e of spawner.getActiveEnemies()) e.y = 100;

      // Spawn 2nd enemy
      for (let i = 0; i < 30; i++) {
        spawner.update(0.1, 194, 386, []);
      }
      expect(spawner.getActiveEnemies().length).toBe(2);

      player.x = 50;
      player.y = 50;
      powerUpSystem.spawnPowerUp(PowerUpType.GRENADE, 50, 50);
      powerUpSystem.update(0.1, player, spawner);

      expect(spawner.getActiveEnemies().length).toBe(0);
    });

    it('CLOCK: triggers spawner.freezeAll(10.0)', () => {
      spawner.initWave([EnemyType.BASIC]);
      for (let i = 0; i < 6; i++) {
        spawner.update(0.1, 194, 386, []);
      }
      expect(spawner.getActiveEnemies().length).toBe(1);

      player.x = 50;
      player.y = 50;
      powerUpSystem.spawnPowerUp(PowerUpType.CLOCK, 50, 50);
      powerUpSystem.update(0.1, player, spawner);

      const enemy = spawner.getActiveEnemies()[0]!;
      expect(enemy.isFrozen).toBe(true);
      expect(enemy.freezeTimer).toBe(10.0);
    });
  });

  describe('4. Shovel Eagle HQ Fortification & Perimeter State Caching/Restoration', () => {
    it('fortifies Eagle base perimeter with STEEL for 20s and restores original layout upon expiration', () => {
      // Set initial brick perimeter layout around HQ
      for (const coord of EAGLE_PERIMETER_COORDS) {
        grid.setCell(coord.col, coord.row, TileType.BRICK, SubTileMask.FULL);
      }

      // Partially damage one brick to test exact bitmask caching
      grid.damageBrick(11, 23, 'UP', false);
      const damagedCell = grid.getCell(11, 23);
      const cachedOriginalMask = damagedCell?.mask;

      player.x = 50;
      player.y = 50;
      powerUpSystem.spawnPowerUp(PowerUpType.SHOVEL, 50, 50);
      powerUpSystem.update(0.1, player, spawner);

      expect(powerUpSystem.shovelTimer).toBe(20.0);

      // Verify all 8 perimeter tiles are now STEEL
      for (const coord of EAGLE_PERIMETER_COORDS) {
        const cell = grid.getCell(coord.col, coord.row);
        expect(cell?.type).toBe(TileType.STEEL);
        expect(cell?.mask).toBe(SubTileMask.FULL);
      }

      // Advance time past 20.0s (e.g. 21.0s)
      for (let i = 0; i < 210; i++) {
        powerUpSystem.update(0.1, player, spawner);
      }

      expect(powerUpSystem.shovelTimer).toBe(0);

      // Verify tiles are restored to original types and bitmasks
      for (const coord of EAGLE_PERIMETER_COORDS) {
        const cell = grid.getCell(coord.col, coord.row);
        expect(cell?.type).toBe(TileType.BRICK);
      }

      // Verify damaged brick has its original chipped mask restored
      const restoredDamagedCell = grid.getCell(11, 23);
      expect(restoredDamagedCell?.mask).toBe(cachedOriginalMask);
    });
  });
});
