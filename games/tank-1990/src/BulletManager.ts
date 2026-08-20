import {
  Bullet,
  BulletHitEvent,
  BulletOwner,
  BULLET_SIZE,
  CardinalDirection,
  CombatTankTarget,
  Rect,
  SubTileMask,
  TileType,
} from './types';
import { ARENA_SIZE, GridMap } from './GridMap';

export interface FireStats {
  bulletSpeed: number;
  canDestroySteel: boolean;
  canCutTrees: boolean;
  damage?: number;
}

export class BulletManager {
  private bullets: Bullet[] = [];
  private nextBulletId: number = 1;
  private events: BulletHitEvent[] = [];
  private grid: GridMap;

  constructor(grid: GridMap) {
    this.grid = grid;
  }

  public getBullets(): Bullet[] {
    return this.bullets;
  }

  public getEvents(): BulletHitEvent[] {
    return this.events;
  }

  public clearEvents(): void {
    this.events = [];
  }

  public clear(): void {
    this.bullets = [];
    this.events = [];
  }

  public canFire(owner: BulletOwner, maxBullets: number): boolean {
    let count = 0;
    for (let i = 0; i < this.bullets.length; i++) {
      const b = this.bullets[i];
      if (b && b.alive && b.owner === owner) {
        count++;
      }
    }
    return count < maxBullets;
  }

  public fire(
    tankX: number,
    tankY: number,
    direction: CardinalDirection,
    owner: BulletOwner,
    stats: FireStats,
    tankSize: number = 28
  ): Bullet | null {
    let x = 0;
    let y = 0;

    switch (direction) {
      case 'UP':
        x = tankX + (tankSize - BULLET_SIZE) / 2;
        y = tankY - BULLET_SIZE;
        break;
      case 'DOWN':
        x = tankX + (tankSize - BULLET_SIZE) / 2;
        y = tankY + tankSize;
        break;
      case 'LEFT':
        x = tankX - BULLET_SIZE;
        y = tankY + (tankSize - BULLET_SIZE) / 2;
        break;
      case 'RIGHT':
        x = tankX + tankSize;
        y = tankY + (tankSize - BULLET_SIZE) / 2;
        break;
    }

    const bullet: Bullet = {
      id: this.nextBulletId++,
      x,
      y,
      width: BULLET_SIZE,
      height: BULLET_SIZE,
      direction,
      speed: stats.bulletSpeed,
      owner,
      canDestroySteel: stats.canDestroySteel,
      canCutTrees: stats.canCutTrees,
      damage: stats.damage ?? 1,
      alive: true,
    };

    this.bullets.push(bullet);
    return bullet;
  }

