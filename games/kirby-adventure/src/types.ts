export const enum TileType {
  AIR = 0,
  SOLID = 1,
  ONE_WAY = 2,
  HAZARD = 3,
  BREAKABLE = 4,
  DOOR = 5,
}

export type Direction = -1 | 1;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export type AbilityType =
  | 'sword'
  | 'fire'
  | 'ice'
  | 'beam'
  | 'cutter'
  | 'stone'
  | 'spark'
  | 'needle';

export type EnemyType =
  | 'waddle_dee'
  | 'waddle_doo'
  | 'blade_knight'
  | 'hot_head'
  | 'chilly'
  | 'sparky'
  | 'sir_kibble'
  | 'rocky';

export interface InhaleCone {
  originX: number;
  originY: number;
  direction: Direction;
  reach: number;
  width: number;
}

export interface MouthContent {
  type: 'enemy' | 'star' | 'food' | 'ability_star';
  enemyType?: EnemyType;
  abilityGrant?: AbilityType | null;
  hpRestore?: number;
}

export interface LevelData {
  cols: number;
  rows: number;
  tileSize: number;
  tiles: TileType[];
  playerSpawn: Point;
  doors?: Array<{
    col: number;
    row: number;
    targetRoom: string;
    targetDoorId: string;
  }>;
  enemies?: Array<{
    type: EnemyType;
    col: number;
    row: number;
  }>;
  foods?: Array<{
    type: 'food' | 'maxim_tomato';
    col: number;
    row: number;
  }>;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpJustPressed: boolean;
  jumpJustReleased: boolean;
  attack?: boolean;
  attackJustPressed?: boolean;
  attackJustReleased?: boolean;
  discard?: boolean;
  dash?: boolean;
}

export interface GameScene {
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export class SimpleInputManager {
  private _pressed = new Set<string>();
  private _justPressed = new Set<string>();
  private _justReleased = new Set<string>();

  private _onKeyDown = (event: KeyboardEvent): void => {
    if (!this._pressed.has(event.code)) {
      this._justPressed.add(event.code);
    }
    this._pressed.add(event.code);
  };

  private _onKeyUp = (event: KeyboardEvent): void => {
    this._pressed.delete(event.code);
    this._justReleased.add(event.code);
  };

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this._onKeyDown);
      window.addEventListener('keyup', this._onKeyUp);
    }
  }

  isDown(key: string): boolean {
    return this._pressed.has(key);
  }

  justPressed(key: string): boolean {
    return this._justPressed.has(key);
  }

  justReleased(key: string): boolean {
    return this._justReleased.has(key);
  }

  update(): void {
    this._justPressed.clear();
    this._justReleased.clear();
  }

  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this._onKeyDown);
      window.removeEventListener('keyup', this._onKeyUp);
    }
  }
}
