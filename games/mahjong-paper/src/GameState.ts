import { loadData, saveData, reportScore } from '@arcade-carnival/playables-adapter';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'cleared' | 'gameover';

export interface TileTypeInfo {
  id: string;
  category: 'animals' | 'flowers' | 'seals' | 'dragons';
  name: string;
  symbol: string;
  color: string;
}

export const TILE_TYPES: TileTypeInfo[] = [
  // Category 1: Origami Animals (4 types)
  { id: 'crane', category: 'animals', name: 'Origami Crane', symbol: '🕊️', color: '#E11D48' },
  { id: 'frog', category: 'animals', name: 'Paper Frog', symbol: '🐸', color: '#10B981' },
  { id: 'fox', category: 'animals', name: 'Folded Fox', symbol: '🦊', color: '#F97316' },
  { id: 'butterfly', category: 'animals', name: 'Paper Butterfly', symbol: '🦋', color: '#3B82F6' },

  // Category 2: Paper Flowers (4 types)
  { id: 'lotus', category: 'flowers', name: 'Paper Lotus', symbol: '🪷', color: '#EC4899' },
  { id: 'cherry', category: 'flowers', name: 'Cherry Blossom', symbol: '🌸', color: '#F472B6' },
  { id: 'sunflower', category: 'flowers', name: 'Sun Flower', symbol: '🌻', color: '#EAB308' },
  { id: 'bamboo', category: 'flowers', name: 'Cut Bamboo', symbol: '🎋', color: '#22C55E' },

  // Category 3: Geometric Seals (4 types)
  { id: 'sun_seal', category: 'seals', name: 'Solar Seal', symbol: '☀️', color: '#F59E0B' },
  { id: 'moon_seal', category: 'seals', name: 'Lunar Crest', symbol: '🌙', color: '#6366F1' },
  { id: 'star_seal', category: 'seals', name: 'Astral Star', symbol: '⭐', color: '#FBBF24' },
  { id: 'spark_seal', category: 'seals', name: 'Magic Rune', symbol: '✨', color: '#8B5CF6' },

  // Category 4: Dragon Crests (2 types)
  { id: 'gold_dragon', category: 'dragons', name: 'Imperial Dragon', symbol: '🐉', color: '#D97706' },
  { id: 'red_phoenix', category: 'dragons', name: 'Paper Phoenix', symbol: '🦚', color: '#BE123C' },
];

export class GameState {
  public status: GameStatus = 'ready';
  public score: number = 0;
  public highScore: number = 0;
  public matchesMade: number = 0;
  public totalTiles: number = 0;
  public tilesRemaining: number = 0;
  public combo: number = 0;
  public comboTimer: number = 0;
  public multiplier: number = 1;
  public hintsRemaining: number = 3;
  public shufflesRemaining: number = 3;
  public undosRemaining: number = 5;

  private readonly comboWindow = 4.0;
  private readonly storageKey = 'mahjong-paper-highscore';

  constructor() {
    this.highScore = this.loadHighScore();
  }

  public start(totalTiles: number): void {
    this.status = 'playing';
    this.score = 0;
    this.matchesMade = 0;
    this.totalTiles = totalTiles;
    this.tilesRemaining = totalTiles;
    this.combo = 0;
    this.comboTimer = 0;
    this.multiplier = 1;
    this.hintsRemaining = 3;
    this.shufflesRemaining = 3;
    this.undoseRemaining = 5;
  }

  public set undoseRemaining(val: number) {
    this.undosRemaining = val;
  }

  public recordMatch(): number {
    if (this.status !== 'playing') return 0;

    this.matchesMade++;
    this.tilesRemaining -= 2;
    this.combo++;
    this.comboTimer = this.comboWindow;

    if (this.combo >= 8) {
      this.multiplier = 4;
    } else if (this.combo >= 5) {
      this.multiplier = 3;
    } else if (this.combo >= 2) {
      this.multiplier = 2;
    } else {
      this.multiplier = 1;
    }

    const earned = 100 * this.multiplier;
    this.score += earned;

    if (this.score > this.highScore) {
      this.highScore = this.score;
    }

    if (this.tilesRemaining <= 0) {
      this.levelCleared();
    }

    return earned;
  }

  public recordUndo(): void {
    if (this.status !== 'playing') return;
    this.matchesMade = Math.max(0, this.matchesMade - 1);
    this.tilesRemaining += 2;
    this.combo = 0;
    this.multiplier = 1;
    this.score = Math.max(0, this.score - 50);
  }

  public levelCleared(): void {
    this.status = 'cleared';
    this.score += 1000; // completion bonus
    reportScore(this.score);
    if (this.score >= this.highScore) {
      this.highScore = this.score;
      this.saveHighScore(this.score);
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

  public update(dt: number): void {
    if (this.status !== 'playing') return;

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.multiplier = 1;
      }
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
