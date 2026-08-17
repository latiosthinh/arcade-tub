import { Balloon, BalloonType } from './Balloon';

export interface PopResult {
  balloon: Balloon;
  pointsAwarded: number;
  streak: number;
  multiplier: number;
  isBomb: boolean;
  isRainbow: boolean;
}

export interface PopEngineConfig {
  comboWindow?: number;
  maxMultiplier?: number;
}

export class PopEngine {
  private comboWindow: number;
  private maxMultiplier: number;

  private streak = 0;
  private currentStreakColor: BalloonType | null = null;
  private comboTimer = 0;

  constructor(config?: PopEngineConfig) {
    this.comboWindow = config?.comboWindow ?? 1.8;
    this.maxMultiplier = config?.maxMultiplier ?? 5.0;
  }

  getStreak(): number {
    return this.streak;
  }

  getComboTimer(): number {
    return this.comboTimer;
  }

  getComboWindow(): number {
    return this.comboWindow;
  }

  getMultiplier(): number {
    if (this.streak <= 1) return 1.0;
    return Math.min(this.maxMultiplier, 1.0 + (this.streak - 1) * 0.5);
  }

  update(dt: number): void {
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.resetCombo();
      }
    }
  }

  handleClick(px: number, py: number, balloons: Balloon[]): PopResult | null {
    // Iterate in reverse order so top-most rendered balloons get hit first
    for (let i = balloons.length - 1; i >= 0; i--) {
      const b = balloons[i];
      if (b && b.isAlive && b.containsPoint(px, py)) {
        b.pop();
        return this.processPop(b);
      }
    }

    return null;
  }

  private processPop(balloon: Balloon): PopResult {
    if (balloon.type === 'bomb') {
      this.resetCombo();
      return {
        balloon,
        pointsAwarded: balloon.points, // -300
        streak: 0,
        multiplier: 1.0,
        isBomb: true,
        isRainbow: false,
      };
    }

    const isRainbow = balloon.type === 'rainbow';

    if (isRainbow) {
      this.streak += 1;
    } else if (this.currentStreakColor === null || this.currentStreakColor === balloon.type) {
      this.streak += 1;
      this.currentStreakColor = balloon.type;
    } else {
      // Color mismatch: reset streak to 1 with new color
      this.streak = 1;
      this.currentStreakColor = balloon.type;
    }

    this.comboTimer = this.comboWindow;
    const multiplier = this.getMultiplier();
    const pointsAwarded = Math.round(balloon.points * multiplier);

    return {
      balloon,
      pointsAwarded,
      streak: this.streak,
      multiplier,
      isBomb: false,
      isRainbow,
    };
  }

  resetCombo(): void {
    this.streak = 0;
    this.currentStreakColor = null;
    this.comboTimer = 0;
  }
}
