import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScoreManager } from '../src/ScoreManager';
import { EnemyType, ENEMY_CONFIGS } from '../src/types';

describe('ScoreManager Unit Tests', () => {
  let scoreManager: ScoreManager;
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    const localStorageMock = {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value.toString();
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
    };
    vi.stubGlobal('localStorage', localStorageMock);
    scoreManager = new ScoreManager('test_tank1990_high_score');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('1. Initialization & Default Values', () => {
    it('initializes with 0 score, 20000 default high score, and empty stage kills', () => {
      expect(scoreManager.score).toBe(0);
      expect(scoreManager.highScore).toBe(20000);
      expect(scoreManager.stageKills[EnemyType.BASIC]).toBe(0);
      expect(scoreManager.stageKills[EnemyType.FAST]).toBe(0);
      expect(scoreManager.stageKills[EnemyType.POWER]).toBe(0);
      expect(scoreManager.stageKills[EnemyType.ARMOR]).toBe(0);
    });

    it('loads saved high score from localStorage during initialization', () => {
      mockStorage['custom_score_key'] = '45000';
      const customMgr = new ScoreManager('custom_score_key');
      expect(customMgr.highScore).toBe(45000);
    });
  });

  describe('2. Score Tracking & Per-Enemy Kills', () => {
    it('awards points and logs kills accurately for each enemy type', () => {
      // BASIC tank -> 100 pts
      const p1 = scoreManager.recordKill(EnemyType.BASIC);
      expect(p1).toBe(ENEMY_CONFIGS[EnemyType.BASIC].points);
      expect(scoreManager.score).toBe(100);
      expect(scoreManager.stageKills[EnemyType.BASIC]).toBe(1);

      // FAST tank -> 200 pts
      const p2 = scoreManager.recordKill(EnemyType.FAST);
      expect(p2).toBe(ENEMY_CONFIGS[EnemyType.FAST].points);
      expect(scoreManager.score).toBe(300);
      expect(scoreManager.stageKills[EnemyType.FAST]).toBe(1);

      // POWER tank -> 300 pts
      const p3 = scoreManager.recordKill(EnemyType.POWER);
      expect(p3).toBe(ENEMY_CONFIGS[EnemyType.POWER].points);
      expect(scoreManager.score).toBe(600);
      expect(scoreManager.stageKills[EnemyType.POWER]).toBe(1);

      // ARMOR tank -> 400 pts
      const p4 = scoreManager.recordKill(EnemyType.ARMOR);
      expect(p4).toBe(ENEMY_CONFIGS[EnemyType.ARMOR].points);
      expect(scoreManager.score).toBe(1000);
      expect(scoreManager.stageKills[EnemyType.ARMOR]).toBe(1);
    });

    it('adds bonus points via addScore', () => {
      scoreManager.addScore(500);
      expect(scoreManager.score).toBe(500);

      // Ignore zero or negative points
      scoreManager.addScore(0);
      scoreManager.addScore(-100);
      expect(scoreManager.score).toBe(500);
    });

    it('returns HUD score snapshot', () => {
      scoreManager.score = 1200;
      scoreManager.highScore = 20000;
      const hud = scoreManager.getHUDScore();
      expect(hud).toEqual({ score: 1200, highScore: 20000 });
    });
  });

  describe('3. Stage Kills Reset & Game Reset', () => {
    it('resets stage kills without resetting cumulative score', () => {
      scoreManager.recordKill(EnemyType.BASIC);
      scoreManager.recordKill(EnemyType.FAST);
      expect(scoreManager.score).toBe(300);
      expect(scoreManager.stageKills[EnemyType.BASIC]).toBe(1);
      expect(scoreManager.stageKills[EnemyType.FAST]).toBe(1);

      scoreManager.resetStageKills();
      expect(scoreManager.score).toBe(300);
      expect(scoreManager.stageKills[EnemyType.BASIC]).toBe(0);
      expect(scoreManager.stageKills[EnemyType.FAST]).toBe(0);
    });

    it('resets active score and stage kills on resetGameScore', () => {
      scoreManager.recordKill(EnemyType.BASIC);
      scoreManager.addScore(1000);
      expect(scoreManager.score).toBe(1100);

      scoreManager.resetGameScore();
      expect(scoreManager.score).toBe(0);
      expect(scoreManager.stageKills[EnemyType.BASIC]).toBe(0);
    });
  });

  describe('4. Stage Tally Calculation & Structured Breakdown', () => {
    it('calculates full stage tally breakdown per enemy archetype', () => {
      // 5 basic (500 pts), 3 fast (600 pts), 2 power (600 pts), 1 armor (400 pts)
      for (let i = 0; i < 5; i++) scoreManager.recordKill(EnemyType.BASIC);
      for (let i = 0; i < 3; i++) scoreManager.recordKill(EnemyType.FAST);
      for (let i = 0; i < 2; i++) scoreManager.recordKill(EnemyType.POWER);
      for (let i = 0; i < 1; i++) scoreManager.recordKill(EnemyType.ARMOR);

      const tally = scoreManager.calculateStageTally(1);

      expect(tally.stage).toBe(1);
      expect(tally.totalKills).toBe(11);
      expect(tally.totalStagePoints).toBe(2100);
      expect(tally.cumulativeScore).toBe(2100);
      expect(tally.isNewHighScore).toBe(false); // Default highScore is 20000

      expect(tally.rows).toHaveLength(4);
      expect(tally.rows[0]).toEqual({
        type: EnemyType.BASIC,
        count: 5,
        unitPoints: 100,
        totalPoints: 500,
      });
      expect(tally.rows[1]).toEqual({
        type: EnemyType.FAST,
        count: 3,
        unitPoints: 200,
        totalPoints: 600,
      });
      expect(tally.rows[2]).toEqual({
        type: EnemyType.POWER,
        count: 2,
        unitPoints: 300,
        totalPoints: 600,
      });
      expect(tally.rows[3]).toEqual({
        type: EnemyType.ARMOR,
        count: 1,
        unitPoints: 400,
        totalPoints: 400,
      });
    });

    it('flags isNewHighScore when score surpasses high score', () => {
      scoreManager.highScore = 500;
      scoreManager.addScore(1000);
      const tally = scoreManager.calculateStageTally(2);
      expect(tally.isNewHighScore).toBe(true);
    });
  });

  describe('5. LocalStorage High Score Persistence & Safety', () => {
    it('updates and persists high score when score exceeds previous record', () => {
      scoreManager.highScore = 20000;
      scoreManager.addScore(25000);

      expect(scoreManager.highScore).toBe(25000);
      expect(mockStorage['test_tank1990_high_score']).toBe('25000');
    });

    it('handles corrupted localStorage values gracefully by retaining fallback', () => {
      mockStorage['corrupt_key'] = 'invalid_number';
      const corruptMgr = new ScoreManager('corrupt_key');
      expect(corruptMgr.highScore).toBe(20000);
    });

    it('handles negative or NaN parsed scores in localStorage', () => {
      mockStorage['neg_key'] = '-500';
      const negMgr = new ScoreManager('neg_key');
      expect(negMgr.highScore).toBe(20000);
    });

    it('safely handles localStorage throwing errors (e.g. quota exceeded / sandbox)', () => {
      const errorStorage = {
        getItem: vi.fn(() => {
          throw new Error('SecurityError: The operation is insecure.');
        }),
        setItem: vi.fn(() => {
          throw new Error('QuotaExceededError');
        }),
      };
      vi.stubGlobal('localStorage', errorStorage);

      const errMgr = new ScoreManager('err_key');
      expect(errMgr.highScore).toBe(20000);

      errMgr.score = 30000;
      expect(() => errMgr.saveHighScore()).not.toThrow();
      expect(errMgr.highScore).toBe(30000);
    });

    it('safely operates in environments without localStorage (undefined/null)', () => {
      vi.stubGlobal('localStorage', undefined);
      const undefMgr = new ScoreManager('undef_key');
      expect(undefMgr.highScore).toBe(20000);

      undefMgr.score = 40000;
      expect(() => undefMgr.saveHighScore()).not.toThrow();
      expect(undefMgr.highScore).toBe(40000);
    });
  });
});
