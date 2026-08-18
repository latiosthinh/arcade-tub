import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerCar, MIN_SPEED, MAX_SPEED, BASE_SPEED, CAR_WIDTH, CAR_HEIGHT } from '../src/PlayerCar';
import { HighwayLanes } from '../src/HighwayLanes';

describe('PlayerCar', () => {
  let car: PlayerCar;
  let lanes: HighwayLanes;

  beforeEach(() => {
    lanes = new HighwayLanes();
    car = new PlayerCar(lanes, 1);
  });

  it('initializes in specified lane at base speed', () => {
    expect(car.currentLane).toBe(1);
    expect(car.x).toBe(lanes.getLaneCenter(1)); // 195
    expect(car.y).toBe(560);
    expect(car.speed).toBe(BASE_SPEED);
    expect(car.alive).toBe(true);
  });

  it('accelerates speed when throttle is active up to MAX_SPEED', () => {
    car.setThrottle(true);
    car.update(1.0, lanes); // +120 km/h
    expect(car.speed).toBe(BASE_SPEED + 120);

    car.update(2.0, lanes); // would exceed 350
    expect(car.speed).toBe(MAX_SPEED);
  });

  it('brakes speed when brake is active down to MIN_SPEED', () => {
    car.setBrake(true);
    car.update(0.5, lanes); // -90 km/h (150 -> 60 clamped to 100)
    expect(car.speed).toBe(MIN_SPEED);
  });

  it('naturally relaxes speed back to BASE_SPEED when no throttle or brake', () => {
    car.speed = 250;
    car.update(1.0, lanes); // -30 km/h
    expect(car.speed).toBe(220);

    car.speed = 120;
    car.update(1.0, lanes); // +30 km/h
    expect(car.speed).toBe(150);
  });

  it('steers laterally and clamps to road boundaries', () => {
    car.setSteer(1); // steer right
    car.update(0.5, lanes); // +160px from 195 = 355
    expect(car.x).toBe(355);
    expect(car.currentLane).toBe(3);

    car.update(1.0, lanes); // moves way right, clamps to 420 - 21 = 399
    expect(car.x).toBe(lanes.clampToRoad(1000, CAR_WIDTH));

    car.setSteer(-1); // steer left
    car.update(2.0, lanes); // moves way left, clamps to 60 + 21 = 81
    expect(car.x).toBe(lanes.clampToRoad(0, CAR_WIDTH));
    expect(car.currentLane).toBe(0);
  });

  it('returns slightly inset AABB hitbox for arcade dodging', () => {
    const hitbox = car.getHitbox();
    expect(hitbox.width).toBe(CAR_WIDTH - 8);
    expect(hitbox.height).toBe(CAR_HEIGHT - 12);
    expect(hitbox.x).toBe(car.x - CAR_WIDTH / 2 + 4);
    expect(hitbox.y).toBe(car.y - CAR_HEIGHT / 2 + 6);
  });

  it('resets state correctly', () => {
    car.speed = 300;
    car.x = 350;
    car.steeringDir = 1;
    car.alive = false;

    car.reset(lanes, 2);
    expect(car.alive).toBe(true);
    expect(car.currentLane).toBe(2);
    expect(car.x).toBe(lanes.getLaneCenter(2));
    expect(car.speed).toBe(BASE_SPEED);
    expect(car.steeringDir).toBe(0);
  });
});
