import { BoardPiece, BeamColor } from './OpticsEngine.js';

export interface PuzzleLevel {
  levelNumber: number;
  rows: number;
  cols: number;
  parMoves: number;
  pieces: BoardPiece[];
}

export class PuzzleGridGenerator {
  static getLevel(levelNumber: number): PuzzleLevel {
    switch (levelNumber) {
      case 1:
        // Level 1: Simple 90-degree mirror reflection to target
        return {
          levelNumber: 1,
          rows: 5,
          cols: 5,
          parMoves: 1,
          pieces: [
            { id: 1, row: 2, col: 0, type: 'emitter', direction: 'RIGHT', color: 'red', rotatable: false, draggable: false },
            { id: 2, row: 2, col: 2, type: 'mirror', angle: 90, rotatable: true, draggable: false },
            { id: 3, row: 4, col: 2, type: 'target', color: 'red', rotatable: false, draggable: false }
          ]
        };

      case 2:
        // Level 2: Two Mirrors S-Route around blocker
        return {
          levelNumber: 2,
          rows: 5,
          cols: 5,
          parMoves: 2,
          pieces: [
            { id: 1, row: 0, col: 1, type: 'emitter', direction: 'DOWN', color: 'green', rotatable: false, draggable: false },
            { id: 2, row: 2, col: 1, type: 'blocker', rotatable: false, draggable: false },
            { id: 3, row: 1, col: 1, type: 'mirror', angle: 0, rotatable: true, draggable: false },
            { id: 4, row: 1, col: 3, type: 'mirror', angle: 90, rotatable: true, draggable: false },
            { id: 5, row: 4, col: 3, type: 'target', color: 'green', rotatable: false, draggable: false }
          ]
        };

      case 3:
        // Level 3: Color Filter & Mirror
        return {
          levelNumber: 3,
          rows: 6,
          cols: 6,
          parMoves: 2,
          pieces: [
            { id: 1, row: 1, col: 0, type: 'emitter', direction: 'RIGHT', color: 'white', rotatable: false, draggable: false },
            { id: 2, row: 1, col: 2, type: 'filter', color: 'cyan', rotatable: false, draggable: false },
            { id: 3, row: 1, col: 4, type: 'mirror', angle: 0, rotatable: true, draggable: false },
            { id: 4, row: 4, col: 4, type: 'mirror', angle: 90, rotatable: true, draggable: false },
            { id: 5, row: 4, col: 1, type: 'target', color: 'cyan', rotatable: false, draggable: false }
          ]
        };

      case 4:
        // Level 4: Prism light splitter hitting dual targets
        return {
          levelNumber: 4,
          rows: 6,
          cols: 6,
          parMoves: 3,
          pieces: [
            { id: 1, row: 2, col: 0, type: 'emitter', direction: 'RIGHT', color: 'white', rotatable: false, draggable: false },
            { id: 2, row: 2, col: 2, type: 'prism', rotatable: false, draggable: false },
            { id: 3, row: 0, col: 2, type: 'mirror', angle: 0, rotatable: true, draggable: false },
            { id: 4, row: 4, col: 2, type: 'mirror', angle: 90, rotatable: true, draggable: false },
            { id: 5, row: 0, col: 5, type: 'target', color: 'red', rotatable: false, draggable: false },
            { id: 6, row: 4, col: 5, type: 'target', color: 'blue', rotatable: false, draggable: false }
          ]
        };

      case 5:
      default:
        // Level 5: Grand Optical Network
        return {
          levelNumber: 5,
          rows: 6,
          cols: 6,
          parMoves: 4,
          pieces: [
            { id: 1, row: 0, col: 2, type: 'emitter', direction: 'DOWN', color: 'white', rotatable: false, draggable: false },
            { id: 2, row: 2, col: 2, type: 'prism', rotatable: false, draggable: false },
            { id: 3, row: 2, col: 0, type: 'mirror', angle: 90, rotatable: true, draggable: false },
            { id: 4, row: 5, col: 0, type: 'mirror', angle: 0, rotatable: true, draggable: false },
            { id: 5, row: 2, col: 5, type: 'mirror', angle: 0, rotatable: true, draggable: false },
            { id: 6, row: 5, col: 5, type: 'target', color: 'red', rotatable: false, draggable: false },
            { id: 7, row: 5, col: 3, type: 'target', color: 'blue', rotatable: false, draggable: false }
          ]
        };
    }
  }

  static getMaxLevels(): number {
    return 5;
  }
}
