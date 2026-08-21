import { Direction, Rect } from '../types';
import { ProjectileManager } from '../ProjectileManager';
import { TreeCanopy } from '../TreeCanopy';

export abstract class EnemyBase {
  abstract readonly type: string;

  id: string;
  x: number;
  y: number;
  width = 18;
  height = 24;
  vx = 0;
  vy = 0;
  facing: Direction = -1;
  hp = 1;
  isDead = false;
  isGrounded = false;

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

  takeHit(damage = 1): boolean {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.isDead = true;
      return true; // Killed
    }
    return false;
  }

  abstract update(
    dt: number,
    playerX: number,
    playerY: number,
    canopy: TreeCanopy,
    projectiles: ProjectileManager,
    stageFloorY?: number
  ): void;
}
