export interface DinoBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DinoPhysicsOptions {
  groundY?: number;
  gravity?: number;
  jumpForce?: number;
  standWidth?: number;
  standHeight?: number;
  duckWidth?: number;
  duckHeight?: number;
}

export class DinoPhysics {
  public x: number = 80;
  public y: number;
  public vy: number = 0;
  public isGrounded: boolean = true;
  public isDucking: boolean = false;
  
  public readonly groundY: number;
  public readonly gravity: number;
  public readonly jumpForce: number;
  public readonly standWidth: number;
  public readonly standHeight: number;
  public readonly duckWidth: number;
  public readonly duckHeight: number;

  public runFrameTimer: number = 0;
  public runFrame: number = 0; // 0 or 1 for leg alternate
  public duckHoldTime: number = 0;

  constructor(options: DinoPhysicsOptions = {}) {
    this.groundY = options.groundY ?? 320;
    this.gravity = options.gravity ?? 1800;
    this.jumpForce = options.jumpForce ?? -620;
    this.standWidth = options.standWidth ?? 44;
    this.standHeight = options.standHeight ?? 52;
    this.duckWidth = options.duckWidth ?? 58;
    this.duckHeight = options.duckHeight ?? 30;

    this.y = this.groundY - this.standHeight;
  }

  public reset(): void {
    this.x = 80;
    this.isDucking = false;
    this.isGrounded = true;
    this.vy = 0;
    this.y = this.groundY - this.standHeight;
    this.runFrameTimer = 0;
    this.runFrame = 0;
    this.duckHoldTime = 0;
  }

  public jump(): boolean {
    if (this.isGrounded) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      this.isDucking = false;
      return true;
    }
    return false;
  }

  public duck(ducking: boolean): void {
    if (this.isGrounded) {
      this.isDucking = ducking;
    } else if (ducking && !this.isDucking) {
      // Fast drop in air
      this.vy += 600;
      this.isDucking = true;
    } else {
      this.isDucking = ducking;
    }
  }

  public update(dt: number, speedMultiplier: number = 1.0): void {
    if (!this.isGrounded) {
      this.vy += this.gravity * dt;
      this.y += this.vy * dt;

      const currentHeight = this.isDucking ? this.duckHeight : this.standHeight;
      if (this.y + currentHeight >= this.groundY) {
        this.y = this.groundY - currentHeight;
        this.vy = 0;
        this.isGrounded = true;
      }
    } else {
      const currentHeight = this.isDucking ? this.duckHeight : this.standHeight;
      this.y = this.groundY - currentHeight;

      // Animate paper legs when running
      this.runFrameTimer += dt * 10 * speedMultiplier;
      if (this.runFrameTimer >= 1) {
        this.runFrame = (this.runFrame + 1) % 2;
        this.runFrameTimer = 0;
      }
    }

    if (this.isDucking) {
      this.duckHoldTime += dt;
    } else {
      this.duckHoldTime = 0;
    }
  }

  public getBounds(): DinoBounds {
    if (this.isDucking) {
      // Duck hitbox: lower profile, slightly wider head forward
      return {
        x: this.x + 4,
        y: this.groundY - this.duckHeight + 4,
        width: this.duckWidth - 8,
        height: this.duckHeight - 4,
      };
    }

    // Standing hitbox: slightly inset to be forgiving
    return {
      x: this.x + 6,
      y: this.y + 4,
      width: this.standWidth - 10,
      height: this.standHeight - 6,
    };
  }
}
