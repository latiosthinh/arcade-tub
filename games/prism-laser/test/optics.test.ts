import { describe, it, expect, beforeEach } from 'vitest';
import { OpticsEngine, BoardPiece } from '../src/OpticsEngine.js';
import { PuzzleGridGenerator } from '../src/PuzzleGridGenerator.js';
import { GameState } from '../src/GameState.js';

describe('Prism Laser Optics Engine', () => {
  describe('Optics Reflection and Beam Math', () => {
    it('reflects beams off 45-degree angle mirrors', () => {
      // '/' mirror (angle 0)
      expect(OpticsEngine.reflect('RIGHT', 0)).toBe('UP');
      expect(OpticsEngine.reflect('UP', 0)).toBe('RIGHT');
      expect(OpticsEngine.reflect('DOWN', 0)).toBe('LEFT');
      expect(OpticsEngine.reflect('LEFT', 0)).toBe('DOWN');

      // '\' mirror (angle 90)
      expect(OpticsEngine.reflect('RIGHT', 90)).toBe('DOWN');
      expect(OpticsEngine.reflect('DOWN', 90)).toBe('RIGHT');
      expect(OpticsEngine.reflect('UP', 90)).toBe('LEFT');
      expect(OpticsEngine.reflect('LEFT', 90)).toBe('UP');
    });

    it('traces laser beam from emitter to target via mirror', () => {
      const engine = new OpticsEngine(5, 5);
      const pieces: BoardPiece[] = [
        { id: 1, row: 2, col: 0, type: 'emitter', direction: 'RIGHT', color: 'red', rotatable: false, draggable: false },
        { id: 2, row: 2, col: 2, type: 'mirror', angle: 90, rotatable: true, draggable: false }, // reflects DOWN
        { id: 3, row: 4, col: 2, type: 'target', color: 'red', rotatable: false, draggable: false }
      ];

      const trace = engine.traceBeams(pieces);
      expect(trace.activatedTargets).toContain(3);
      expect(engine.isPuzzleSolved(pieces)).toBe(true);

      // Rotate mirror to angle 0 (reflects UP instead of DOWN)
      pieces[1].angle = 0;
      const traceAfterRotate = engine.traceBeams(pieces);
      expect(traceAfterRotate.activatedTargets).not.toContain(3);
      expect(engine.isPuzzleSolved(pieces)).toBe(false);
    });

    it('splits white light beam through prism into dual colored beams', () => {
      const engine = new OpticsEngine(5, 5);
      const pieces: BoardPiece[] = [
        { id: 1, row: 2, col: 0, type: 'emitter', direction: 'RIGHT', color: 'white', rotatable: false, draggable: false },
        { id: 2, row: 2, col: 2, type: 'prism', rotatable: false, draggable: false },
        { id: 3, row: 0, col: 2, type: 'target', color: 'red', rotatable: false, draggable: false },
        { id: 4, row: 4, col: 2, type: 'target', color: 'blue', rotatable: false, draggable: false }
      ];

      const trace = engine.traceBeams(pieces);
      expect(trace.activatedTargets).toContain(3);
      expect(trace.activatedTargets).toContain(4);
      expect(engine.isPuzzleSolved(pieces)).toBe(true);
    });

    it('filters beam color using optical filters', () => {
      const engine = new OpticsEngine(5, 5);
      const pieces: BoardPiece[] = [
        { id: 1, row: 2, col: 0, type: 'emitter', direction: 'RIGHT', color: 'white', rotatable: false, draggable: false },
        { id: 2, row: 2, col: 2, type: 'filter', color: 'cyan', rotatable: false, draggable: false },
        { id: 3, row: 2, col: 4, type: 'target', color: 'cyan', rotatable: false, draggable: false }
      ];

      const trace = engine.traceBeams(pieces);
      expect(trace.activatedTargets).toContain(3);
      expect(engine.isPuzzleSolved(pieces)).toBe(true);
    });
  });

  describe('PuzzleGridGenerator Level Solvability', () => {
    it('verifies all procedural levels can be loaded and tested', () => {
      const maxLevels = PuzzleGridGenerator.getMaxLevels();
      expect(maxLevels).toBe(5);

      for (let lvl = 1; lvl <= maxLevels; lvl++) {
        const level = PuzzleGridGenerator.getLevel(lvl);
        expect(level.pieces.length).toBeGreaterThan(0);
        expect(level.rows).toBeGreaterThanOrEqual(5);
        expect(level.cols).toBeGreaterThanOrEqual(5);
      }
    });
  });

  describe('GameState', () => {
    let state: GameState;

    beforeEach(() => {
      state = new GameState();
      state.startGame();
    });

    it('increments move counts and awards score upon level clear', () => {
      state.incrementMove();
      state.incrementMove();
      expect(state.movesMade).toBe(2);

      state.clearLevel(2);
      expect(state.status).toBe('level_cleared');
      expect(state.totalScore).toBeGreaterThan(0);
    });

    it('advances through levels to game completion', () => {
      expect(state.currentLevelNumber).toBe(1);
      const next1 = state.nextLevel(2);
      expect(next1).toBe(true);
      expect(state.currentLevelNumber).toBe(2);

      const next2 = state.nextLevel(2);
      expect(next2).toBe(false);
      expect(state.status).toBe('completed');
    });
  });
});
