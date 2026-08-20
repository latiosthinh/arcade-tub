import { LawnGrid } from './LawnGrid';

export interface MowerConfig {
  maxSpeed: number;
  acceleration: number;
  friction: number;
  turnSpeed: number;
  deckOffset: number;
  deckRadius: number;
  bodyRadius: number;
}

export const DEFAULT_MOWER_CONFIG: MowerConfig = {
  maxSpeed: 160,
  acceleration: 400,
  friction: 4.0,
  turnSpeed: 8.0,
  deckOffset: 14,
  deckRadius: 18,
  bodyRadius: 12,
};

export class MowerVehicle {
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public speed: number = 0;
  public heading: number = 0; // radians (0 = facing right)
  public bladeRotation: number = 0;
  public config: MowerConfig;

  constructor(startX: number, startY: number, config: Partial<MowerConfig> = {}) {
    this.x = startX;
    this.y = startY;
    this.config = { ...DEFAULT_MOWER_CONFIG, ...config };
  }

  public update(inputVector: { x: number; y: number }, dt: number, grid: LawnGrid): void {
    const inputLen = Math.hypot(inputVector.x, inputVector.y);

    if (inputLen > 0.05) {
      const normX = inputVector.x / inputLen;
      const normY = inputVector.y / inputLen;
      const targetHeading = Math.atan2(normY, normX);

      // Smooth turning towards target heading
      let angleDiff = targetHeading - this.heading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      this.heading += angleDiff * Math.min(1.0, this.config.turnSpeed * dt);

      // Accelerate forward
      const targetSpeed = this.config.maxSpeed * Math.min(1.0, inputLen);
      this.speed += this.config.acceleration * dt;
      if (this.speed > targetSpeed) this.speed = targetSpeed;
    } else {
      // Apply friction
      this.speed = Math.max(0, this.speed - this.speed * this.config.friction * dt);
    }

    // Velocity vector
    this.vx = Math.cos(this.heading) * this.speed;
    this.vy = Math.sin(this.heading) * this.speed;

    // Tentative new position
    const nextX = this.x + this.vx * dt;
    const nextY = this.y + this.vy * dt;

    // Collision check against grid bounds and obstacles
    const radius = this.config.bodyRadius;

    // Check X axis
    if (!grid.isObstacle(nextX + (this.vx > 0 ? radius : -radius), this.y)) {
      this.x = nextX;
    } else {
      this.vx = 0;
      this.speed *= 0.5;
    }

    // Check Y axis
    if (!grid.isObstacle(this.x, nextY + (this.vy > 0 ? radius : -radius))) {
      this.y = nextY;
    } else {
      this.vy = 0;
      this.speed *= 0.5;
    }

    // Clamp inside world bounds
    const minX = grid.cellSize + radius;
    const maxX = (grid.cols - 1) * grid.cellSize - radius;
    const minY = grid.cellSize + radius;
    const maxY = (grid.rows - 1) * grid.cellSize - radius;

    this.x = Math.max(minX, Math.min(maxX, this.x));
    this.y = Math.max(minY, Math.min(maxY, this.y));

    // Spin mower cutting blades
    const spinRate = this.speed > 5 ? 25.0 : 8.0;
    this.bladeRotation = (this.bladeRotation + spinRate * dt) % (Math.PI * 2);
  }

  public getCuttingDeck(): { deckX: number; deckY: number; radius: number } {
    const deckX = this.x + Math.cos(this.heading) * this.config.deckOffset;
    const deckY = this.y + Math.sin(this.heading) * this.config.deckOffset;
    return { deckX, deckY, radius: this.config.deckRadius };
  }
}
