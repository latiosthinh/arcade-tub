import {
  EnemyType,
  ENEMY_CONFIGS,
  KillTallyStats,
  EnemyTallyRow,
  StageTallyResult,
} from './types';

/**
 * ScoreManager handles score tracking, stage kill tally roll-up breakdowns,
 * and safe localStorage high score persistence for Tank 1990.
 */
export class ScoreManager {
  public score: number = 0;
  public highScore: number = 20000;
  public stageKills: KillTallyStats = {
    [EnemyType.BASIC]: 0,
    [EnemyType.FAST]: 0,
    [EnemyType.POWER]: 0,
    [EnemyType.ARMOR]: 0,
  };
  public readonly storageKey: string;

  constructor(storageKey: string = 'tank1990_high_score') {
    this.storageKey = storageKey;
    this.loadHighScore();
  }

  /**
   * Safely loads high score from localStorage with validation and fallback.
   */
  public loadHighScore(): number {
    try {
      if (typeof localStorage !== 'undefined' && localStorage !== null) {
        const raw = localStorage.getItem(this.storageKey);
        if (raw !== null) {
          const parsed = parseInt(raw, 10);
          if (!isNaN(parsed) && parsed >= 0) {
            this.highScore = parsed;
            return this.highScore;
          }
        }
      }
    } catch {
      // Storage unavailable or disabled (e.g. iframe sandbox/private mode)
    }
    return this.highScore;
  }

  /**
   * Safely persists high score to localStorage if current score exceeds high score.
   */
  public saveHighScore(): boolean {
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }

    try {
      if (typeof localStorage !== 'undefined' && localStorage !== null) {
        localStorage.setItem(this.storageKey, this.highScore.toString());
        return true;
      }
    } catch {
      // Storage quota exceeded or blocked
    }
    return false;
  }

  /**
   * Records an enemy kill, adds points according to ENEMY_CONFIGS,
   * increments per-type kill tally, and updates high score.
   */
  public recordKill(type: EnemyType, pointsOverride?: number): number {
    const config = ENEMY_CONFIGS[type];
    const points = pointsOverride !== undefined ? pointsOverride : (config ? config.points : 100);

    if (this.stageKills[type] !== undefined) {
      this.stageKills[type]++;
    } else {
      this.stageKills[type] = 1;
    }

    this.score += points;
    if (this.score > this.highScore) {
      this.saveHighScore();
    }

    return points;
  }

  /**
   * Adds arbitrary points (e.g., power-up bonuses) and updates high score.
   */
  public addScore(points: number): void {
    if (points <= 0) return;
    this.score += points;
    if (this.score > this.highScore) {
      this.saveHighScore();
    }
  }

  /**
   * Resets stage kill counters for the start of a new stage.
   */
  public resetStageKills(): void {
    this.stageKills = {
      [EnemyType.BASIC]: 0,
      [EnemyType.FAST]: 0,
      [EnemyType.POWER]: 0,
      [EnemyType.ARMOR]: 0,
    };
  }

  /**
   * Resets active game score and stage kills back to 0.
   */
  public resetGameScore(): void {
    this.score = 0;
    this.resetStageKills();
  }

  /**
   * Calculates end-stage kill tally breakdown per enemy archetype.
   */
  public getStageTally(stage: number): StageTallyResult {
    return this.calculateStageTally(stage);
  }

  public addPowerUpPoints(points: number): void {
    this.addScore(points);
  }

  public calculateStageTally(stage: number): StageTallyResult {
    const order: EnemyType[] = [
      EnemyType.BASIC,
      EnemyType.FAST,
      EnemyType.POWER,
      EnemyType.ARMOR,
    ];

    let totalKills = 0;
    let totalStagePoints = 0;

    const rows: EnemyTallyRow[] = order.map((type) => {
      const count = this.stageKills[type] || 0;
      const unitPoints = ENEMY_CONFIGS[type]?.points ?? 100;
      const totalPoints = count * unitPoints;

      totalKills += count;
      totalStagePoints += totalPoints;

      return {
        type,
        count,
        unitPoints,
        totalPoints,
      };
    });

    return {
      stage,
      rows,
      totalKills,
      totalStagePoints,
      cumulativeScore: this.score,
      isNewHighScore: this.score >= this.highScore && this.score > 0,
    };
  }

  /**
   * Returns current score and high score for quick access.
   */
  public getHUDScore(): { score: number; highScore: number } {
    return {
      score: this.score,
      highScore: this.highScore,
    };
  }
}
