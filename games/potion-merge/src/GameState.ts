import { loadData, saveData, reportScore } from '@arcade-carnival/playables-adapter';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';

export interface PotionDef {
  tier: number;
  name: string;
  radius: number;
  color: string;
  secondaryColor: string;
  points: number;
  symbol: string;
}

export const POTION_TIERS: PotionDef[] = [
  { tier: 1, name: 'Dew Droplet', radius: 18, color: '#93C5FD', secondaryColor: '#3B82F6', points: 2, symbol: '💧' },
  { tier: 2, name: 'Sprout Sap', radius: 25, color: '#86EFAC', secondaryColor: '#22C55E', points: 4, symbol: '🌿' },
  { tier: 3, name: 'Amber Nectar', radius: 33, color: '#FDE047', secondaryColor: '#EAB308', points: 8, symbol: '✨' },
  { tier: 4, name: 'Flame Tincture', radius: 42, color: '#FDBA74', secondaryColor: '#F97316', points: 16, symbol: '🔥' },
  { tier: 5, name: 'Amethyst Brew', radius: 52, color: '#D8B4FE', secondaryColor: '#A855F7', points: 32, symbol: '🔮' },
  { tier: 6, name: 'Ruby Tonic', radius: 63, color: '#FDA4AF', secondaryColor: '#F43F5E', points: 64, symbol: '💎' },
  { tier: 7, name: 'Verdant Elixir', radius: 75, color: '#6EE7B7', secondaryColor: '#10B981', points: 128, symbol: '🍃' },
  { tier: 8, name: 'Solar Essence', radius: 88, color: '#FCD34D', secondaryColor: '#D97706', points: 256, symbol: '☀️' },
  { tier: 9, name: 'Lunar Draft', radius: 102, color: '#A5B4FC', secondaryColor: '#6366F1', points: 512, symbol: '🌙' },
  { tier: 10, name: 'Astral Philtre', radius: 118, color: '#C084FC', secondaryColor: '#7E22CE', points: 1024, symbol: '🌌' },
  { tier: 11, name: 'Grand Cosmic Elixir', radius: 136, color: '#F472B6', secondaryColor: '#DB2777', points: 2048, symbol: '👑' }
];

export class GameState {
  public status: GameStatus = 'ready';
  public score: number = 0;
  public highScore: number = 0;
  public mergesCount: number = 0;
  public combo: number = 0;
  public comboTimer: number = 0;
  public multiplier: number = 1;
  public overflowTimer: number = 0;
  public isOverflowing: boolean = false;
  public nextTier: number = 1;
  public currentTier: number = 1;

  private readonly comboWindow = 2.0;
  private readonly maxOverflowTime = 3.0;
  private readonly storageKey = 'potion-merge-highscore';

  constructor() {
    this.highScore = this.loadHighScore();
    this.rollNextPotion();
    this.rollCurrentPotion();
  }

  public start(): void {
    this.status = 'playing';
    this.score = 0;
    this.mergesCount = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.multiplier = 1;
    this.overflowTimer = 0;
    this.isOverflowing = false;
    this.rollNextPotion();
    this.rollCurrentPotion();
  }

  public rollNextPotion(): void {
    // Only spawn lower tier potions (tiers 1 to 4)
    this.nextTier = Math.floor(Math.random() * 4) + 1;
  }

  public rollCurrentPotion(): void {
    this.currentTier = this.nextTier;
    this.rollNextPotion();
  }

  public recordMerge(tier: number): number {
    if (this.status !== 'playing') return 0;

    const potionDef = POTION_TIERS[tier - 1] || POTION_TIERS[POTION_TIERS.length - 1];
    this.mergesCount++;
    this.combo++;
    this.comboTimer = this.comboWindow;

    if (this.combo >= 10) {
      this.multiplier = 4;
    } else if (this.combo >= 6) {
      this.multiplier = 3;
    } else if (this.combo >= 3) {
      this.multiplier = 2;
    } else {
      this.multiplier = 1;
    }

    const earned = potionDef.points * this.multiplier;
    this.score += earned;

    if (this.score > this.highScore) {
      this.highScore = this.score;
    }

    return earned;
  }

  public update(dt: number, isAnyPotionOverLimit: boolean): void {
    if (this.status !== 'playing') return;

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.multiplier = 1;
      }
    }

    this.isOverflowing = isAnyPotionOverLimit;
    if (this.isOverflowing) {
      this.overflowTimer += dt;
      if (this.overflowTimer >= this.maxOverflowTime) {
        this.gameOver();
      }
    } else {
      this.overflowTimer = Math.max(0, this.overflowTimer - dt * 1.5);
    }
  }

  public gameOver(): void {
    this.status = 'gameover';
    reportScore(this.score);
    if (this.score >= this.highScore) {
      this.highScore = this.score;
      this.saveHighScore(this.score);
    }
  }

  public pause(): void {
    if (this.status === 'playing') this.status = 'paused';
  }

  public resume(): void {
    if (this.status === 'paused') this.status = 'playing';
  }

  private loadHighScore(): number {
    try {
      const val = loadData(this.storageKey);
      const parsed = Number(val);
      return !isNaN(parsed) && Number.isFinite(parsed) ? parsed : 0;
    } catch {
      return 0;
    }
  }

  private saveHighScore(score: number): void {
    try {
      saveData(this.storageKey, score.toString());
    } catch {}
  }
}
