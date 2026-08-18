import { describe, it, expect, beforeEach } from 'vitest';
import { BugClimber, ClimberSide } from '../src/BugClimber';
import { TreeTrunk, BranchSide } from '../src/TreeTrunk';

describe('BugClimber', () => {
  let climber: BugClimber;
  let trunk: TreeTrunk;

  beforeEach(() => {
    climber = new BugClimber();
    trunk = new TreeTrunk();
    trunk.generateInitial();
  });

  it('initializes with default left side and 0 altitude', () => {
    expect(climber.side).toBe(ClimberSide.LEFT);
    expect(climber.altitude).toBe(0);
    expect(climber.alive).toBe(true);
    expect(climber.scurryTimer).toBe(0);
  });

  it('can climb and switch sides safely when no branch hazard exists', () => {
    // Safe start segments are clear
    const res = climber.climb(ClimberSide.RIGHT, trunk);
    expect(res.success).toBe(true);
    expect(res.collided).toBe(false);
    expect(climber.side).toBe(ClimberSide.RIGHT);
    expect(climber.altitude).toBe(1);
    expect(climber.alive).toBe(true);
    expect(climber.scurryTimer).toBeGreaterThan(0);
  });

  it('detects collision and kills bug when climbing into branch', () => {
    // Manually force segment at index 0 after step to have a branch
    trunk.generateInitial();
    // Segment 1 becomes index 0 after step
    trunk.segments[1].branch = BranchSide.LEFT;

    const res = climber.climb(ClimberSide.LEFT, trunk);
    expect(res.collided).toBe(true);
    expect(res.success).toBe(false);
    expect(res.branchHit).toBe(BranchSide.LEFT);
    expect(climber.alive).toBe(false);
  });

  it('survives if switching to opposite side of branch hazard', () => {
    trunk.generateInitial();
    // Segment 1 becomes index 0 after step
    trunk.segments[1].branch = BranchSide.LEFT;

    // Climber switches to RIGHT
    const res = climber.climb(ClimberSide.RIGHT, trunk);
    expect(res.collided).toBe(false);
    expect(res.success).toBe(true);
    expect(climber.side).toBe(ClimberSide.RIGHT);
    expect(climber.alive).toBe(true);
  });

  it('updates and decays scurry timer', () => {
    climber.climb(ClimberSide.LEFT, trunk);
    expect(climber.scurryTimer).toBeGreaterThan(0);
    climber.update(0.2);
    expect(climber.scurryTimer).toBe(0);
  });

  it('resets climber state cleanly', () => {
    climber.climb(ClimberSide.RIGHT, trunk);
    climber.alive = false;
    climber.reset(ClimberSide.LEFT);

    expect(climber.side).toBe(ClimberSide.LEFT);
    expect(climber.altitude).toBe(0);
    expect(climber.alive).toBe(true);
    expect(climber.scurryTimer).toBe(0);
  });
});
