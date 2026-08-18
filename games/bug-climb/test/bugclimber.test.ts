import { describe, it, expect, beforeEach } from 'vitest';
import { BugClimber, MIN_SPEED, MAX_SPEED, BASE_SPEED, BUG_WIDTH, BUG_HEIGHT } from '../src/BugClimber';
import { BUG_LEFT_X, BUG_RIGHT_X, BUG_Y } from '../src/TrunkLanes';

describe('BugClimber', () => {
  let climber: BugClimber;

  beforeEach(() => {
    climber = new BugClimber(0);
  });

  it('initializes in lane 0 (left) at base speed', () => {
    expect(climber.currentLane).toBe(0);
    expect(climber.x).toBe(BUG_LEFT_X);
    expect(climber.y).toBe(BUG_Y);
    expect(climber.speed).toBe(BASE_SPEED);
    expect(climber.alive).toBe(true);
  });

  it('accelerates speed when throttle is active up to MAX_SPEED', () => {
    climber.setThrottle(true);
    climber.update(1.0);
    expect(climber.speed).toBe(BASE_SPEED + 140);

    climber.update(2.0);
    expect(climber.speed).toBe(MAX_SPEED);
  });

  it('brakes speed when brake is active down to MIN_SPEED', () => {
    climber.setBrake(true);
    climber.update(1.0);
    expect(climber.speed).toBe(MIN_SPEED);
  });

  it('steers smoothly laterally towards target lane position', () => {
    climber.setSteer(1); // steer right -> lane 1
    expect(climber.currentLane).toBe(1);

    climber.update(0.5);
    expect(climber.x).toBeGreaterThan(BUG_LEFT_X);

    climber.update(2.0);
    expect(climber.x).toBeCloseTo(BUG_RIGHT_X, 0);

    climber.setSteer(-1); // steer left -> lane 0
    expect(climber.currentLane).toBe(0);
    climber.update(2.0);
    expect(climber.x).toBeCloseTo(BUG_LEFT_X, 0);
  });

  it('returns inset AABB hitbox for arcade dodging', () => {
    const hitbox = climber.getHitbox();
    expect(hitbox.width).toBe(BUG_WIDTH - 8);
    expect(hitbox.height).toBe(BUG_HEIGHT - 8);
    expect(hitbox.x).toBe(climber.x - BUG_WIDTH / 2 + 4);
    expect(hitbox.y).toBe(climber.y - BUG_HEIGHT / 2 + 4);
  });

  it('resets state correctly', () => {
    climber.speed = 300;
    climber.x = BUG_RIGHT_X;
    climber.currentLane = 1;
    climber.alive = false;

    climber.reset(0);
    expect(climber.alive).toBe(true);
    expect(climber.currentLane).toBe(0);
    expect(climber.x).toBe(BUG_LEFT_X);
    expect(climber.speed).toBe(BASE_SPEED);
  });
});
