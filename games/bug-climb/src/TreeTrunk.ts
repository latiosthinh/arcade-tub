export enum BranchSide {
  NONE = 'NONE',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface TrunkSegment {
  id: number;
  altitude: number;
  branch: BranchSide;
  woodVariation: number;
}

export class TreeTrunk {
  public static readonly VISIBLE_SEGMENTS = 8;
  public static readonly SEGMENT_HEIGHT = 80;
  public static readonly SAFE_START_SEGMENTS = 4;

  public segments: TrunkSegment[] = [];
  public nextAltitude = 0;

  private consecutiveLeft = 0;
  private consecutiveRight = 0;

  constructor() {
    this.reset();
  }

  public generateInitial(count: number = TreeTrunk.VISIBLE_SEGMENTS): void {
    this.segments = [];
    this.nextAltitude = 0;
    this.consecutiveLeft = 0;
    this.consecutiveRight = 0;

    for (let i = 0; i < count; i++) {
      let branch = BranchSide.NONE;
      if (i >= TreeTrunk.SAFE_START_SEGMENTS) {
        branch = this.generateNextBranch();
      }

      this.segments.push({
        id: this.nextAltitude,
        altitude: this.nextAltitude,
        branch,
        woodVariation: (this.nextAltitude * 7) % 5,
      });
      this.nextAltitude++;
    }
  }

  public step(): TrunkSegment {
    if (this.segments.length === 0) {
      this.generateInitial();
    }

    const removed = this.segments.shift()!;
    const newBranch = this.generateNextBranch();

    this.segments.push({
      id: this.nextAltitude,
      altitude: this.nextAltitude,
      branch: newBranch,
      woodVariation: (this.nextAltitude * 7) % 5,
    });
    this.nextAltitude++;

    return removed;
  }

  public getBranchAt(index: number): BranchSide {
    if (index < 0 || index >= this.segments.length) {
      return BranchSide.NONE;
    }
    return this.segments[index].branch;
  }

  public reset(): void {
    this.generateInitial();
  }

  private generateNextBranch(): BranchSide {
    // Solvable procedural rules:
    // 1. Never allow more than 4 consecutive branches on same side
    // 2. 45% chance NONE, 27.5% LEFT, 27.5% RIGHT
    const rand = Math.random();
    let choice = BranchSide.NONE;

    if (rand < 0.45) {
      choice = BranchSide.NONE;
    } else if (rand < 0.725) {
      choice = BranchSide.LEFT;
    } else {
      choice = BranchSide.RIGHT;
    }

    if (choice === BranchSide.LEFT && this.consecutiveLeft >= 4) {
      choice = BranchSide.RIGHT;
    } else if (choice === BranchSide.RIGHT && this.consecutiveRight >= 4) {
      choice = BranchSide.LEFT;
    }

    if (choice === BranchSide.LEFT) {
      this.consecutiveLeft++;
      this.consecutiveRight = 0;
    } else if (choice === BranchSide.RIGHT) {
      this.consecutiveRight++;
      this.consecutiveLeft = 0;
    } else {
      this.consecutiveLeft = 0;
      this.consecutiveRight = 0;
    }

    return choice;
  }
}
