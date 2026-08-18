import { TreeTrunk, BranchSide } from './TreeTrunk';

export enum ClimberSide {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface ClimbResult {
  success: boolean;
  collided: boolean;
  branchHit: BranchSide;
  climbedAltitude: number;
}

export class BugClimber {
  public side: ClimberSide = ClimberSide.LEFT;
  public altitude = 0;
  public scurryTimer = 0;
  public alive = true;

  constructor(initialSide: ClimberSide = ClimberSide.LEFT) {
    this.reset(initialSide);
  }

  public climb(targetSide: ClimberSide, trunk: TreeTrunk): ClimbResult {
    if (!this.alive) {
      return {
        success: false,
        collided: true,
        branchHit: BranchSide.NONE,
        climbedAltitude: this.altitude,
      };
    }

    this.side = targetSide;
    trunk.step();

    // After step, trunk segment index 0 is at climber's level
    const currentBranch = trunk.getBranchAt(0);
    const branchMatchesSide =
      (targetSide === ClimberSide.LEFT && currentBranch === BranchSide.LEFT) ||
      (targetSide === ClimberSide.RIGHT && currentBranch === BranchSide.RIGHT);

    if (branchMatchesSide) {
      this.alive = false;
      return {
        success: false,
        collided: true,
        branchHit: currentBranch,
        climbedAltitude: this.altitude,
      };
    }

    this.altitude += 1;
    this.scurryTimer = 0.12;

    return {
      success: true,
      collided: false,
      branchHit: BranchSide.NONE,
      climbedAltitude: this.altitude,
    };
  }

  public update(dt: number): void {
    if (this.scurryTimer > 0) {
      this.scurryTimer = Math.max(0, this.scurryTimer - dt);
    }
  }

  public reset(initialSide: ClimberSide = ClimberSide.LEFT): void {
    this.side = initialSide;
    this.altitude = 0;
    this.scurryTimer = 0;
    this.alive = true;
  }
}
