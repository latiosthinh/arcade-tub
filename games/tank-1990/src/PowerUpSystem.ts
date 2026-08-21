import {
  PowerUpType,
  PowerUpItem,
  TankTier,
  TileType,
  SubTileMask,
  GridCell,
  Rect,
} from './types';
import { GridMap, ARENA_SIZE, CELL_SIZE } from './GridMap';
import { PlayerTank } from './PlayerTank';
import { EnemySpawner } from './EnemySpawner';

export const POWERUP_SIZE = 30;
export const POWERUP_SCORE = 500;
export const SHOVEL_DURATION = 20.0;
export const CLOCK_DURATION = 10.0;
export const HELMET_DURATION = 10.0;

export const EAGLE_PERIMETER_COORDS: Array<{ col: number; row: number }> = [
  { col: 11, row: 23 },
  { col: 12, row: 23 },
  { col: 13, row: 23 },
  { col: 14, row: 23 },
  { col: 11, row: 24 },
  { col: 14, row: 24 },
  { col: 11, row: 25 },
  { col: 14, row: 25 },
];

export interface PowerUpPickupEvent {
  type: PowerUpType;
  points: number;
  x: number;
  y: number;
}

export interface PowerUpSystemOptions {
  maxItems?: number;
  shovelDuration?: number;
  clockDuration?: number;
  helmetDuration?: number;
}

export class PowerUpSystem {
  private grid: GridMap;
  private items: PowerUpItem[] = [];
  private nextItemId: number = 1;
  private maxItems: number = 1;

  public shovelTimer: number = 0;
  public cachedBasePerimeter: Map<string, GridCell> | null = null;
  public onPowerUpCollected?: (event: PowerUpPickupEvent) => void;

  private shovelDuration: number = SHOVEL_DURATION;
  private clockDuration: number = CLOCK_DURATION;
  private helmetDuration: number = HELMET_DURATION;

  constructor(grid: GridMap, options?: PowerUpSystemOptions) {
    this.grid = grid;
    if (options?.maxItems !== undefined) this.maxItems = options.maxItems;
    if (options?.shovelDuration !== undefined) this.shovelDuration = options.shovelDuration;
    if (options?.clockDuration !== undefined) this.clockDuration = options.clockDuration;
    if (options?.helmetDuration !== undefined) this.helmetDuration = options.helmetDuration;
  }

  public getItems(): PowerUpItem[] {
    return this.items;
  }

  public getItemCount(): number {
    return this.items.length;
  }

  public spawnPowerUp(type: PowerUpType, x?: number, y?: number): PowerUpItem {
    // Single active powerup cap (T-51-05): remove older uncollected items if max reached
    if (this.items.length >= this.maxItems) {
      this.items = [];
    }

    const maxX = ARENA_SIZE - POWERUP_SIZE;
    const maxY = ARENA_SIZE - POWERUP_SIZE;

    let posX = x !== undefined ? Math.max(0, Math.min(maxX, x)) : Math.floor(Math.random() * maxX);
    let posY = y !== undefined ? Math.max(0, Math.min(maxY, y)) : Math.floor(Math.random() * maxY);

    const item: PowerUpItem = {
      id: this.nextItemId++,
      type,
      x: posX,
      y: posY,
      width: POWERUP_SIZE,
      height: POWERUP_SIZE,
      alive: true,
      flashTimer: 0,
    };

    this.items.push(item);
    return item;
  }

  public spawnRandomPowerUp(x?: number, y?: number): PowerUpItem {
    const allTypes = Object.values(PowerUpType);
    const randomIndex = Math.floor(Math.random() * allTypes.length);
    const randomType = allTypes[randomIndex] ?? PowerUpType.STAR;
    return this.spawnPowerUp(randomType, x, y);
  }

