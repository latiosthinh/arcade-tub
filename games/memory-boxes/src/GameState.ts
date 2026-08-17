import { loadData, saveData, reportScore } from '@arcade-carnival/playables-adapter';
import { SequenceGenerator } from './SequenceGenerator.js';

export type GameStatus =
  | 'ready'
  | 'playback'
  | 'player_turn'
  | 'round_complete'
  | 'paused'
  | 'gameover';

export interface StepResult {
  correct: boolean;
  roundCompleted: boolean;
  gameOver: boolean;
  pointsAwarded: number;
}

export class GameState {
  public static readonly INITIAL_LIVES = 3;
  public static readonly BASE_ROUND_SCORE = 500;
  public static readonly MAX_ROUND_TIME = 15.0;
  public static readonly TIME_BONUS_FACTOR = 50;
  public static readonly STORAGE_KEY = 'memory-boxes-highscore';

  public score: number = 0;
  public highScore: number = 0;
  public round: number = 1;
  public lives: number = GameState.INITIAL_LIVES;
  public streak: number = 0;
  public playerStepIndex: number = 0;
  public roundTimer: number = GameState.MAX_ROUND_TIME;
  public status: GameStatus = 'ready';

  private _sequenceGen: SequenceGenerator;
  private _previousStatus: GameStatus = 'ready';

  constructor(boxCount: number = 9, initialSequenceLength: number = 3) {
    this._sequenceGen = new SequenceGenerator(boxCount, initialSequenceLength);
    const raw = loadData(GameState.STORAGE_KEY);
    if (raw !== null) {
      const parsed = parseInt(raw, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        this.highScore = parsed;
      }
    }
  }

  public get sequence(): number[] {
    return this._sequenceGen.sequence;
  }

  public get currentLength(): number {
    return this._sequenceGen.currentLength;
  }

  public get streakMultiplier(): number {
    return 1 + this.streak * 0.25;
  }

  public start(): void {
    this.score = 0;
    this.round = 1;
    this.lives = GameState.INITIAL_LIVES;
    this.streak = 0;
    this.playerStepIndex = 0;
    this.roundTimer = GameState.MAX_ROUND_TIME;
    this._sequenceGen.reset(3);
    this.status = 'playback';
  }

  public startPlayerTurn(): void {
    this.playerStepIndex = 0;
    this.roundTimer = GameState.MAX_ROUND_TIME;
    this.status = 'player_turn';
  }

  public submitStep(boxId: number): StepResult {
    if (this.status !== 'player_turn') {
      return { correct: false, roundCompleted: false, gameOver: false, pointsAwarded: 0 };
    }

    const expectedBoxId = this._sequenceGen.sequence[this.playerStepIndex];

    if (boxId === expectedBoxId) {
      this.playerStepIndex++;

      // Check if sequence completed
      if (this.playerStepIndex >= this._sequenceGen.sequence.length) {
        this.streak++;
        const speedBonus = Math.round(this.roundTimer * GameState.TIME_BONUS_FACTOR);
        const baseScore = GameState.BASE_ROUND_SCORE * this.round;
        const pointsAwarded = Math.round((baseScore + speedBonus) * this.streakMultiplier);
        this.score += pointsAwarded;
        this.status = 'round_complete';

        return {
          correct: true,
          roundCompleted: true,
          gameOver: false,
          pointsAwarded,
        };
      }

      return {
        correct: true,
        roundCompleted: false,
        gameOver: false,
        pointsAwarded: 0,
      };
    }

    // Mistake
    this.lives--;
    this.streak = 0;
    this.playerStepIndex = 0;

    if (this.lives <= 0) {
      this.status = 'gameover';
      this.finalizeGame();
      return {
        correct: false,
        roundCompleted: false,
        gameOver: true,
        pointsAwarded: 0,
      };
    }

    return {
      correct: false,
      roundCompleted: false,
      gameOver: false,
      pointsAwarded: 0,
    };
  }

  public advanceRound(): void {
    this.round++;
    this._sequenceGen.advance();
    this.playerStepIndex = 0;
    this.roundTimer = GameState.MAX_ROUND_TIME;
    this.status = 'playback';
  }

  public update(dt: number): void {
    if (this.status !== 'player_turn') {
      return;
    }

    const safeDt = Number.isFinite(dt) ? Math.max(0, dt) : 0;
    this.roundTimer = Math.max(0, this.roundTimer - safeDt);

    if (this.roundTimer <= 0) {
      this.lives--;
      this.streak = 0;
      this.playerStepIndex = 0;
      this.roundTimer = GameState.MAX_ROUND_TIME;

      if (this.lives <= 0) {
        this.status = 'gameover';
        this.finalizeGame();
      }
    }
  }

  public pause(): void {
    if (this.status !== 'paused' && this.status !== 'gameover') {
      this._previousStatus = this.status;
      this.status = 'paused';
    }
  }

  public resume(): void {
    if (this.status === 'paused') {
      this.status = this._previousStatus;
    }
  }

  public restart(): void {
    this.start();
  }

  private finalizeGame(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      saveData(GameState.STORAGE_KEY, String(this.highScore));
    }
    reportScore(this.score);
  }
}
