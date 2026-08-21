import { EnemyBase, EnemyAttackResult } from './EnemyBase';
import { AbilityType, EnemyType, Rect } from '../types';
import { TileMap } from '../TileMap';

export class Sparky extends EnemyBase {
  readonly type: EnemyType = 'sparky';
  readonly abilityGrant: AbilityType | null = 'spark';

  private hopTimer = 0.5;
  private sparkTimer = 1.5;
  private isSparking = false;

  update(dt: number, tileMap: TileMap): EnemyAttackResult | null {
    if (this.isDead || this.isBeingInhaled) return null;

    this.hopTimer -= dt;
    this.sparkTimer -= dt;

    if (this.isSparking) {
      this.sparkTimer -= dt;
      if (this.sparkTimer <= 0) {
        this.isSparking = false;
        this.sparkTimer = 2.0;
      }

      const radius = 28;
      const hitbox: Rect = {
        x: this.x - radius / 2,
        y: this.y - radius / 2,
        width: this.width + radius,
        height: this.height + radius,
      };

      return {
        hitboxes: [hitbox],
        damage: 2,
      };
    }

    if (this.sparkTimer <= 0) {
      this.isSparking = true;
      this.sparkTimer = 0.4;
      return null;
    }

    // Hopping movement
    this.vy += 400 * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const groundRow = Math.floor((this.y + this.height) / tileMap.tileSize);
    const col = Math.floor(this.x / tileMap.tileSize);

    if (tileMap.isSolid(col, groundRow)) {
      this.y = groundRow * tileMap.tileSize - this.height;
      if (this.hopTimer <= 0) {
        this.vy = -140;
        this.vx = this.facing * 30;
        this.hopTimer = 0.6;
      } else {
        this.vy = 0;
        this.vx = 0;
      }
    }

    return null;
  }
}