  public update(dt: number, tanks: CombatTankTarget[] = []): BulletHitEvent[] {
    const SUB_STEP_DT = 1 / 120;
    const steps = Math.max(1, Math.ceil(dt / SUB_STEP_DT));
    const stepDt = dt / steps;

    for (let step = 0; step < steps; step++) {
      // Step 1: Move live bullets
      for (let i = 0; i < this.bullets.length; i++) {
        const bullet = this.bullets[i];
        if (!bullet || !bullet.alive) continue;

        switch (bullet.direction) {
          case 'UP':
            bullet.y -= bullet.speed * stepDt;
            break;
          case 'DOWN':
            bullet.y += bullet.speed * stepDt;
            break;
          case 'LEFT':
            bullet.x -= bullet.speed * stepDt;
            break;
          case 'RIGHT':
            bullet.x += bullet.speed * stepDt;
            break;
        }

        // Step 2: Arena Boundary Collisions
        if (
          bullet.x < 0 ||
          bullet.y < 0 ||
          bullet.x + bullet.width > ARENA_SIZE ||
          bullet.y + bullet.height > ARENA_SIZE
        ) {
          bullet.alive = false;
          const hitX = Math.max(0, Math.min(ARENA_SIZE, bullet.x + bullet.width / 2));
          const hitY = Math.max(0, Math.min(ARENA_SIZE, bullet.y + bullet.height / 2));
          this.events.push({
            type: 'BOUNDARY',
            x: hitX,
            y: hitY,
            bulletId: bullet.id,
          });
        }
      }

      // Step 3: Mid-Air Bullet-vs-Bullet Cancellation (COMBAT-02)
      for (let i = 0; i < this.bullets.length; i++) {
        const b1 = this.bullets[i];
        if (!b1 || !b1.alive || b1.owner !== 'PLAYER') continue;

        for (let j = 0; j < this.bullets.length; j++) {
          const b2 = this.bullets[j];
          if (!b2 || !b2.alive || b2.owner !== 'ENEMY') continue;

          if (this.checkAABBOverlap(b1, b2)) {
            b1.alive = false;
            b2.alive = false;
            this.events.push({
              type: 'BULLET_CANCEL',
              x: (b1.x + b2.x) / 2 + BULLET_SIZE / 2,
              y: (b1.y + b2.y) / 2 + BULLET_SIZE / 2,
              bulletId: b1.id,
              targetId: b2.id,
            });
            break;
          }
        }
      }

      // Step 4: Bullet-vs-Terrain Collisions (COMBAT-03)
      for (let i = 0; i < this.bullets.length; i++) {
        const bullet = this.bullets[i];
        if (!bullet || !bullet.alive) continue;

        const bulletBounds: Rect = {
          x: bullet.x,
          y: bullet.y,
          width: bullet.width,
          height: bullet.height,
        };

        const intersecting = this.grid.getIntersectingCells(bulletBounds);
        for (const item of intersecting) {
          if (!bullet.alive) break;

          const { col, row, cell } = item;
          switch (cell.type) {
            case TileType.BRICK: {
              if (cell.mask > SubTileMask.EMPTY) {
                const subBoxes = this.grid.getSubTileBoxes(col, row);
                let hitAnyQuadrant = false;
                for (const box of subBoxes) {
                  if (this.checkAABBOverlap(bulletBounds, box)) {
                    hitAnyQuadrant = true;
                    break;
                  }
                }
                if (hitAnyQuadrant) {
                  this.grid.damageBrick(col, row, bullet.direction, bullet.canDestroySteel);
                  bullet.alive = false;
                  this.events.push({
                    type: 'BRICK',
                    x: bullet.x + bullet.width / 2,
                    y: bullet.y + bullet.height / 2,
                    bulletId: bullet.id,
                    cellCol: col,
                    cellRow: row,
                  });
                }
              }
              break;
            }
            case TileType.STEEL: {
              if (bullet.canDestroySteel) {
                this.grid.damageSteel(col, row, true);
              }
              bullet.alive = false;
              this.events.push({
                type: 'STEEL',
                x: bullet.x + bullet.width / 2,
                y: bullet.y + bullet.height / 2,
                bulletId: bullet.id,
                cellCol: col,
                cellRow: row,
              });
              break;
            }
            case TileType.TREES: {
              if (bullet.canCutTrees) {
                this.grid.setCell(col, row, TileType.EMPTY, SubTileMask.EMPTY);
                bullet.alive = false;
                this.events.push({
                  type: 'TREE',
                  x: bullet.x + bullet.width / 2,
                  y: bullet.y + bullet.height / 2,
                  bulletId: bullet.id,
                  cellCol: col,
                  cellRow: row,
                });
              }
              break;
            }
            case TileType.EAGLE: {
              this.grid.damageEagle();
              bullet.alive = false;
              this.events.push({
                type: 'EAGLE',
                x: bullet.x + bullet.width / 2,
                y: bullet.y + bullet.height / 2,
                bulletId: bullet.id,
                cellCol: col,
                cellRow: row,
              });
              break;
            }
            case TileType.WATER:
            case TileType.ICE:
            case TileType.EMPTY:
            default:
              break;
          }
        }
      }

      // Step 5: Bullet-vs-Tank Damage Resolution (COMBAT-04)
      for (let i = 0; i < this.bullets.length; i++) {
        const bullet = this.bullets[i];
        if (!bullet || !bullet.alive) continue;

        const bulletBounds: Rect = {
          x: bullet.x,
          y: bullet.y,
          width: bullet.width,
          height: bullet.height,
        };

        for (const tank of tanks) {
          if (!bullet.alive) break;
          if (tank.isDead) continue;

          // Player bullets hit enemy tanks; Enemy bullets hit player tanks
          if (bullet.owner === 'PLAYER' && tank.isPlayer) continue;
          if (bullet.owner === 'ENEMY' && !tank.isPlayer) continue;

          const tankBounds: Rect = {
            x: tank.x,
            y: tank.y,
            width: tank.width,
            height: tank.height,
          };

          if (this.checkAABBOverlap(bulletBounds, tankBounds)) {
            bullet.alive = false;
            if (tank.isInvulnerable) {
              this.events.push({
                type: 'TANK',
                x: bullet.x + bullet.width / 2,
                y: bullet.y + bullet.height / 2,
                bulletId: bullet.id,
                targetId: tank.id,
              });
            } else {
              tank.takeDamage(bullet.damage);
              this.events.push({
                type: 'TANK',
                x: bullet.x + bullet.width / 2,
                y: bullet.y + bullet.height / 2,
                bulletId: bullet.id,
                targetId: tank.id,
              });
            }
          }
        }
      }
    }

    // Cleanup dead projectiles
    this.bullets = this.bullets.filter((b) => b.alive);

    return this.events;
  }

  private checkAABBOverlap(r1: Rect, r2: Rect): boolean {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }
}
