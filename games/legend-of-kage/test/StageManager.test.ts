import { describe, it, expect, beforeEach } from 'vitest';
import { StageManager, STAGES } from '../src/stages/StageManager';
import { SeasonManager } from '../src/stages/SeasonManager';

describe('StageManager (STAG-01..04, STAG-06)', () => {
  let stageManager: StageManager;
  let seasonManager: SeasonManager;

  beforeEach(() => {
    seasonManager = new SeasonManager();
    stageManager = new StageManager(seasonManager);
  });

  it('tracks kills and advances through 4 stages (STAG-01..04)', () => {
    expect(stageManager.getCurrentStage().name).toBe('Bamboo Forest');

    // Score required kills for stage 1 (8 kills)
    for (let i = 0; i < 7; i++) {
      expect(stageManager.recordKill()).toBe(false);
    }
    expect(stageManager.recordKill()).toBe(true); // Stage cleared!

    const res = stageManager.advanceStage();
    expect(res.stage.name).toBe('Castle Moat & Wall');
    expect(res.isNewLoop).toBe(false);
  });

  it('triggers new seasonal loop after stage 4', () => {
    stageManager.currentStageIndex = 3; // Stage 4 Boss
    const res = stageManager.advanceStage();

    expect(res.isNewLoop).toBe(true);
    expect(stageManager.currentStageIndex).toBe(0);
    expect(seasonManager.currentSeason).toBe('summer'); // Advanced to loop 2!
  });
});
