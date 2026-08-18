import { describe, it, expect, beforeEach } from 'vitest';
import { TreeTrunk, BranchSide, TrunkSegment } from '../src/TreeTrunk';

describe('TreeTrunk', () => {
  let trunk: TreeTrunk;

  beforeEach(() => {
    trunk = new TreeTrunk();
  });

  it('generates initial segments with safe starting base', () => {
    trunk.generateInitial();
    expect(trunk.segments.length).toBe(TreeTrunk.VISIBLE_SEGMENTS);
    // Safe starting segments must have no branches
    for (let i = 0; i < TreeTrunk.SAFE_START_SEGMENTS; i++) {
      expect(trunk.segments[i].branch).toBe(BranchSide.NONE);
    }
  });

  it('guarantees sequential altitude and ids', () => {
    trunk.generateInitial();
    for (let i = 0; i < trunk.segments.length; i++) {
      expect(trunk.segments[i].altitude).toBe(i);
      expect(trunk.segments[i].id).toBe(i);
    }
  });

  it('advances segments queue on step()', () => {
    trunk.generateInitial();
    const firstSegment = trunk.segments[0];
    const removed = trunk.step();

    expect(removed.id).toBe(firstSegment.id);
    expect(trunk.segments.length).toBe(TreeTrunk.VISIBLE_SEGMENTS);
    expect(trunk.segments[0].altitude).toBe(1);
    expect(trunk.segments[trunk.segments.length - 1].altitude).toBe(TreeTrunk.VISIBLE_SEGMENTS);
  });

  it('retrieves branch hazard at specific index', () => {
    trunk.generateInitial();
    expect(trunk.getBranchAt(0)).toBe(BranchSide.NONE);
    expect(trunk.getBranchAt(99)).toBe(BranchSide.NONE);
  });

  it('resets segment buffer to initial safe state', () => {
    trunk.generateInitial();
    trunk.step();
    trunk.step();
    trunk.step();
    trunk.reset();

    expect(trunk.segments.length).toBe(TreeTrunk.VISIBLE_SEGMENTS);
    expect(trunk.segments[0].altitude).toBe(0);
    for (let i = 0; i < TreeTrunk.SAFE_START_SEGMENTS; i++) {
      expect(trunk.segments[i].branch).toBe(BranchSide.NONE);
    }
  });

  it('ensures no consecutive branches on same side exceed 4 times', () => {
    trunk.generateInitial(100);
    let consecutiveLeft = 0;
    let consecutiveRight = 0;

    for (const segment of trunk.segments) {
      if (segment.branch === BranchSide.LEFT) {
        consecutiveLeft++;
        consecutiveRight = 0;
      } else if (segment.branch === BranchSide.RIGHT) {
        consecutiveRight++;
        consecutiveLeft = 0;
      } else {
        consecutiveLeft = 0;
        consecutiveRight = 0;
      }
      expect(consecutiveLeft).toBeLessThanOrEqual(4);
      expect(consecutiveRight).toBeLessThanOrEqual(4);
    }
  });
});
