export class Ball {
  public x: number;
  public y: number;
  public vx: number = 0;
  public vy: number = 0;
  public radius: number = 18;
  public rotation: number = 0;
  public vRot: number = 0;

  public static readonly GRAVITY = 1100;
  public static readonly JUMP_IMPULSE_Y = -420;
  public static readonly JUMP_IMPULSE_X = 140;

  constructor(startX: number = 200, startY: number = 300) {
    this.x = startX;
    this.y = startY;
  }

  public flap(directionTowardsRight: boolean = true): void {
    this.vy = Ball.JUMP_IMPULSE_Y;
    this.vx = (directionTowardsRight ? 1 : -1) * Ball.JUMP_IMPULSE_X;
    this.vRot = (directionTowardsRight ? 1 : -1) * 8;
  }

  public update(dt: number, canvasWidth: number, canvasHeight: number): { hitFloor: boolean } {
    this.vy += Ball.GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.vRot * dt;

    // Wall bounce
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = Math.abs(this.vx) * 0.65;
      this.vRot = -this.vRot * 0.5;
    } else if (this.x + this.radius > canvasWidth) {
      this.x = canvasWidth - this.radius;
      this.vx = -Math.abs(this.vx) * 0.65;
      this.vRot = -this.vRot * 0.5;
    }

    // Floor check (death if ball hits bottom)
    if (this.y + this.radius >= canvasHeight) {
      return { hitFloor: true };
    }

    return { hitFloor: false };
  }

  public reset(x: number = 200, y: number = 300): void {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0;
    this.vRot = 0;
  }
}
