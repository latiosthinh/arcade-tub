export type GameStatus = 'ready' | 'playing' | 'falling' | 'gameover';

export class GameState {
  public status: GameStatus = 'ready';
  public score = 0;
  public highScore = 0;
  public coins = 0;
  public totalCoins = 0;
  public multiplier = 1.0;
  public comboTimer = 0;

  private readonly STORAGE_HIGHSCORE = 'drift_boss_highscore';
  private readonly STORAGE_COINS = 'drift_boss_total_coins';

  constructor() {
    this.loadPersistence();
  }

  private loadPersistence(): void {
    try {
      const savedHighScore = localStorage.getItem(this.STORAGE_HIGHSCORE);
      if (savedHighScore) {
        const val = parseInt(savedHighScore, 10);
        this.highScore = !isNaN(val) && val >= 0 ? val : 0;
      }

      const savedCoins = localStorage.getItem(this.STORAGE_COINS);
      if (savedCoins) {
        const val = parseInt(savedCoins, 10);
        this.totalCoins = !isNaN(val) && val >= 0 ? val : 0;
      }
    } catch {
      this.highScore = 0;
      this.totalCoins = 0;
    }
  }

  public savePersistence(): void {
    try {
      localStorage.setItem(this.STORAGE_HIGHSCORE, String(this.highScore));
      localStorage.setItem(this.STORAGE_COINS, String(this.totalCoins));
    } catch {
      // Storage unavailable or disabled
    }
  }

  public start(): void {
    this.status = 'playing';
    this.score = 0;
    this.coins = 0;
    this.multiplier = 1.0;
    this.comboTimer = 0;
  }

  public addScore(amount: number): void {
    if (this.status !== 'playing') return;
    this.score += Math.round(amount * this.multiplier);
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  public increaseMultiplier(delta = 0.2): void {
    this.multiplier = Math.min(4.0, this.multiplier + delta);
    this.comboTimer = 2.0; // 2 seconds combo window
  }

  public updateCombo(dt: number): void {
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.multiplier = 1.0;
      }
    }
  }

  public collectCoin(val = 1): void {
    this.coins += val;
    this.totalCoins += val;
    this.addScore(val * 5);
  }

  public triggerFall(): void {
    if (this.status === 'playing') {
      this.status = 'falling';
    }
  }

  public gameOver(): void {
    this.status = 'gameover';
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
    this.savePersistence();
  }

  public reset(): void {
    this.status = 'ready';
    this.score = 0;
    this.coins = 0;
    this.multiplier = 1.0;
    this.comboTimer = 0;
  }
}
