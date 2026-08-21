import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from '../src/SaveManager';
import { WorldMapScene } from '../src/WorldMapScene';
import { WORLD_1_STAGES } from '../src/stages/WorldStages';

describe('World Map, Stage Data & Progression', () => {
  let saveManager: SaveManager;
  let worldMap: WorldMapScene;

  beforeEach(() => {
    saveManager = new SaveManager();
    saveManager.reset();
    worldMap = new WorldMapScene(saveManager);
  });

  it('initializes world map with 5 nodes per world (WRLD-01, WRLD-02)', () => {
    expect(worldMap.nodes.length).toBe(5);
    expect(worldMap.nodes[0].stageId).toBe('1-1');
    expect(worldMap.nodes[4].isBoss).toBe(true);
  });

  it('navigates unlocked nodes and blocks locked ones (WRLD-04)', () => {
    expect(worldMap.isNodeUnlocked(0)).toBe(true);
    expect(worldMap.isNodeUnlocked(1)).toBe(false); // Stage 2 locked

    expect(worldMap.moveNext()).toBe(false); // Can't move to locked

    saveManager.markStageComplete('1-1');
    expect(worldMap.isNodeUnlocked(1)).toBe(true);
    expect(worldMap.moveNext()).toBe(true);
    expect(worldMap.getSelectedStageId()).toBe('1-2');
  });

  it('tracks progression and auto-saves (WRLD-06)', () => {
    saveManager.markStageComplete('1-1');
    saveManager.markStageComplete('1-2');
    const state = saveManager.getState();
    expect(state.completedStages['1-1']).toBe(true);
    expect(state.completedStages['1-2']).toBe(true);
    expect(state.completionPercent).toBe(10); // 2/20 = 10%
  });

  it('verifies World 1 stages data structure (WRLD-03)', () => {
    expect(WORLD_1_STAGES.length).toBe(5);
    expect(WORLD_1_STAGES[0].rooms['main']).toBeDefined();
    expect(WORLD_1_STAGES[0].rooms['main'].enemies?.length).toBe(2);
  });
});
