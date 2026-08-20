export interface BirdConfig {
  x: number;
  size: number;
  runSpeed: number;
  feverSpeed: number;
  gravity: number;
  eggDuration: number;
  maxEggStack: number;
  eggCooldown: number;
}

export interface EggBlock {
  id: number;
  y: number; // Y position in world coordinates (top edge)
  size: number;
  lifeTime: number; // Seconds remaining before crumbling
  maxLifeTime: number; // Initial lifespan in seconds
}

export class BirdPhysics {
  public x: number;
  public y: number; // Bird top-left y coordinate
  public vy: number;
  public size: number;
  public config: BirdConfig;
  public eggs: EggBlock[];
  public onEggExpire?: (egg: EggBlock) => void;
  public eggCooldownTimer: number = 0;
  private nextEggId: number;

  constructor(customConfig: Partial<BirdConfig> = {}) {
    this.config = {
      x: 180,
      size: 36,
      runSpeed: 280,
      feverSpeed: 520,
      gravity: 1200,
      eggDuration: 2.2,
      maxEggStack: 7, // Limit maximum egg stack height to prevent soaring over entire course
      eggCooldown: 0.08, // Minimum interval between successive egg lays (anti-spam)
      ...customConfig
    };
    this.x = this.config.x;
    this.size = this.config.size;
    this.y = 0;
    this.vy = 0;
    this.eggs = [];
    this.eggCooldownTimer = 0;
    this.nextEggId = 1;
  }

  public reset(groundY: number): void {
    this.x = this.config.x;
    this.size = this.config.size;
    this.y = groundY - this.size;
    this.vy = 0;
    this.eggs = [];
    this.eggCooldownTimer = 0;
    this.nextEggId = 1;
  }

  /**
   * Can lay egg check (stack height limit, cooldown, ceiling clearance)
   */
  public canLayEgg(): boolean {
    if (this.eggCooldownTimer > 0) return false;
    if (this.eggs.length >= this.config.maxEggStack) return false;
    // Don't allow stacking beyond top ceiling (y <= 40)
    if (this.y - this.size < 40) return false;
    return true;
  }

  /**
   * Instantly lays an egg block under the bird.
   * Lifts bird and any existing stack upwards by block size.
   * The new block sits at the base of the bird (or bottom of stack).
   */
  public layEgg(customDuration?: number): EggBlock | null {
    if (!this.canLayEgg()) {
      return null;
    }

    this.eggCooldownTimer = this.config.eggCooldown;

    // Lift bird upward
    this.y -= this.size;
    this.vy = 0;

    // Shift existing eggs up
    for (const egg of this.eggs) {
      egg.y -= this.size;
    }

    const duration = Math.max(0.1, customDuration ?? this.config.eggDuration);

    // New egg placed directly beneath the bird / top of existing egg column
    const newEgg: EggBlock = {
      id: this.nextEggId++,
      y: this.y + this.size,
      size: this.size,
      lifeTime: duration,
      maxLifeTime: duration
    };
    this.eggs.unshift(newEgg);
    return newEgg;
  }

  /**
   * Remove bottom N eggs (e.g. when sliced or crashed into low obstacle)
   */
  public removeBottomEggs(count: number): EggBlock[] {
    if (count <= 0) return [];
    return this.eggs.splice(-count, count);
  }

  /**
   * Total height of stack including bird and eggs
   */
  public getTotalHeight(): number {
    return (1 + this.eggs.length) * this.size;
  }

  /**
   * Bottom Y coordinate of lowest egg or bird bottom if no eggs
   */
  public getBottomY(): number {
    return this.y + (1 + this.eggs.length) * this.size;
  }

  /**
   * Update bird falling physics onto ground or platform and decay egg block timers
   */
  public update(dt: number, groundY: number): void {
    if (this.eggCooldownTimer > 0) {
      this.eggCooldownTimer = Math.max(0, this.eggCooldownTimer - dt);
    }

    // 1. Decay egg block timers and handle expiration
    if (this.eggs.length > 0) {
      const survivingEggs: EggBlock[] = [];
      const expiredEggs: EggBlock[] = [];

      for (const egg of this.eggs) {
        egg.lifeTime -= dt;
        if (egg.lifeTime <= 0) {
          egg.lifeTime = 0;
          expiredEggs.push(egg);
        } else {
          survivingEggs.push(egg);
        }
      }

      if (expiredEggs.length > 0) {
        this.eggs = survivingEggs;
        // Re-align surviving eggs directly under bird before gravity step
        for (let i = 0; i < this.eggs.length; i++) {
          this.eggs[i].y = this.y + (1 + i) * this.size;
        }

        for (const exp of expiredEggs) {
          if (this.onEggExpire) {
            this.onEggExpire(exp);
          }
        }
      }
    }

    // 2. Resolve vertical gravity and ground collision
    const bottomY = this.getBottomY();

    if (bottomY < groundY) {
      this.vy += this.config.gravity * dt;
      const deltaY = this.vy * dt;
      const nextBottomY = bottomY + deltaY;

      if (nextBottomY >= groundY) {
        // Landed on ground
        const correction = groundY - bottomY;
        this.y += correction;
        for (let i = 0; i < this.eggs.length; i++) {
          this.eggs[i].y = this.y + (1 + i) * this.size;
        }
        this.vy = 0;
      } else {
        this.y += deltaY;
        for (let i = 0; i < this.eggs.length; i++) {
          this.eggs[i].y = this.y + (1 + i) * this.size;
        }
      }
    } else if (bottomY > groundY) {
      // Correct penetration
      const correction = groundY - bottomY;
      this.y += correction;
      for (let i = 0; i < this.eggs.length; i++) {
        this.eggs[i].y = this.y + (1 + i) * this.size;
      }
      this.vy = 0;
    } else {
      this.vy = 0;
      for (let i = 0; i < this.eggs.length; i++) {
        this.eggs[i].y = this.y + (1 + i) * this.size;
      }
    }
  }
}
