import { EnemyBase, EnemyAttackResult } from './EnemyBase';
import { AbilityType, EnemyType, Rect } from '../types';
import { TileMap } from '../TileMap';

export class BladeKnight extends EnemyBase {
  readonly type: EnemyType = 'blade_knight';
  readonly abilityGrant: AbilityType | null = 'sword';

  private speed = 45;
  private isSlashing = false;
  private slashTimer = 0;

  constructor(id: string, x: number, y: number) {
    super(id, x, y);
    this.hp = 2; // Armored
  }

  update(dt: number, tileMap: TileMap, playerBounds: Rect): EnemyAttackResult | null {
    if (this.isDead || this.isBeingInhaled) return null;

    const dx = playerBounds.x - this.x;
    const dist = Math.abs(dx);

    if (this.isSlashing) {
      this.slashTimer -= dt;
      if (this.slashTimer <= 0) {
        this.isSlashing = false;
      }

      const reach = 24;
      const hitbox: Rect = {
        x: this.facing === 1 ? this.x + this.width : this.x - reach,
        y: this.y - 2,
        width: reach,
        height: this.height + 4,
      };

      return {
        hitboxes: [hitbox],
        damage: 2,
      };
    }

    if (dist < 60 && ((dx > 0 && this.facing === 1) || (dx < 0 && this.facing === -1))) {
      this.isSlashing = true;
      this.slashTimer = 0.3;
      this.vx = this.facing * 80;
    } else {
      this.vx = this.facing * this.speed;
    }

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
