import { AbilityType, Direction, Rect } from '../types';
import { KirbyPhysics } from '../KirbyPhysics';
import { ProjectileManager } from '../Projectile';

export interface AbilityAttackResult {
  hitboxes: Rect[];
  damage: number;
  isInvulnerable?: boolean;
  knockbackDir?: Direction;
  element?: AbilityType;
}

export interface CopyAbility {
  readonly type: AbilityType;
  readonly displayName: string;
  readonly hatColor: string;

  activate(physics: KirbyPhysics, projectiles: ProjectileManager): void;
  update(dt: number, physics: KirbyPhysics, projectiles: ProjectileManager): AbilityAttackResult | null;
  isAttacking(): boolean;
  cancel(): void;
  dispose(): void;
}
