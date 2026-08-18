import { describe, it, expect, beforeEach } from 'vitest';
import { TrafficManager, VehicleType, MAX_ACTIVE_VEHICLES } from '../src/TrafficManager';
import { HighwayLanes } from '../src/HighwayLanes';
import { PlayerCar } from '../src/PlayerCar';

describe('TrafficManager', () => {
  let traffic: TrafficManager;
  let lanes: HighwayLanes;
  let player: PlayerCar;

  beforeEach(() => {
    traffic = new TrafficManager();
    lanes = new HighwayLanes();
    player = new PlayerCar(lanes, 1);
  });

  it('spawns a traffic vehicle in valid lane within road bounds', () => {
    const v = traffic.spawnVehicle(lanes, 150);
    expect(v).not.toBeNull();
    if (v) {
      expect(v.lane).toBeGreaterThanOrEqual(0);
      expect(v.lane).toBeLessThan(4);
      expect(v.y).toBe(-120);
      expect(traffic.vehicles.length).toBe(1);
    }
  });

  it('respects MAX_ACTIVE_VEHICLES limit', () => {
    for (let i = 0; i < MAX_ACTIVE_VEHICLES + 5; i++) {
      traffic.spawnVehicle(lanes, 150);
      // artificially displace y to bypass lane spacing for this test
      if (traffic.vehicles[i]) {
        traffic.vehicles[i].y = 200 + i * 50;
      }
    }
    expect(traffic.vehicles.length).toBeLessThanOrEqual(MAX_ACTIVE_VEHICLES);
  });

  it('updates vehicle downward positions relative to player speed and removes offscreen', () => {
    const v = traffic.spawnVehicle(lanes, 200);
    expect(v).not.toBeNull();
    if (v) {
      v.y = 100;
      v.speed = 80; // player is 200, relative delta = +120 km/h

      const initialY = v.y;
      const res = traffic.update(0.1, 200, lanes);
      expect(v.y).toBeGreaterThan(initialY);
      expect(res.passedCount).toBe(0);

      // Scroll vehicle past bottom
      v.y = 900;
      const res2 = traffic.update(0.1, 200, lanes);
      expect(res2.passedCount).toBe(1);
      expect(traffic.vehicles.length).toBe(0);
    }
  });

  it('detects collision when player hitbox overlaps vehicle hitbox', () => {
    const v = traffic.spawnVehicle(lanes, 150);
    expect(v).not.toBeNull();
    if (v) {
      // Place vehicle right at player location (lane 1)
      v.lane = 1;
      v.x = lanes.getLaneCenter(1);
      v.y = player.y;

      const hit = traffic.checkCollision(player.getHitbox());
      expect(hit).toBe(v);
    }
  });

  it('returns null when player is in different lane from traffic', () => {
    const v = traffic.spawnVehicle(lanes, 150);
    expect(v).not.toBeNull();
    if (v) {
      v.lane = 3;
      v.x = lanes.getLaneCenter(3);
      v.y = player.y;

      const hit = traffic.checkCollision(player.getHitbox());
      expect(hit).toBeNull();
    }
  });

  it('detects slipstream drafting bonus when player is tucked behind vehicle ahead', () => {
    const v = traffic.spawnVehicle(lanes, 150);
    expect(v).not.toBeNull();
    if (v) {
      v.lane = 1;
      v.x = lanes.getLaneCenter(1);
      v.y = player.y - 110; // directly ahead of player with safe gap

      const draftResult = traffic.checkDrafting(player.getHitbox());
      expect(draftResult.isDrafting).toBe(true);
      expect(draftResult.draftedVehicle).toBe(v);
    }
  });

  it('resets all traffic state', () => {
    traffic.spawnVehicle(lanes, 150);
    expect(traffic.vehicles.length).toBeGreaterThan(0);
    traffic.reset();
    expect(traffic.vehicles.length).toBe(0);
    expect(traffic.nextId).toBe(1);
  });
});
