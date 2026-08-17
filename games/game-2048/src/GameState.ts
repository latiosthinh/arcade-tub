import { saveData, loadData, reportScore } from '@arcade-carnival/playables-adapter';
import { Grid2048, Direction, SlideResult } from './Grid2048';

export type GameStatus = 'ready' | 'playing' | 'won' | 'gameover';

const STORAGE_KEY = 'arcade-carnival-2048-highscore';

export class GameState {
  public grid: Grid2048;
  public status: GameStatus = 'ready';
  public score: number = 0;
  public highScore: number = 0;
  public movesCount: number = 0;
  public wonAcknowledged: boolean = false;
  public undoCount: number = 0;

  constructor() {
    this.grid = new Grid2048();
    this.loadHighScore();
  }

  public get maxTile(): number {
    return this.grid.getMaxTile();
  }

  public start(): void {
    this.grid.reset();
    this.status = 'playing';
    this.score = 0;
    this.movesCount = 0;
    this.wonAcknowledged = false;
    this.undoCount = 0;
  }

  public restart(): void {
    this.start();
  }

  public continueAfterWin(): void {
    this.wonAcknowledged = true;
    this.status = 'playing';
  }

  public move(dir: Direction, rng: () => number = Math.random): SlideResult {
    if (this.status !== 'playing' && this.status !== 'ready') {
      return {
        moved: false,
        scoreGained: 0,
        moves: [],
        merges: [],
        spawnedTile: null,
      };
    }

    if (this.status === 'ready') {
      this.status = 'playing';
    }

    // Save snapshot before executing slide
    this.grid.saveSnapshot(this.score);

    const result = this.grid.slide(dir, true, rng);

    if (result.moved) {
      this.score += result.scoreGained;
      this.movesCount++;

      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.saveHighScore();
      }

      reportScore(this.score);

      // Check win condition (2048)
      if (!this.wonAcknowledged && this.grid.hasWon(2048)) {
        this.status = 'won';
      } else if (!this.grid.canMove()) {
        this.status = 'gameover';
      }
    } else {
      // Discard snapshot if move was not valid
      this.grid.undo();
    }

    return result;
  }

  public undo(): boolean {
    const previousScore = this.grid.undo();
    if (previousScore === null) return false;

    this.score = previousScore;
    if (this.movesCount > 0) this.movesCount--;
    this.undoCount++;
    this.status = 'playing';
    return true;
  }

  public loadHighScore(): void {
    try {
      const saved = loadData(STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        this.highScore = Number.isFinite(parsed) && !isNaN(parsed) && parsed >= 0 ? parsed : 0;
      } else {
        this.highScore = 0;
      }
    } catch {
      this.highScore = 0;
    }
  }

  public saveHighScore(): void {
    try {
      saveData(STORAGE_KEY, this.highScore.toString());
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }
}
