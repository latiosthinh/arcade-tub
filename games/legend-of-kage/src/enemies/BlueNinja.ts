import { EnemyBase } from './EnemyBase';
import { ProjectileManager } from '../ProjectileManager';
import { TreeCanopy } from '../TreeCanopy';

export class BlueNinja extends EnemyBase {
  readonly type = 'blue_ninja';
  private throwTimer = 1.2;

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
    this.throwTimer -= dt;

    if (this.throwTimer <= 0) {
      const dx = playerX - this.x;
      const dy = playerY - this.y;
      projectiles.spawnShuriken(this.x + 9, this.y + 12, dx, dy, 'enemy');
      this.throwTimer = 2.0;
    }

    // Agile bounding movement
    this.vy += 600 * dt;
    this.x += this.facing * 80 * dt;
    this.y += this.vy * dt;

    const prevY = this.y - this.vy * dt;
    if (this.vy >= 0) {
      const branchHit = canopy.checkBranchLanding(this.x, this.y, this.width, this.height, prevY);
      if (branchHit) {
        this.y = branchHit.y - this.height;
        this.vy = -350; // Bound off branch
      }
    }

    if (this.y + this.height >= stageFloorY) {
      this.y = stageFloorY - this.height;
      this.vy = -450; // High leap off floor
      this.isGrounded = false;
    }
  }
}
