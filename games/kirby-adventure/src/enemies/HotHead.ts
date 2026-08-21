import { EnemyBase, EnemyAttackResult } from './EnemyBase';
import { AbilityType, EnemyType, Rect } from '../types';
import { TileMap } from '../TileMap';

export class HotHead extends EnemyBase {
  readonly type: EnemyType = 'hot_head';
  readonly abilityGrant: AbilityType | null = 'fire';

  private speed = 30;
  private breathTimer = 2.0;
  private isBreathing = false;
  private breathDuration = 0.5;

  update(dt: number, tileMap: TileMap, playerBounds: Rect): EnemyAttackResult | null {
    if (this.isDead || this.isBeingInhaled) return null;

    this.breathTimer -= dt;

    if (this.isBreathing) {
      this.breathDuration -= dt;
      if (this.breathDuration <= 0) {
        this.isBreathing = false;
        this.breathTimer = 2.2;
        this.breathDuration = 0.5;
      }

      const reach = 30;
      const hitbox: Rect = {
        x: this.facing === 1 ? this.x + this.width : this.x - reach,
        y: this.y + 2,
        width: reach,
        height: this.height - 4,
      };

      return {
        hitboxes: [hitbox],
        damage: 2,
      };
    }

    if (this.breathTimer <= 0) {
      const dx = playerBounds.x - this.x;
      if (Math.abs(dx) < 80) {
        this.facing = dx > 0 ? 1 : -1;
        this.isBreathing = true;
        this.vx = 0;
        return null;
      }
    }

    this.vx = this.facing * this.speed;
    this.x += this.vx * dt;

    const aheadX = this.facing === 1 ? this.x + this.width + 2 : this.x - 2;
    const col = Math.floor(aheadX / tileMap.tileSize);
    const row = Math.floor((this.y + this.height / 2) / tileMap.tileSize);

    if (tileMap.isSolid(col, row)) {
      this.facing = this.facing === 1 ? -1 : 1;
    }

    return null;
  }
}
