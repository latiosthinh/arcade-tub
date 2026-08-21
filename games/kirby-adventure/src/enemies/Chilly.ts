import { EnemyBase, EnemyAttackResult } from './EnemyBase';
import { AbilityType, EnemyType, Rect } from '../types';

export class Chilly extends EnemyBase {
  readonly type: EnemyType = 'chilly';
  readonly abilityGrant: AbilityType | null = 'ice';

  private auraTimer = 0;
  private auraRadius = 24;

  update(dt: number): EnemyAttackResult | null {
    if (this.isDead || this.isBeingInhaled) return null;

    this.auraTimer += dt;
    // Pulsing aura radius
    const currentRadius = this.auraRadius + Math.sin(this.auraTimer * 4) * 4;

    const hitbox: Rect = {
      x: this.x - currentRadius / 2,
      y: this.y - currentRadius / 2,
      width: this.width + currentRadius,
      height: this.height + currentRadius,
    };

    return {
      hitboxes: [hitbox],
      damage: 1,
    };
  }
}
