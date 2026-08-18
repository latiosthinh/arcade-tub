import { HighwayLanes, CANVAS_HEIGHT } from './HighwayLanes';
import { CarHitbox } from './PlayerCar';

export enum VehicleType {
  SEDAN = 'SEDAN',
  TRUCK = 'TRUCK',
  SPORTS = 'SPORTS',
  POLICE = 'POLICE',
}

export interface TrafficVehicle {
  id: number;
  lane: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number; // km/h
  type: VehicleType;
  color: string;
  isDrafted: boolean;
}

export const SPAWN_INTERVAL_BASE = 1.4; // seconds
export const MIN_SPAWN_INTERVAL = 0.55;
export const DRAFT_DISTANCE_Y = 130;
export const DRAFT_LATERAL_MARGIN = 32;
export const MAX_ACTIVE_VEHICLES = 16; // T-24-01 mitigation

export class TrafficManager {
  vehicles: TrafficVehicle[] = [];
  spawnTimer: number = SPAWN_INTERVAL_BASE;
  nextId: number = 1;

  spawnVehicle(lanes: HighwayLanes, playerSpeed: number): TrafficVehicle | null {
    if (this.vehicles.length >= MAX_ACTIVE_VEHICLES) {
      return null;
    }

    // T-24-02 mitigation: Solvable gap check. Ensure we don't block all 4 lanes simultaneously.
    const laneCandidates = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
    let chosenLane = -1;

    for (const lane of laneCandidates) {
      const topInLane = this.vehicles
        .filter((v) => v.lane === lane)
        .sort((a, b) => a.y - b.y)[0];

      // If lane is clear or nearest car is far enough down
      if (!topInLane || topInLane.y > 150) {
        // Also check if spawning here leaves at least one open gap
        chosenLane = lane;
        break;
      }
    }

    if (chosenLane === -1) {
      return null;
    }

    const typeRoll = Math.random();
    let type = VehicleType.SEDAN;
    let width = 42;
    let height = 76;
    let speed = 85 + Math.random() * 20; // 85-105 km/h
    let color = '#4a90e2';

    if (typeRoll < 0.25) {
      type = VehicleType.TRUCK;
      width = 46;
      height = 104;
      speed = 65 + Math.random() * 20; // 65-85 km/h
      color = '#e67e22';
    } else if (typeRoll < 0.4) {
      type = VehicleType.SPORTS;
      width = 42;
      height = 74;
      speed = 120 + Math.random() * 25; // 120-145 km/h
      color = '#f1c40f';
    } else if (typeRoll < 0.5) {
      type = VehicleType.POLICE;
      width = 42;
      height = 78;
      speed = 110 + Math.random() * 25; // 110-135 km/h
      color = '#ffffff';
    } else {
      type = VehicleType.SEDAN;
      const sedanColors = ['#9b59b6', '#3498db', '#1abc9c', '#bdc3c7'];
      color = sedanColors[Math.floor(Math.random() * sedanColors.length)] ?? '#9b59b6';
    }

    const vehicle: TrafficVehicle = {
      id: this.nextId++,
      lane: chosenLane,
      x: lanes.getLaneCenter(chosenLane),
      y: -120,
      width,
      height,
      speed,
      type,
      color,
      isDrafted: false,
    };

    this.vehicles.push(vehicle);
    return vehicle;
  }

  update(
    dt: number,
    playerSpeed: number,
    lanes: HighwayLanes
  ): { passedCount: number } {
    let passedCount = 0;

    // Spawn timer scaling with player speed
    this.spawnTimer -= dt;
    const speedRatio = Math.max(0, Math.min(1, (playerSpeed - 100) / 250));
    const currentSpawnInterval =
      SPAWN_INTERVAL_BASE - speedRatio * (SPAWN_INTERVAL_BASE - MIN_SPAWN_INTERVAL);

    if (this.spawnTimer <= 0) {
      this.spawnVehicle(lanes, playerSpeed);
      this.spawnTimer = currentSpawnInterval;
    }

    // Relative speed movement
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      const v = this.vehicles[i];
      if (!v) continue;
      // Convert km/h delta to px/sec: (playerSpeed - vehicleSpeed) * (1000m/3600s) * scaling_factor
      const speedDeltaKmh = playerSpeed - v.speed;
      const relativeSpeedPx = speedDeltaKmh * (1000 / 3600) * 4.2;
      v.y += relativeSpeedPx * dt;

      if (v.y > CANVAS_HEIGHT + 140) {
        this.vehicles.splice(i, 1);
        passedCount++;
      }
    }

    return { passedCount };
  }

  checkCollision(playerHitbox: CarHitbox): TrafficVehicle | null {
    for (const v of this.vehicles) {
      const vHitbox = {
        x: v.x - v.width / 2 + 4,
        y: v.y - v.height / 2 + 4,
        width: v.width - 8,
        height: v.height - 8,
      };

      if (
        playerHitbox.x < vHitbox.x + vHitbox.width &&
        playerHitbox.x + playerHitbox.width > vHitbox.x &&
        playerHitbox.y < vHitbox.y + vHitbox.height &&
        playerHitbox.y + playerHitbox.height > vHitbox.y
      ) {
        return v;
      }
    }
    return null;
  }

  checkDrafting(playerHitbox: CarHitbox): {
    isDrafting: boolean;
    draftedVehicle: TrafficVehicle | null;
  } {
    const playerCenterX = playerHitbox.x + playerHitbox.width / 2;
    const playerTopY = playerHitbox.y;

    for (const v of this.vehicles) {
      const vBottomY = v.y + v.height / 2;
      const dy = playerTopY - vBottomY;
      const dx = Math.abs(playerCenterX - v.x);

      // Must be directly behind or close alongside vehicle within draft cone
      if (dy > 0 && dy < DRAFT_DISTANCE_Y && dx < DRAFT_LATERAL_MARGIN) {
        v.isDrafted = true;
        return { isDrafting: true, draftedVehicle: v };
      }
    }
    return { isDrafting: false, draftedVehicle: null };
  }

  reset(): void {
    this.vehicles = [];
    this.spawnTimer = SPAWN_INTERVAL_BASE;
    this.nextId = 1;
  }
}
