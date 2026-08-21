import {
  TileType,
  CardinalDirection,
  Rect,
  CombatTankTarget,
  EnemyType,
  EnemyConfig,
  ENEMY_CONFIGS,
  ArmorColor,
  EnemyTankState,
  TANK_SIZE,
} from './types';
import { GridMap, ARENA_SIZE, CELL_SIZE } from './GridMap';
import { BulletManager } from './BulletManager';

export interface EnemyTankOptions {
  id?: string | number;
  x?: number;
  y?: number;
  direction?: CardinalDirection;
  isFlashing?: boolean;
}

export class EnemyTank implements CombatTankTarget {
  public id: string | number;
  public readonly type: EnemyType;
  public x: number;
  public y: number;
  public readonly width: number = TANK_SIZE;
  public readonly height: number = TANK_SIZE;
  public direction: CardinalDirection = 'DOWN';
  public hp: number;
  public readonly maxHp: number;
  public isFlashing: boolean = false;
  public isFrozen: boolean = false;
  public freezeTimer: number = 0;
  public isDead: boolean = false;
  public readonly isPlayer: boolean = false;

  public onBonusDrop?: (tank: EnemyTank) => void;
  public onFire?: (tank: EnemyTank) => void;

  private grid: GridMap;
  private bulletManager?: BulletManager;
  private fireTimer: number = 0;
  private fireInterval: number = 1.5;
  private lastTurnNode: string = '';
  private turnCooldown: number = 0;

