import { EnemyBase } from './EnemyBase';
import { ProjectileManager } from '../ProjectileManager';

export class FireMonk extends EnemyBase {
  readonly type = 'fire_monk';
  private fireTimer = 1.8;

  constructor(id: string, x: number, y: number) {
    super(id, x, y);
    this.width = 22;
    this.height = 26;
    this.hp = 2;
  }

  update(
    dt: number,
    playerX: number,
    playerY: number,
    canopy: any,
    projectiles: ProjectileManager,
    stageFloorY = 560
  ): void {
    if (this.isDead) return;

    this.facing = playerX > this.x ? 1 : -1;
    this.fireTimer -= dt;

    if (this.fireTimer <= 0) {
      projectiles.spawnFireball(this.x + (this.facing === 1 ? this.width : -14), this.y + 6, this.facing);
      this.fireTimer = 2.2;
    }

    // Slow ground patrol
    this.x += this.facing * 35 * dt;
    this.y = stageFloorY - this.height;
  }
}
