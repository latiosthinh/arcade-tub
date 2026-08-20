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

  describe('1. Cardinal Kinematics & World Boundary Collisions', () => {
    it('moves UP at tier-specified speed (64 px/s for Tier 1)', () => {
      const startY = tank.y;
      tank.update(0.1, 'UP'); // 64 * 0.1 = 6.4 px
      expect(tank.y).toBeCloseTo(startY - 6.4, 1);
      expect(tank.direction).toBe('UP');
    });

    it('moves DOWN, LEFT, RIGHT at correct speeds', () => {
      tank.x = 200;
      tank.y = 200;
      tank.setTier(TankTier.TIER_2); // 96 px/s
      expect(tank.getStats().speed).toBe(96);

      const startX = tank.x;
      tank.update(0.1, 'RIGHT'); // 96 * 0.1 = 9.6 px
      expect(tank.x).toBeCloseTo(startX + 9.6, 1);
      expect(tank.direction).toBe('RIGHT');

      const startY = tank.y;
      tank.update(0.1, 'DOWN');
      expect(tank.y).toBeCloseTo(startY + 9.6, 1);
      expect(tank.direction).toBe('DOWN');

      tank.update(0.1, 'LEFT');
      expect(tank.direction).toBe('LEFT');
    });

    it('prevents moving outside arena boundary edges [0, 0, 416, 416]', () => {
      tank.x = 2;
      tank.y = 2;

      // Try moving LEFT past left border (x < 0)
      for (let i = 0; i < 10; i++) {
        tank.update(0.1, 'LEFT');
      }
      expect(tank.x).toBeGreaterThanOrEqual(0);

      // Try moving UP past top border (y < 0)
      for (let i = 0; i < 10; i++) {
        tank.update(0.1, 'UP');
      }
      expect(tank.y).toBeGreaterThanOrEqual(0);

      // Move to right / bottom edge
      tank.x = 416 - 28 - 2;
      tank.y = 416 - 28 - 2;

      for (let i = 0; i < 10; i++) {
        tank.update(0.1, 'RIGHT');
        tank.update(0.1, 'DOWN');
      }
      expect(tank.x + tank.width).toBeLessThanOrEqual(416);
      expect(tank.y + tank.height).toBeLessThanOrEqual(416);
    });

    it('stops at solid wall boundaries without tunneling', () => {
      grid.setCell(8, 23, TileType.STEEL, SubTileMask.FULL);
      grid.setCell(9, 23, TileType.STEEL, SubTileMask.FULL);

      // Try moving up into steel wall
      for (let i = 0; i < 20; i++) {
        tank.update(0.1, 'UP');
      }

      // Tank should be clamped below row 24 (y >= 23 * 16 + 16 = 384)
      expect(tank.y).toBeGreaterThanOrEqual(23 * 16 + 16);
    });
  });

  describe('2. Orthogonal Corridor Corner Snapping (<= 4px Deadzone)', () => {
    it('snaps X coordinate to grid line when turning perpendicular with <= 4px offset', () => {
      // Target grid line col 8 (x = 128). Put tank at 131 (offset 3px from 128, and offset 1px from 130).
      tank.x = 131;
      tank.y = 200;
      tank.direction = 'LEFT';

      // Turn UP -> should snap x to 130 or 128
      tank.update(0.01, 'UP');
      expect(tank.direction).toBe('UP');
      expect(tank.x === 128 || tank.x === 130).toBe(true);
    });

    it('does not snap if perpendicular offset exceeds 4px threshold', () => {
      // col 8 is 128 (offsets 128 and 130). Put tank at 136 (8px from 128, 6px from 130, 8px from 144)
      tank.x = 136;
      tank.y = 200;
      tank.direction = 'LEFT';

      // Attempt turn UP -> remainder > 4px threshold -> not snapped
      tank.update(0.01, 'UP');
      expect(tank.direction).toBe('UP');
      expect(tank.x).toBe(136);
    });

    it('does not snap if snapped target position is blocked by solid wall', () => {
      // Solid steel tile at (8, 12) -> x: 128..144, y: 192..208
      grid.setCell(8, 12, TileType.STEEL, SubTileMask.FULL);

      tank.x = 130;
      tank.y = 200;
      tank.direction = 'LEFT';

      // Snapping to 128 would overlap with steel at 128. Snapping must be aborted.
      tank.update(0.01, 'UP');
      expect(tank.direction).toBe('UP');
      expect(tank.x).toBe(130);
    });
  });

  describe('3. Ice Sliding Drift & Deceleration Physics', () => {
    it('drifts on ICE tiles after releasing steering inputs', () => {
      // Place ICE under tank spawn area
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

    it('decelerates and stops sliding after ice inertia decays', () => {
      grid.setCell(8, 24, TileType.ICE, SubTileMask.FULL);
      grid.setCell(9, 24, TileType.ICE, SubTileMask.FULL);
      grid.setCell(8, 23, TileType.ICE, SubTileMask.FULL);
      grid.setCell(9, 23, TileType.ICE, SubTileMask.FULL);

      tank.update(0.1, 'UP');
      // Update with no input until slide decays
      for (let i = 0; i < 20; i++) {
        tank.update(0.1, null);
      }
      expect(tank.getState().isSliding).toBe(false);
    });
  });

  describe('4. Tank Upgrade Tiers (1 -> 4) & Stat Progression', () => {
    it('progresses tiers from TIER_1 to TIER_4 with distinct stats', () => {
      expect(tank.tier).toBe(TankTier.TIER_1);
      expect(tank.getStats().speed).toBe(64);
      expect(tank.getStats().bulletSpeed).toBe(160);
      expect(tank.getStats().maxBullets).toBe(1);
      expect(tank.getStats().canDestroySteel).toBe(false);
      expect(tank.getStats().canCutTrees).toBe(false);

      tank.upgradeTier(); // -> TIER_2 (Fast cannon)
      expect(tank.tier).toBe(TankTier.TIER_2);
      expect(tank.getStats().speed).toBe(96);
      expect(tank.getStats().bulletSpeed).toBe(240);
      expect(tank.getStats().maxBullets).toBe(1);
      expect(tank.getStats().canDestroySteel).toBe(false);

      tank.upgradeTier(); // -> TIER_3 (Dual rapid shot)
      expect(tank.tier).toBe(TankTier.TIER_3);
      expect(tank.getStats().maxBullets).toBe(2);
      expect(tank.getStats().bulletSpeed).toBe(240);

      tank.upgradeTier(); // -> TIER_4 (Heavy armor-piercing)
      expect(tank.tier).toBe(TankTier.TIER_4);
      expect(tank.getStats().bulletSpeed).toBe(280);
      expect(tank.getStats().canDestroySteel).toBe(true);
      expect(tank.getStats().canCutTrees).toBe(true);

      // Capped at TIER_4
      tank.upgradeTier();
      expect(tank.tier).toBe(TankTier.TIER_4);
    });

    it('allows setting tier directly via setTier()', () => {
      tank.setTier(TankTier.TIER_4);
      expect(tank.tier).toBe(TankTier.TIER_4);
      expect(tank.getStats().canDestroySteel).toBe(true);

      tank.setTier(TankTier.TIER_1);
      expect(tank.tier).toBe(TankTier.TIER_1);
      expect(tank.getStats().canDestroySteel).toBe(false);
    });
  });

  describe('5. Invulnerability Shield Bubbles (Spawn & Powerup)', () => {
    it('initializes with 3.0s spawn shield bubble', () => {
      expect(tank.shieldTimer).toBe(SPAWN_SHIELD_DURATION);
      expect(tank.getState().isInvulnerable).toBe(true);
    });

    it('shield protects tank against kill attempts during spawn timer', () => {
      const killed = tank.kill();
      expect(killed).toBe(false);
      expect(tank.isDead).toBe(false);
    });

    it('counts down shieldTimer with update(dt) and expires', () => {
      tank.update(1.5, null);
      expect(tank.shieldTimer).toBeCloseTo(1.5, 1);
      expect(tank.getState().isInvulnerable).toBe(true);

      tank.update(2.0, null);
      expect(tank.shieldTimer).toBe(0);
      expect(tank.getState().isInvulnerable).toBe(false);

      const killed = tank.kill();
      expect(killed).toBe(true);
      expect(tank.isDead).toBe(true);
    });

    it('allows applying custom shield duration via setShield()', () => {
      tank.update(4.0, null); // Expire spawn shield
      expect(tank.getState().isInvulnerable).toBe(false);

      tank.setShield(10.0);
      expect(tank.shieldTimer).toBe(10.0);
      expect(tank.getState().isInvulnerable).toBe(true);

      expect(tank.kill()).toBe(false);
    });
  });

  describe('6. Lives Counter, Death, Respawn Reset & Game Over', () => {
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

    it('allows adding extra lives via addLife()', () => {
      tank.addLife(2);
      expect(tank.lives).toBe(5);
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

  describe('7. Water Terrain Traversal & Boat Powerup Modifier', () => {
    it('water blocks movement by default', () => {
      grid.setCell(8, 23, TileType.WATER, SubTileMask.FULL);
      grid.setCell(9, 23, TileType.WATER, SubTileMask.FULL);

      // Place tank right against the bottom edge of water row 23 (y = 24 * 16 = 384)
      tank.x = 128;
      tank.y = 384;
      tank.update(0.1, 'UP');
      expect(tank.y).toBe(384);
    });

    it('boat powerup allows traversing WATER tiles freely', () => {
      grid.setCell(8, 23, TileType.WATER, SubTileMask.FULL);
      grid.setCell(9, 23, TileType.WATER, SubTileMask.FULL);

      tank.x = 128;
      tank.y = 384;
      tank.setBoat(true);
      expect(tank.getState().boatActive).toBe(true);

      tank.update(0.1, 'UP');
      expect(tank.y).toBeLessThan(384);
    });
  });
});

