import { Rect } from '../types';

export interface BossAttackResult {
  hitboxes: Rect[];
  damage: number;
  spawnProjectiles?: Array<{
    type: 'apple' | 'lightning' | 'shockwave' | 'air_bullet';
    x: number;
    y: number;
    vx: number;
    vy: number;
  }>;
}

export abstract class BossBase {
  abstract readonly name: string;
  abstract readonly maxHp: number;

  hp: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isDefeated = false;
  isInvulnerable = false;
  iframeTimer = 0;
  phase = 1;

  constructor(x: number, y: number, width: number, height: number, maxHp: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.maxHp = maxHp;
    this.hp = maxHp;
  }

  getBounds(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  takeDamage(amount = 1): boolean {
    if (this.isInvulnerable || this.isDefeated || this.iframeTimer > 0) {
      return false;
    }

    this.hp = Math.max(0, this.hp - amount);
    this.iframeTimer = 0.5; // 500ms i-frames

    if (this.hp <= this.maxHp / 2) {
      this.phase = 2;
    }

    if (this.hp <= 0) {
      this.isDefeated = true;
      return true; // Defeated
    }

    return true;
  }

  abstract update(dt: number, playerBounds: Rect): BossAttackResult | null;
}
