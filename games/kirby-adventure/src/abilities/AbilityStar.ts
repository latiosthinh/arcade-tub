import { AbilityType, Rect } from '../types';
import { TileMap } from '../TileMap';

export class AbilityStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width = 16;
  height = 16;
  ability: AbilityType;
  lifeTimer = 3.0; // 3 seconds
  isDead = false;

  constructor(x: number, y: number, ability: AbilityType, dir: -1 | 1 = 1) {
    this.x = x;
    this.y = y;
    this.ability = ability;
    this.vx = dir * 120;
    this.vy = -180;
  }

  getBounds(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  update(dt: number, tileMap: TileMap): void {
    if (this.isDead) return;

    this.lifeTimer -= dt;
    if (this.lifeTimer <= 0) {
      this.isDead = true;
      return;
    }

    // Gravity
    this.vy += 450 * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Tile bounce
    const hits = tileMap.queryRect(this.getBounds());
    for (const hit of hits) {
      if (tileMap.isSolid(hit.col, hit.row)) {
        this.y = hit.bounds.y - this.height;
        this.vy = -Math.abs(this.vy) * 0.7;
        this.vx *= 0.9;
        break;
      }
    }
  }

  isFlashing(): boolean {
    if (this.lifeTimer > 1.0) return false;
    return Math.floor(this.lifeTimer * 10) % 2 === 0;
  }
}
