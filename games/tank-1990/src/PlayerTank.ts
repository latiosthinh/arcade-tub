import {
  TileType,
  CardinalDirection,
  Rect,
  TankTier,
  TankTierStats,
  TANK_TIER_CONFIGS,
  TANK_SIZE,
  SPAWN_X,
  SPAWN_Y,
  SPAWN_SHIELD_DURATION,
  CORNER_SNAP_THRESHOLD,
  ICE_SLIDE_DECEL,
  PlayerTankState,
} from './types';
import { GridMap, ARENA_SIZE, CELL_SIZE } from './GridMap';

export interface PlayerTankOptions {
  lives?: number;
  spawnCol?: number;
  spawnRow?: number;
  tier?: TankTier;
}

export class PlayerTank {
  public x: number = 0;
  public y: number = 0;
  public readonly width: number = TANK_SIZE;
  public readonly height: number = TANK_SIZE;
  public direction: CardinalDirection = 'UP';
  public tier: TankTier = TankTier.TIER_1;
  public shieldTimer: number = 0;
  public lives: number = 3;
  public isDead: boolean = false;
  public isGameOver: boolean = false;
  public boatActive: boolean = false;

  private grid: GridMap;
  private spawnCol: number = 8;
  private spawnRow: number = 24;
  private slideVelocity: number = 0;
  private lastSlideDirection: CardinalDirection = 'UP';

  constructor(grid: GridMap, options?: PlayerTankOptions) {
    this.grid = grid;
    if (options) {
      if (options.lives !== undefined) this.lives = options.lives;
      if (options.spawnCol !== undefined) this.spawnCol = options.spawnCol;
      if (options.spawnRow !== undefined) this.spawnRow = options.spawnRow;
      if (options.tier !== undefined) this.tier = options.tier;
    }
    this.spawn();
  }

  /**
   * Spawns tank at designated spawn cell coordinates.
   * Sets default position centered in 32x32 footprint (28x28 tank at col*16 + 2, row*16 + 2).
   */
  public spawn(): void {
    this.x = this.spawnCol * CELL_SIZE + 2;
    this.y = this.spawnRow * CELL_SIZE + 2;
    this.direction = 'UP';
    this.lastSlideDirection = 'UP';
    this.shieldTimer = SPAWN_SHIELD_DURATION;
    this.isDead = false;
    this.slideVelocity = 0;
  }

  /**
   * Respawns player tank after death. Decrements life count and resets tier to TIER_1.
   */
  public respawn(): boolean {
    if (this.lives <= 0) {
      this.isGameOver = true;
      return false;
    }
    this.lives--;
    if (this.lives <= 0) {
      this.isGameOver = true;
      return false;
    }
    this.tier = TankTier.TIER_1;
    this.spawn();
    return true;
  }

  public getStats(): TankTierStats {
    return TANK_TIER_CONFIGS[this.tier];
  }

  public getBounds(x = this.x, y = this.y): Rect {
    return {
      x,
      y,
      width: this.width,
      height: this.height,
    };
  }

