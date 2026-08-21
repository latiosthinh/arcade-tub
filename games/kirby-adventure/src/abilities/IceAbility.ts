import { CopyAbility, AbilityAttackResult } from './AbilityTypes';
import { AbilityType, Rect } from '../types';
import { KirbyPhysics } from '../KirbyPhysics';

export class IceAbility implements CopyAbility {
  readonly type: AbilityType = 'ice';
  readonly displayName = 'Ice';
  readonly hatColor = '#00ACC1';

  private attacking = false;
  private timer = 0;

  activate(): void {
    this.attacking = true;
    this.timer = 0.35;
  }

  update(dt: number, physics: KirbyPhysics): AbilityAttackResult | null {
    if (!this.attacking) return null;

    this.timer -= dt;
    if (this.timer <= 0) {
      this.attacking = false;
      return null;
    }

    const reach = 28;
    const hitbox: Rect = {
      x: physics.facing === 1 ? physics.x + physics.width : physics.x - reach,
      y: physics.y,
      width: reach,
      height: physics.height,
    };

    return {
      hitboxes: [hitbox],
      damage: 1,
      knockbackDir: physics.facing,
      element: 'ice',
    };
  }

  isAttacking(): boolean {
    return this.attacking;
  }

  cancel(): void {
    this.attacking = false;
    this.timer = 0;
  }

  dispose(): void {
    this.cancel();
  }
}
