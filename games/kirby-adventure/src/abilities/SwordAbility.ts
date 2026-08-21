import { CopyAbility, AbilityAttackResult } from './AbilityTypes';
import { AbilityType, Rect } from '../types';
import { KirbyPhysics } from '../KirbyPhysics';
import { ProjectileManager } from '../Projectile';

export class SwordAbility implements CopyAbility {
  readonly type: AbilityType = 'sword';
  readonly displayName = 'Sword';
  readonly hatColor = '#2E7D32';

  private attackTimer = 0;
  private comboStep = 1;
  private attacking = false;

  activate(physics: KirbyPhysics): void {
    if (this.attacking) {
      if (this.comboStep < 3 && this.attackTimer < 0.15) {
        this.comboStep += 1;
        this.attackTimer = 0.25;
      }
      return;
    }

    this.attacking = true;
    this.attackTimer = 0.25;
    this.comboStep = 1;
  }

  update(dt: number, physics: KirbyPhysics): AbilityAttackResult | null {
    if (!this.attacking) return null;

    this.attackTimer -= dt;
    if (this.attackTimer <= 0) {
      this.attacking = false;
      this.comboStep = 1;
      return null;
    }

    const reach = 22 + this.comboStep * 4;
    const hitbox: Rect = {
      x: physics.facing === 1 ? physics.x + physics.width : physics.x - reach,
      y: physics.y - 2,
      width: reach,
      height: physics.height + 4,
    };

    return {
      hitboxes: [hitbox],
      damage: 1 + this.comboStep,
      knockbackDir: physics.facing,
      element: 'sword',
    };
  }

  isAttacking(): boolean {
    return this.attacking;
  }

  cancel(): void {
    this.attacking = false;
    this.comboStep = 1;
    this.attackTimer = 0;
  }

  dispose(): void {
    this.cancel();
  }
}
