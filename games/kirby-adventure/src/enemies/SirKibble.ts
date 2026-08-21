import { EnemyBase, EnemyAttackResult } from './EnemyBase';
import { AbilityType, EnemyType, Rect } from '../types';
import { TileMap } from '../TileMap';

export class SirKibble extends EnemyBase {
  readonly type: EnemyType = 'sir_kibble';
  readonly abilityGrant: AbilityType | null = 'cutter';

  private speed = 30;
  private throwTimer = 2.0;
  private isThrowing = false;
  private cutterX = 0;
  private cutterY = 0;
  private cutterVx = 0;
  private cutterActive = false;

  constructor(id: string, x: number, y: number) {
    super(id, x, y);
    this.hp = 2; // Armored
  }

  update(dt: number, tileMap: TileMap, playerBounds: Rect): EnemyAttackResult | null {
    if (this.isDead || this.isBeingInhaled) {
      this.cutterActive = false;
      return null;
    }

    this.throwTimer -= dt;

    if (this.cutterActive) {
      this.cutterX += this.cutterVx * dt;
      const dx = this.cutterX - this.x;
      if (Math.abs(dx) > 100) {
        this.cutterVx = -this.cutterVx; // Return
      }
      if (Math.abs(this.cutterX - this.x) < 8 && ((this.cutterVx > 0 && this.facing === -1) || (this.cutterVx < 0 && this.facing === 1))) {
        this.cutterActive = false;
        this.throwTimer = 2.5;
      }

      const hitbox: Rect = {
        x: this.cutterX - 6,
        y: this.cutterY - 6,
        width: 12,
        height: 12,
      };

      return {
        hitboxes: [hitbox],
        damage: 2,
      };
    }

    if (this.throwTimer <= 0 && !this.cutterActive) {
      const dx = playerBounds.x - this.x;
      if (Math.abs(dx) < 120) {
        this.facing = dx > 0 ? 1 : -1;
        this.cutterActive = true;
        this.cutterX = this.x + this.width / 2;
        this.cutterY = this.y + this.height / 2;
        this.cutterVx = this.facing * 160;
        return null;
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