  constructor(
    type: EnemyType,
    grid: GridMap,
    bulletManager?: BulletManager,
    options?: EnemyTankOptions
  ) {
    this.type = type;
    this.grid = grid;
    this.bulletManager = bulletManager;

    const config = ENEMY_CONFIGS[type];
    this.hp = config.hp;
    this.maxHp = config.hp;

    this.id = options?.id ?? `enemy_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    this.x = options?.x ?? 0;
    this.y = options?.y ?? 0;
    this.direction = options?.direction ?? 'DOWN';
    this.isFlashing = options?.isFlashing ?? false;

    this.resetFireTimer();
  }

  public getStats(): EnemyConfig {
    return ENEMY_CONFIGS[this.type];
  }

  public getConfig(): EnemyConfig {
    return this.getStats();
  }

  public getBounds(x = this.x, y = this.y): Rect {
    return {
      x,
      y,
      width: this.width,
      height: this.height,
    };
  }

  public getArmorColor(): ArmorColor | undefined {
    if (this.type !== EnemyType.ARMOR) return undefined;
    switch (this.hp) {
      case 4:
        return 'GREEN';
      case 3:
        return 'YELLOW';
      case 2:
        return 'ORANGE';
      case 1:
      default:
        return 'WHITE';
    }
  }

  public getState(): EnemyTankState {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      direction: this.direction,
      hp: this.hp,
      maxHp: this.maxHp,
      armorColor: this.getArmorColor(),
      isFlashing: this.isFlashing,
      isFrozen: this.isFrozen,
      isDead: this.isDead,
    };
  }

  public setFreeze(duration: number): void {
    this.freezeTimer = Math.max(this.freezeTimer, duration);
    this.isFrozen = this.freezeTimer > 0;
  }

  public takeDamage(damage: number = 1): boolean {
    if (this.isDead) return false;

    const wasFlashing = this.isFlashing;
    this.hp -= damage;

    if (wasFlashing) {
      this.isFlashing = false;
      if (this.onBonusDrop) {
        this.onBonusDrop(this);
      }
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
      return true;
    }

    return false;
  }

  public destroy(): void {
    this.hp = 0;
    this.isDead = true;
  }

  private resetFireTimer(): void {
    // Random fire interval between 1.0s and 2.5s
    this.fireInterval = 1.0 + Math.random() * 1.5;
    this.fireTimer = this.fireInterval;
  }

  public update(
    dt: number,
    targetX?: number,
    targetY?: number,
    otherTanks: CombatTankTarget[] = []
  ): void {
    if (this.isDead) return;

    const safeDt = Math.min(Math.max(0, dt), 0.1);

    // Clock freeze handling
    if (this.freezeTimer > 0) {
      this.freezeTimer = Math.max(0, this.freezeTimer - safeDt);
      this.isFrozen = this.freezeTimer > 0;
      if (this.isFrozen) return;
    } else {
      this.isFrozen = false;
    }

    if (this.turnCooldown > 0) {
      this.turnCooldown = Math.max(0, this.turnCooldown - safeDt);
    }

    // Kinematics & AI Steering
    this.updateAIAndMovement(safeDt, targetX, targetY, otherTanks);

    // Shooting logic
    this.updateShooting(safeDt);
  }

  private updateShooting(dt: number): void {
    if (!this.bulletManager) return;

    this.fireTimer -= dt;
    if (this.fireTimer <= 0) {
      const stats = this.getStats();
      if (this.bulletManager.canFire('ENEMY', stats.maxBullets)) {
        this.bulletManager.fire(
          this.x,
          this.y,
          this.direction,
          'ENEMY',
          {
            bulletSpeed: stats.bulletSpeed,
            canDestroySteel: false,
            canCutTrees: false,
            damage: 1,
          },
          this.width
        );
        if (this.onFire) {
          this.onFire(this);
        }
      }
      this.resetFireTimer();
    }
  }

  private updateAIAndMovement(
    dt: number,
    targetX?: number,
    targetY?: number,
    otherTanks: CombatTankTarget[] = []
  ): void {
    const stats = this.getStats();
    const speed = stats.speed;
    const moveDist = speed * dt;

    // Check if at grid node intersection (approx 16px tile aligned: offset ~2px for centered 28px tank)
    const nodeCol = Math.round((this.x - 2) / CELL_SIZE);
    const nodeRow = Math.round((this.y - 2) / CELL_SIZE);
    const nodeX = nodeCol * CELL_SIZE + 2;
    const nodeY = nodeRow * CELL_SIZE + 2;
    const nodeKey = `${nodeCol},${nodeRow}`;

    const distToNode = Math.hypot(this.x - nodeX, this.y - nodeY);

    if (distToNode <= 2.5 && this.lastTurnNode !== nodeKey && this.turnCooldown <= 0) {
      // Evaluate turning decision at integer grid node
      this.steerAtNode(nodeX, nodeY, targetX, targetY, otherTanks);
      this.lastTurnNode = nodeKey;
      this.turnCooldown = 0.2; // brief threshold to prevent immediate re-triggering on same node
    }

    // Move forward in current direction
    const moved = this.moveInDirection(this.direction, moveDist, otherTanks);
    if (!moved) {
      // Obstructed: Force an immediate direction recalculation
      this.steerOnCollision(targetX, targetY, otherTanks);
    }
  }

  private steerAtNode(
    nodeX: number,
    nodeY: number,
    targetX?: number,
    targetY?: number,
    otherTanks: CombatTankTarget[] = []
  ): void {
    const validDirs = this.getValidDirections(otherTanks, this.x, this.y);
    if (validDirs.length === 0) return;

    // Anti-180deg oscillation lock: Filter out immediate reverse direction unless all other options are blocked
    const reverseDir = this.getReverseDirection(this.direction);
    let nonReverseDirs = validDirs.filter((d) => d !== reverseDir);
    if (nonReverseDirs.length === 0) {
      nonReverseDirs = validDirs;
    }

    // Default target is Eagle HQ (col 12 * 16 + 2, row 24 * 16 + 2 = 194, 386) or Player if given
    const goalX = targetX !== undefined ? targetX : 194;
    const goalY = targetY !== undefined ? targetY : 386;

    // Goal-oriented bias: 60% probability pick direction that reduces Manhattan distance to goal
    if (Math.random() < 0.6 && nonReverseDirs.length > 1) {
      nonReverseDirs.sort((a, b) => {
        const distA = this.getProjectedDistanceToGoal(a, goalX, goalY);
        const distB = this.getProjectedDistanceToGoal(b, goalX, goalY);
        return distA - distB;
      });
      const chosen = nonReverseDirs[0];
      if (chosen) {
        this.direction = chosen;
      }
    } else {
      // 40% probability or random pick
      const randomIndex = Math.floor(Math.random() * nonReverseDirs.length);
      const chosen = nonReverseDirs[randomIndex];
      if (chosen) {
        this.direction = chosen;
      }
    }
  }

  private steerOnCollision(
    targetX?: number,
    targetY?: number,
    otherTanks: CombatTankTarget[] = []
  ): void {
    const validDirs = this.getValidDirections(otherTanks, this.x, this.y);
    if (validDirs.length === 0) return;

    const reverseDir = this.getReverseDirection(this.direction);
    let nonReverseDirs = validDirs.filter((d) => d !== reverseDir);
    if (nonReverseDirs.length === 0) {
      nonReverseDirs = validDirs;
    }

    const randomIndex = Math.floor(Math.random() * nonReverseDirs.length);
    const chosen = nonReverseDirs[randomIndex];
    if (chosen) {
      this.direction = chosen;
    }
  }

  private getProjectedDistanceToGoal(dir: CardinalDirection, goalX: number, goalY: number): number {
    let px = this.x;
    let py = this.y;
    const step = CELL_SIZE;

    switch (dir) {
      case 'UP':
        py -= step;
        break;
      case 'DOWN':
        py += step;
        break;
      case 'LEFT':
        px -= step;
        break;
      case 'RIGHT':
        px += step;
        break;
    }

    return Math.abs(px - goalX) + Math.abs(py - goalY);
  }

  private getReverseDirection(dir: CardinalDirection): CardinalDirection {
    switch (dir) {
      case 'UP':
        return 'DOWN';
      case 'DOWN':
        return 'UP';
      case 'LEFT':
        return 'RIGHT';
      case 'RIGHT':
        return 'LEFT';
    }
  }

  public getValidDirections(
    otherTanks: CombatTankTarget[] = [],
    fromX = this.x,
    fromY = this.y
  ): CardinalDirection[] {
    const allDirs: CardinalDirection[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    const valid: CardinalDirection[] = [];
    const probeDist = 4; // probe 4px forward to check passage

    for (const dir of allDirs) {
      let tx = fromX;
      let ty = fromY;
      switch (dir) {
        case 'UP':
          ty -= probeDist;
          break;
        case 'DOWN':
          ty += probeDist;
          break;
        case 'LEFT':
          tx -= probeDist;
          break;
        case 'RIGHT':
          tx += probeDist;
          break;
      }

      const rect = this.getBounds(tx, ty);
      if (!this.checkSolidCollision(rect, otherTanks)) {
        valid.push(dir);
      }
    }

    return valid;
  }

  public checkSolidCollision(rect: Rect, otherTanks: CombatTankTarget[] = []): boolean {
    if (
      rect.x < 0 ||
      rect.y < 0 ||
      rect.x + rect.width > ARENA_SIZE ||
      rect.y + rect.height > ARENA_SIZE
    ) {
      return true;
    }

    // Query GridMap terrain
    const query = this.grid.queryRect(rect);
    if (query.solid) {
      return true;
    }

    // Check tank-vs-tank collisions against other alive tanks
    for (const other of otherTanks) {
      if (other.id === this.id || other.isDead) continue;
      const otherRect: Rect = {
        x: other.x,
        y: other.y,
        width: other.width,
        height: other.height,
      };

      if (
        rect.x < otherRect.x + otherRect.width &&
        rect.x + rect.width > otherRect.x &&
        rect.y < otherRect.y + otherRect.height &&
        rect.y + rect.height > otherRect.y
      ) {
        return true;
      }
    }

    return false;
  }

  private moveInDirection(
    dir: CardinalDirection,
    distance: number,
    otherTanks: CombatTankTarget[] = []
  ): boolean {
    if (distance <= 0) return true;

    let targetX = this.x;
    let targetY = this.y;

    switch (dir) {
      case 'UP':
        targetY -= distance;
        break;
      case 'DOWN':
        targetY += distance;
        break;
      case 'LEFT':
        targetX -= distance;
        break;
      case 'RIGHT':
        targetX += distance;
        break;
    }

    const targetRect = this.getBounds(targetX, targetY);
    if (!this.checkSolidCollision(targetRect, otherTanks)) {
      this.x = targetX;
      this.y = targetY;
      return true;
    } else {
      // Step resolve close to obstacle
      this.resolveCollisionClamp(dir, targetX, targetY, otherTanks);
      return false;
    }
  }

  private resolveCollisionClamp(
    dir: CardinalDirection,
    targetX: number,
    targetY: number,
    otherTanks: CombatTankTarget[] = []
  ): void {
    const step = 0.5;
    let currX = this.x;
    let currY = this.y;

    switch (dir) {
      case 'UP':
        while (
          currY - step >= targetY &&
          !this.checkSolidCollision(this.getBounds(currX, currY - step), otherTanks)
        ) {
          currY -= step;
        }
        this.y = Math.max(0, currY);
        break;
      case 'DOWN':
        while (
          currY + step <= targetY &&
          !this.checkSolidCollision(this.getBounds(currX, currY + step), otherTanks)
        ) {
          currY += step;
        }
        this.y = Math.min(ARENA_SIZE - this.height, currY);
        break;
      case 'LEFT':
        while (
          currX - step >= targetX &&
          !this.checkSolidCollision(this.getBounds(currX - step, currY), otherTanks)
        ) {
          currX -= step;
        }
        this.x = Math.max(0, currX);
        break;
      case 'RIGHT':
        while (
          currX + step <= targetX &&
          !this.checkSolidCollision(this.getBounds(currX + step, currY), otherTanks)
        ) {
          currX += step;
        }
        this.x = Math.min(ARENA_SIZE - this.width, currX);
        break;
    }
  }
}
