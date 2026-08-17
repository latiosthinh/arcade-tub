import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameState } from '../src/GameState';
import * as adapter from '@arcade-carnival/playables-adapter';

vi.mock('@arcade-carnival/playables-adapter', () => ({
  loadData: vi.fn(),
  saveData: vi.fn(),
  reportScore: vi.fn(),
}));

describe('GameState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default status ready and loaded high score', () => {
    vi.mocked(adapter.loadData).mockReturnValue('1500');
    const state = new GameState();
    expect(state.status).toBe('ready');
    expect(state.score).toBe(0);
    expect(state.highScore).toBe(1500);
    expect(state.movesCount).toBe(0);
    expect(state.wonAcknowledged).toBe(false);
  });

  it('handles corrupted high score gracefully', () => {
    vi.mocked(adapter.loadData).mockReturnValue('invalid-json-nan');
    const state = new GameState();
    expect(state.highScore).toBe(0);
  });

  it('starts game and resets grid', () => {
    const state = new GameState();
    state.start();
    expect(state.status).toBe('playing');
    expect(state.grid.getEmptyCells().length).toBe(14); // 2 spawned out of 16
  });

  it('executes valid moves, updates score, movesCount, and high score', () => {
    const state = new GameState();
    state.start();
    state.grid.setCells([
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    const res = state.move('left');
    expect(res.moved).toBe(true);
    expect(state.score).toBe(4);
    expect(state.highScore).toBe(4);
    expect(state.movesCount).toBe(1);
    expect(adapter.saveData).toHaveBeenCalledWith('arcade-carnival-2048-highscore', '4');
    expect(adapter.reportScore).toHaveBeenCalledWith(4);
  });

  it('triggers won status on reaching 2048 and allows continueAfterWin', () => {
    const state = new GameState();
    state.start();
    state.grid.setCells([
      [1024, 1024, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    state.move('left');
    expect(state.status).toBe('won');
    expect(state.maxTile).toBe(2048);

    // Continuing after win
    state.continueAfterWin();
    expect(state.status).toBe('playing');
    expect(state.wonAcknowledged).toBe(true);

    // Another move does not re-trigger won
    state.grid.setCells([
      [2048, 2048, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    state.move('left');
    expect(state.status).toBe('playing');
  });

  it('triggers gameover when no moves are possible', () => {
    const state = new GameState();
    state.start();
    state.grid.setCells([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 0, 2, 4], // Row 3: empty at (3, 1)
    ]);

    // Move left to shift 2 from (3,2) to (3,1), and 4 from (3,3) to (3,2), leaving (3,3) empty.
    // Slide will spawn into (3,3). With rng returning 0.5 (val=2), board becomes full alternating [4, 2, 4, 2]
    state.move('left', () => 0.5);
    expect(state.status).toBe('gameover');
  });

  it('handles undo correctly, restoring previous state and score', () => {
    const state = new GameState();
    state.start();
    state.grid.setCells([
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);

    state.move('left');
    expect(state.score).toBe(4);
    expect(state.movesCount).toBe(1);

    const undone = state.undo();
    expect(undone).toBe(true);
    expect(state.score).toBe(0);
    expect(state.movesCount).toBe(0);
    expect(state.grid.getCell(0, 0)).toBe(2);
    expect(state.grid.getCell(0, 1)).toBe(2);
  });
});
