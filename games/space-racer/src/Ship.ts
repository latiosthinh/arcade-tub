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
    this.y = config.y ?? 520;
    this.width = config.width ?? 60;
    this.height = config.height ?? 40;
    this.maxSpeed = config.maxSpeed ?? 600;
    this.acceleration = config.acceleration ?? 2400;
    this.friction = config.friction ?? 8.0;
    this.maxShieldHp = config.maxShieldHp ?? 3;
    this.shieldHp = this.maxShieldHp;
  }

  public steer(dir: number, dt: number): void {
    if (dir !== 0) {
      this.vx += dir * this.acceleration * dt;
      this.vx = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.vx));
    } else {
      // Apply friction damping
      const damp = Math.exp(-this.friction * dt);
      this.vx *= damp;
      if (Math.abs(this.vx) < 1.0) this.vx = 0;
    }
    this.tilt = Math.max(-1.0, Math.min(1.0, this.vx / this.maxSpeed));
  }

  public setTargetX(targetX: number, dt: number): void {
    const clampedTarget = Math.max(this.minX, Math.min(this.maxX, targetX));
    const dx = clampedTarget - this.x;
    const speed = Math.min(Math.abs(dx) * 12, this.maxSpeed);
    this.vx = Math.sign(dx) * speed;
    this.x += this.vx * dt;
    this.clamp();
    this.tilt = Math.max(-1.0, Math.min(1.0, this.vx / (this.maxSpeed * 0.7)));
  }

  public update(dt: number): void {
    this.x += this.vx * dt;
    this.clamp();

    // Tilt follows normalized velocity
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
    this.x = (this.minX + this.maxX) / 2;
    this.vx = 0;
    this.shieldHp = this.maxShieldHp;
    this.isInvulnerable = false;
    this.invulnerabilityTimer = 0;
    this.isBoosting = false;
    this.boostTimer = 0;
    this.tilt = 0;
  }
}
