import { CANVAS_WIDTH, CANVAS_HEIGHT, TRUNK_LEFT, TRUNK_WIDTH, BUG_LEFT_X, BUG_RIGHT_X } from './TrunkLanes';
import { BugHitbox } from './BugClimber';

export enum BranchSide {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface TreeObstacle {
  id: number;
  lane: number; // 0 = LEFT, 1 = RIGHT
  x: number;
  y: number;
  width: number;
  height: number;
  side: BranchSide;
  color: string;
}

export const BRANCH_LENGTH = 110;
export const BRANCH_HEIGHT = 28;
export const SPAWN_INTERVAL_BASE = 1.25; // seconds
export const MIN_SPAWN_INTERVAL = 0.55;
export const MAX_ACTIVE_OBSTACLES = 12;

export class TreeTrunk {
  obstacles: TreeObstacle[] = [];
  spawnTimer: number = SPAWN_INTERVAL_BASE;
  nextId: number = 1;
  scrollOffset: number = 0;

  private consecutiveLeft = 0;
  private consecutiveRight = 0;

  spawnObstacle(climberSpeed: number): TreeObstacle | null {
    if (this.obstacles.length >= MAX_ACTIVE_OBSTACLES) {
      return null;
    }

    // Ensure we don't block both lanes at same vertical window
    const topObstacle = this.obstacles.slice().sort((a, b) => a.y - b.y)[0];
    if (topObstacle && topObstacle.y < 120) {
      return null;
    }

    let side = Math.random() < 0.5 ? BranchSide.LEFT : BranchSide.RIGHT;

    // Prevent more than 3 consecutive same side branches
    if (side === BranchSide.LEFT && this.consecutiveLeft >= 3) {
      side = BranchSide.RIGHT;
    } else if (side === BranchSide.RIGHT && this.consecutiveRight >= 3) {
      side = BranchSide.LEFT;
    }

    if (side === BranchSide.LEFT) {
      this.consecutiveLeft++;
      this.consecutiveRight = 0;
    } else {
      this.consecutiveRight++;
      this.consecutiveLeft = 0;
    }

    const lane = side === BranchSide.LEFT ? 0 : 1;
    const x = side === BranchSide.LEFT ? TRUNK_LEFT : TRUNK_LEFT + TRUNK_WIDTH;

    const obstacle: TreeObstacle = {
      id: this.nextId++,
      lane,
      x,
      y: -60,
      width: BRANCH_LENGTH,
      height: BRANCH_HEIGHT,
      side,
      color: '#8D5B34',
    };

    this.obstacles.push(obstacle);
    return obstacle;
  }

  update(dt: number, climberSpeed: number): { passedCount: number } {
    let passedCount = 0;

    // Scroll offset for bark texture
    this.scrollOffset = (this.scrollOffset + climberSpeed * dt) % 64;

    // Dynamic spawn rate scaling with climb speed
    this.spawnTimer -= dt;
    const speedRatio = Math.max(0, Math.min(1, (climberSpeed - 120) / 260));
    const currentInterval = SPAWN_INTERVAL_BASE - speedRatio * (SPAWN_INTERVAL_BASE - MIN_SPAWN_INTERVAL);

    if (this.spawnTimer <= 0) {
      this.spawnObstacle(climberSpeed);
      this.spawnTimer = currentInterval;
    }

    // Obstacles scroll downwards as bug climbs up
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (!obs) continue;
      obs.y += climberSpeed * dt;

      if (obs.y > CANVAS_HEIGHT + 80) {
        this.obstacles.splice(i, 1);
        passedCount++;
      }
    }

    return { passedCount };
  }

  checkCollision(bugHitbox: BugHitbox): TreeObstacle | null {
    for (const obs of this.obstacles) {
      // Branch bounding box on left or right of trunk
      const obsHitbox = {
        x: obs.side === BranchSide.LEFT ? obs.x - obs.width : obs.x,
        y: obs.y - obs.height / 2,
        width: obs.width,
        height: obs.height,
      };

      if (
        bugHitbox.x < obsHitbox.x + obsHitbox.width &&
        bugHitbox.x + bugHitbox.width > obsHitbox.x &&
        bugHitbox.y < obsHitbox.y + obsHitbox.height &&
        bugHitbox.y + bugHitbox.height > obsHitbox.y
      ) {
        return obs;
      }
    }
    return null;
  }

  reset(): void {
    this.obstacles = [];
    this.spawnTimer = SPAWN_INTERVAL_BASE;
    this.nextId = 1;
    this.scrollOffset = 0;
    this.consecutiveLeft = 0;
    this.consecutiveRight = 0;
  }
}
