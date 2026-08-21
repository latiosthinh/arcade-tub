export interface KageSaveState {
  highScore: number;
  highestLoop: number;
  highestStage: number;
}

const STORAGE_KEY = 'arcadetub_kage_save';

export class SaveManager {
  private state: KageSaveState;

  constructor() {
    this.state = this.load();
  }

  load(): KageSaveState {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch {
        // Ignore
      }
    }
    return { highScore: 0, highestLoop: 1, highestStage: 1 };
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

  updateProgress(loop: number, stage: number, score: number): void {
    if (loop > this.state.highestLoop) this.state.highestLoop = loop;
    if (stage > this.state.highestStage) this.state.highestStage = stage;
    if (score > this.state.highScore) this.state.highScore = score;
    this.save();
  }

  getState(): KageSaveState {
    return { ...this.state };
  }
}
