/**
 * Core test tube and liquid color models
 */
export type ColorLayer = string;
export type Tube = ColorLayer[];

export interface MoveRecord {
  fromIndex: number;
  toIndex: number;
  color: string;
  count: number;
}

export const WATER_COLORS = [
  '#FF3B30', // Vibrant Red
  '#007AFF', // Royal Blue
  '#34C759', // Emerald Green
  '#FF9500', // Citrus Orange
  '#AF52DE', // Violet Purple
  '#FFCC00', // Golden Yellow
  '#5856D6', // Indigo
  '#00C7BE', // Teal Aqua
  '#FF2D55', // Hot Pink
  '#A2845E'  // Warm Clay
];

/**
 * Deterministic puzzle state manager for Color Water Sort
 */
export class WaterSortEngine {
  readonly tubeCapacity: number;
  private tubes: Tube[] = [];
  private initialTubes: Tube[] = [];
  private undoStack: MoveRecord[] = [];

  constructor(tubeCapacity: number = 4) {
    this.tubeCapacity = tubeCapacity;
  }

  /**
   * Set and initialize tube state
   */
  public setTubes(tubes: Tube[]): void {
    this.tubes = tubes.map(tube => [...tube]);
    this.initialTubes = tubes.map(tube => [...tube]);
    this.undoStack = [];
  }

  /**
   * Get current tubes array
   */
  public getTubes(): Tube[] {
    return this.tubes;
  }

  /**
   * Get specific tube by index
   */
  public getTube(index: number): Tube | undefined {
    return this.tubes[index];
  }

  /**
   * Get color of uppermost liquid layer in tube
   */
  public getTopColor(tubeIndex: number): string | null {
    const tube = this.tubes[tubeIndex];
    if (!tube || tube.length === 0) return null;
    return tube[tube.length - 1];
  }

  /**
   * Count contiguous units of top color in a tube
   */
  public getTopRunLength(tubeIndex: number): number {
    const tube = this.tubes[tubeIndex];
    if (!tube || tube.length === 0) return 0;
    const topColor = tube[tube.length - 1];
    let count = 0;
    for (let i = tube.length - 1; i >= 0; i--) {
      if (tube[i] === topColor) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  /**
   * Validate if liquid can be poured from source to destination
   */
  public canPour(fromIndex: number, toIndex: number): boolean {
    if (fromIndex === toIndex) return false;
    if (fromIndex < 0 || fromIndex >= this.tubes.length) return false;
    if (toIndex < 0 || toIndex >= this.tubes.length) return false;

    const source = this.tubes[fromIndex];
    const target = this.tubes[toIndex];

    if (source.length === 0) return false; // Source empty
    if (target.length >= this.tubeCapacity) return false; // Target full

    const sourceTop = source[source.length - 1];
    if (target.length === 0) return true; // Empty destination is always valid

    const targetTop = target[target.length - 1];
    return sourceTop === targetTop; // Colors must match
  }

  /**
   * Calculate how many units will transfer in a valid pour
   */
  public getTransferCount(fromIndex: number, toIndex: number): number {
    if (!this.canPour(fromIndex, toIndex)) return 0;

    const sourceRun = this.getTopRunLength(fromIndex);
    const targetAvailable = this.tubeCapacity - this.tubes[toIndex].length;

    return Math.min(sourceRun, targetAvailable);
  }

  /**
   * Execute pour move from source to target
   */
  public pour(fromIndex: number, toIndex: number): MoveRecord | null {
    const count = this.getTransferCount(fromIndex, toIndex);
    if (count <= 0) return null;

    const source = this.tubes[fromIndex];
    const target = this.tubes[toIndex];
    const color = source[source.length - 1];

    for (let i = 0; i < count; i++) {
      source.pop();
      target.push(color);
    }

    const record: MoveRecord = {
      fromIndex,
      toIndex,
      color,
      count
    };

    this.undoStack.push(record);
    return record;
  }

  /**
   * Undo the previous pour move
   */
  public undo(): MoveRecord | null {
    if (this.undoStack.length === 0) return null;
    const lastMove = this.undoStack.pop()!;

    const source = this.tubes[lastMove.fromIndex];
    const target = this.tubes[lastMove.toIndex];

    // Revert transferred units from target back to source
    for (let i = 0; i < lastMove.count; i++) {
      target.pop();
      source.push(lastMove.color);
    }

    return lastMove;
  }

  /**
   * Check if undo is available
   */
  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Get count of stored undo moves
   */
  public getUndoCount(): number {
    return this.undoStack.length;
  }

  /**
   * Restart current level to initial configuration
   */
  public restart(): void {
    this.tubes = this.initialTubes.map(tube => [...tube]);
    this.undoStack = [];
  }

  /**
   * Check if puzzle is solved (every tube is either empty or full uniform color)
   */
  public isSolved(): boolean {
    if (this.tubes.length === 0) return false;

    let solvedFullTubes = 0;
    for (const tube of this.tubes) {
      if (tube.length === 0) {
        continue;
      }
      if (tube.length !== this.tubeCapacity) {
        return false;
      }
      const firstColor = tube[0];
      for (let i = 1; i < tube.length; i++) {
        if (tube[i] !== firstColor) {
          return false;
        }
      }
      solvedFullTubes++;
    }

    return solvedFullTubes > 0;
  }

  /**
   * Check if a specific tube is fully completed with a single color
   */
  public isTubeComplete(tubeIndex: number): boolean {
    const tube = this.tubes[tubeIndex];
    if (!tube || tube.length !== this.tubeCapacity) return false;
    const color = tube[0];
    return tube.every(c => c === color);
  }
}
