import { CopyAbility, AbilityAttackResult } from './AbilityTypes';
import { AbilityType } from '../types';
import { KirbyPhysics } from '../KirbyPhysics';
import { ProjectileManager } from '../Projectile';

export class CutterAbility implements CopyAbility {
  readonly type: AbilityType = 'cutter';
  readonly displayName = 'Cutter';
  readonly hatColor = '#E91E63';

  private attacking = false;
  private timer = 0;

  activate(physics: KirbyPhysics, projectiles: ProjectileManager): void {
    if (this.attacking) return;
    this.attacking = true;
    this.timer = 0.2;

    const spawnX = physics.facing === 1 ? physics.x + physics.width : physics.x - 12;
    const spawnY = physics.y + (physics.height - 12) / 2;
    projectiles.spawnCutter(spawnX, spawnY, physics.facing);
  }

  update(dt: number): AbilityAttackResult | null {
    if (!this.attacking) return null;
    this.timer -= dt;
    if (this.timer <= 0) {
      this.attacking = false;
    }
    return null;
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
