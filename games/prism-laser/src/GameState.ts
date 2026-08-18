import { loadData, saveData, reportScore } from '@arcade-carnival/playables-adapter';

export type GameStatus = 'ready' | 'playing' | 'level_cleared' | 'completed';

export const HIGH_SCORE_KEY = 'arcade-carnival-prism-laser-highscore';

export class GameState {
  status: GameStatus = 'ready';
  currentLevelNumber: number = 1;
  movesMade: number = 0;
  totalScore: number = 0;
  highScore: number = 0;

  constructor() {
    this.loadHighScore();
  }

  loadHighScore(): void {
    try {
      const saved = loadData(HIGH_SCORE_KEY);
      const parsed = Number(saved);
      this.highScore = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    } catch {
      this.highScore = 0;
    }
  }

  saveHighScore(): void {
    try {
      saveData(HIGH_SCORE_KEY, String(this.highScore));
      reportScore(this.highScore);
    } catch {
      // Ignored in test/sandbox
    }
  }

  startGame(): void {
    this.status = 'playing';
    this.currentLevelNumber = 1;
    this.movesMade = 0;
    this.totalScore = 0;
  }

  incrementMove(): void {
    this.movesMade += 1;
  }

  clearLevel(parMoves: number): void {
    this.status = 'level_cleared';
    // Par move bonus scoring
    const levelBase = 500;
    const efficiencyBonus = Math.max(0, (parMoves - this.movesMade + 1) * 150);
    const roundScore = levelBase + efficiencyBonus;
    this.totalScore += roundScore;

    if (this.totalScore > this.highScore) {
      this.highScore = this.totalScore;
      this.saveHighScore();
    }
  }

  nextLevel(maxLevels: number): boolean {
    if (this.currentLevelNumber < maxLevels) {
      this.currentLevelNumber += 1;
      this.movesMade = 0;
      this.status = 'playing';
      return true;
    } else {
      this.status = 'completed';
      return false;
    }
  }

  reset(): void {
    this.status = 'ready';
    this.currentLevelNumber = 1;
    this.movesMade = 0;
    this.totalScore = 0;
  }
}