  public getState(): PlayerTankState {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      direction: this.direction,
      tier: this.tier,
      shieldTimer: this.shieldTimer,
      isInvulnerable: this.shieldTimer > 0,
      lives: this.lives,
      isDead: this.isDead,
      isSliding: this.slideVelocity > 0,
      boatActive: this.boatActive,
    };
  }

  public upgradeTier(): TankTier {
    if (this.tier < TankTier.TIER_4) {
      this.tier = (this.tier + 1) as TankTier;
    }
    return this.tier;
  }

  public setTier(tier: TankTier): void {
    this.tier = tier;
  }

  public setShield(duration: number): void {
    this.shieldTimer = Math.max(this.shieldTimer, duration);
  }

  public addLife(amount: number = 1): void {
    this.lives += amount;
    if (this.lives > 0) {
      this.isGameOver = false;
    }
  }

  public setBoat(active: boolean): void {
    this.boatActive = active;
  }

  public kill(): boolean {
    if (this.isDead) return false;
    if (this.shieldTimer > 0) return false; // Spawn / helmet invulnerability shield protects tank

    this.isDead = true;
    this.slideVelocity = 0;
    return true;
  }

  /**
   * Attempts orthogonal alignment corner snapping (<= 4px) to ease turning into 1-tile or 2-tile corridors.
   * Only attempts snapping when turning perpendicular (H -> V or V -> H).
   * Verifies collision before committing snapped position to prevent getting stuck in walls.
   */
  private tryCornerSnap(newDir: CardinalDirection): void {
    const isCurrentHoriz = this.direction === 'LEFT' || this.direction === 'RIGHT';
    const isNewVert = newDir === 'UP' || newDir === 'DOWN';
    const isCurrentVert = this.direction === 'UP' || this.direction === 'DOWN';
    const isNewHoriz = newDir === 'LEFT' || newDir === 'RIGHT';

    // Perpendicular turn from H to V -> Snap X to 16px grid boundary offset
    if (isCurrentHoriz && isNewVert) {
      // Tank is centered (+2 offset) inside 32px block or aligned to 16px grid lines
      // Check distance to nearest (col * 16 + 2) or (col * 16)
      const targetOffsets = [0, 2];
      let bestCandidateX: number | null = null;
      let minDistance = CORNER_SNAP_THRESHOLD + 1;

      for (const offset of targetOffsets) {
        const remainder = (this.x - offset) % CELL_SIZE;
        const normalizedRem = remainder < 0 ? remainder + CELL_SIZE : remainder;

        if (normalizedRem <= CORNER_SNAP_THRESHOLD) {
          const candidateX = this.x - normalizedRem;
          if (normalizedRem < minDistance) {
            minDistance = normalizedRem;
            bestCandidateX = candidateX;
          }
        } else if (CELL_SIZE - normalizedRem <= CORNER_SNAP_THRESHOLD) {
          const candidateX = this.x + (CELL_SIZE - normalizedRem);
          if (CELL_SIZE - normalizedRem < minDistance) {
            minDistance = CELL_SIZE - normalizedRem;
            bestCandidateX = candidateX;
          }
        }
      }

      if (bestCandidateX !== null && bestCandidateX !== this.x) {
        const testRect = this.getBounds(bestCandidateX, this.y);
        const query = this.grid.queryRect(testRect);
        const canPass = !query.solid || (query.isWater && this.boatActive && !query.bulletSolid);
        if (!this.checkSolidCollision(testRect)) {
          this.x = bestCandidateX;
        }
      }
    }

    // Perpendicular turn from V to H -> Snap Y to 16px grid boundary offset
    if (isCurrentVert && isNewHoriz) {
      const targetOffsets = [0, 2];
      let bestCandidateY: number | null = null;
      let minDistance = CORNER_SNAP_THRESHOLD + 1;

      for (const offset of targetOffsets) {
        const remainder = (this.y - offset) % CELL_SIZE;
        const normalizedRem = remainder < 0 ? remainder + CELL_SIZE : remainder;

        if (normalizedRem <= CORNER_SNAP_THRESHOLD) {
          const candidateY = this.y - normalizedRem;
          if (normalizedRem < minDistance) {
            minDistance = normalizedRem;
            bestCandidateY = candidateY;
          }
        } else if (CELL_SIZE - normalizedRem <= CORNER_SNAP_THRESHOLD) {
          const candidateY = this.y + (CELL_SIZE - normalizedRem);
          if (CELL_SIZE - normalizedRem < minDistance) {
            minDistance = CELL_SIZE - normalizedRem;
            bestCandidateY = candidateY;
          }
        }
      }

      if (bestCandidateY !== null && bestCandidateY !== this.y) {
        const testRect = this.getBounds(this.x, bestCandidateY);
        if (!this.checkSolidCollision(testRect)) {
          this.y = bestCandidateY;
        }
      }
    }
  }

  private checkSolidCollision(rect: Rect): boolean {
    if (
      rect.x < 0 ||
      rect.y < 0 ||
      rect.x + rect.width > ARENA_SIZE ||
      rect.y + rect.height > ARENA_SIZE
    ) {
      return true;
    }

    const query = this.grid.queryRect(rect);
    if (query.solid) {
      // If solid only because of water and boat is active, allow passage
      if (query.isWater && this.boatActive) {
        // Must check if there are other solid tiles (brick, steel, eagle)
        const intersecting = this.grid.getIntersectingCells(rect);
        for (const item of intersecting) {
          if (item.cell.type === TileType.WATER) continue;
          if (item.cell.type === TileType.TREES || item.cell.type === TileType.ICE || item.cell.type === TileType.EMPTY) continue;
          if (item.cell.type === TileType.BRICK) {
            const boxes = this.grid.getSubTileBoxes(item.col, item.row);
            for (const box of boxes) {
              if (
                rect.x < box.x + box.width &&
                rect.x + rect.width > box.x &&
                rect.y < box.y + box.height &&
                rect.y + rect.height > box.y
              ) {
                return true;
              }
            }
          } else {
            return true;
          }
        }
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Updates player tank kinematics, corner snapping, ice sliding, and shield timer.
   * Clamps dt to 0.1s max to prevent tunneling through walls during frame drops (T-49-01).
   */
  public update(dt: number, inputDirection: CardinalDirection | null): void {
    if (this.isDead) return;

    const safeDt = Math.min(Math.max(0, dt), 0.1);
    if (this.shieldTimer > 0) {
      this.shieldTimer = Math.max(0, this.shieldTimer - Math.max(0, dt));
    }

    const currentBounds = this.getBounds();
    const terrainQuery = this.grid.queryRect(currentBounds);
    const isOnIce = terrainQuery.isIce;

    const stats = this.getStats();
    const speed = stats.speed;

    if (inputDirection !== null) {
      if (inputDirection !== this.direction) {
        this.tryCornerSnap(inputDirection);
        this.direction = inputDirection;
      }

      this.lastSlideDirection = this.direction;
      if (isOnIce) {
        this.slideVelocity = speed;
      } else {
        this.slideVelocity = 0;
      }

      this.moveInDirection(this.direction, speed * safeDt);
    } else {
      // No active steering input: handle ice slide or stop
      if (isOnIce && this.slideVelocity > 0) {
        this.moveInDirection(this.lastSlideDirection, this.slideVelocity * safeDt);
        this.slideVelocity = Math.max(0, this.slideVelocity - ICE_SLIDE_DECEL * safeDt);
      } else {
        this.slideVelocity = 0;
      }
    }
  }

  private moveInDirection(dir: CardinalDirection, distance: number): void {
    if (distance <= 0) return;

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

    // Check collision along target position
    const targetRect = this.getBounds(targetX, targetY);
    if (!this.checkSolidCollision(targetRect)) {
      this.x = targetX;
      this.y = targetY;
    } else {
      // Collision occurred: resolve by clamping to boundary/cell edge
      this.resolveCollisionClamp(dir, targetX, targetY);
      this.slideVelocity = 0;
    }
  }

  private resolveCollisionClamp(dir: CardinalDirection, targetX: number, targetY: number): void {
    // Step resolution in small increments to get as close as possible to the obstacle
    let step = 1.0;
    let currX = this.x;
    let currY = this.y;

    switch (dir) {
      case 'UP':
        while (currY - step >= targetY && !this.checkSolidCollision(this.getBounds(currX, currY - step))) {
          currY -= step;
        }
        this.y = Math.max(0, currY);
        break;
      case 'DOWN':
        while (currY + step <= targetY && !this.checkSolidCollision(this.getBounds(currX, currY + step))) {
          currY += step;
        }
        this.y = Math.min(ARENA_SIZE - this.height, currY);
        break;
      case 'LEFT':
        while (currX - step >= targetX && !this.checkSolidCollision(this.getBounds(currX - step, currY))) {
          currX -= step;
        }
        this.x = Math.max(0, currX);
        break;
      case 'RIGHT':
        while (currX + step <= targetX && !this.checkSolidCollision(this.getBounds(currX + step, currY))) {
          currX += step;
        }
        this.x = Math.min(ARENA_SIZE - this.width, currX);
        break;
    }
  }
}
