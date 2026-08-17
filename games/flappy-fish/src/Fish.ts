export interface FishConfig {
  x?: number;
  y?: number;
  radius?: number;
  width?: number;
  height?: number;
  gravity?: number;
  drag?: number;
  flapImpulse?: number;
  maxFallSpeed?: number;
  maxRiseSpeed?: number;
}

export class Fish {
  x: number;
  y: number;
  vy: number;
  radius: number;
  width: number;
  height: number;
  rotation: number;
  gravity: number;
  drag: number;
  flapImpulse: number;
  maxFallSpeed: number;
  maxRiseSpeed: number;
  finPhase: number;

  constructor(config: FishConfig = {}) {
    this.x = config.x ?? 160;
    this.y = config.y ?? 300;
    this.vy = 0;
    this.radius = config.radius ?? 18;
    this.width = config.width ?? 44;
    this.height = config.height ?? 32;
    this.rotation = 0;
    this.gravity = config.gravity ?? 980;
    this.drag = config.drag ?? 0.98;
    this.flapImpulse = config.flapImpulse ?? -380;
    this.maxFallSpeed = config.maxFallSpeed ?? 600;
    this.maxRiseSpeed = config.maxRiseSpeed ?? -450;
    this.finPhase = 0;
  }

  flap(): void {
    this.vy = Math.max(this.flapImpulse, this.maxRiseSpeed);
  }

  update(dt: number): void {
    if (dt <= 0) return;

    // Apply gravity
    this.vy += this.gravity * dt;

    // Apply water drag damping
    this.vy *= Math.pow(this.drag, dt * 60);

    // Clamp velocities (T-18-01: prevent infinite acceleration / NaN)
    if (this.vy > this.maxFallSpeed) {
      this.vy = this.maxFallSpeed;
    } else if (this.vy < this.maxRiseSpeed) {
      this.vy = this.maxRiseSpeed;
    }

    // Integrate position
    this.y += this.vy * dt;

    // Calculate pitch angle: -0.45 rad (up ~ -25 deg) to +1.1 rad (down ~ +63 deg)
    const targetAngle = this.vy < 0
      ? (this.vy / Math.abs(this.maxRiseSpeed)) * 0.45
      : (this.vy / this.maxFallSpeed) * 1.1;

    // Smooth rotation interpolation
    this.rotation += (targetAngle - this.rotation) * Math.min(1, dt * 10);

    // Advance fin oscillation
    this.finPhase += dt * (8 + Math.abs(this.vy) * 0.02);
  }

  checkBounds(minY: number, maxY: number): 'top' | 'bottom' | null {
    if (this.y - this.radius <= minY) {
      return 'top';
    }
    if (this.y + this.radius >= maxY) {
      return 'bottom';
    }
    return null;
  }

  reset(startX: number, startY: number): void {
    this.x = startX;
    this.y = startY;
    this.vy = 0;
    this.rotation = 0;
    this.finPhase = 0;
  }
}
