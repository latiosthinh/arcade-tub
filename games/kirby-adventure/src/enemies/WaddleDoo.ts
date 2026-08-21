import { EnemyBase, EnemyAttackResult } from './EnemyBase';
import { AbilityType, EnemyType, Rect } from '../types';
import { TileMap } from '../TileMap';

export class WaddleDoo extends EnemyBase {
  readonly type: EnemyType = 'waddle_doo';
  readonly abilityGrant: AbilityType | null = 'beam';

  private speed = 35;
  private attackTimer = 2.0;
  private isAttacking = false;
  private attackDuration = 0.4;

  update(dt: number, tileMap: TileMap, playerBounds: Rect): EnemyAttackResult | null {
    if (this.isDead || this.isBeingInhaled) return null;

    this.attackTimer -= dt;

    if (this.isAttacking) {
      this.attackDuration -= dt;
      if (this.attackDuration <= 0) {
        this.isAttacking = false;
        this.attackTimer = 2.5;
        this.attackDuration = 0.4;
      }

      // Beam arc hitbox
      const reach = 36;
      const hitbox: Rect = {
        x: this.facing === 1 ? this.x + this.width : this.x - reach,
        y: this.y - 4,
        width: reach,
        height: this.height + 8,
      };

      return {
        hitboxes: [hitbox],
        damage: 2,
      };
    }

    if (this.attackTimer <= 0) {
      // Trigger beam attack if facing player
      const dx = playerBounds.x - this.x;
      if ((dx > 0 && this.facing === 1) || (dx < 0 && this.facing === -1)) {
        if (Math.abs(dx) < 100) {
          this.isAttacking = true;
          this.vx = 0;
          return null;
        }
      }
    }

    // Normal patrol
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
