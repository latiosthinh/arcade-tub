import { describe, it, expect } from 'vitest';
import { TreeCanopy } from '../src/TreeCanopy';

describe('TreeCanopy', () => {
  it('detects branch landing and trunk grips', () => {
    const canopy = new TreeCanopy();
    expect(canopy.branches.length).toBeGreaterThan(0);
    expect(canopy.trunks.length).toBeGreaterThan(0);

    // Landing from above branch b_1 (y: 420)
    // prevY = 390 (bottom 414), current Y = 405 (bottom 429)
    const hit = canopy.checkBranchLanding(180, 405, 18, 24, 390);
    expect(hit).not.toBeNull();
    expect(hit?.id).toBe('b_1');
  });
});
