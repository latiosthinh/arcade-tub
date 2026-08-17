import { saveData, loadData, reportScore } from '@arcade-carnival/playables-adapter';

export type GameMode = 'story' | 'infinite';
export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover' | 'victory';

export class GameState {
  mode: GameMode = 'story';
  status: GameStatus = 'ready';
  altitude: number = 0;
  maxAltitude: number = 0;
  targetAltitude: number = 5000;
  score: number = 0;
  highScore: number = 0;
  bonusPoints: number = 0;

  constructor() {
    const saved = loadData('sky-hopper-highscore');
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) {
        this.highScore = parsed;
      }
    }
  }

  setMode(mode: GameMode): void {
    this.mode = mode;
    this.targetAltitude = mode === 'story' ? 5000 : Infinity;
  }

  start(mode?: GameMode): void {
    if (mode) {
      this.setMode(mode);
    }
    this.status = 'playing';
    this.altitude = 0;
    this.maxAltitude = 0;
    this.score = 0;
    this.bonusPoints = 0;
  }

  updateAltitude(playerWorldY: number): void {
    const currentAlt = Math.max(0, Math.floor((500 - playerWorldY) / 10));
    this.altitude = currentAlt;

    if (currentAlt > this.maxAltitude) {
      this.maxAltitude = currentAlt;
      this.recalculateScore();
    }

    if (this.mode === 'story' && this.maxAltitude >= this.targetAltitude && this.status === 'playing') {
      this.triggerVictory();
    }
  }

  addScore(pts: number): void {
    this.bonusPoints += pts;
    this.recalculateScore();
  }

  private recalculateScore(): void {
    this.score = this.maxAltitude + this.bonusPoints;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  triggerGameOver(): void {
    this.status = 'gameover';
    saveData('sky-hopper-highscore', String(this.highScore));
    reportScore(this.score);
  }

  triggerVictory(): void {
    this.status = 'victory';
    this.addScore(2500);
    saveData('sky-hopper-highscore', String(this.highScore));
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
    this.start(this.mode);
  }
}
