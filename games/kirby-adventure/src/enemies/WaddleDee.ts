import { EnemyBase, EnemyAttackResult } from './EnemyBase';
import { AbilityType, EnemyType, Rect } from '../types';
import { TileMap } from '../TileMap';

export class WaddleDee extends EnemyBase {
  readonly type: EnemyType = 'waddle_dee';
  readonly abilityGrant: AbilityType | null = null;

  private speed = 40;

  update(dt: number, tileMap: TileMap): EnemyAttackResult | null {
    if (this.isDead || this.isBeingInhaled) return null;

    // Move forward
    this.vx = this.facing * this.speed;
    this.x += this.vx * dt;

    // Check wall collision or ledge
    const aheadX = this.facing === 1 ? this.x + this.width + 2 : this.x - 2;
    const col = Math.floor(aheadX / tileMap.tileSize);
    const row = Math.floor((this.y + this.height / 2) / tileMap.tileSize);
    const groundRow = Math.floor((this.y + this.height + 4) / tileMap.tileSize);

    const hitWall = tileMap.isSolid(col, row);
    const noGround = !tileMap.isSolid(col, groundRow) && !tileMap.isOneWay(col, groundRow);

    if (hitWall || noGround) {
      this.facing = this.facing === 1 ? -1 : 1;
    }

    return null;
  }
}
