import {
  EnemyType,
  SpawnPortal,
  SPAWN_PORTALS,
  CombatTankTarget,
  ENEMY_CONFIGS,
} from './types';
import { GridMap, CELL_SIZE } from './GridMap';
import { BulletManager } from './BulletManager';
import { EnemyTank } from './EnemyTank';

export interface EnemySpawnerOptions {
  spawnInterval?: number;
  maxConcurrent?: number;
}

export class EnemySpawner {
  private grid: GridMap;
  private bulletManager: BulletManager;
  private waveQueue: EnemyType[] = [];
  private activeEnemies: EnemyTank[] = [];

  private spawnIndex: number = 0; // 1-based overall spawn index in wave (1..20)
  private portalIndex: number = 0; // 0, 1, 2 rotating
  private spawnInterval: number = 2.5; // seconds between spawns
  private spawnTimer: number = 0;
  private maxConcurrent: number = 4;
  private isSpawningActive: boolean = false;

  public onBonusDrop?: (tank: EnemyTank) => void;
  public onEnemyDestroyed?: (tank: EnemyTank, points: number) => void;

  constructor(
    grid: GridMap,
    bulletManager: BulletManager,
    options?: EnemySpawnerOptions
  ) {
    this.grid = grid;
    this.bulletManager = bulletManager;
    if (options?.spawnInterval !== undefined) this.spawnInterval = options.spawnInterval;
    if (options?.maxConcurrent !== undefined) this.maxConcurrent = options.maxConcurrent;
  }

  /**
   * Initializes a new wave with specified enemy sequence (typically 20 tanks).
   */
  public initWave(enemyTypes: EnemyType[]): void {
    this.waveQueue = [...enemyTypes];
    this.activeEnemies = [];
    this.spawnIndex = 0;
    this.portalIndex = 0;
    this.spawnTimer = 0.5; // Quick initial spawn delay
    this.isSpawningActive = true;
  }

  /**
   * Default 20-tank composition helper (14 Basic, 4 Fast, 1 Power, 1 Armor).
   */
  public static getDefaultWaveQueue(): EnemyType[] {
    return [
      EnemyType.BASIC,
      EnemyType.BASIC,
      EnemyType.BASIC,
      EnemyType.BASIC, // 4th (Bonus 1)
      EnemyType.FAST,
      EnemyType.BASIC,
      EnemyType.BASIC,
      EnemyType.FAST,
      EnemyType.BASIC,
      EnemyType.BASIC,
      EnemyType.POWER, // 11th (Bonus 2)
      EnemyType.BASIC,
      EnemyType.FAST,
      EnemyType.BASIC,
      EnemyType.ARMOR,
      EnemyType.BASIC,
      EnemyType.FAST,
      EnemyType.ARMOR, // 18th (Bonus 3)
      EnemyType.BASIC,
      EnemyType.BASIC,
    ];
  }

  public getActiveEnemies(): EnemyTank[] {
    return this.activeEnemies;
  }

  public getQueueRemaining(): number {
    return this.waveQueue.length;
  }

  public getTotalRemaining(): number {
    return this.waveQueue.length + this.activeEnemies.length;
  }

  public isWaveComplete(): boolean {
    return this.waveQueue.length === 0 && this.activeEnemies.length === 0;
  }

  public freezeAll(duration: number): void {
    for (const enemy of this.activeEnemies) {
      if (!enemy.isDead) {
        enemy.setFreeze(duration);
      }
    }
  }

  public killAll(awardScoreCallback?: (points: number) => void): number {
    let totalPoints = 0;
    for (const enemy of this.activeEnemies) {
      if (!enemy.isDead) {
        const stats = ENEMY_CONFIGS[enemy.type];
        const pts = stats.points;
        totalPoints += pts;
        enemy.destroy();
        if (awardScoreCallback) {
          awardScoreCallback(pts);
        }
        if (this.onEnemyDestroyed) {
          this.onEnemyDestroyed(enemy, pts);
        }
      }
    }
    this.activeEnemies = [];
    return totalPoints;
  }

