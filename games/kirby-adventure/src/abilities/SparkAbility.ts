import { CopyAbility, AbilityAttackResult } from './AbilityTypes';
import { AbilityType, Rect } from '../types';
import { KirbyPhysics } from '../KirbyPhysics';

export class SparkAbility implements CopyAbility {
  readonly type: AbilityType = 'spark';
  readonly displayName = 'Spark';
  readonly hatColor = '#64DD17';

  private attacking = false;
  private timer = 0;

  activate(): void {
    this.attacking = true;
    this.timer = 0.3;
  }

  update(dt: number, physics: KirbyPhysics): AbilityAttackResult | null {
    if (!this.attacking) return null;

    this.timer -= dt;
    if (this.timer <= 0) {
      this.attacking = false;
      return null;
    }

    // Radial field around Kirby
    const radius = 24;
    const hitbox: Rect = {
      x: physics.x - radius / 2,
      y: physics.y - radius / 2,
      width: physics.width + radius,
      height: physics.height + radius,
    };

    return {
      hitboxes: [hitbox],
      damage: 2,
      element: 'spark',
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
