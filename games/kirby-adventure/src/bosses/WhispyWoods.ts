import { BossBase, BossAttackResult } from './BossBase';
import { Rect } from '../types';

export class WhispyWoods extends BossBase {
  readonly name = 'Whispy Woods';
  readonly maxHp = 10;

  private attackTimer = 2.0;
  private isShaking = false;
  private isBlowing = false;
  private blowTimer = 0;

  constructor(x: number, y: number) {
    super(x, y, 48, 80, 10);
  }

  update(dt: number, playerBounds: Rect): BossAttackResult | null {
    if (this.isDefeated) return null;

    if (this.iframeTimer > 0) {
      this.iframeTimer -= dt;
    }

    this.attackTimer -= dt;

    if (this.isBlowing) {
      this.blowTimer -= dt;
      if (this.blowTimer <= 0) {
        this.isBlowing = false;
      }

      // Air puff traveling across bottom
      const reach = 80;
      const hitbox: Rect = {
        x: this.x - reach,
        y: this.y + this.height - 24,
        width: reach,
        height: 20,
      };

      return {
        hitboxes: [hitbox],
        damage: 2,
      };
    }

    if (this.attackTimer <= 0) {
      const cooldown = this.phase === 2 ? 1.5 : 2.5;
      this.attackTimer = cooldown;

      // Alternate between apple drop and air blow
      if (Math.random() < 0.5) {
        this.isBlowing = true;
        this.blowTimer = 0.5;
      } else {
        // Apple drop
        return {
          hitboxes: [],
          damage: 1,
          spawnProjectiles: [
            { type: 'apple', x: this.x - 20, y: this.y + 10, vx: -40, vy: 0 },
            { type: 'apple', x: this.x - 40, y: this.y + 10, vx: -80, vy: 0 },
          ],
        };
      }
    }

    return null;
  }
}
