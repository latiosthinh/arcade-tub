export interface TrailPoint {
  x: number;
  y: number;
}

export interface WallCollisionResult {
  bounced: boolean;
  lost: boolean;
}

export class Ball {
  public x: number = 0;
  public y: number = 0;
  public vx: number = 0;
  public vy: number = 0;
  public radius: number = 7;
  public speed: number = 380;
  public launched: boolean = false;
  public trail: TrailPoint[] = [];
  public maxTrailLength: number = 8;

  constructor(radius: number = 7, speed: number = 380) {
    this.radius = radius;
    this.speed = speed;
  }

  public reset(paddleX: number, paddleWidth: number, paddleY: number): void {
    this.x = paddleX + paddleWidth / 2;
    this.y = paddleY - this.radius;
    this.vx = 0;
    this.vy = 0;
    this.launched = false;
    this.trail = [];
  }

  public launch(angle: number = 0, speed: number = 380): void {
    // Clamp launch angle [-PI/4, PI/4]
    const clampedAngle = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, angle));
    this.speed = speed;
    this.vx = speed * Math.sin(clampedAngle);
    this.vy = -speed * Math.cos(clampedAngle);
    this.launched = true;
  }

  public update(
    dt: number,
    paddleX?: number,
    paddleWidth?: number,
    paddleY?: number
  ): void {
    if (!this.launched) {
      if (paddleX !== undefined && paddleWidth !== undefined && paddleY !== undefined) {
        this.x = paddleX + paddleWidth / 2;
        this.y = paddleY - this.radius;
      }
      return;
    }

    // T-03-01 mitigate: cap delta time to 0.05s to prevent tunneling
    const cappedDt = Math.min(dt, 0.05);

    this.trail.unshift({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.pop();
    }

    this.x += this.vx * cappedDt;
    this.y += this.vy * cappedDt;
  }

  public checkWallCollisions(width: number = 800, height: number = 600): WallCollisionResult {
    let bounced = false;

    // Left wall
    if (this.x - this.radius <= 0) {
      this.x = this.radius;
      this.vx = Math.abs(this.vx);
      bounced = true;
    } else if (this.x + this.radius >= width) {
      // Right wall
      this.x = width - this.radius;
      this.vx = -Math.abs(this.vx);
      bounced = true;
    }

    // Top wall
    if (this.y - this.radius <= 0) {
      this.y = this.radius;
      this.vy = Math.abs(this.vy);
      bounced = true;
    }

    // Bottom loss
    if (this.y - this.radius >= height) {
      return { bounced: false, lost: true };
    }

    return { bounced, lost: false };
  }
}
