import { CopyAbility, AbilityAttackResult } from './AbilityTypes';
import { AbilityType, Rect } from '../types';
import { KirbyPhysics } from '../KirbyPhysics';

export class BeamAbility implements CopyAbility {
  readonly type: AbilityType = 'beam';
  readonly displayName = 'Beam';
  readonly hatColor = '#FBC02D';

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

    // Sweeping beam whip arc
    const progress = 1 - this.timer / 0.3;
    const arcAngle = (progress - 0.5) * Math.PI; // -90 deg to +90 deg
    const radius = 34;

    const targetX = (physics.facing === 1 ? physics.x + physics.width : physics.x) + Math.cos(arcAngle) * radius * physics.facing;
    const targetY = physics.y + physics.height / 2 + Math.sin(arcAngle) * radius;

    const hitbox: Rect = {
      x: Math.min(physics.x, targetX) - 4,
      y: Math.min(physics.y, targetY) - 4,
      width: Math.abs(targetX - physics.x) + 8,
      height: Math.abs(targetY - physics.y) + 8,
    };

    return {
      hitboxes: [hitbox],
      damage: 2,
      knockbackDir: physics.facing,
      element: 'beam',
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
