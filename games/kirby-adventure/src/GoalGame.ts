export class GoalGame {
  private power = 0;
  private powerDir = 1;
  private isPressed = false;
  isComplete = false;
  tierAwarded = 0; // 1 to 7

  update(dt: number): void {
    if (this.isPressed || this.isComplete) return;

    // Oscillating springboard power meter
    this.power += this.powerDir * dt * 2.5;
    if (this.power >= 1.0) {
      this.power = 1.0;
      this.powerDir = -1;
    } else if (this.power <= 0) {
      this.power = 0;
      this.powerDir = 1;
    }
  }

  jump(): { tier: number; reward: '1up' | 'maxim_tomato' | 'points' } {
    this.isPressed = true;
    this.isComplete = true;

    if (this.power > 0.85) {
      this.tierAwarded = 1;
      return { tier: 1, reward: '1up' };
    } else if (this.power > 0.6) {
      this.tierAwarded = 2;
      return { tier: 2, reward: 'maxim_tomato' };
    } else {
      this.tierAwarded = 3;
      return { tier: 3, reward: 'points' };
    }
  }
}
