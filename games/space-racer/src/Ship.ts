export const RACER_LANES = [175, 325, 475, 625];

export interface ShipConfig {
  minX?: number;
  maxX?: number;
  initialX?: number;
  y?: number;
  width?: number;
  height?: number;
  maxSpeed?: number;
  acceleration?: number;
  friction?: number;
  maxShieldHp?: number;
}

export class Ship {
  public x: number;
  public y: number;
  public vx: number = 0;
  public targetX: number;
  public currentLane: number = 1;
  public width: number;
  public height: number;
  public minX: number;
  public maxX: number;

  public maxSpeed: number;
  public acceleration: number;
  public friction: number;

  public shieldHp: number;
  public maxShieldHp: number;
  public isInvulnerable: boolean = false;
  public invulnerabilityTimer: number = 0;
  public isBoosting: boolean = false;
  public boostTimer: number = 0;
  public tilt: number = 0; // -1.0 (left) to 1.0 (right)

  constructor(config: ShipConfig = {}) {
    this.minX = config.minX ?? 100;
    this.maxX = config.maxX ?? 700;
    this.x = config.initialX ?? 400;
    this.targetX = this.x;
    this.y = config.y ?? 520;
    this.width = config.width ?? 60;
    this.height = config.height ?? 40;
    this.maxSpeed = config.maxSpeed ?? 600;
    this.acceleration = config.acceleration ?? 2400;
    this.friction = config.friction ?? 8.0;
    this.maxShieldHp = config.maxShieldHp ?? 3;
    this.shieldHp = this.maxShieldHp;

    // Find closest initial lane
    this.initLaneFromX(this.x);
  }

  private initLaneFromX(x: number): void {
    let closestLane = 0;
    let minDiff = Infinity;
    for (let i = 0; i < RACER_LANES.length; i++) {
      const diff = Math.abs(RACER_LANES[i]! - x);
      if (diff < minDiff) {
        minDiff = diff;
        closestLane = i;
      }
    }
    this.currentLane = closestLane;
    this.targetX = RACER_LANES[this.currentLane]!;
  }

  public shiftLane(direction: -1 | 1): void {
    this.currentLane = Math.max(0, Math.min(RACER_LANES.length - 1, this.currentLane + direction));
    this.targetX = RACER_LANES[this.currentLane]!;
  }

  public setLane(laneIndex: number): void {
    this.currentLane = Math.max(0, Math.min(RACER_LANES.length - 1, laneIndex));
    this.targetX = RACER_LANES[this.currentLane]!;
  }

  public steer(dir: number, dt: number): void {
    if (dir !== 0) {
      this.shiftLane(dir > 0 ? 1 : -1);
    } else {
      const damp = Math.exp(-this.friction * dt);
      this.vx *= damp;
      if (Math.abs(this.vx) < 1.0) this.vx = 0;
    }
  }

  public setTargetX(targetX: number, dt: number): void {
    const clampedTarget = Math.max(this.minX, Math.min(this.maxX, targetX));
    this.targetX = clampedTarget;
    // Find matching lane
    this.initLaneFromX(clampedTarget);
  }

  public update(dt: number): void {
    // Smoothly glide to target lane X without overshooting
    const dx = this.targetX - this.x;
    if (Math.abs(dx) > 1.0) {
      const rawVx = dx * 14;
      this.vx = Math.sign(rawVx) * Math.min(this.maxSpeed, Math.abs(rawVx));
      this.x += this.vx * dt;
      if ((dx > 0 && this.x > this.targetX) || (dx < 0 && this.x < this.targetX)) {
        this.x = this.targetX;
        this.vx = 0;
      }
    } else {
      this.x = this.targetX;
      this.vx = 0;
    }
    this.clamp();

    // Tilt follows velocity
    this.tilt = Math.max(-1.0, Math.min(1.0, this.vx / this.maxSpeed));

    // Update invulnerability
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer -= dt;
      if (this.invulnerabilityTimer <= 0) {
        this.invulnerabilityTimer = 0;
        if (!this.isBoosting) {
          this.isInvulnerable = false;
        }
      }
    }

    // Update boost timer
    if (this.boostTimer > 0) {
      this.boostTimer -= dt;
      if (this.boostTimer <= 0) {
        this.boostTimer = 0;
        this.isBoosting = false;
        if (this.invulnerabilityTimer <= 0) {
          this.isInvulnerable = false;
        }
      }
    }
  }

  public takeDamage(amount: number = 1): boolean {
    if (this.isInvulnerable || this.isBoosting) {
      return false;
    }
    this.shieldHp = Math.max(0, this.shieldHp - amount);
    this.isInvulnerable = true;
    this.invulnerabilityTimer = 1.5;
    return true;
  }

  public activateBoost(duration: number = 3.0): void {
    this.isBoosting = true;
    this.boostTimer = duration;
    this.isInvulnerable = true;
  }

  public repairShield(amount: number = 1): void {
    this.shieldHp = Math.min(this.maxShieldHp, this.shieldHp + amount);
  }

  private clamp(): void {
    if (this.x < this.minX) {
      this.x = this.minX;
      this.vx = 0;
    } else if (this.x > this.maxX) {
      this.x = this.maxX;
      this.vx = 0;
    }
  }

  public reset(): void {
    this.currentLane = 1;
    this.targetX = RACER_LANES[this.currentLane]!;
    this.x = this.targetX;
    this.vx = 0;
    this.shieldHp = this.maxShieldHp;
    this.isInvulnerable = false;
    this.invulnerabilityTimer = 0;
    this.isBoosting = false;
    this.boostTimer = 0;
    this.tilt = 0;
  }
}
