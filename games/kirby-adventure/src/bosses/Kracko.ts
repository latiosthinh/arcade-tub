import { BossBase, BossAttackResult } from './BossBase';
import { Rect } from '../types';

export class Kracko extends BossBase {
  readonly name = 'Kracko';
  readonly maxHp = 12;

  private speed = 60;
  private dir = 1;
  private lightningTimer = 2.0;
  private isStriking = false;
  private strikeTimer = 0;

  constructor(x: number, y: number) {
    super(x, y, 40, 32, 12);
  }

  update(dt: number, playerBounds: Rect): BossAttackResult | null {
    if (this.isDefeated) return null;

    if (this.iframeTimer > 0) {
      this.iframeTimer -= dt;
    }

    // Aerial horizontal patrol
    this.x += this.dir * this.speed * dt;
    if (this.x < 40) {
      this.dir = 1;
    } else if (this.x > 200) {
      this.dir = -1;
    }

    this.lightningTimer -= dt;

    if (this.isStriking) {
      this.strikeTimer -= dt;
      if (this.strikeTimer <= 0) {
        this.isStriking = false;
      }

      // Vertical lightning column straight down
      const column: Rect = {
        x: this.x + this.width / 2 - 8,
        y: this.y + this.height,
        width: 16,
        height: 120,
      };

      return {
        hitboxes: [column],
        damage: 2,
      };
    }

    if (this.lightningTimer <= 0) {
      const cooldown = this.phase === 2 ? 1.8 : 2.8;
      this.lightningTimer = cooldown;
      this.isStriking = true;
      this.strikeTimer = 0.4;
    }

    return null;
  }
}
