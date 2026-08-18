export interface CarState {
  x: number;
  y: number;
  z: number;
  direction: 'X' | 'Y';
  speed: number;
  rotationAngle: number;
  isJumping: boolean;
  isFalling: boolean;
  verticalVelocity: number;
}

export class CarPhysics {
  private x = 0;
  private y = 0;
  private z = 0;
  private direction: 'X' | 'Y' = 'X';
  private speed = 4.0;
  private baseSpeed = 4.0;
  private maxSpeed = 7.5;
  private rotationAngle = 0; // 0 = facing X, PI/2 = facing Y
  private targetAngle = 0;
  private isJumping = false;
  private isFalling = false;
  private verticalVelocity = 0;
  private gravity = -18.0;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.direction = 'X';
    this.speed = this.baseSpeed;
    this.rotationAngle = 0;
    this.targetAngle = 0;
    this.isJumping = false;
    this.isFalling = false;
    this.verticalVelocity = 0;
  }

  public launchJump(power = 6.0): void {
    this.isJumping = true;
    this.verticalVelocity = power;
  }

  public startFalling(): void {
    this.isFalling = true;
  }

  public update(dt: number, isTurningRight: boolean): void {
    if (this.isFalling) {
      this.verticalVelocity += this.gravity * dt;
      this.z += this.verticalVelocity * dt;
      return;
    }

    // Steering: holding Space / pointer turns right (Direction X), releasing turns left (Direction Y)
    this.direction = isTurningRight ? 'X' : 'Y';
    this.targetAngle = this.direction === 'X' ? 0 : Math.PI / 2;

    // Smooth angle interpolation
    const rotSpeed = 15.0;
    this.rotationAngle += (this.targetAngle - this.rotationAngle) * Math.min(1, rotSpeed * dt);

    // Speed progression over time
    if (this.speed < this.maxSpeed) {
      this.speed += 0.03 * dt;
    }

    // Move forward in current direction
    if (this.direction === 'X') {
      this.x += this.speed * dt;
    } else {
      this.y += this.speed * dt;
    }

    // Jump handling
    if (this.isJumping) {
      this.verticalVelocity += this.gravity * dt;
      this.z += this.verticalVelocity * dt;
      if (this.z <= 0) {
        this.z = 0;
        this.isJumping = false;
        this.verticalVelocity = 0;
      }
    }
  }

  public getState(): CarState {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      direction: this.direction,
      speed: this.speed,
      rotationAngle: this.rotationAngle,
      isJumping: this.isJumping,
      isFalling: this.isFalling,
      verticalVelocity: this.verticalVelocity
    };
  }
}
