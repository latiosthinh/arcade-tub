export interface DropletConfig {
  gravity: number;
  bounceImpulse: number;
  maxFallVelocity: number;
  fireVelocityThreshold: number; // velocity or consecutive tiers to trigger fireball mode
  radius: number;
}

export class DropletPhysics {
  public y: number; // vertical position in tower world coordinates
  public vy: number; // vertical velocity (positive = downward)
  public config: DropletConfig;
  public isFireball: boolean;
  public comboStreak: number;
  public continuousFallDistance: number;

  constructor(config: Partial<DropletConfig> = {}) {
    this.config = {
      gravity: config.gravity ?? 1400,
      bounceImpulse: config.bounceImpulse ?? -480,
      maxFallVelocity: config.maxFallVelocity ?? 1100,
      fireVelocityThreshold: config.fireVelocityThreshold ?? 700,
      radius: config.radius ?? 12
    };

    this.y = 0;
    this.vy = 0;
    this.isFireball = false;
    this.comboStreak = 0;
    this.continuousFallDistance = 0;
  }

  public reset(startY: number = 0): void {
    this.y = startY;
    this.vy = 0;
    this.isFireball = false;
    this.comboStreak = 0;
    this.continuousFallDistance = 0;
  }

  public update(dt: number): void {
    // Gravity application
    this.vy += this.config.gravity * dt;
    if (this.vy > this.config.maxFallVelocity) {
      this.vy = this.config.maxFallVelocity;
    }

    const prevY = this.y;
    this.y += this.vy * dt;

    if (this.vy > 0) {
      this.continuousFallDistance += (this.y - prevY);
    }

    // Check fireball condition (high speed or combo streak >= 3)
    if (this.vy >= this.config.fireVelocityThreshold || this.comboStreak >= 3) {
      this.isFireball = true;
    }
  }

  public bounce(tierY: number): void {
    this.y = tierY - this.config.radius;
    this.vy = this.config.bounceImpulse;
    this.isFireball = false;
    this.comboStreak = 0;
    this.continuousFallDistance = 0;
  }

  public registerTierPass(): void {
    this.comboStreak++;
    if (this.comboStreak >= 3) {
      this.isFireball = true;
    }
  }
}
