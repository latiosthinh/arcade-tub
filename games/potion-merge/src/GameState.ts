import { loadData, saveData, reportScore } from '@arcade-carnival/playables-adapter';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';

export interface GemDef {
  tier: number;
  name: string;
  radius: number;
  color: string;
  secondaryColor: string;
  facetsColor: string;
  points: number;
  symbol: string;
  shape: 'circle' | 'diamond' | 'hexagon' | 'octagon' | 'star';
}

export const GEM_TIERS: GemDef[] = [
  { tier: 1, name: 'Quartz Shard', radius: 18, color: '#E2E8F0', secondaryColor: '#CBD5E1', facetsColor: '#94A3B8', points: 2, symbol: '💎', shape: 'diamond' },
  { tier: 2, name: 'Amber Citrine', radius: 25, color: '#FDE047', secondaryColor: '#EAB308', facetsColor: '#CA8A04', points: 4, symbol: '✨', shape: 'hexagon' },
  { tier: 3, name: 'Jadeite Crystal', radius: 33, color: '#86EFAC', secondaryColor: '#22C55E', facetsColor: '#16A34A', points: 8, symbol: '🍃', shape: 'circle' },
  { tier: 4, name: 'Aquamarine', radius: 42, color: '#67E8F9', secondaryColor: '#06B6D4', facetsColor: '#0891B2', points: 16, symbol: '💧', shape: 'diamond' },
  { tier: 5, name: 'Amethyst Cluster', radius: 52, color: '#D8B4FE', secondaryColor: '#A855F7', facetsColor: '#7E22CE', points: 32, symbol: '🔮', shape: 'hexagon' },
  { tier: 6, name: 'Topaz Fire', radius: 63, color: '#FDBA74', secondaryColor: '#F97316', facetsColor: '#C2410C', points: 64, symbol: '🔥', shape: 'octagon' },
  { tier: 7, name: 'Ruby Core', radius: 75, color: '#FDA4AF', secondaryColor: '#F43F5E', facetsColor: '#BE123C', points: 128, symbol: '♦️', shape: 'diamond' },
  { tier: 8, name: 'Sapphire Prism', radius: 88, color: '#93C5FD', secondaryColor: '#3B82F6', facetsColor: '#1D4ED8', points: 256, symbol: '💠', shape: 'hexagon' },
  { tier: 9, name: 'Emerald Jewel', radius: 102, color: '#6EE7B7', secondaryColor: '#10B981', facetsColor: '#047857', points: 512, symbol: '❇️', shape: 'octagon' },
  { tier: 10, name: 'Obsidian Astral', radius: 118, color: '#C084FC', secondaryColor: '#7C3AED', facetsColor: '#581C87', points: 1024, symbol: '🌌', shape: 'circle' },
  { tier: 11, name: 'Grand Diamond Crown', radius: 136, color: '#F472B6', secondaryColor: '#EC4899', facetsColor: '#BE185D', points: 2048, symbol: '👑', shape: 'star' }
];

export const POTION_TIERS = GEM_TIERS; // Alias for backward compatibility if needed

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
