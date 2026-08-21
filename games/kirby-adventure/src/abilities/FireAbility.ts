import { CopyAbility, AbilityAttackResult } from './AbilityTypes';
import { AbilityType, Rect } from '../types';
import { KirbyPhysics } from '../KirbyPhysics';
import { ProjectileManager } from '../Projectile';

export class FireAbility implements CopyAbility {
  readonly type: AbilityType = 'fire';
  readonly displayName = 'Fire';
  readonly hatColor = '#E64A19';

  private attacking = false;
  private isDashing = false;
  private timer = 0;

  activate(physics: KirbyPhysics): void {
    this.attacking = true;
    if (physics.isDashing) {
      this.isDashing = true;
      this.timer = 0.4;
      physics.vx = physics.facing * 260;
    } else {
      this.isDashing = false;
      this.timer = 0.35;
    }
  }

  update(dt: number, physics: KirbyPhysics): AbilityAttackResult | null {
    if (!this.attacking) return null;

    this.timer -= dt;
    if (this.timer <= 0) {
      this.attacking = false;
      this.isDashing = false;
      return null;
    }

    if (this.isDashing) {
      physics.vx = physics.facing * 260;
      return {
        hitboxes: [physics.getBounds()],
        damage: 3,
        isInvulnerable: true,
        knockbackDir: physics.facing,
        element: 'fire',
      };
    }

    // Flame breath cone
    const reach = 32;
    const hitbox: Rect = {
      x: physics.facing === 1 ? physics.x + physics.width : physics.x - reach,
      y: physics.y + 2,
      width: reach,
      height: physics.height - 4,
    };

    return {
      hitboxes: [hitbox],
      damage: 2,
      knockbackDir: physics.facing,
      element: 'fire',
    };
  }

  isAttacking(): boolean {
    return this.attacking;
  }

  cancel(): void {
    this.attacking = false;
    this.isDashing = false;
    this.timer = 0;
  }

  dispose(): void {
    this.cancel();
  }
}
