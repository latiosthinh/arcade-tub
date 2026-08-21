import { describe, it, expect, beforeEach } from 'vitest';
import { GridMap } from '../src/GridMap';
import { BulletManager } from '../src/BulletManager';
import { EnemyTank } from '../src/EnemyTank';
import { EnemyType, ENEMY_CONFIGS, TileType, SubTileMask } from '../src/types';

describe('EnemyTank Unit Tests', () => {
  let grid: GridMap;
  let bulletManager: BulletManager;

  beforeEach(() => {
    grid = new GridMap();
    bulletManager = new BulletManager(grid);
  });

  describe('1. 4 Enemy Tank Archetypes & Config Parameters', () => {
    it('initializes BASIC tank with correct stats (speed 48, bulletSpeed 160, hp 1, points 100)', () => {
      const enemy = new EnemyTank(EnemyType.BASIC, grid, bulletManager);
      const stats = enemy.getStats();

      expect(stats.speed).toBe(48);
      expect(stats.bulletSpeed).toBe(160);
      expect(stats.hp).toBe(1);
      expect(stats.points).toBe(100);
      expect(enemy.hp).toBe(1);
      expect(enemy.maxHp).toBe(1);
      expect(enemy.isPlayer).toBe(false);
    });

    it('initializes FAST tank with correct stats (speed 96, bulletSpeed 192, hp 1, points 200)', () => {
      const enemy = new EnemyTank(EnemyType.FAST, grid, bulletManager);
      const stats = enemy.getStats();

      expect(stats.speed).toBe(96);
      expect(stats.bulletSpeed).toBe(192);
      expect(stats.hp).toBe(1);
      expect(stats.points).toBe(200);
      expect(enemy.hp).toBe(1);
    });

    it('initializes POWER tank with correct stats (speed 64, bulletSpeed 280, hp 1, points 300)', () => {
      const enemy = new EnemyTank(EnemyType.POWER, grid, bulletManager);
      const stats = enemy.getStats();

      expect(stats.speed).toBe(64);
      expect(stats.bulletSpeed).toBe(280);
      expect(stats.hp).toBe(1);
      expect(stats.points).toBe(300);
    });

    it('initializes ARMOR tank with correct stats (speed 48, bulletSpeed 160, hp 4, points 400)', () => {
      const enemy = new EnemyTank(EnemyType.ARMOR, grid, bulletManager);
      const stats = enemy.getStats();

      expect(stats.speed).toBe(48);
      expect(stats.bulletSpeed).toBe(160);
      expect(stats.hp).toBe(4);
      expect(stats.points).toBe(400);
      expect(enemy.hp).toBe(4);
      expect(enemy.maxHp).toBe(4);
    });
  });

  describe('2. Armor Tank 4-Hit Degradation Palette & Damage Taking', () => {
    it('degrades armor color on damage: GREEN (4hp) -> YELLOW (3hp) -> ORANGE (2hp) -> WHITE (1hp)', () => {
      const armorTank = new EnemyTank(EnemyType.ARMOR, grid, bulletManager);
      expect(armorTank.getArmorColor()).toBe('GREEN');

      armorTank.takeDamage(1);
      expect(armorTank.hp).toBe(3);
      expect(armorTank.getArmorColor()).toBe('YELLOW');
      expect(armorTank.isDead).toBe(false);

      armorTank.takeDamage(1);
      expect(armorTank.hp).toBe(2);
      expect(armorTank.getArmorColor()).toBe('ORANGE');
      expect(armorTank.isDead).toBe(false);

      armorTank.takeDamage(1);
      expect(armorTank.hp).toBe(1);
      expect(armorTank.getArmorColor()).toBe('WHITE');
      expect(armorTank.isDead).toBe(false);

      const fatal = armorTank.takeDamage(1);
      expect(fatal).toBe(true);
      expect(armorTank.hp).toBe(0);
      expect(armorTank.isDead).toBe(true);
    });

    it('non-armor tanks return undefined armorColor', () => {
      const basicTank = new EnemyTank(EnemyType.BASIC, grid, bulletManager);
      expect(basicTank.getArmorColor()).toBeUndefined();
    });

    it('triggers onBonusDrop when flashing tank is damaged', () => {
      let dropped = false;
      const flashingTank = new EnemyTank(EnemyType.BASIC, grid, bulletManager, { isFlashing: true });
      flashingTank.onBonusDrop = () => {
        dropped = true;
      };

      flashingTank.takeDamage(1);
      expect(dropped).toBe(true);
      expect(flashingTank.isFlashing).toBe(false);
    });
  });

  describe('3. Clock Freeze Behavior', () => {
    it('freezes tank movement and firing for specified freeze duration', () => {
      const enemy = new EnemyTank(EnemyType.BASIC, grid, bulletManager, { x: 100, y: 100, direction: 'DOWN' });
      enemy.setFreeze(5.0);

      expect(enemy.isFrozen).toBe(true);
      expect(enemy.freezeTimer).toBe(5.0);

      const startY = enemy.y;
      // EnemyTank clamps safeDt to 0.1 max
      for (let i = 0; i < 10; i++) {
        enemy.update(0.1, 194, 386, []);
      }

      // Should not move while frozen
      expect(enemy.y).toBe(startY);
      expect(enemy.freezeTimer).toBeCloseTo(4.0, 1);
      expect(enemy.isFrozen).toBe(true);

      // Advance through remainder of freeze timer (40 more ticks of 0.1s = 4.0s)
      for (let i = 0; i < 45; i++) {
        enemy.update(0.1, 194, 386, []);
      }
      expect(enemy.isFrozen).toBe(false);
      expect(enemy.freezeTimer).toBe(0);
    });
  });

  describe('4. Kinematics, Boundaries & Collision Handling', () => {
    it('moves in current direction when unblocked', () => {
      const enemy = new EnemyTank(EnemyType.FAST, grid, bulletManager, { x: 100, y: 100, direction: 'DOWN' });
      const startY = enemy.y;
      // FAST speed = 96 px/s. Update with dt = 0.1 -> 9.6 px
      enemy.update(0.1, 100, 300, []);
      expect(enemy.y).toBeGreaterThan(startY);
    });

    it('does not cross arena boundaries (0-416)', () => {
      const enemy = new EnemyTank(EnemyType.FAST, grid, bulletManager, { x: 2, y: 2, direction: 'UP' });
      for (let i = 0; i < 10; i++) {
        enemy.update(0.1, 2, 0, []);
      }
      expect(enemy.y).toBeGreaterThanOrEqual(0);
    });

    it('detects solid obstacles in path and does not pass through', () => {
      // Place full steel barrier across rows 7..8 (y: 112..144) to prevent steering around
      for (let c = 0; c < 26; c++) {
        grid.setCell(c, 7, TileType.STEEL, SubTileMask.FULL);
      }

      const enemy = new EnemyTank(EnemyType.BASIC, grid, bulletManager, { x: 98, y: 80, direction: 'DOWN' });
      for (let i = 0; i < 20; i++) {
        enemy.update(0.1, 98, 386, []);
      }

      // Tank must not penetrate steel at row 7 (y + height <= 112)
      expect(enemy.y + enemy.height).toBeLessThanOrEqual(112);
    });

    it('collides with other combat tanks and does not overlap', () => {
      const enemy1 = new EnemyTank(EnemyType.BASIC, grid, bulletManager, { id: 'e1', x: 100, y: 80, direction: 'DOWN' });
      // Enemy width/height is 28px; placed at y:110, bounds are [110..138].
      // When moving DOWN towards otherTank, enemy1 must be clamped above y:110 (so enemy1.y + 28 <= 110).
      // Freeze turnCooldown to prevent AI from turning LEFT/RIGHT and bypassing the obstacle.
      enemy1.turnCooldown = 999;
      const otherTank = {
        id: 'other',
        x: 100,
        y: 110,
        width: 28,
        height: 28,
        isPlayer: false,
        isDead: false,
        takeDamage: () => false,
      };

      for (let i = 0; i < 10; i++) {
        enemy1.update(0.1, 100, 300, [enemy1, otherTank]);
      }

      expect(enemy1.y + enemy1.height).toBeLessThanOrEqual(110);
    });

    it('triggers onFire callback and supports getConfig()', () => {
      const enemy = new EnemyTank(EnemyType.BASIC, grid, bulletManager, { x: 100, y: 80, direction: 'DOWN' });
      expect(enemy.getConfig()).toEqual(enemy.getStats());

      let fired = false;
      enemy.onFire = () => {
        fired = true;
      };

      // Advance time enough to trigger shooting
      for (let i = 0; i < 30; i++) {
        enemy.update(0.1, 100, 300, []);
        if (fired) break;
      }

      expect(fired).toBe(true);
    });
  });
});
