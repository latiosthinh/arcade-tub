import { Direction, InputState, Rect } from './types';
import { ProjectileManager } from './ProjectileManager';
import { PowerUpManager, PowerUpItem } from './PowerUpManager';

export class CombatSystem {
  lives = 3;
  score = 0;
  isDead = false;
  isGameOver = false;
  isInvulnerable = false;
  invulnerabilityTimer = 0;
  isSlashing = false;
  slashTimer = 0;
  slashCooldown = 0;
  shurikenCooldown = 0;

  getSwordHitbox(playerX: number, playerY: number, playerWidth: number, playerHeight: number, facing: Direction): Rect | null {
    if (!this.isSlashing) return null;

    const reach = 32;
    return {
      x: facing === 1 ? playerX + playerWidth : playerX - reach,
      y: playerY - 4,
      width: reach,
      height: playerHeight + 8,
    };
  }

  triggerSlash(): boolean {
    if (this.slashCooldown > 0 || this.isDead) return false;
    this.isSlashing = true;
    this.slashTimer = 0.16; // 160ms slash duration
    this.slashCooldown = 0.22;
    return true;
  }

  triggerShuriken(
    playerX: number,
    playerY: number,
    facing: Direction,
    input: InputState,
    projectiles: ProjectileManager
  ): boolean {
    if (this.shurikenCooldown > 0 || this.isDead) return false;

    let dirX = facing as number;
    let dirY = 0;

    if (input.up && input.right) {
      dirX = 1;
      dirY = -1;
    } else if (input.up && input.left) {
      dirX = -1;
      dirY = -1;
    } else if (input.down && input.right) {
      dirX = 1;
      dirY = 1;
    } else if (input.down && input.left) {
      dirX = -1;
      dirY = 1;
    } else if (input.up) {
      dirX = 0;
      dirY = -1;
    } else if (input.down) {
      dirX = 0;
      dirY = 1;
    }

    projectiles.spawnShuriken(playerX + 9, playerY + 12, dirX, dirY, 'player');
    this.shurikenCooldown = 0.12; // 120ms rate of fire
    return true;
  }

  takeHit(): boolean {
    if (this.isInvulnerable || this.isDead) return false;

    this.isDead = true;
    this.lives -= 1;
    if (this.lives <= 0) {
      this.isGameOver = true;
    }
    return true;
  }

  respawn(): void {
    if (this.isGameOver) return;
    this.isDead = false;
    this.isInvulnerable = true;
    this.invulnerabilityTimer = 2.0; // 2.0s post-spawn i-frames
  }

  applyPowerUp(item: PowerUpItem): void {
    if (item.type === 'crystal_ball') {
      this.isInvulnerable = true;
      this.invulnerabilityTimer = 8.0; // 8s invincibility
    }
  }

  update(dt: number): void {
    if (this.slashTimer > 0) {
      this.slashTimer -= dt;
      if (this.slashTimer <= 0) {
        this.isSlashing = false;
      }
    }

    if (this.slashCooldown > 0) {
      this.slashCooldown -= dt;
    }

    if (this.shurikenCooldown > 0) {
      this.shurikenCooldown -= dt;
    }

    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer -= dt;
      if (this.invulnerabilityTimer <= 0) {
        this.isInvulnerable = false;
      }
    }
  }
}
