export interface BirdConfig {
  x: number;
  size: number;
  runSpeed: number;
  feverSpeed: number;
  gravity: number;
}

export interface EggBlock {
  id: number;
  y: number; // Y position in world coordinates (top edge)
  size: number;
}

export class BirdPhysics {
  public x: number;
  public y: number; // Bird top-left y coordinate
  public vy: number;
  public size: number;
  public config: BirdConfig;
  public eggs: EggBlock[];
  private nextEggId: number;

  constructor(customConfig: Partial<BirdConfig> = {}) {
    this.config = {
      x: 180,
      size: 36,
      runSpeed: 280,
      feverSpeed: 520,
      gravity: 1200,
      ...customConfig
    };
    this.x = this.config.x;
    this.size = this.config.size;
    this.y = 0;
    this.vy = 0;
    this.eggs = [];
    this.nextEggId = 1;
  }

  public reset(groundY: number): void {
    this.x = this.config.x;
    this.size = this.config.size;
    this.y = groundY - this.size;
    this.vy = 0;
    this.eggs = [];
    this.nextEggId = 1;
  }

  /**
   * Instantly lays an egg block under the bird.
   * Lifts bird and any existing stack upwards by block size.
   * The new block sits at the base of the bird (or bottom of stack).
   */
  public layEgg(): EggBlock {
    // Lift bird upward
    this.y -= this.size;
    this.vy = 0;

    // Shift existing eggs up
    for (const egg of this.eggs) {
      egg.y -= this.size;
    }

    // New egg placed directly beneath the bird / top of existing egg column
    const newEgg: EggBlock = {
      id: this.nextEggId++,
      y: this.y + this.size,
      size: this.size
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
   * Update bird falling physics onto ground or platform
   */
  public update(dt: number, groundY: number): void {
    const bottomY = this.getBottomY();

    if (bottomY < groundY) {
      this.vy += this.config.gravity * dt;
      const deltaY = this.vy * dt;
      const nextBottomY = bottomY + deltaY;

      if (nextBottomY >= groundY) {
        // Landed on ground
        const correction = groundY - bottomY;
        this.y += correction;
        for (const egg of this.eggs) {
          egg.y += correction;
        }
        this.vy = 0;
      } else {
        this.y += deltaY;
        for (const egg of this.eggs) {
          egg.y += deltaY;
        }
      }
    } else if (bottomY > groundY) {
      // Correct penetration
      const correction = groundY - bottomY;
      this.y += correction;
      for (const egg of this.eggs) {
        egg.y += correction;
      }
      this.vy = 0;
    } else {
      this.vy = 0;
    }
  }
}
