import { describe, it, expect, beforeEach } from 'vitest';
import { BulletManager, FireStats } from '../src/BulletManager';
import { GridMap } from '../src/GridMap';
import {
  BULLET_SIZE,
  BulletOwner,
  CombatTankTarget,
  SubTileMask,
  TANK_SIZE,
  TileType,
} from '../src/types';

describe('BulletManager Unit Tests', () => {
  let grid: GridMap;
  let bulletManager: BulletManager;

  const defaultPlayerStats: FireStats = {
    bulletSpeed: 160,
    canDestroySteel: false,
    canCutTrees: false,
    damage: 1,
  };

  const heavyStats: FireStats = {
    bulletSpeed: 280,
    canDestroySteel: true,
    canCutTrees: true,
    damage: 1,
  };

  beforeEach(() => {
    grid = new GridMap();
    bulletManager = new BulletManager(grid);
  });

  describe('1. Muzzle Calculations & Rate-Limiting', () => {
    it('spawns bullets from correct muzzle positions for all 4 cardinal directions', () => {
      const tankX = 100;
      const tankY = 100;
      const expectedCenterOffset = (TANK_SIZE - BULLET_SIZE) / 2; // (28 - 6) / 2 = 11

      // UP: above top edge
      const bUp = bulletManager.fire(tankX, tankY, 'UP', 'PLAYER', defaultPlayerStats);
      expect(bUp).not.toBeNull();
      expect(bUp?.x).toBe(tankX + expectedCenterOffset);
      expect(bUp?.y).toBe(tankY - BULLET_SIZE);
      expect(bUp?.direction).toBe('UP');
      expect(bUp?.owner).toBe('PLAYER');
      expect(bUp?.alive).toBe(true);

      // DOWN: below bottom edge
      const bDown = bulletManager.fire(tankX, tankY, 'DOWN', 'PLAYER', defaultPlayerStats);
      expect(bDown?.x).toBe(tankX + expectedCenterOffset);
      expect(bDown?.y).toBe(tankY + TANK_SIZE);
      expect(bDown?.direction).toBe('DOWN');

      // LEFT: left of left edge
      const bLeft = bulletManager.fire(tankX, tankY, 'LEFT', 'PLAYER', defaultPlayerStats);
      expect(bLeft?.x).toBe(tankX - BULLET_SIZE);
      expect(bLeft?.y).toBe(tankY + expectedCenterOffset);
      expect(bLeft?.direction).toBe('LEFT');

      // RIGHT: right of right edge
      const bRight = bulletManager.fire(tankX, tankY, 'RIGHT', 'PLAYER', defaultPlayerStats);
      expect(bRight?.x).toBe(tankX + TANK_SIZE);
      expect(bRight?.y).toBe(tankY + expectedCenterOffset);
      expect(bRight?.direction).toBe('RIGHT');
    });

    it('enforces rate-limiting via canFire based on maxBullets and owner', () => {
      expect(bulletManager.canFire('PLAYER', 1)).toBe(true);
      bulletManager.fire(100, 100, 'UP', 'PLAYER', defaultPlayerStats);
      expect(bulletManager.canFire('PLAYER', 1)).toBe(false);
      expect(bulletManager.canFire('PLAYER', 2)).toBe(true);

      // Enemy fire limit is tracked independently from Player
      expect(bulletManager.canFire('ENEMY', 1)).toBe(true);
      bulletManager.fire(200, 200, 'DOWN', 'ENEMY', defaultPlayerStats);
      expect(bulletManager.canFire('ENEMY', 1)).toBe(false);
      expect(bulletManager.canFire('PLAYER', 2)).toBe(true);
    });

    it('cleans up and resets bullets correctly', () => {
      bulletManager.fire(100, 100, 'UP', 'PLAYER', defaultPlayerStats);
      bulletManager.fire(200, 200, 'DOWN', 'ENEMY', defaultPlayerStats);
      expect(bulletManager.getBullets()).toHaveLength(2);

      bulletManager.clear();
      expect(bulletManager.getBullets()).toHaveLength(0);
      expect(bulletManager.getEvents()).toHaveLength(0);
    });
  });

  describe('2. Continuous 120Hz Sub-Stepping & Anti-Tunneling', () => {
    it('prevents fast bullets from tunneling through single 16px brick walls on large dt frames', () => {
      // Place single brick wall at col 10 (x: 160..176), row 10 (y: 160..176)
      grid.setCell(10, 10, TileType.BRICK, SubTileMask.FULL);

      // Spawn very fast bullet at x: 100 moving RIGHT toward col 10 at 800 px/s
      const fastStats: FireStats = {
        bulletSpeed: 800,
        canDestroySteel: false,
        canCutTrees: false,
      };
      bulletManager.fire(100 - 28, 160 - 11 + 4, 'RIGHT', 'PLAYER', fastStats);

      // One large frame dt = 0.1s -> total displacement = 80px (from x: 100 to x: 180)
      // Without sub-stepping, bullet would jump from 100 to 180, completely bypassing the 160..176 wall!
      const events = bulletManager.update(0.1);

      expect(events.some((e) => e.type === 'BRICK' && e.cellCol === 10 && e.cellRow === 10)).toBe(true);
      expect(bulletManager.getBullets()).toHaveLength(0); // Bullet was consumed
      // Wall should have received damage (chipped left quadrants)
      expect(grid.getCell(10, 10)?.mask).toBe(SubTileMask.TOP_RIGHT | SubTileMask.BOTTOM_RIGHT);
    });

    it('removes bullets and emits BOUNDARY event when exiting arena edges [0, 0, 416, 416]', () => {
      // Bullet moving UP near top edge
      bulletManager.fire(100, 4, 'UP', 'PLAYER', defaultPlayerStats);
      // Bullet moving LEFT near left edge
      bulletManager.fire(4, 100, 'LEFT', 'PLAYER', defaultPlayerStats);

      const events = bulletManager.update(0.1);
      const boundaryEvents = events.filter((e) => e.type === 'BOUNDARY');
      expect(boundaryEvents).toHaveLength(2);
      expect(bulletManager.getBullets()).toHaveLength(0);
    });
  });

  describe('3. Mid-Air Opposing Bullet-vs-Bullet Cancellation (COMBAT-02)', () => {
    it('cancels colliding opposing player and enemy bullets mid-air and fires BULLET_CANCEL event', () => {
      // Player bullet at (100, 100) moving DOWN
      const pBullet = bulletManager.fire(100 - 11, 72, 'DOWN', 'PLAYER', defaultPlayerStats); // y starts at 100
      // Enemy bullet at (100, 140) moving UP
      const eBullet = bulletManager.fire(100 - 11, 146, 'UP', 'ENEMY', defaultPlayerStats); // y starts at 140

      expect(pBullet).not.toBeNull();
      expect(eBullet).not.toBeNull();

      // Over 0.15s (160 px/s * 0.15 = 24px each), bullets will collide around y = 120
      const events = bulletManager.update(0.15);
      const cancelEvents = events.filter((e) => e.type === 'BULLET_CANCEL');

      expect(cancelEvents).toHaveLength(1);
      expect(cancelEvents[0]?.bulletId).toBe(pBullet?.id);
      expect(cancelEvents[0]?.targetId).toBe(eBullet?.id);
      expect(bulletManager.getBullets()).toHaveLength(0);
    });

    it('does not cancel bullets belonging to the same owner team', () => {
      // Two player bullets moving toward or alongside each other
      bulletManager.fire(100, 100, 'DOWN', 'PLAYER', defaultPlayerStats);
      bulletManager.fire(100, 120, 'UP', 'PLAYER', defaultPlayerStats);

      const events = bulletManager.update(0.01);
      const cancelEvents = events.filter((e) => e.type === 'BULLET_CANCEL');
      expect(cancelEvents).toHaveLength(0);
    });
  });

  describe('4. Terrain Collisions & Sub-Tile Destruction (COMBAT-03)', () => {
    it('chips brick quadrants accurately on projectile impact', () => {
      // Brick at (5, 5)
      grid.setCell(5, 5, TileType.BRICK, SubTileMask.FULL);

      // Fire UP bullet hitting bottom of cell (5, 5) -> (x: 80..96, y: 80..96)
      bulletManager.fire(80 - 11 + 4, 110, 'UP', 'PLAYER', defaultPlayerStats);
      let events = bulletManager.update(0.2);

      expect(events.some((e) => e.type === 'BRICK' && e.cellCol === 5 && e.cellRow === 5)).toBe(true);
      // Bottom half chipped away -> TOP_LEFT | TOP_RIGHT remains
      expect(grid.getCell(5, 5)?.mask).toBe(SubTileMask.TOP_LEFT | SubTileMask.TOP_RIGHT);
      expect(bulletManager.getBullets()).toHaveLength(0);

      // Fire second UP bullet into remaining top half
      bulletManager.clearEvents();
      bulletManager.fire(80 - 11 + 4, 110, 'UP', 'PLAYER', defaultPlayerStats);
      events = bulletManager.update(0.2);

      expect(events.some((e) => e.type === 'BRICK' && e.cellCol === 5 && e.cellRow === 5)).toBe(true);
      expect(grid.getCell(5, 5)?.type).toBe(TileType.EMPTY);
    });

    it('passes through partially chipped brick quadrant gaps without colliding', () => {
      // Brick at (5, 5) with only TOP_LEFT quadrant present (x: 80..88, y: 80..88)
      grid.setCell(5, 5, TileType.BRICK, SubTileMask.TOP_LEFT);

      // Fire bullet aligned with right half of cell (x: 89..95) moving UP
      // (tankSize: 28, BULLET_SIZE: 6, center offset: 11 -> tankX = 89 - 11 = 78)
      bulletManager.fire(78, 120, 'UP', 'PLAYER', defaultPlayerStats);
      const events = bulletManager.update(0.1);

      // Should not collide with brick at (5, 5) because right half is empty!
      expect(events.some((e) => e.type === 'BRICK')).toBe(false);
      expect(bulletManager.getBullets()).toHaveLength(1);
    });

    it('standard bullets collide with STEEL without destroying it', () => {
      grid.setCell(6, 6, TileType.STEEL, SubTileMask.FULL);

      bulletManager.fire(6 * 16 - 11 + 4, 6 * 16 + 30, 'UP', 'PLAYER', defaultPlayerStats);
      const events = bulletManager.update(0.2);

      expect(events.some((e) => e.type === 'STEEL' && e.cellCol === 6 && e.cellRow === 6)).toBe(true);
      expect(grid.getCell(6, 6)?.type).toBe(TileType.STEEL);
      expect(grid.getCell(6, 6)?.mask).toBe(SubTileMask.FULL);
      expect(bulletManager.getBullets()).toHaveLength(0);
    });

    it('Tier-4 heavy bullets demolish STEEL and cut TREES', () => {
      grid.setCell(6, 6, TileType.STEEL, SubTileMask.FULL);
      grid.setCell(7, 6, TileType.TREES, SubTileMask.FULL);

      // Heavy bullet against steel
      bulletManager.fire(6 * 16 - 11 + 4, 6 * 16 + 30, 'UP', 'PLAYER', heavyStats);
      let events = bulletManager.update(0.2);
      expect(events.some((e) => e.type === 'STEEL' && e.cellCol === 6 && e.cellRow === 6)).toBe(true);
      expect(grid.getCell(6, 6)?.type).toBe(TileType.EMPTY);

      // Heavy bullet against trees
      bulletManager.clearEvents();
      bulletManager.fire(7 * 16 - 11 + 4, 6 * 16 + 30, 'UP', 'PLAYER', heavyStats);
      events = bulletManager.update(0.2);
      expect(events.some((e) => e.type === 'TREE' && e.cellCol === 7 && e.cellRow === 6)).toBe(true);
      expect(grid.getCell(7, 6)?.type).toBe(TileType.EMPTY);
    });

    it('allows bullets to fly unimpeded across WATER and ICE tiles', () => {
      grid.setCell(8, 8, TileType.WATER, SubTileMask.FULL);
      grid.setCell(8, 9, TileType.ICE, SubTileMask.FULL);

      // Bullet traverses through water and ice
      bulletManager.fire(8 * 16 - 11 + 4, 8 * 16 - 10, 'DOWN', 'PLAYER', defaultPlayerStats);
      const events = bulletManager.update(0.1);

      // No collision events, bullet remains alive
      expect(events).toHaveLength(0);
      expect(bulletManager.getBullets()).toHaveLength(1);
    });

    it('destroys Eagle HQ and triggers EAGLE event on impact', () => {
      expect(grid.isEagleDestroyed()).toBe(false);

      // Eagle is at (12..13, 24..25) -> y: 384..416
      // Fire DOWN from above Eagle
      bulletManager.fire(12 * 16 - 11 + 4, 350, 'DOWN', 'ENEMY', defaultPlayerStats);
      const events = bulletManager.update(0.3);

      expect(events.some((e) => e.type === 'EAGLE')).toBe(true);
      expect(grid.isEagleDestroyed()).toBe(true);
      expect(bulletManager.getBullets()).toHaveLength(0);
    });
  });

  describe('5. Tank Combat Damage Resolution (COMBAT-04)', () => {
    let mockPlayerTank: CombatTankTarget;
    let mockEnemyTank: CombatTankTarget;
    let playerDamageReceived = 0;
    let enemyDamageReceived = 0;

    beforeEach(() => {
      playerDamageReceived = 0;
      enemyDamageReceived = 0;

      mockPlayerTank = {
        id: 'player-1',
        x: 100,
        y: 100,
        width: 28,
        height: 28,
        isPlayer: true,
        isDead: false,
        isInvulnerable: false,
        takeDamage: (dmg: number) => {
          playerDamageReceived += dmg;
          return true;
        },
      };

      mockEnemyTank = {
        id: 'enemy-1',
        x: 200,
        y: 200,
        width: 28,
        height: 28,
        isPlayer: false,
        isDead: false,
        isInvulnerable: false,
        takeDamage: (dmg: number) => {
          enemyDamageReceived += dmg;
          return true;
        },
      };
    });

    it('player bullet damages enemy tank and produces TANK event', () => {
      // Fire player bullet at enemy tank at (200, 200)
      bulletManager.fire(200 - 11 + 4, 250, 'UP', 'PLAYER', defaultPlayerStats);
      const events = bulletManager.update(0.3, [mockPlayerTank, mockEnemyTank]);

      const tankEvents = events.filter((e) => e.type === 'TANK');
      expect(tankEvents).toHaveLength(1);
      expect(tankEvents[0]?.targetId).toBe('enemy-1');
      expect(enemyDamageReceived).toBe(1);
      expect(playerDamageReceived).toBe(0);
      expect(bulletManager.getBullets()).toHaveLength(0);
    });

    it('enemy bullet damages player tank and produces TANK event', () => {
      // Fire enemy bullet at player tank at (100, 100)
      bulletManager.fire(100 - 11 + 4, 50, 'DOWN', 'ENEMY', defaultPlayerStats);
      const events = bulletManager.update(0.3, [mockPlayerTank, mockEnemyTank]);

      const tankEvents = events.filter((e) => e.type === 'TANK');
      expect(tankEvents).toHaveLength(1);
      expect(tankEvents[0]?.targetId).toBe('player-1');
      expect(playerDamageReceived).toBe(1);
      expect(enemyDamageReceived).toBe(0);
    });

    it('friendly fire is ignored: player bullets do not hit player, enemy bullets do not hit enemy', () => {
      // Player bullet fired right on player tank
      bulletManager.fire(100 - 11 + 4, 100, 'DOWN', 'PLAYER', defaultPlayerStats);
      // Enemy bullet fired right on enemy tank
      bulletManager.fire(200 - 11 + 4, 200, 'DOWN', 'ENEMY', defaultPlayerStats);

      const events = bulletManager.update(0.01, [mockPlayerTank, mockEnemyTank]);
      const tankEvents = events.filter((e) => e.type === 'TANK');

      expect(tankEvents).toHaveLength(0);
      expect(playerDamageReceived).toBe(0);
      expect(enemyDamageReceived).toBe(0);
    });

    it('invulnerable tank absorbs bullet without calling takeDamage', () => {
      mockPlayerTank.isInvulnerable = true;

      bulletManager.fire(100 - 11 + 4, 50, 'DOWN', 'ENEMY', defaultPlayerStats);
      const events = bulletManager.update(0.3, [mockPlayerTank, mockEnemyTank]);

      const tankEvents = events.filter((e) => e.type === 'TANK');
      expect(tankEvents).toHaveLength(1);
      expect(tankEvents[0]?.targetId).toBe('player-1');
      expect(playerDamageReceived).toBe(0); // Protected by invulnerability shield
      expect(bulletManager.getBullets()).toHaveLength(0);
    });

    it('ignores dead tanks during damage resolution', () => {
      mockEnemyTank.isDead = true;

      bulletManager.fire(200 - 11 + 4, 250, 'UP', 'PLAYER', defaultPlayerStats);
      const events = bulletManager.update(0.3, [mockPlayerTank, mockEnemyTank]);

      const tankEvents = events.filter((e) => e.type === 'TANK');
      expect(tankEvents).toHaveLength(0);
      expect(enemyDamageReceived).toBe(0);
    });
  });
});
