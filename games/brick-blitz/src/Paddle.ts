import { Ball } from './Ball.js';

export class Paddle {
  public x: number = 350;
  public y: number = 550;
  public width: number = 100;
  public height: number = 16;
  public speed: number = 500;
  public boundsWidth: number = 800;

  constructor(
    x: number = 350,
    y: number = 550,
    width: number = 100,
    height: number = 16,
    speed: number = 500,
    boundsWidth: number = 800
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.boundsWidth = boundsWidth;
  }

  public moveLeft(dt: number): void {
    this.x = Math.max(0, this.x - this.speed * dt);
  }

  public moveRight(dt: number): void {
    this.x = Math.min(this.boundsWidth - this.width, this.x + this.speed * dt);
  }

  public setPositionX(centerX: number): void {
    this.x = Math.max(0, Math.min(this.boundsWidth - this.width, centerX - this.width / 2));
  }

  public checkBallBounce(ball: Ball): boolean {
    if (ball.vy <= 0) {
      return false;
    }

    const ballBottom = ball.y + ball.radius;
    const ballTop = ball.y - ball.radius;
    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;

    const paddleTop = this.y;
    const paddleBottom = this.y + this.height;
    const paddleLeft = this.x;
    const paddleRight = this.x + this.width;

    const overlapsX = ballRight >= paddleLeft && ballLeft <= paddleRight;
    const overlapsY = ballBottom >= paddleTop && ballTop <= paddleBottom;

    if (overlapsX && overlapsY) {
      const hitOffset = (ball.x - (this.x + this.width / 2)) / (this.width / 2);
      const clampedOffset = Math.max(-1, Math.min(1, hitOffset));
      const maxAngle = Math.PI / 3; // 60 degrees
      const bounceAngle = clampedOffset * maxAngle;

      const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) || ball.speed;
      ball.vx = currentSpeed * Math.sin(bounceAngle);
      ball.vy = -Math.abs(currentSpeed * Math.cos(bounceAngle));
      ball.y = this.y - ball.radius;
      return true;
    }

    return false;
  }
}
