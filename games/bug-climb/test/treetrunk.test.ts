import { describe, it, expect, beforeEach } from 'vitest';
import { TreeTrunk, BranchSide, MAX_ACTIVE_OBSTACLES } from '../src/TreeTrunk';
import { BugClimber } from '../src/BugClimber';
import { BUG_LEFT_X, BUG_RIGHT_X, TRUNK_LEFT, TRUNK_WIDTH } from '../src/TrunkLanes';

describe('TreeTrunk', () => {
  let trunk: TreeTrunk;
  let climber: BugClimber;

  beforeEach(() => {
    trunk = new TreeTrunk();
    climber = new BugClimber(0);
  });

  it('spawns a branch obstacle with valid side and dimensions', () => {
    const obs = trunk.spawnObstacle(180);
    expect(obs).not.toBeNull();
    if (obs) {
      expect(obs.lane).toBeGreaterThanOrEqual(0);
      expect(obs.lane).toBeLessThanOrEqual(1);
      expect(obs.y).toBe(-60);
      expect(trunk.obstacles.length).toBe(1);
    }
  });

  it('respects MAX_ACTIVE_OBSTACLES limit', () => {
    for (let i = 0; i < MAX_ACTIVE_OBSTACLES + 5; i++) {
      trunk.spawnObstacle(180);
      if (trunk.obstacles[i]) {
        trunk.obstacles[i].y = 200 + i * 80;
      }
    }
    expect(trunk.obstacles.length).toBeLessThanOrEqual(MAX_ACTIVE_OBSTACLES);
  });

  it('updates downward obstacle scrolling relative to climb speed', () => {
    const obs = trunk.spawnObstacle(200);
    expect(obs).not.toBeNull();
    if (obs) {
      obs.y = 100;
      const initialY = obs.y;
      const res = trunk.update(0.1, 200);
      expect(obs.y).toBeGreaterThan(initialY);
      expect(res.passedCount).toBe(0);

      obs.y = 900;
      const res2 = trunk.update(0.1, 200);
      expect(res2.passedCount).toBe(1);
      expect(trunk.obstacles.length).toBe(0);
    }
  });

  it('detects collision when bug overlaps branch on same side', () => {
    const obs = trunk.spawnObstacle(180);
    expect(obs).not.toBeNull();
    if (obs) {
      obs.side = BranchSide.LEFT;
      obs.lane = 0;
      obs.x = TRUNK_LEFT;
      obs.y = climber.y;

      const hit = trunk.checkCollision(climber.getHitbox());
      expect(hit).toBe(obs);
    }
  });

  it('returns null when bug is on opposite side of branch', () => {
    const obs = trunk.spawnObstacle(180);
    expect(obs).not.toBeNull();
    if (obs) {
      obs.side = BranchSide.RIGHT;
      obs.lane = 1;
      obs.x = TRUNK_LEFT + TRUNK_WIDTH;
      obs.y = climber.y;

      // Climber is in left lane
      const hit = trunk.checkCollision(climber.getHitbox());
      expect(hit).toBeNull();
    }
  });

  it('resets trunk state', () => {
    trunk.spawnObstacle(180);
    expect(trunk.obstacles.length).toBeGreaterThan(0);
    trunk.reset();
    expect(trunk.obstacles.length).toBe(0);
    expect(trunk.nextId).toBe(1);
  });
});
