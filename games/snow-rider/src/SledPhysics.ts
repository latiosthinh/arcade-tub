export interface SledPhysicsOptions {
  trackWidth?: number;
  gravity?: number;
  jumpForce?: number;
  steerSpeed?: number;
}

export class SledPhysics {
  // Lateral position on the slope (-1 to 1)
  public x: number = 0;
  // Jump / Height above ground
  public y: number = 0;
  public vy: number = 0;
  public isGrounded: boolean = true;
  
  // Steering velocity
  public steerX: number = 0;
  public tilt: number = 0;

  public readonly gravity: number;
  public readonly jumpForce: number;
  public readonly steerSpeed: number;

  constructor(options: SledPhysicsOptions = {}) {
    this.gravity = options.gravity ?? 1200;
    this.jumpForce = options.jumpForce ?? 480;
    this.steerSpeed = options.steerSpeed ?? 2.4;
  }

  public reset(): void {
    this.x = 0;
    this.y = 0;
    this.vy = 0;
    this.isGrounded = true;
    this.steerX = 0;
    this.tilt = 0;
  }

  public steer(direction: number): void {
    // direction: -1 (left), 1 (right), 0 (neutral)
    this.steerX = Math.max(-1, Math.min(1, direction));
  }

  public jump(): boolean {
    if (this.isGrounded) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      return true;
    }
    return false;
  }

  public update(dt: number): void {
    // Lateral steering
    this.x += this.steerX * this.steerSpeed * dt;
    // Clamp to track bounds with paper boundary recoil
    if (this.x < -0.92) {
      this.x = -0.92;
    } else if (this.x > 0.92) {
      this.x = 0.92;
    }

    // Dynamic tilt based on steering direction
    const targetTilt = this.steerX * 0.25;
    this.tilt += (targetTilt - this.tilt) * Math.min(1, dt * 10);

    // Jump physics
    if (!this.isGrounded) {
      this.vy -= this.gravity * dt;
      this.y += this.vy * dt;

      if (this.y <= 0) {
        this.y = 0;
        this.vy = 0;
        this.isGrounded = true;
      }
    }
  }
}
