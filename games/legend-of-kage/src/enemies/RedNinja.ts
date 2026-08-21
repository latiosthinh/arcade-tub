import { EnemyBase } from './EnemyBase';
import { Direction } from '../types';
import { ProjectileManager } from '../ProjectileManager';
import { TreeCanopy } from '../TreeCanopy';

export class RedNinja extends EnemyBase {
  readonly type = 'red_ninja';
  private jumpTimer = 1.5;

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
    this.jumpTimer -= dt;

    if (this.jumpTimer <= 0 && this.isGrounded) {
      this.vy = -400; // Low leap toward player
      this.vx = this.facing * 120;
      this.jumpTimer = 2.0;
      this.isGrounded = false;
    }

    // Gravity
    if (!this.isGrounded) {
      this.vy += 650 * dt;
    } else {
      this.vx = this.facing * 90;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.y + this.height >= stageFloorY) {
      this.y = stageFloorY - this.height;
      this.vy = 0;
      this.isGrounded = true;
    }
  }
}
