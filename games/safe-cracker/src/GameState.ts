import { loadData, saveData, reportScore } from '@arcade-carnival/playables-adapter';
import type { ZoneType } from './Dial.js';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';
export type PickOutcome = 'yellow' | 'blue' | 'miss' | 'cooldown';

export interface PickResult {
  outcome: PickOutcome;
  pointsAwarded: number;
  timeAwarded: number;
}

export class GameState {
  public score: number = 0;
  public highScore: number = 0;
  public timeRemaining: number = 30.0;
  public pickCooldown: number = 0;
  public streak: number = 0;
  public difficultyLevel: number = 0;
  public status: GameStatus = 'ready';

  constructor() {
    const raw = loadData('safe-cracker-highscore');
    if (raw !== null) {
      const parsed = parseInt(raw, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        this.highScore = parsed;
      }
    }
  }

  public get speedMultiplier(): number {
    return 1.0 + Math.floor(this.score / 3000) * 0.35 + this.streak * 0.05;
  }

  public get isLockedOut(): boolean {
    return this.pickCooldown > 0;
  }

  public start(): void {
    this.score = 0;
    this.timeRemaining = 30.0;
    this.pickCooldown = 0;
    this.streak = 0;
    this.difficultyLevel = 0;
    this.status = 'playing';
  }

  public recordPick(hitResult: { hit: boolean; type?: ZoneType }): PickResult {
    if (this.pickCooldown > 0) {
      return { outcome: 'cooldown', pointsAwarded: 0, timeAwarded: 0 };
    }

    if (hitResult.hit && hitResult.type === 'score') {
      this.score += 1000;
      this.streak++;
      this.difficultyLevel++;
      return { outcome: 'yellow', pointsAwarded: 1000, timeAwarded: 0 };
    }

    if (hitResult.hit && hitResult.type === 'time') {
      this.timeRemaining = Math.min(60.0, this.timeRemaining + 1.5);
      this.streak++;
      this.difficultyLevel++;
      return { outcome: 'blue', pointsAwarded: 0, timeAwarded: 1.5 };
    }

    // Miss
    this.streak = 0;
    this.pickCooldown = 0.4;
    return { outcome: 'miss', pointsAwarded: 0, timeAwarded: 0 };
  }

  public update(dt: number): void {
    if (this.status !== 'playing') {
      return;
    }

    const safeDt = Number.isFinite(dt) ? Math.max(0, dt) : 0;
    this.timeRemaining = Math.max(0, this.timeRemaining - safeDt);

    if (this.pickCooldown > 0) {
      this.pickCooldown = Math.max(0, this.pickCooldown - safeDt);
    }

    if (this.timeRemaining <= 0) {
      this.status = 'gameover';
      if (this.score > this.highScore) {
        this.highScore = this.score;
        saveData('safe-cracker-highscore', String(this.highScore));
      }
      reportScore(this.score);
    }
  }

  public pause(): void {
    if (this.status === 'playing') {
      this.status = 'paused';
    }
  }

  public resume(): void {
    if (this.status === 'paused') {
      this.status = 'playing';
    }
  }

  public restart(): void {
    this.start();
  }
}
