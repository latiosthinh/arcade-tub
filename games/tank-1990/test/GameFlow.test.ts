import { describe, it, expect, beforeEach } from 'vitest';
import { GameFlow } from '../src/GameFlow';
import { ScoreManager } from '../src/ScoreManager';
import { GameState, TitleOption, TankTier, EnemyType } from '../src/types';
import { TOTAL_STAGES } from '../src/stages';

describe('GameFlow Unit Tests', () => {
  let scoreManager: ScoreManager;
  let gameFlow: GameFlow;

  beforeEach(() => {
    scoreManager = new ScoreManager('test_gameflow_score');
    scoreManager.resetGameScore();
    scoreManager.highScore = 20000;
    gameFlow = new GameFlow({
      curtainDuration: 2.0,
      tallyDuration: 3.5,
      scoreManager,
    });
  });

  describe('1. State Machine Initialization & Navigation', () => {
    it('initializes in TITLE state with stage 1 and default config', () => {
      expect(gameFlow.state).toBe(GameState.TITLE);
      expect(gameFlow.currentStage).toBe(1);
      expect(gameFlow.selectedTitleOption).toBe(TitleOption.ONE_PLAYER);
      expect(gameFlow.curtainDuration).toBe(2.0);
      expect(gameFlow.tallyDuration).toBe(3.5);
    });

    it('goToTitle resets state, options, and timers', () => {
      gameFlow.startStage(5);
      gameFlow.update(2.5); // Now PLAYING
      gameFlow.pause(); // Now PAUSED

      gameFlow.goToTitle();

      expect(gameFlow.state).toBe(GameState.TITLE);
      expect(gameFlow.curtainTimer).toBe(0);
      expect(gameFlow.tallyTimer).toBe(0);
      expect(gameFlow.gameOverTimer).toBe(0);
      expect(gameFlow.selectedTitleOption).toBe(TitleOption.ONE_PLAYER);
    });
  });

  describe('2. Stage Selection & Clamping', () => {
    it('clamps selected stages within [1, TOTAL_STAGES] range', () => {
      expect(gameFlow.selectStage(0)).toBe(1);
      expect(gameFlow.selectStage(-5)).toBe(1);
      expect(gameFlow.selectStage(1)).toBe(1);
      expect(gameFlow.selectStage(15)).toBe(15);
      expect(gameFlow.selectStage(TOTAL_STAGES)).toBe(TOTAL_STAGES);
      expect(gameFlow.selectStage(TOTAL_STAGES + 10)).toBe(TOTAL_STAGES);
      expect(gameFlow.selectStage(NaN)).toBe(1);
    });
  });

  describe('3. Stage Intro & Curtain Timer Transitions', () => {
    it('startStage transitions to STAGE_INTRO and sets curtainTimer', () => {
      gameFlow.startStage(3);

      expect(gameFlow.state).toBe(GameState.STAGE_INTRO);
      expect(gameFlow.currentStage).toBe(3);
      expect(gameFlow.curtainTimer).toBe(2.0);
      expect(gameFlow.getCurtainProgress()).toBe(0.0); // (1 - 2.0/2.0) = 0
    });

    it('curtain timer decrements and auto-transitions to PLAYING upon expiration', () => {
      gameFlow.startStage(1);
      expect(gameFlow.state).toBe(GameState.STAGE_INTRO);

      // Advance halfway
      gameFlow.update(1.0);
      expect(gameFlow.state).toBe(GameState.STAGE_INTRO);
      expect(gameFlow.curtainTimer).toBe(1.0);
      expect(gameFlow.getCurtainProgress()).toBe(0.5);

      // Advance remaining duration
      gameFlow.update(1.0);
      expect(gameFlow.state).toBe(GameState.PLAYING);
      expect(gameFlow.curtainTimer).toBe(0);
      expect(gameFlow.getCurtainProgress()).toBe(1.0);
    });

    it('handles dt <= 0 gracefully during update', () => {
      gameFlow.startStage(1);
      gameFlow.update(0);
      gameFlow.update(-1);
      expect(gameFlow.curtainTimer).toBe(2.0);
      expect(gameFlow.state).toBe(GameState.STAGE_INTRO);
    });
  });

  describe('4. Pause & Resume Mechanics', () => {
    beforeEach(() => {
      gameFlow.startStage(1);
      gameFlow.update(2.0); // Transition to PLAYING
      expect(gameFlow.state).toBe(GameState.PLAYING);
    });

    it('pause() succeeds only in PLAYING state', () => {
      expect(gameFlow.pause()).toBe(true);
      expect(gameFlow.state).toBe(GameState.PAUSED);

      // Cannot pause again while already PAUSED
      expect(gameFlow.pause()).toBe(false);
    });

    it('resume() succeeds only in PAUSED state', () => {
      // Cannot resume while PLAYING
      expect(gameFlow.resume()).toBe(false);

      gameFlow.pause();
      expect(gameFlow.resume()).toBe(true);
      expect(gameFlow.state).toBe(GameState.PLAYING);
    });

    it('togglePause toggles back and forth between PLAYING and PAUSED', () => {
      expect(gameFlow.togglePause()).toBe(true);
      expect(gameFlow.state).toBe(GameState.PAUSED);

      expect(gameFlow.togglePause()).toBe(true);
      expect(gameFlow.state).toBe(GameState.PLAYING);
    });

    it('togglePause rejects toggling in TITLE, STAGE_INTRO, or GAME_OVER', () => {
      gameFlow.goToTitle();
      expect(gameFlow.togglePause()).toBe(false);
      expect(gameFlow.state).toBe(GameState.TITLE);

      gameFlow.startStage(1);
      expect(gameFlow.togglePause()).toBe(false);
      expect(gameFlow.state).toBe(GameState.STAGE_INTRO);

      gameFlow.triggerGameOver();
      expect(gameFlow.togglePause()).toBe(false);
      expect(gameFlow.state).toBe(GameState.GAME_OVER);
    });
  });

  describe('5. Stage Clear, Tally Progress, & Stage Advancement', () => {
    it('onStageCleared transitions to STAGE_TALLY and starts tallyTimer', () => {
      gameFlow.startStage(1);
      gameFlow.update(2.0); // PLAYING

      gameFlow.onStageCleared();
      expect(gameFlow.state).toBe(GameState.STAGE_TALLY);
      expect(gameFlow.tallyTimer).toBe(0);
      expect(gameFlow.getTallyProgress()).toBe(0.0);

      gameFlow.update(1.75);
      expect(gameFlow.tallyTimer).toBe(1.75);
      expect(gameFlow.getTallyProgress()).toBe(0.5); // 1.75 / 3.5 = 0.5
    });

    it('nextStage advances currentStage and enters STAGE_INTRO for next stage', () => {
      gameFlow.startStage(1);
      gameFlow.update(2.0); // PLAYING
      gameFlow.onStageCleared();

      gameFlow.nextStage();
      expect(gameFlow.currentStage).toBe(2);
      expect(gameFlow.state).toBe(GameState.STAGE_INTRO);
      expect(gameFlow.curtainTimer).toBe(2.0);
    });

    it('nextStage triggers VICTORY when completing stage 35', () => {
      gameFlow.startStage(TOTAL_STAGES); // 35
      gameFlow.update(2.0);
      gameFlow.onStageCleared();

      gameFlow.nextStage();
      expect(gameFlow.state).toBe(GameState.VICTORY);
    });

    it('triggerVictory directly sets VICTORY state', () => {
      gameFlow.triggerVictory();
      expect(gameFlow.state).toBe(GameState.VICTORY);
    });
  });

  describe('6. Game Over, Defeat, & Restart Flow', () => {
    it('triggerGameOver sets GAME_OVER state and updates gameOverTimer', () => {
      gameFlow.startStage(1);
      gameFlow.update(2.0);

      gameFlow.triggerGameOver();
      expect(gameFlow.state).toBe(GameState.GAME_OVER);
      expect(gameFlow.gameOverTimer).toBe(0);

      gameFlow.update(1.5);
      expect(gameFlow.gameOverTimer).toBe(1.5);
    });

    it('restart resets game score, stage to 1, and starts STAGE_INTRO', () => {
      scoreManager.recordKill(EnemyType.BASIC);
      scoreManager.recordKill(EnemyType.ARMOR);
      expect(scoreManager.score).toBe(500);

      gameFlow.startStage(10);
      gameFlow.triggerGameOver();

      gameFlow.restart();

      expect(gameFlow.currentStage).toBe(1);
      expect(scoreManager.score).toBe(0);
      expect(gameFlow.state).toBe(GameState.STAGE_INTRO);
      expect(gameFlow.curtainTimer).toBe(2.0);
    });
  });

  describe('7. HUD State Snapshot Bindings', () => {
    it('generates accurate HUDState snapshot matching active game status', () => {
      scoreManager.score = 3400;
      scoreManager.highScore = 20000;
      gameFlow.currentStage = 4;

      const hud = gameFlow.getHUDState(16, 2, TankTier.TIER_3);

      expect(hud).toEqual({
        stage: 4,
        lives: 2,
        score: 3400,
        highScore: 20000,
        enemyReserveCount: 16,
        playerTier: TankTier.TIER_3,
        isGameOver: false,
        isPaused: false,
      });
    });

    it('reflects isGameOver and isPaused flags in HUDState', () => {
      gameFlow.startStage(1);
      gameFlow.update(2.0);
      gameFlow.pause();

      let hud = gameFlow.getHUDState(10, 1, TankTier.TIER_1);
      expect(hud.isPaused).toBe(true);
      expect(hud.isGameOver).toBe(false);

      gameFlow.triggerGameOver();
      hud = gameFlow.getHUDState(0, 0, TankTier.TIER_1);
      expect(hud.isGameOver).toBe(true);
      expect(hud.isPaused).toBe(false);
      expect(hud.lives).toBe(0);
      expect(hud.enemyReserveCount).toBe(0);
    });

    it('clamps negative lives or enemyReserveCount to 0 in HUDState', () => {
      const hud = gameFlow.getHUDState(-5, -2, TankTier.TIER_1);
      expect(hud.lives).toBe(0);
      expect(hud.enemyReserveCount).toBe(0);
    });
  });
});
