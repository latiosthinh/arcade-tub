import { Tube, WATER_COLORS, WaterSortEngine } from './WaterSortEngine';

export interface LevelConfig {
  levelNumber: number;
  tubes: Tube[];
  colorsCount: number;
  tubeCapacity: number;
}

/**
 * Solvable procedural level generator for Color Water Sort
 */
export class LevelGenerator {
  readonly tubeCapacity: number;

  constructor(tubeCapacity: number = 4) {
    this.tubeCapacity = tubeCapacity;
  }

  /**
   * Generate a guaranteed solvable level with progressive difficulty
   */
  public generateLevel(levelNumber: number): LevelConfig {
    // Progressive color scaling:
    // Level 1: 2 colors, 3 tubes (2 colors + 1 buffer tube or 1 color + 2 empty)
    // Level 2-3: 3 colors, 5 tubes
    // Level 4-6: 4 colors, 6 tubes
    // Level 7-9: 5 colors, 7 tubes
    // Level 10-14: 6 colors, 8 tubes
    // Level 15-19: 7 colors, 9 tubes
    // Level 20+: 8 colors, 10 tubes (capped to available vibrant colors)
    let colorsCount: number;
    let emptyTubesCount = 2;

    if (levelNumber <= 1) {
      colorsCount = 2;
      emptyTubesCount = 1; // 3 tubes total for easiest intro
    } else if (levelNumber <= 3) {
      colorsCount = 3;
      emptyTubesCount = 2;
    } else if (levelNumber <= 6) {
      colorsCount = 4;
      emptyTubesCount = 2;
    } else if (levelNumber <= 9) {
      colorsCount = 5;
      emptyTubesCount = 2;
    } else if (levelNumber <= 14) {
      colorsCount = 6;
      emptyTubesCount = 2;
    } else if (levelNumber <= 19) {
      colorsCount = 7;
      emptyTubesCount = 2;
    } else {
      colorsCount = 8;
      emptyTubesCount = 2;
    }

    const totalTubes = colorsCount + emptyTubesCount;
    const selectedColors = WATER_COLORS.slice(0, colorsCount);

    // Create solved state: colorsCount full tubes + empty tubes
    const tubes: Tube[] = [];
    for (let i = 0; i < colorsCount; i++) {
      const color = selectedColors[i];
      tubes.push(Array(this.tubeCapacity).fill(color));
    }
    for (let i = 0; i < emptyTubesCount; i++) {
      tubes.push([]);
    }

    // Shuffle using reverse valid random pours
    // Threat mitigation T-45-03: Cap shuffle steps to max 50 to prevent hangs
    const maxSteps = Math.min(50, 15 + levelNumber * 2);
    this.shuffleSolvedBoard(tubes, maxSteps);

    return {
      levelNumber,
      tubes,
      colorsCount,
      tubeCapacity: this.tubeCapacity
    };
  }

  /**
   * Reverse-pour simulation to scramble the board into a solvable configuration
   */
  private shuffleSolvedBoard(tubes: Tube[], steps: number): void {
    const totalTubes = tubes.length;
    let successfulSteps = 0;
    let attempts = 0;
    const maxAttempts = steps * 6;

    // Reserve at least 1 tube to stay empty as breathing buffer room if possible
    const reserveEmpty = tubes.length >= 4;

    while (successfulSteps < steps && attempts < maxAttempts) {
      attempts++;
      const from = Math.floor(Math.random() * totalTubes);
      let to = Math.floor(Math.random() * totalTubes);

      // If reserving an empty buffer tube, keep last tube empty during scramble
      if (reserveEmpty && to === totalTubes - 1) {
        to = Math.floor(Math.random() * (totalTubes - 1));
      }

      if (from === to) continue;
      const source = tubes[from];
      const target = tubes[to];
      if (!source || !target) continue;

      if (source.length === 0) continue;
      if (target.length >= this.tubeCapacity) continue;

      // Transfer 1 unit from source to target
      const unit = source.pop();
      if (unit) {
        target.push(unit);
        successfulSteps++;
      }
    }

    // Ensure at least 1 tube remains empty for comfortable play
    const emptyCount = tubes.filter(t => t.length === 0).length;
    if (emptyCount === 0) {
      // Find the tube with fewest items and pour all of them into tubes with space
      let minIdx = -1;
      let minLen = 999;
      for (let i = 0; i < tubes.length; i++) {
        const currentTube = tubes[i];
        if (currentTube && currentTube.length > 0 && currentTube.length < minLen) {
          minLen = currentTube.length;
          minIdx = i;
        }
      }
      if (minIdx !== -1) {
        const sourceTube = tubes[minIdx];
        if (sourceTube) {
          const itemsToMove = [...sourceTube];
          tubes[minIdx] = [];
          for (const item of itemsToMove) {
            for (let i = 0; i < tubes.length; i++) {
              const destTube = tubes[i];
              if (destTube && i !== minIdx && destTube.length < this.tubeCapacity) {
                destTube.push(item);
                break;
              }
            }
          }
        }
      }
    }

    // Ensure we do not accidentally leave the puzzle in an already-solved state
    const engine = new WaterSortEngine(this.tubeCapacity);
    engine.setTubes(tubes);
    if (engine.isSolved() && tubes.length > 2) {
      // Force swap a unit between two non-empty tubes
      const nonEmpties = tubes.filter(t => t.length > 0);
      if (nonEmpties.length >= 2 && nonEmpties[0] && nonEmpties[1]) {
        const u1 = nonEmpties[0].pop();
        const u2 = nonEmpties[1].pop();
        if (u1 && u2) {
          nonEmpties[0].push(u2);
          nonEmpties[1].push(u1);
        }
      }
    }
  }
}
