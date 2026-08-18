import { TrunkLanes, BUG_LEFT_X, BUG_RIGHT_X, BUG_Y } from './TrunkLanes';

export interface BugHitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const MIN_SPEED = 120;
export const MAX_SPEED = 380;
export const ACCELERATION = 140; // speed units per sec
export const BRAKE_DECELERATION = 200; // speed units per sec
export const NATURAL_DECEL = 35;
export const BASE_SPEED = 180;
export const LATERAL_SPEED = 480; // pixels per sec
export const BUG_WIDTH = 36;
export const BUG_HEIGHT = 46;

export class BugClimber {
  x: number = BUG_LEFT_X;
  y: number = BUG_Y;
  speed: number = BASE_SPEED;
  currentLane: number = 0; // 0 = Left, 1 = Right
  steeringDir: number = 0; // -1 = Left, 1 = Right
  isAccelerating: boolean = false;
  isBraking: boolean = false;
  alive: boolean = true;
  tiltAngle: number = 0;
  scurryTimer: number = 0;

  constructor(initialLane: number = 0) {
    this.reset(initialLane);
  }

  setThrottle(accelerating: boolean): void {
    this.isAccelerating = accelerating;
  }

  setBrake(braking: boolean): void {
    this.isBraking = braking;
  }

  setSteer(dir: number): void {
    this.steeringDir = Math.max(-1, Math.min(1, dir));
    if (dir !== 0) {
      this.currentLane = dir < 0 ? 0 : 1;
    }
  }

  update(dt: number): void {
    if (!this.alive) return;

    // Speed throttle / brake curve
    if (this.isAccelerating) {
      this.speed = Math.min(MAX_SPEED, this.speed + ACCELERATION * dt);
    } else if (this.isBraking) {
      this.speed = Math.max(MIN_SPEED, this.speed - BRAKE_DECELERATION * dt);
    } else {
      if (this.speed > BASE_SPEED) {
        this.speed = Math.max(BASE_SPEED, this.speed - NATURAL_DECEL * dt);
      } else if (this.speed < BASE_SPEED) {
        this.speed = Math.min(BASE_SPEED, this.speed + NATURAL_DECEL * dt);
      }
    }

    // Lateral steering towards target lane position
    const targetX = this.currentLane === 0 ? BUG_LEFT_X : BUG_RIGHT_X;
    this.x += (targetX - this.x) * Math.min(1, dt * 16);

    // Smooth tilt angle banking
    const targetTilt = (targetX - this.x) * 0.003;
    this.tiltAngle += (targetTilt - this.tiltAngle) * Math.min(1, dt * 14);

    this.scurryTimer += dt * (this.speed / 100);
  }

  getHitbox(): BugHitbox {
    return {
      x: this.x - BUG_WIDTH / 2 + 4,
      y: this.y - BUG_HEIGHT / 2 + 4,
      width: BUG_WIDTH - 8,
      height: BUG_HEIGHT - 8,
    };
  }

  reset(initialLane: number = 0): void {
    this.currentLane = initialLane;
    this.x = initialLane === 0 ? BUG_LEFT_X : BUG_RIGHT_X;
    this.y = BUG_Y;
    this.speed = BASE_SPEED;
    this.steeringDir = 0;
    this.isAccelerating = false;
    this.isBraking = false;
    this.alive = true;
    this.tiltAngle = 0;
    this.scurryTimer = 0;
  }
}
