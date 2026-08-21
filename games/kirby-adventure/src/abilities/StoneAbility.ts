import { CopyAbility, AbilityAttackResult } from './AbilityTypes';
import { AbilityType, Rect } from '../types';
import { KirbyPhysics } from '../KirbyPhysics';

export class StoneAbility implements CopyAbility {
  readonly type: AbilityType = 'stone';
  readonly displayName = 'Stone';
  readonly hatColor = '#795548';

  private isStone = false;
  private landed = false;

  activate(physics: KirbyPhysics): void {
    if (this.isStone) {
      // Revert stone
      this.isStone = false;
      this.landed = false;
      return;
    }

    this.isStone = true;
    this.landed = false;
    physics.vy = 400; // Slam downward
  }

  update(dt: number, physics: KirbyPhysics): AbilityAttackResult | null {
    if (!this.isStone) return null;

    physics.vx = 0; // Stationary while stone

    if (physics.grounded && !this.landed) {
      this.landed = true;
      // Area shockwave on landing
      const shockwave: Rect = {
        x: physics.x - 20,
        y: physics.y,
        width: physics.width + 40,
        height: physics.height,
      };

      return {
        hitboxes: [shockwave],
        damage: 4,
        isInvulnerable: true,
        element: 'stone',
      };
    }

    return {
      hitboxes: [physics.getBounds()],
      damage: 3,
      isInvulnerable: true,
      element: 'stone',
    };
  }

  isAttacking(): boolean {
    return this.isStone;
  }

  cancel(): void {
    this.isStone = false;
    this.landed = false;
  }

  dispose(): void {
    this.cancel();
  }
}
