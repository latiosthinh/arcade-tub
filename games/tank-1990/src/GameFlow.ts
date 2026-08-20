import {
  GameState,
  TitleOption,
  HUDState,
  TankTier,
} from './types';
import { ScoreManager } from './ScoreManager';
import { TOTAL_STAGES } from './stages';

export interface GameFlowConfig {
  curtainDuration?: number;
  tallyDuration?: number;
  scoreManager?: ScoreManager;
}

/**
 * GameFlow manages the finite state machine transitions, stage intro curtain timer,
 * end-stage score tally flow, pause/resume coordination, and active HUD data bindings.
 */
export class GameFlow {
  public state: GameState = GameState.TITLE;
  public currentStage: number = 1;
  public curtainTimer: number = 0;
  public curtainDuration: number = 2.0;
  public tallyTimer: number = 0;
  public tallyDuration: number = 3.5;
  public gameOverTimer: number = 0;
  public selectedTitleOption: TitleOption = TitleOption.ONE_PLAYER;
  public readonly scoreManager: ScoreManager;

  constructor(config: GameFlowConfig = {}) {
    if (config.curtainDuration !== undefined && config.curtainDuration > 0) {
      this.curtainDuration = config.curtainDuration;
    }
    if (config.tallyDuration !== undefined && config.tallyDuration > 0) {
      this.tallyDuration = config.tallyDuration;
    }
    this.scoreManager = config.scoreManager ?? new ScoreManager();
  }

  /**
   * Navigates back to TITLE screen.
   */
  public goToTitle(): void {
    this.state = GameState.TITLE;
    this.selectedTitleOption = TitleOption.ONE_PLAYER;
    this.curtainTimer = 0;
    this.tallyTimer = 0;
    this.gameOverTimer = 0;
  }

  /**
   * Validates and selects a stage number within [1, TOTAL_STAGES].
   */
  public selectStage(stageNumber: number): number {
    let s = Math.floor(stageNumber);
    if (isNaN(s)) s = 1;
    this.currentStage = Math.max(1, Math.min(TOTAL_STAGES, s));
    return this.currentStage;
  }

  /**
   * Starts a stage with the curtain introduction sequence.
   */
  public startStage(stageNumber?: number): void {
    if (stageNumber !== undefined) {
      this.selectStage(stageNumber);
    }
    this.state = GameState.STAGE_INTRO;
    this.curtainTimer = this.curtainDuration;
    this.scoreManager.resetStageKills();
  }

  /**
   * Pauses the active game if currently playing.
   */
  public pause(): boolean {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
      return true;
    }
    return false;
  }

  /**
   * Resumes gameplay from paused state.
   */
  public resume(): boolean {
    if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
      return true;
    }
    return false;
  }

  /**
   * Toggles pause state if in PLAYING or PAUSED.
   */
  public togglePause(): boolean {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
      return true;
    } else if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
      return true;
    }
    return false;
  }

  /**
   * Triggers GAME_OVER state when player loses all lives or Eagle HQ is destroyed.
   */
  public triggerGameOver(): void {
    this.state = GameState.GAME_OVER;
    this.gameOverTimer = 0;
    this.scoreManager.saveHighScore();
  }

  /**
   * Triggers VICTORY state when final stage (35) is completed.
   */
  public triggerVictory(): void {
    this.state = GameState.VICTORY;
    this.scoreManager.saveHighScore();
  }

  /**
   * Called when all 20 enemy tanks in a wave are defeated.
   */
  public onStageCleared(): void {
    this.state = GameState.STAGE_TALLY;
    this.tallyTimer = 0;
    this.scoreManager.saveHighScore();
  }

  /**
   * Advances to next stage or triggers VICTORY if all stages cleared.
   */
  public nextStage(): void {
    if (this.currentStage >= TOTAL_STAGES) {
      this.triggerVictory();
    } else {
      this.currentStage++;
      this.startStage(this.currentStage);
    }
  }

  /**
   * Restarts the entire campaign from Stage 1, resetting active score.
   */
  public restart(): void {
    this.currentStage = 1;
    this.scoreManager.resetGameScore();
    this.startStage(1);
  }

  /**
   * Updates state timers and handles automatic state transitions.
   */
  public update(dt: number): void {
    if (dt <= 0) return;

    switch (this.state) {
      case GameState.STAGE_INTRO:
        this.curtainTimer -= dt;
        if (this.curtainTimer <= 0) {
          this.curtainTimer = 0;
          this.state = GameState.PLAYING;
        }
        break;

      case GameState.STAGE_TALLY:
        this.tallyTimer += dt;
        break;

      case GameState.GAME_OVER:
        this.gameOverTimer += dt;
        break;

      default:
        break;
    }
  }

  /**
   * Returns normalized curtain opening progress in range [0, 1].
   * 0 = completely closed, 1 = completely open.
   */
  public getCurtainProgress(): number {
    if (this.curtainDuration <= 0) return 1.0;
    const progress = 1.0 - this.curtainTimer / this.curtainDuration;
    return Math.max(0.0, Math.min(1.0, progress));
  }

  /**
   * Returns normalized tally roll-up animation progress in range [0, 1].
   */
  public getTallyProgress(): number {
    if (this.tallyDuration <= 0) return 1.0;
    const progress = this.tallyTimer / this.tallyDuration;
    return Math.max(0.0, Math.min(1.0, progress));
  }

  /**
   * Generates a complete HUD snapshot for sidebar rendering.
   */
  public getHUDState(
    enemyReserveCount: number,
    playerLives: number,
    playerTier: TankTier = TankTier.TIER_1
  ): HUDState {
    return {
      stage: this.currentStage,
      lives: Math.max(0, playerLives),
      score: this.scoreManager.score,
      highScore: this.scoreManager.highScore,
      enemyReserveCount: Math.max(0, enemyReserveCount),
      playerTier,
      isGameOver: this.state === GameState.GAME_OVER,
      isPaused: this.state === GameState.PAUSED,
    };
  }
}
