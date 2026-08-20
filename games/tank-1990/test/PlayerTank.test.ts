import { describe, it, expect, beforeEach } from 'vitest';
import { GridMap } from '../src/GridMap';
import { PlayerTank } from '../src/PlayerTank';
import { TankTier, TileType, SubTileMask, SPAWN_SHIELD_DURATION, TANK_TIER_CONFIGS } from '../src/types';

describe('PlayerTank Unit Tests', () => {
  let grid: GridMap;
  let tank: PlayerTank;

  beforeEach(() => {
    grid = new GridMap();
    tank = new PlayerTank(grid, { spawnCol: 8, spawnRow: 24, lives: 3 });
  });

  describe('Lifecycle & Spawning', () => {
    it('initializes at correct spawn coordinates with shield bubble', () => {
      expect(tank.x).toBe(8 * 16 + 2); // 130
      expect(tank.y).toBe(24 * 16 + 2); // 386
      expect(tank.direction).toBe('UP');
      expect(tank.shieldTimer).toBe(SPAWN_SHIELD_DURATION);
      expect(tank.getState().isInvulnerable).toBe(true);
      expect(tank.lives).toBe(3);
      expect(tank.isDead).toBe(false);
      expect(tank.tier).toBe(TankTier.TIER_1);
    });

    it('shield protects tank against kill attempts during spawn timer', () => {
      const killed = tank.kill();
      expect(killed).toBe(false);
      expect(tank.isDead).toBe(false);
    });

    it('kill succeeds after shield timer expires', () => {
      tank.update(3.5, null);
      expect(tank.shieldTimer).toBe(0);
      expect(tank.getState().isInvulnerable).toBe(false);

      const killed = tank.kill();
      expect(killed).toBe(true);
      expect(tank.isDead).toBe(true);
    });

    it('respawn decrements lives and resets tier to TIER_1', () => {
      tank.upgradeTier();
      tank.upgradeTier();
      expect(tank.tier).toBe(TankTier.TIER_3);

      tank.update(3.5, null);
      tank.kill();
      expect(tank.isDead).toBe(true);

      const respawned = tank.respawn();
      expect(respawned).toBe(true);
      expect(tank.lives).toBe(2);
      expect(tank.tier).toBe(TankTier.TIER_1);
      expect(tank.isDead).toBe(false);
      expect(tank.shieldTimer).toBe(SPAWN_SHIELD_DURATION);
    });

    it('marks gameOver when respawning with 0 lives', () => {
      const deadTank = new PlayerTank(grid, { lives: 1 });
      deadTank.update(3.5, null);
      deadTank.kill();
      const respawned = deadTank.respawn();
      expect(respawned).toBe(false);
      expect(deadTank.isGameOver).toBe(true);
    });
  });

  describe('Upgrade Tier Progression', () => {
    it('progresses tiers from TIER_1 to TIER_4 with distinct stats', () => {
      expect(tank.tier).toBe(TankTier.TIER_1);
      expect(tank.getStats().speed).toBe(64);
      expect(tank.getStats().bulletSpeed).toBe(160);
      expect(tank.getStats().maxBullets).toBe(1);
      expect(tank.getStats().canDestroySteel).toBe(false);

      tank.upgradeTier(); // -> TIER_2
      expect(tank.tier).toBe(TankTier.TIER_2);
      expect(tank.getStats().speed).toBe(96);
      expect(tank.getStats().bulletSpeed).toBe(240);
      expect(tank.getStats().maxBullets).toBe(1);

      tank.upgradeTier(); // -> TIER_3
      expect(tank.tier).toBe(TankTier.TIER_3);
      expect(tank.getStats().maxBullets).toBe(2);

      tank.upgradeTier(); // -> TIER_4
      expect(tank.tier).toBe(TankTier.TIER_4);
      expect(tank.getStats().bulletSpeed).toBe(280);
      expect(tank.getStats().canDestroySteel).toBe(true);
      expect(tank.getStats().canCutTrees).toBe(true);

      // Capped at TIER_4
      tank.upgradeTier();
      expect(tank.tier).toBe(TankTier.TIER_4);
    });
  });

  describe('Kinematics & Cardinal Movement', () => {
    it('moves UP at tier-specified speed and safe dt', () => {
      const startY = tank.y;
      tank.update(0.1, 'UP'); // 64 * 0.1 = 6.4 px
      expect(tank.y).toBeCloseTo(startY - 6.4, 1);
    });

    it('stops at solid wall boundaries without tunneling', () => {
      grid.setCell(8, 23, TileType.STEEL, SubTileMask.FULL);
      grid.setCell(9, 23, TileType.STEEL, SubTileMask.FULL);

      // Try moving up into steel wall
      for (let i = 0; i < 20; i++) {
        tank.update(0.1, 'UP');
      }

      // Tank should be clamped below row 24 (y >= 24 * 16 = 384)
      expect(tank.y).toBeGreaterThanOrEqual(23 * 16 + 16);
    });

    it('boat powerup allows traversing WATER tiles', () => {
      grid.setCell(8, 23, TileType.WATER, SubTileMask.FULL);
      grid.setCell(9, 23, TileType.WATER, SubTileMask.FULL);

      // Without boat, movement is blocked by water
      const startY = tank.y;
      tank.update(0.1, 'UP');
      const stoppedY = tank.y;

      // With boat, movement proceeds through water
      tank.setBoat(true);
      tank.update(0.1, 'UP');
      expect(tank.y).toBeLessThan(stoppedY);
    });
  });

  describe('Corner Snapping (<= 4px alignment assist)', () => {
    it('snaps X coordinate to grid line when turning perpendicular with <= 4px offset', () => {
      // Tank at x = 130 (128 + 2). Slightly nudge to 132 (remainder 4 from 128)
      tank.x = 132;
      tank.direction = 'LEFT';

      // Turn UP -> should snap x back to 128 or 130
      tank.update(0.01, 'UP');
      expect(tank.direction).toBe('UP');
      expect(tank.x === 128 || tank.x === 130).toBe(true);
    });
  });

  describe('Ice Sliding Physics', () => {
    it('drifts on ICE tiles after releasing steering inputs', () => {
      // Place ICE under tank spawn
      grid.setCell(8, 24, TileType.ICE, SubTileMask.FULL);
      grid.setCell(9, 24, TileType.ICE, SubTileMask.FULL);
      grid.setCell(8, 23, TileType.ICE, SubTileMask.FULL);
      grid.setCell(9, 23, TileType.ICE, SubTileMask.FULL);

      // Move on ice
      tank.update(0.1, 'UP');
      const moveY = tank.y;

      // Release key (null input) -> should slide forward due to momentum
      tank.update(0.1, null);
      expect(tank.y).toBeLessThan(moveY);
      expect(tank.getState().isSliding).toBe(true);
    });
  });
});