  public update(
    dt: number,
    targetX?: number,
    targetY?: number,
    extraTargets: CombatTankTarget[] = []
  ): void {
    const safeDt = Math.min(Math.max(0, dt), 0.1);

    // 1. Spawning tick
    if (this.isSpawningActive && this.waveQueue.length > 0) {
      if (this.activeEnemies.length < this.maxConcurrent) {
        this.spawnTimer -= safeDt;
        if (this.spawnTimer <= 0) {
          const spawned = this.trySpawnNextEnemy();
          if (spawned) {
            this.spawnTimer = this.spawnInterval;
          } else {
            // Portal was obstructed, retry shortly
            this.spawnTimer = 0.5;
          }
        }
      }
    }

    // 2. Build full target collision list (active enemies + extra targets like player)
    const allCombatants: CombatTankTarget[] = [...this.activeEnemies, ...extraTargets];

    // 3. Update all active enemies
    for (let i = 0; i < this.activeEnemies.length; i++) {
      const enemy = this.activeEnemies[i];
      if (enemy && !enemy.isDead) {
        enemy.update(safeDt, targetX, targetY, allCombatants);
      }
    }

    // 4. Remove dead enemies
    for (let i = this.activeEnemies.length - 1; i >= 0; i--) {
      const enemy = this.activeEnemies[i];
      if (enemy && enemy.isDead) {
        if (this.onEnemyDestroyed) {
          const stats = ENEMY_CONFIGS[enemy.type];
          this.onEnemyDestroyed(enemy, stats.points);
        }
        this.activeEnemies.splice(i, 1);
      }
    }
  }

  private trySpawnNextEnemy(): boolean {
    if (this.waveQueue.length === 0) return false;

    // Determine current portal from 3 top portals
    const portal = SPAWN_PORTALS[this.portalIndex];
    if (!portal) return false;

    // Centered tank position: col * 16 + 2, row * 16 + 2 (row 0 => 2)
    const spawnX = portal.col * CELL_SIZE + 2;
    const spawnY = portal.row * CELL_SIZE + 2;

    // Check collision at spawn location to prevent stacking
    const spawnRect = {
      x: spawnX,
      y: spawnY,
      width: 28,
      height: 28,
    };

    // Check against grid terrain
    const query = this.grid.queryRect(spawnRect);
    if (query.solid) {
      // Rotate portal if blocked
      this.portalIndex = (this.portalIndex + 1) % SPAWN_PORTALS.length;
      return false;
    }

    // Check against active enemies
    for (const other of this.activeEnemies) {
      if (other.isDead) continue;
      const otherRect = other.getBounds();
      if (
        spawnRect.x < otherRect.x + otherRect.width &&
        spawnRect.x + spawnRect.width > otherRect.x &&
        spawnRect.y < otherRect.y + otherRect.height &&
        spawnRect.y + spawnRect.height > otherRect.y
      ) {
        // Portal currently occupied, try next portal next cycle
        this.portalIndex = (this.portalIndex + 1) % SPAWN_PORTALS.length;
        return false;
      }
    }

    // Pop enemy archetype from wave queue
    const enemyType = this.waveQueue.shift()!;
    this.spawnIndex++;

    // 4th, 11th, 18th spawned tanks are flashing bonus tanks (ENEMY-04)
    const isFlashing =
      this.spawnIndex === 4 || this.spawnIndex === 11 || this.spawnIndex === 18;

    const newEnemy = new EnemyTank(
      enemyType,
      this.grid,
      this.bulletManager,
      {
        id: `enemy_w${this.spawnIndex}_${Date.now()}`,
        x: spawnX,
        y: spawnY,
        direction: 'DOWN',
        isFlashing,
      }
    );

    newEnemy.onBonusDrop = (tank) => {
      if (this.onBonusDrop) {
        this.onBonusDrop(tank);
      }
    };

    this.activeEnemies.push(newEnemy);

    // Advance portal rotation (0 -> 1 -> 2 -> 0)
    this.portalIndex = (this.portalIndex + 1) % SPAWN_PORTALS.length;
    return true;
  }
}
