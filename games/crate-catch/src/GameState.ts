import { loadData, saveData, reportScore } from '@arcade-carnival/playables-adapter';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';

export class GameState {
  status: GameStatus = 'ready';
  hp: number = 100;
  maxHp: number = 100;
  missedCrates: number = 0;
  maxMissedCrates: number = 5;
  score: number = 0;
  highScore: number = 0;
  round: number = 1;
  bankedCratesCount: number = 0;
  roundThreshold: number = 1500;

  constructor() {
    const saved = loadData('crate-catch-highscore');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) {
        this.highScore = parsed;
      }
    }
  }

  start(): void {
    this.status = 'playing';
    this.hp = this.maxHp;
    this.missedCrates = 0;
    this.score = 0;
    this.round = 1;
    this.bankedCratesCount = 0;
  }

  damageCart(amount: number = 35): void {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0 && this.status === 'playing') {
      this.triggerGameOver();
    }
  }

  repairCart(amount: number = 35): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  registerMissedCrate(): void {
    this.missedCrates++;
    if (this.missedCrates >= this.maxMissedCrates && this.status === 'playing') {
      this.triggerGameOver();
    }
  }

  addBankedScore(pts: number, crateCount: number): void {
    this.score += pts;
    this.bankedCratesCount += crateCount;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
    this.round = 1 + Math.floor(this.score / this.roundThreshold);
  }

  triggerGameOver(): void {
    this.status = 'gameover';
    saveData('crate-catch-highscore', String(this.highScore));
    reportScore(this.score);
  }

  pause(): void {
    if (this.status === 'playing') {
      this.status = 'paused';
    }
  }

  resume(): void {
    if (this.status === 'paused') {
      this.status = 'playing';
    }
  }

  restart(): void {
    this.start();
  }
}
