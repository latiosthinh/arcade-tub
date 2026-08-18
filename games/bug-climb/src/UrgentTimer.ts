export class UrgentTimer {
  public static readonly DEFAULT_MAX_TIME = 8.0;
  public static readonly INITIAL_TIME = 5.0;
  public static readonly TIME_BONUS_PER_STEP = 0.28;
  public static readonly BASE_DRAIN_RATE = 1.0;

  public timeRemaining: number;
  public maxTime: number;
  public drainRate: number;
  public isUrgent: boolean;

  constructor(maxTime: number = UrgentTimer.DEFAULT_MAX_TIME, initialTime: number = UrgentTimer.INITIAL_TIME) {
    this.maxTime = maxTime;
    this.timeRemaining = initialTime;
    this.drainRate = UrgentTimer.BASE_DRAIN_RATE;
    this.isUrgent = false;
  }

  public update(dt: number, altitude: number = 0): { expired: boolean; isUrgent: boolean } {
    const validDt = Math.max(0, dt);

    this.drainRate = UrgentTimer.BASE_DRAIN_RATE + Math.min(2.5, Math.max(0, altitude) * 0.015);
    this.timeRemaining -= this.drainRate * validDt;

    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.isUrgent = false;
      return { expired: true, isUrgent: false };
    }

    this.isUrgent = this.timeRemaining <= this.maxTime * 0.25;
    return { expired: false, isUrgent: this.isUrgent };
  }

  public addStepBonus(bonus: number = UrgentTimer.TIME_BONUS_PER_STEP): void {
    if (this.timeRemaining > 0) {
      this.timeRemaining = Math.min(this.maxTime, this.timeRemaining + Math.max(0, bonus));
      this.isUrgent = this.timeRemaining <= this.maxTime * 0.25;
    }
  }

  public getTimeFraction(): number {
    return this.maxTime > 0 ? this.timeRemaining / this.maxTime : 0;
  }

  public reset(initialTime: number = UrgentTimer.INITIAL_TIME): void {
    this.timeRemaining = initialTime;
    this.drainRate = UrgentTimer.BASE_DRAIN_RATE;
    this.isUrgent = false;
  }
}
