import { EnemyBase } from './EnemyBase';
import { ProjectileManager } from '../ProjectileManager';

export class SorcererBoss extends EnemyBase {
  readonly type = 'sorcerer_boss';
  private teleportTimer = 3.0;
  private attackTimer = 1.0;

  constructor(id: string, x: number, y: number) {
    super(id, x, y);
    this.width = 24;
    this.height = 32;
    this.hp = 8; // Boss health
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
    this.teleportTimer -= dt;
    this.attackTimer -= dt;

    if (this.attackTimer <= 0) {
      const dx = playerX - this.x;
      const dy = playerY - this.y;
      projectiles.spawnShuriken(this.x + 12, this.y + 16, dx, dy, 'enemy');
      this.attackTimer = 1.5;
    }

    if (this.teleportTimer <= 0) {
      // Teleport to new arena position
      this.x = playerX > 400 ? 150 + Math.random() * 200 : 550 + Math.random() * 200;
      this.y = 200 + Math.random() * 250;
      this.teleportTimer = 3.5;
    }
  }
}
