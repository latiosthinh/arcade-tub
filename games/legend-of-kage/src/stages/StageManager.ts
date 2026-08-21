import { SeasonManager } from './SeasonManager';

export interface StageInfo {
  number: number;
  name: string;
  type: 'forest' | 'moat' | 'interior' | 'boss';
  stageWidth: number;
  stageHeight: number;
  targetKills: number;
}

export const STAGES: StageInfo[] = [
  { number: 1, name: 'Bamboo Forest', type: 'forest', stageWidth: 1200, stageHeight: 800, targetKills: 8 },
  { number: 2, name: 'Castle Moat & Wall', type: 'moat', stageWidth: 1000, stageHeight: 1000, targetKills: 10 },
  { number: 3, name: 'Castle Interior', type: 'interior', stageWidth: 900, stageHeight: 700, targetKills: 12 },
  { number: 4, name: 'Sanctuary Boss Chamber', type: 'boss', stageWidth: 800, stageHeight: 600, targetKills: 1 },
];

export class StageManager {
  currentStageIndex = 0;
  stageKillCount = 0;
  isStageCleared = false;
  isCutsceneActive = false;

  constructor(public seasonManager: SeasonManager) {}

  getCurrentStage(): StageInfo {
    return STAGES[this.currentStageIndex];
  }

  recordKill(): boolean {
    this.stageKillCount += 1;
    const stage = this.getCurrentStage();
    if (this.stageKillCount >= stage.targetKills) {
      this.isStageCleared = true;
      return true; // Cleared
    }
    return false;
  }

  advanceStage(): { isNewLoop: boolean; stage: StageInfo } {
    this.stageKillCount = 0;
    this.isStageCleared = false;

    if (this.currentStageIndex < STAGES.length - 1) {
      this.currentStageIndex += 1;
      return { isNewLoop: false, stage: this.getCurrentStage() };
    } else {
      // Loop complete: Advance season & reset to stage 1
      this.currentStageIndex = 0;
      this.seasonManager.advanceLoop();
      return { isNewLoop: true, stage: this.getCurrentStage() };
    }
  }
}
