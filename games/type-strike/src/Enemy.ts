import { WordTier, GameMode, arrowCharToSymbol, formatArrowSequence } from './Dictionary.js';

export interface EnemyConfig {
  id: string;
  word: string;
  tier: WordTier;
  basePoints: number;
  lane: number;
  mode?: GameMode;
  x?: number;
  y?: number;
  speed?: number;
  width?: number;
  height?: number;
}

export class Enemy {
  id: string;
  word: string;
  tier: WordTier;
  basePoints: number;
  lane: number;
  mode: GameMode;
  x: number;
  y: number;
  speed: number;
  width: number;
  height: number;
  matchedIndex: number = 0;
  alive: boolean = true;
  baseBoundaryX: number = 60;
  hoverOffset: number = 0;
  hoverTime: number = 0;

  constructor(config: EnemyConfig) {
    this.id = config.id;
    this.word = config.word;
    this.tier = config.tier;
    this.basePoints = config.basePoints;
    this.lane = config.lane;
    this.mode = config.mode ?? 'words';
    this.x = config.x ?? 820;
    this.y = config.y ?? (100 + config.lane * 80);
    this.speed = config.speed ?? 45;
    this.width = config.width ?? 64;
    this.height = config.height ?? 36;
  }

  update(dt: number): void {
    if (!this.alive) return;
    this.x -= this.speed * dt;
    this.hoverTime += dt * 3;
    this.hoverOffset = Math.sin(this.hoverTime) * 3;
  }

  isBreachingBase(): boolean {
    return this.alive && this.x <= this.baseBoundaryX;
  }

  getMatchedPrefix(): string {
    return this.word.slice(0, this.matchedIndex);
  }

  getUnmatchedPrefix(): string {
    return this.word.slice(this.matchedIndex);
  }

  getNextChar(): string {
    return this.matchedIndex < this.word.length ? (this.word[this.matchedIndex] || '') : '';
  }

  getFormattedWord(): string {
    return this.mode === 'arrows' ? formatArrowSequence(this.word) : this.word;
  }

  getFormattedNextChar(): string {
    const next = this.getNextChar();
    return this.mode === 'arrows' ? arrowCharToSymbol(next) : next;
  }

  advanceLetter(): boolean {
    this.matchedIndex++;
    return this.isCompleted();
  }

  isCompleted(): boolean {
    return this.matchedIndex >= this.word.length;
  }

  resetProgress(): void {
    this.matchedIndex = 0;
  }

  destroy(): number {
    this.alive = false;
    return this.basePoints;
  }
}
