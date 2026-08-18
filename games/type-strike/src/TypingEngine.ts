import { Enemy } from './Enemy.js';
import { GameMode } from './Dictionary.js';

export interface TypingResult {
  status: 'locked' | 'progress' | 'completed' | 'typo' | 'ignored';
  targetId: string | null;
  matchedLetter?: string;
  completedWord?: string;
  pointsEarned?: number;
  multiplier: number;
  streak: number;
  targetEnemy?: Enemy;
}

export class TypingEngine {
  mode: GameMode = 'words';
  activeTarget: Enemy | null = null;
  streak: number = 0;
  multiplier: number = 1;
  maxMultiplier: number = 8;
  totalWordsCompleted: number = 0;
  totalTypos: number = 0;

  setMode(mode: GameMode): void {
    this.mode = mode;
    this.reset();
  }

  reset(): void {
    this.activeTarget = null;
    this.streak = 0;
    this.multiplier = 1;
    this.totalWordsCompleted = 0;
    this.totalTypos = 0;
  }

  getActiveTarget(): Enemy | null {
    return this.activeTarget;
  }

  getStreak(): number {
    return this.streak;
  }

  getMultiplier(): number {
    return this.multiplier;
  }

  normalizeKey(key: string, mode: GameMode = this.mode): string | null {
    if (!key) return null;

    if (mode === 'words') {
      if (key.length === 1) {
        const char = key.toUpperCase();
        if (char >= 'A' && char <= 'Z') {
          return char;
        }
      }
      return null;
    }

    // mode === 'arrows'
    const lower = key.toLowerCase();
    if (key === 'ArrowUp' || lower === 'w' || key === 'KeyW') return 'U';
    if (key === 'ArrowDown' || lower === 's' || key === 'KeyS') return 'D';
    if (key === 'ArrowLeft' || lower === 'a' || key === 'KeyA') return 'L';
    if (key === 'ArrowRight' || lower === 'd' || key === 'KeyD') return 'R';

    return null;
  }

  handleKey(key: string, enemies: Enemy[], overrideMode?: GameMode): TypingResult {
    const activeMode = overrideMode ?? this.mode;
    const normalized = this.normalizeKey(key, activeMode);

    if (!normalized) {
      return {
        status: 'ignored',
        targetId: null,
        multiplier: this.multiplier,
        streak: this.streak
      };
    }

    const char = normalized;

    // Active locked target flow
    if (this.activeTarget !== null) {
      if (!this.activeTarget.alive) {
        this.activeTarget = null;
      } else {
        const expected = this.activeTarget.getNextChar();
        if (char === expected) {
          const isDone = this.activeTarget.advanceLetter();
          if (isDone) {
            const enemy = this.activeTarget;
            this.activeTarget = null;
            this.streak++;
            this.multiplier = Math.min(this.maxMultiplier, 1 + this.streak);
            this.totalWordsCompleted++;
            const pts = enemy.destroy() * this.multiplier;
            return {
              status: 'completed',
              targetId: enemy.id,
              completedWord: enemy.word,
              pointsEarned: pts,
              multiplier: this.multiplier,
              streak: this.streak,
              targetEnemy: enemy
            };
          } else {
            return {
              status: 'progress',
              targetId: this.activeTarget.id,
              matchedLetter: char,
              multiplier: this.multiplier,
              streak: this.streak,
              targetEnemy: this.activeTarget
            };
          }
        } else {
          // Typo while target locked
          const enemy = this.activeTarget;
          enemy.resetProgress();
          this.activeTarget = null;
          this.streak = 0;
          this.multiplier = 1;
          this.totalTypos++;
          return {
            status: 'typo',
            targetId: enemy.id,
            multiplier: 1,
            streak: 0,
            targetEnemy: enemy
          };
        }
      }
    }

    // No target locked -> acquire new target from alive enemies
    const aliveEnemies = enemies.filter((e) => e.alive && e.word.startsWith(char));

    if (aliveEnemies.length > 0) {
      // Find closest enemy (minimum x coordinate)
      let closest = aliveEnemies[0]!;
      for (let i = 1; i < aliveEnemies.length; i++) {
        const candidate = aliveEnemies[i]!;
        if (candidate.x < closest.x) {
          closest = candidate;
        }
      }

      this.activeTarget = closest;
      const isDone = closest.advanceLetter();

      if (isDone) {
        // 1-token sequence completed immediately
        this.activeTarget = null;
        this.streak++;
        this.multiplier = Math.min(this.maxMultiplier, 1 + this.streak);
        this.totalWordsCompleted++;
        const pts = closest.destroy() * this.multiplier;
        return {
          status: 'completed',
          targetId: closest.id,
          completedWord: closest.word,
          pointsEarned: pts,
          multiplier: this.multiplier,
          streak: this.streak,
          targetEnemy: closest
        };
      } else {
        return {
          status: 'locked',
          targetId: closest.id,
          matchedLetter: char,
          multiplier: this.multiplier,
          streak: this.streak,
          targetEnemy: closest
        };
      }
    } else {
      // Unmatched key
      this.streak = 0;
      this.multiplier = 1;
      this.totalTypos++;
      return {
        status: 'typo',
        targetId: null,
        multiplier: 1,
        streak: 0
      };
    }
  }

  handleTargetLost(enemyId: string): void {
    if (this.activeTarget && this.activeTarget.id === enemyId) {
      this.activeTarget.resetProgress();
      this.activeTarget = null;
      this.streak = 0;
      this.multiplier = 1;
    }
  }
}
