import { AbilityType, Direction, EnemyType, Rect } from '../types';
import { TileMap } from '../TileMap';

export interface EnemyAttackResult {
  hitboxes: Rect[];
  damage: number;
}

export abstract class EnemyBase {
  abstract readonly type: EnemyType;
  abstract readonly abilityGrant: AbilityType | null;

  id: string;
  x: number;
  y: number;
  width = 18;
  height = 18;
  vx = 0;
  vy = 0;
  facing: Direction = -1;
  hp = 1;
  isDead = false;
  isFrozen = false;
  isBeingInhaled = false;

  constructor(id: string, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
  }

  getBounds(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  canBeInhaled(): boolean {
    return !this.isDead && !this.isFrozen;
  }

  takeDamage(amount = 1): boolean {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.isDead = true;
      return true; // Killed
    }
    return false;
  }

  abstract update(dt: number, tileMap: TileMap, playerBounds: Rect): EnemyAttackResult | null;
}
