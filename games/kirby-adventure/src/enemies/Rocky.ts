import { EnemyBase, EnemyAttackResult } from './EnemyBase';
import { AbilityType, EnemyType, Rect } from '../types';
import { TileMap } from '../TileMap';

export class Rocky extends EnemyBase {
  readonly type: EnemyType = 'rocky';
  readonly abilityGrant: AbilityType | null = 'stone';

  private speed = 25;
  private isStoneDropping = false;
  private dropTimer = 0;

  constructor(id: string, x: number, y: number) {
    super(id, x, y);
    this.hp = 3; // Very durable
  }

  update(dt: number, tileMap: TileMap, playerBounds: Rect): EnemyAttackResult | null {
    if (this.isDead || this.isBeingInhaled) return null;

    if (this.isStoneDropping) {
      this.vy = 350; // Heavy fall
      this.y += this.vy * dt;

      const groundRow = Math.floor((this.y + this.height) / tileMap.tileSize);
      const col = Math.floor(this.x / tileMap.tileSize);

      if (tileMap.isSolid(col, groundRow)) {
        this.y = groundRow * tileMap.tileSize - this.height;
        this.isStoneDropping = false;
        this.dropTimer = 2.0;

        // Ground shockwave
        const shockwave: Rect = {
          x: this.x - 16,
          y: this.y,
          width: this.width + 32,
          height: this.height,
        };

        return {
          hitboxes: [shockwave],
          damage: 3,
        };
      }

      return {
        hitboxes: [this.getBounds()],
        damage: 3,
      };
    }

    if (this.dropTimer > 0) {
      this.dropTimer -= dt;
    } else {
      // Check if player is directly beneath
      const dx = Math.abs(playerBounds.x - this.x);
      const dy = playerBounds.y - this.y;
      if (dx < 30 && dy > 20 && dy < 120) {
        this.isStoneDropping = true;
        this.vx = 0;
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