  public activateShovel(): void {
    // Snapshot original cells if not already cached
    if (this.cachedBasePerimeter === null) {
      this.cachedBasePerimeter = new Map<string, GridCell>();
      for (const coord of EAGLE_PERIMETER_COORDS) {
        const cell = this.grid.getCell(coord.col, coord.row);
        const key = `${coord.col},${coord.row}`;
        if (cell) {
          this.cachedBasePerimeter.set(key, {
            type: cell.type,
            mask: cell.mask,
          });
        } else {
          this.cachedBasePerimeter.set(key, {
            type: TileType.EMPTY,
            mask: SubTileMask.EMPTY,
          });
        }
      }
    }

    // Fortify perimeter cells with STEEL
    for (const coord of EAGLE_PERIMETER_COORDS) {
      this.grid.setCell(coord.col, coord.row, TileType.STEEL, SubTileMask.FULL);
    }

    this.shovelTimer = this.shovelDuration;
  }

  public restoreBasePerimeter(): void {
    if (this.cachedBasePerimeter !== null) {
      for (const [key, cell] of this.cachedBasePerimeter.entries()) {
        const [colStr, rowStr] = key.split(',');
        const col = Number(colStr);
        const row = Number(rowStr);
        if (!isNaN(col) && !isNaN(row)) {
          this.grid.setCell(col, row, cell.type, cell.mask);
        }
      }
      this.cachedBasePerimeter = null;
    }
  }

  public update(dt: number, player?: PlayerTank, spawner?: EnemySpawner): void {
    const safeDt = Math.min(Math.max(0, dt), 0.1);

    // 1. Shovel base fortification timer countdown
    if (this.shovelTimer > 0) {
      this.shovelTimer = Math.max(0, this.shovelTimer - safeDt);
      if (this.shovelTimer <= 0) {
        this.restoreBasePerimeter();
      }
    }

    // 2. AABB collection detection against PlayerTank
    if (player && !player.isDead && spawner) {
      this.checkPlayerCollision(player, spawner);
    } else {
      // Clean up dead items if collision wasn't run
      this.items = this.items.filter((item) => item.alive);
    }
  }

  public checkPlayerCollision(player: PlayerTank, spawner: EnemySpawner): void {
    if (!player || player.isDead) return;
    const playerBounds = player.getBounds();

    for (const item of this.items) {
      if (!item.alive) continue;

      if (this.checkAABB(playerBounds, item)) {
        item.alive = false;
        this.applyPowerUpEffect(item.type, player, spawner);

        const event: PowerUpPickupEvent = {
          type: item.type,
          points: POWERUP_SCORE,
          x: item.x,
          y: item.y,
        };

        if (this.onPowerUpCollected) {
          this.onPowerUpCollected(event);
        }
      }
    }

    this.items = this.items.filter((item) => item.alive);
  }

  private applyPowerUpEffect(
    type: PowerUpType,
    player: PlayerTank,
    spawner: EnemySpawner
  ): void {
    switch (type) {
      case PowerUpType.STAR:
        player.upgradeTier();
        break;

      case PowerUpType.GUN:
        player.setTier(TankTier.TIER_4);
        break;

      case PowerUpType.HELMET:
        player.setShield(this.helmetDuration);
        break;

      case PowerUpType.TANK:
        player.addLife(1);
        break;

      case PowerUpType.BOAT:
        player.setBoat(true);
        break;

      case PowerUpType.GRENADE:
        spawner.killAll();
        break;

      case PowerUpType.CLOCK:
        spawner.freezeAll(this.clockDuration);
        break;

      case PowerUpType.SHOVEL:
        this.activateShovel();
        break;
    }
  }

  public clear(): void {
    this.items = [];
    if (this.cachedBasePerimeter !== null) {
      this.restoreBasePerimeter();
      this.shovelTimer = 0;
    }
  }

  private checkAABB(rectA: Rect, rectB: Rect): boolean {
    return (
      rectA.x < rectB.x + rectB.width &&
      rectA.x + rectA.width > rectB.x &&
      rectA.y < rectB.y + rectB.height &&
      rectA.y + rectA.height > rectB.y
    );
  }
}
