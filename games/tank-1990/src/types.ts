/**
 * Core types, enums, bitmasks, and interfaces for Tank 1990 (Battle City).
 */

export enum TileType {
  EMPTY = 0,
  BRICK = 1,
  STEEL = 2,
  WATER = 3,
  TREES = 4,
  ICE = 5,
  EAGLE = 6,
}

export const SubTileMask = {
  TOP_LEFT: 1 << 0,     // 0b0001 (1)
  TOP_RIGHT: 1 << 1,    // 0b0010 (2)
  BOTTOM_LEFT: 1 << 2,  // 0b0100 (4)
  BOTTOM_RIGHT: 1 << 3, // 0b1000 (8)
  FULL: 0b1111,         // 15
  EMPTY: 0b0000,        // 0
} as const;

export type CardinalDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface CellCoord {
  col: number;
  row: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridCell {
  type: TileType;
  mask: number;
}

export interface EagleState {
  col: number;
  row: number;
  width: number;
  height: number;
  destroyed: boolean;
}

export interface TerrainQueryResult {
  solid: boolean;
  bulletSolid: boolean;
  isWater: boolean;
  isIce: boolean;
  isTrees: boolean;
  isEagle: boolean;
  cell?: GridCell;
}

export enum TankTier {
  TIER_1 = 1, // Basic tank
  TIER_2 = 2, // Fast tank (1.5x speed)
  TIER_3 = 3, // Heavy tank (dual-shot)
  TIER_4 = 4, // Super tank (armor-piercing, destroys steel & cuts trees)
}

export interface TankTierStats {
  speed: number;
  bulletSpeed: number;
  maxBullets: number;
  canDestroySteel: boolean;
  canCutTrees: boolean;
}

export const TANK_TIER_CONFIGS: Record<TankTier, TankTierStats> = {
  [TankTier.TIER_1]: {
    speed: 64,
    bulletSpeed: 160,
    maxBullets: 1,
    canDestroySteel: false,
    canCutTrees: false,
  },
  [TankTier.TIER_2]: {
    speed: 96,
    bulletSpeed: 240,
    maxBullets: 1,
    canDestroySteel: false,
    canCutTrees: false,
  },
  [TankTier.TIER_3]: {
    speed: 96,
    bulletSpeed: 240,
    maxBullets: 2,
    canDestroySteel: false,
    canCutTrees: false,
  },
  [TankTier.TIER_4]: {
    speed: 96,
    bulletSpeed: 280,
    maxBullets: 2,
    canDestroySteel: true,
    canCutTrees: true,
  },
};

export const TANK_SIZE = 28;
export const SPAWN_X = 128; // col 8 * 16
export const SPAWN_Y = 384; // col 24 * 16
export const SPAWN_SHIELD_DURATION = 3.0; // 3.0s invulnerability
export const CORNER_SNAP_THRESHOLD = 4; // <= 4px deadzone for orthogonal corridor auto-alignment
export const ICE_SLIDE_DECEL = 180; // px/s² deceleration when drifting on ice

export interface PlayerTankState {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: CardinalDirection;
  tier: TankTier;
  shieldTimer: number;
  isInvulnerable: boolean;
  lives: number;
  isDead: boolean;
  isSliding: boolean;
  boatActive: boolean;
}

export type BulletOwner = 'PLAYER' | 'ENEMY';
export const BULLET_SIZE = 6;

export interface Bullet {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: CardinalDirection;
  speed: number;
  owner: BulletOwner;
  canDestroySteel: boolean;
  canCutTrees: boolean;
  damage: number;
  alive: boolean;
}

export type BulletHitType =
  | 'BOUNDARY'
  | 'BRICK'
  | 'STEEL'
  | 'TREE'
  | 'EAGLE'
  | 'TANK'
  | 'BULLET_CANCEL';

export interface BulletHitEvent {
  type: BulletHitType;
  x: number;
  y: number;
  bulletId: number;
  targetId?: number | string;
  cellCol?: number;
  cellRow?: number;
}

export interface CombatTankTarget {
  id: string | number;
  x: number;
  y: number;
  width: number;
  height: number;
  isPlayer: boolean;
  isDead: boolean;
  isInvulnerable?: boolean;
  armorHp?: number;
  takeDamage: (damage: number) => boolean;
}

export enum EnemyType {
  BASIC = 'BASIC',
  FAST = 'FAST',
  POWER = 'POWER',
  ARMOR = 'ARMOR',
}

export type ArmorColor = 'GREEN' | 'YELLOW' | 'ORANGE' | 'WHITE';

export interface EnemyConfig {
  speed: number;
  bulletSpeed: number;
  maxBullets: number;
  hp: number;
  points: number;
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  [EnemyType.BASIC]: {
    speed: 48,
    bulletSpeed: 160,
    maxBullets: 1,
    hp: 1,
    points: 100,
  },
  [EnemyType.FAST]: {
    speed: 96,
    bulletSpeed: 192,
    maxBullets: 1,
    hp: 1,
    points: 200,
  },
  [EnemyType.POWER]: {
    speed: 64,
    bulletSpeed: 280,
    maxBullets: 1,
    hp: 1,
    points: 300,
  },
  [EnemyType.ARMOR]: {
    speed: 48,
    bulletSpeed: 160,
    maxBullets: 1,
    hp: 4,
    points: 400,
  },
};

export enum PowerUpType {
  STAR = 'STAR',
  SHOVEL = 'SHOVEL',
  GRENADE = 'GRENADE',
  CLOCK = 'CLOCK',
  HELMET = 'HELMET',
  TANK = 'TANK',
  GUN = 'GUN',
  BOAT = 'BOAT',
}

export interface PowerUpItem {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  width: number;
  height: number;
  alive: boolean;
  duration?: number;
  flashTimer?: number;
}

export interface SpawnPortal {
  id: number;
  col: number;
  row: number;
  x: number;
  y: number;
}

export const SPAWN_PORTALS: SpawnPortal[] = [
  { id: 0, col: 0, row: 0, x: 0, y: 0 },
  { id: 1, col: 12, row: 0, x: 192, y: 0 },
  { id: 2, col: 24, row: 0, x: 384, y: 0 },
];

export interface EnemyTankState {
  id: string | number;
  type: EnemyType;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: CardinalDirection;
  hp: number;
  maxHp: number;
  armorColor?: ArmorColor;
  isFlashing: boolean;
  isFrozen: boolean;
  isDead: boolean;
}


