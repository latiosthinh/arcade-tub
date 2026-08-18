import { HighwayLanes } from './HighwayLanes';

export interface CarHitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const MIN_SPEED = 100;
export const MAX_SPEED = 350;
export const ACCELERATION = 120; // km/h per sec
export const BRAKE_DECELERATION = 180; // km/h per sec
export const NATURAL_DECEL = 30; // km/h per sec towards base speed
export const BASE_SPEED = 150;
export const LATERAL_SPEED = 320; // pixels per sec
export const CAR_WIDTH = 42;
export const CAR_HEIGHT = 78;

export class PlayerCar {
  x: number = 0;
  y: number = 560;
  speed: number = BASE_SPEED;
  currentLane: number = 1;
  steeringDir: number = 0;
  isAccelerating: boolean = false;
  isBraking: boolean = false;
  alive: boolean = true;
  tiltAngle: number = 0;

  constructor(lanes?: HighwayLanes, initialLane: number = 1) {
    const highway = lanes ?? new HighwayLanes();
    this.reset(highway, initialLane);
  }

  setThrottle(accelerating: boolean): void {
    this.isAccelerating = accelerating;
  }

  setBrake(braking: boolean): void {
    this.isBraking = braking;
  }

  setSteer(dir: number): void {
    this.steeringDir = Math.max(-1, Math.min(1, dir));
  }

  update(dt: number, lanes: HighwayLanes): void {
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

    // Lateral steering
    this.x += this.steeringDir * LATERAL_SPEED * dt;
    this.x = lanes.clampToRoad(this.x, CAR_WIDTH);
    this.currentLane = lanes.getLaneFromX(this.x);

    // Lean / tilt angle smoothing
    const targetTilt = this.steeringDir * 0.12;
    this.tiltAngle += (targetTilt - this.tiltAngle) * Math.min(1, dt * 15);
  }

  getHitbox(): CarHitbox {
    return {
      x: this.x - CAR_WIDTH / 2 + 4,
      y: this.y - CAR_HEIGHT / 2 + 6,
      width: CAR_WIDTH - 8,
      height: CAR_HEIGHT - 12,
    };
  }

  reset(lanes: HighwayLanes = new HighwayLanes(), initialLane: number = 1): void {
    this.currentLane = Math.max(0, Math.min(lanes.laneCount - 1, initialLane));
    this.x = lanes.getLaneCenter(this.currentLane);
    this.y = 560;
    this.speed = BASE_SPEED;
    this.steeringDir = 0;
    this.isAccelerating = false;
    this.isBraking = false;
    this.alive = true;
    this.tiltAngle = 0;
  }
}
