import { Ball } from './Ball';

export interface Hoop {
  x: number;
  y: number;
  width: number;
  isRightSide: boolean;
  baseY: number;
  moveSpeed: number;
  movePhase: number;
  scored: boolean;
}

export class HoopManager {
  public currentHoop: Hoop;
  public hoopWidth: number = 80;
  public shotTimeRemaining: number = 6.0;
  public maxShotTime: number = 6.0;
  public hoopScoreCount: number = 0;
  private touchedRim: boolean = false;

  constructor(canvasWidth: number = 800) {
    this.currentHoop = this.createHoop(true, canvasWidth);
  }

  public createHoop(isRight: boolean, canvasWidth: number): Hoop {
    const margin = 110;
    const x = isRight ? canvasWidth - margin : margin;
    const y = 200 + Math.random() * 200;
    const moveSpeed = this.hoopScoreCount >= 3 ? 30 + Math.min(60, this.hoopScoreCount * 6) : 0;
    this.touchedRim = false;

    return {
      x,
      y,
      width: this.hoopWidth,
      isRightSide: isRight,
      baseY: y,
      moveSpeed,
      movePhase: Math.random() * Math.PI * 2,
      scored: false,
    };
  }

  public update(dt: number, canvasWidth: number): { timeout: boolean } {
    this.shotTimeRemaining -= dt;
    if (this.shotTimeRemaining <= 0) {
      this.shotTimeRemaining = 0;
      return { timeout: true };
    }

    // Moving hoop vertical oscillation
    if (this.currentHoop.moveSpeed > 0) {
      this.currentHoop.movePhase += dt * (this.currentHoop.moveSpeed / 20);
      this.currentHoop.y = this.currentHoop.baseY + Math.sin(this.currentHoop.movePhase) * 45;
    }

    return { timeout: false };
  }

  public checkScore(ball: Ball, canvasWidth: number): { scored: boolean; isSwish: boolean } {
    if (this.currentHoop.scored) return { scored: false, isSwish: false };

    const hoopLeft = this.currentHoop.x - this.currentHoop.width / 2;
    const hoopRight = this.currentHoop.x + this.currentHoop.width / 2;
    const hoopY = this.currentHoop.y;

    // Rim collision left/right peg bounce
    const distLeft = Math.hypot(ball.x - hoopLeft, ball.y - hoopY);
    const distRight = Math.hypot(ball.x - hoopRight, ball.y - hoopY);

    if (distLeft < ball.radius + 6) {
      this.touchedRim = true;
      ball.vx = -ball.vx * 0.7;
      ball.vy = -ball.vy * 0.6;
    }
    if (distRight < ball.radius + 6) {
      this.touchedRim = true;
      ball.vx = -ball.vx * 0.7;
      ball.vy = -ball.vy * 0.6;
    }

    // Ball passing downwards through the net center
    if (
      ball.x > hoopLeft + 4 &&
      ball.x < hoopRight - 4 &&
      ball.y >= hoopY - 8 &&
      ball.y <= hoopY + 20 &&
      ball.vy > 0
    ) {
      this.currentHoop.scored = true;
      this.hoopScoreCount++;
      const isSwish = !this.touchedRim;

      // Spawn next hoop on opposite side with refreshed timer
      const nextRight = !this.currentHoop.isRightSide;
      this.maxShotTime = Math.max(3.0, 6.0 - Math.min(2.5, this.hoopScoreCount * 0.15));
      this.shotTimeRemaining = this.maxShotTime;
      this.currentHoop = this.createHoop(nextRight, canvasWidth);

      return { scored: true, isSwish };
    }

    return { scored: false, isSwish: false };
  }

  public reset(canvasWidth: number = 800): void {
    this.hoopScoreCount = 0;
    this.maxShotTime = 6.0;
    this.shotTimeRemaining = 6.0;
    this.currentHoop = this.createHoop(true, canvasWidth);
  }
}
