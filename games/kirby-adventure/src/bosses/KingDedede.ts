import { BossBase, BossAttackResult } from './BossBase';
import { Rect } from '../types';

export class KingDedede extends BossBase {
  readonly name = 'King Dedede';
  readonly maxHp = 16;

  private isJumping = false;
  private isSlamming = false;
  private jumpTimer = 2.0;

  constructor(x: number, y: number) {
    super(x, y, 36, 40, 16);
  }

  update(dt: number, playerBounds: Rect): BossAttackResult | null {
    if (this.isDefeated) return null;

    if (this.iframeTimer > 0) {
      this.iframeTimer -= dt;
    }

    this.jumpTimer -= dt;

    if (this.isJumping) {
      this.y += 300 * dt;
      if (this.y >= 140) {
        this.y = 140;
        this.isJumping = false;
        this.isSlamming = true;

        // Ground shockwave on both sides
        const shockwave: Rect = {
          x: this.x - 30,
          y: this.y + this.height - 10,
          width: this.width + 60,
          height: 12,
        };

        return {
          hitboxes: [shockwave],
          damage: 3,
        };
      }
    }

    if (this.jumpTimer <= 0) {
      const cooldown = this.phase === 2 ? 1.5 : 2.5;
      this.jumpTimer = cooldown;
      this.isJumping = true;
      this.y = 40; // Jump up high
      this.x = playerBounds.x; // Align with player
    }

    return null;
  }
}
