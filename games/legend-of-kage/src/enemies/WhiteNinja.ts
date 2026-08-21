import { EnemyBase } from './EnemyBase';
import { ProjectileManager } from '../ProjectileManager';
import { TreeCanopy } from '../TreeCanopy';

export class WhiteNinja extends EnemyBase {
  readonly type = 'white_ninja';
  private spreadTimer = 1.5;

  constructor(id: string, x: number, y: number) {
    super(id, x, y);
    this.hp = 2; // Elite
  }

  update(
    dt: number,
    playerX: number,
    playerY: number,
    canopy: TreeCanopy,
    projectiles: ProjectileManager,
    stageFloorY = 560
  ): void {
    if (this.isDead) return;

    this.facing = playerX > this.x ? 1 : -1;
    this.spreadTimer -= dt;

    if (this.spreadTimer <= 0) {
      // 3-way shuriken spread
      const dx = playerX - this.x;
      const dy = playerY - this.y;
      projectiles.spawnShuriken(this.x + 9, this.y + 12, dx, dy - 60, 'enemy');
      projectiles.spawnShuriken(this.x + 9, this.y + 12, dx, dy, 'enemy');
      projectiles.spawnShuriken(this.x + 9, this.y + 12, dx, dy + 60, 'enemy');
      this.spreadTimer = 2.5;
    }

    // High vertical bounce
    this.vy += 550 * dt;
    this.x += this.facing * 60 * dt;
    this.y += this.vy * dt;

    if (this.y + this.height >= stageFloorY) {
      this.y = stageFloorY - this.height;
      this.vy = -600; // High smoke leap
    }
  }
}
