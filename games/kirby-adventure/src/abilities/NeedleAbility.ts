import { CopyAbility, AbilityAttackResult } from './AbilityTypes';
import { AbilityType, Rect } from '../types';
import { KirbyPhysics } from '../KirbyPhysics';

export class NeedleAbility implements CopyAbility {
  readonly type: AbilityType = 'needle';
  readonly displayName = 'Needle';
  readonly hatColor = '#FFD600';

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

    // Stationary quill burst
    physics.vx = 0;
    const spikeReach = 12;
    const hitbox: Rect = {
      x: physics.x - spikeReach,
      y: physics.y - spikeReach,
      width: physics.width + spikeReach * 2,
      height: physics.height + spikeReach * 2,
    };

    return {
      hitboxes: [hitbox],
      damage: 2,
      element: 'needle',
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
