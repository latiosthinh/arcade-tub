export type ObstacleType = 'barrier_low' | 'barrier_high' | 'train' | 'light_pole';
export type ItemType = 'coin' | 'powerup_magnet' | 'powerup_hoverboard' | 'powerup_2x';

export interface TrackObstacle {
  id: number;
  lane: number;
  z: number; // forward distance (0 is player plane, positive is in front)
  type: ObstacleType;
  lengthZ: number;
  height: number;
  passableBy: 'jump' | 'slide' | 'none';
}

export interface TrackItem {
  id: number;
  lane: number;
  z: number;
  type: ItemType;
  collected: boolean;
  yOffset: number;
}

export class TrainTrackGenerator {
  obstacles: TrackObstacle[] = [];
  items: TrackItem[] = [];

  private nextId: number = 1;
  private spawnZ: number = 1400; // spawn ahead horizon
  private segmentSpacing: number = 240;
  private lastSpawnZ: number = 400;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.obstacles = [];
    this.items = [];
    this.nextId = 1;
    this.lastSpawnZ = 400;

    // Seed initial upcoming track
    for (let z = 400; z < this.spawnZ; z += this.segmentSpacing) {
      this.generateSegment(z);
    }
  }

  update(dt: number, speed: number): void {
    const dz = speed * dt;

    // Move obstacles towards camera
    for (const obs of this.obstacles) {
      obs.z -= dz;
    }
    // Remove obstacles behind camera
    this.obstacles = this.obstacles.filter(obs => obs.z + obs.lengthZ > -60);

    // Move items towards camera
    for (const item of this.items) {
      item.z -= dz;
    }
    this.items = this.items.filter(item => item.z > -40 && !item.collected);

    // Track spawn progress
    this.lastSpawnZ -= dz;
    while (this.lastSpawnZ < this.spawnZ) {
      this.lastSpawnZ += this.segmentSpacing;
      this.generateSegment(this.lastSpawnZ);
    }
  }

  private generateSegment(zPos: number): void {
    // Pick 1 or 2 lanes for obstacles (ensure at least 1 lane is open/traversable)
    const occupiedLanes = new Set<number>();
    const numObstacles = Math.random() < 0.6 ? 1 : 2;

    for (let i = 0; i < numObstacles; i++) {
      const lane = Math.floor(Math.random() * 3);
      if (occupiedLanes.has(lane)) continue;
      occupiedLanes.add(lane);

      const r = Math.random();
      if (r < 0.35) {
        // Low barrier (jumpable)
        this.obstacles.push({
          id: this.nextId++,
          lane,
          z: zPos,
          type: 'barrier_low',
          lengthZ: 30,
          height: 35,
          passableBy: 'jump'
        });
      } else if (r < 0.65) {
        // High barrier/sign (slide under)
        this.obstacles.push({
          id: this.nextId++,
          lane,
          z: zPos,
          type: 'barrier_high',
          lengthZ: 30,
          height: 70,
          passableBy: 'slide'
        });
      } else {
        // Cardboard Train (impassable without lane change)
        this.obstacles.push({
          id: this.nextId++,
          lane,
          z: zPos,
          type: 'train',
          lengthZ: 260,
          height: 90,
          passableBy: 'none'
        });
      }
    }

    // Generate Coins & Power-ups in free lanes or on top of jumpable paths
    for (let l = 0; l < 3; l++) {
      if (!occupiedLanes.has(l)) {
        // Generate coin trail
        const coinCount = Math.floor(Math.random() * 4) + 2;
        for (let c = 0; c < coinCount; c++) {
          this.items.push({
            id: this.nextId++,
            lane: l,
            z: zPos + c * 35,
            type: 'coin',
            collected: false,
            yOffset: 0
          });
        }

        // Rare powerup
        if (Math.random() < 0.12) {
          const pRoll = Math.random();
          const pType: ItemType = pRoll < 0.4 ? 'powerup_magnet' : pRoll < 0.7 ? 'powerup_hoverboard' : 'powerup_2x';
          this.items.push({
            id: this.nextId++,
            lane: l,
            z: zPos + coinCount * 35 + 40,
            type: pType,
            collected: false,
            yOffset: 15
          });
        }
      }
    }
  }

  attractCoins(playerLane: number, playerZ: number = 0, range: number = 320, dt: number = 1/60): void {
    for (const item of this.items) {
      if (item.type === 'coin' && !item.collected && item.z > playerZ && item.z < playerZ + range) {
        // Pull towards player's lane
        if (item.lane !== playerLane) {
          item.lane = playerLane;
        }
      }
    }
  }

  checkCollision(playerLaneOffset: number, playerY: number, playerAction: 'running' | 'jumping' | 'sliding'): { collided: boolean; obstacle?: TrackObstacle } {
    for (const obs of this.obstacles) {
      // Check Z overlap around player plane (z: 0 to 40)
      if (obs.z <= 40 && (obs.z + obs.lengthZ) >= 0) {
        // Check lane overlap: lane 0: -1, lane 1: 0, lane 2: 1
        const obsLaneOffset = obs.lane - 1;
        if (Math.abs(playerLaneOffset - obsLaneOffset) < 0.55) {
          // Check height/passability
          if (obs.passableBy === 'jump' && playerAction === 'jumping' && playerY > 25) {
            continue; // successfully jumped
          }
          if (obs.passableBy === 'slide' && playerAction === 'sliding') {
            continue; // successfully slid under
          }
          return { collided: true, obstacle: obs };
        }
      }
    }
    return { collided: false };
  }

  collectOverlappingItems(playerLaneOffset: number, playerY: number, hasMagnet: boolean): TrackItem[] {
    const collected: TrackItem[] = [];
    for (const item of this.items) {
      if (item.collected) continue;

      const itemLaneOffset = item.lane - 1;
      const laneDist = Math.abs(playerLaneOffset - itemLaneOffset);
      const zDist = Math.abs(item.z - 20);

      const withinCollect = (laneDist < 0.6 && zDist < 35) || (hasMagnet && item.type === 'coin' && zDist < 250 && laneDist < 1.8);

      if (withinCollect) {
        item.collected = true;
        collected.push(item);
      }
    }
    return collected;
  }
}
