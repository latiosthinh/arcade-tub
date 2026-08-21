export interface SaveState {
  unlockedWorlds: number;
  completedStages: Record<string, boolean>;
  highScore: number;
  completionPercent: number;
}

const STORAGE_KEY = 'arcadetub_kirby_save';

export class SaveManager {
  private state: SaveState;

  constructor() {
    this.state = this.load();
  }

  load(): SaveState {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch {
        // Ignore localStorage error
      }
    }
    return {
      unlockedWorlds: 1,
      completedStages: {},
      highScore: 0,
      completionPercent: 0,
    };
  }

  save(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch {
        // Ignore
      }
    }
  }

  getState(): SaveState {
    return { ...this.state };
  }

  markStageComplete(stageId: string): void {
    this.state.completedStages[stageId] = true;
    const completedCount = Object.keys(this.state.completedStages).length;
    this.state.completionPercent = Math.min(100, Math.floor((completedCount / 20) * 100));

    // Unlock next world if boss cleared
    if (stageId === '1-boss' && this.state.unlockedWorlds < 2) this.state.unlockedWorlds = 2;
    if (stageId === '2-boss' && this.state.unlockedWorlds < 3) this.state.unlockedWorlds = 3;
    if (stageId === '3-boss' && this.state.unlockedWorlds < 4) this.state.unlockedWorlds = 4;

    this.save();
  }

  isStageCompleted(stageId: string): boolean {
    return !!this.state.completedStages[stageId];
  }

  updateScore(score: number): void {
    if (score > this.state.highScore) {
      this.state.highScore = score;
      this.save();
    }
  }

  reset(): void {
    this.state = {
      unlockedWorlds: 1,
      completedStages: {},
      highScore: 0,
      completionPercent: 0,
    };
    this.save();
  }
}
