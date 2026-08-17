import { Ship, RACER_LANES } from './Ship.js';

export type ObstacleType = 'asteroid' | 'plasma-mine' | 'boost-ring';

export interface TrackObstacle {
  id: number;
  type: ObstacleType;
  x: number; // Screen X at bottom camera plane (100..700)
  z: number; // 1.0 (horizon) down through 0.0 (camera) to -0.4 (past camera)
  radius: number;
  rotation: number;
  rotationSpeed: number;
  cleared: boolean;
  collided: boolean;
}

export interface CollisionResult {
  obstacle: TrackObstacle;
  type: 'collision' | 'boost';
}

export interface TrackHazardManagerConfig {
  trackWidth?: number;
  minX?: number;
  maxX?: number;
  maxObstacles?: number;
  spawnInterval?: number;
}

export class TrackHazardManager {
  private obstacles: TrackObstacle[] = [];
  private nextId: number = 1;
  private minX: number;
  private maxX: number;
  private maxObstacles: number;

  private spawnTimer: number = 0;
  private spawnInterval: number;

  constructor(config: TrackHazardManagerConfig = {}) {
    this.minX = config.minX ?? 100;
    this.maxX = config.maxX ?? 700;
    this.maxObstacles = config.maxObstacles ?? 25;
    this.spawnInterval = config.spawnInterval ?? 1.2;
  }

  public getObstacles(): TrackObstacle[] {
    return this.obstacles;
  }

  public spawnObstacle(type: ObstacleType, x?: number): TrackObstacle {
    if (this.obstacles.length >= this.maxObstacles) {
      // Remove oldest
      this.obstacles.shift();
    }

    const posX = x !== undefined ? x : RACER_LANES[Math.floor(Math.random() * RACER_LANES.length)]!;

    const radius = type === 'boost-ring' ? 45 : type === 'plasma-mine' ? 35 : 30 + Math.random() * 15;

    const obstacle: TrackObstacle = {
      id: this.nextId++,
      type,
      x: posX,
      z: 1.0,
      radius,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 2.5,
      cleared: false,
      collided: false,
    };

    this.obstacles.push(obstacle);
    return obstacle;
  }

  public spawnWave(difficulty: number): void {
    // 4 standard lane centers
    const lanes = [...RACER_LANES];

    // Determine number of obstacles: 1 to 2, or max 3 at extreme speed, ALWAYS leaving at least 1 open lane
    const count = Math.min(2, Math.floor(1 + difficulty * 2.0));
    const shuffledLanes = [...lanes].sort(() => Math.random() - 0.5);

    // Pick 1 lane for boost ring occasionally (25% chance)
    const hasRing = Math.random() < 0.25;

    for (let i = 0; i < count; i++) {
      const laneX = shuffledLanes[i]!;
      let type: ObstacleType = 'asteroid';
      if (hasRing && i === 0) {
        type = 'boost-ring';
      } else if (difficulty > 0.4 && Math.random() < 0.3) {
        type = 'plasma-mine';
      }
      this.spawnObstacle(type, laneX);
    }
  }

  public update(dt: number, speed: number): void {
    // Advance obstacles along Z
    // Z decreases from 1.0 down towards 0.0 at a rate proportional to speed
    const zSpeed = (speed / 1000) * 1.1;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (!obs) continue;
      obs.z -= zSpeed * dt;
      obs.rotation += obs.rotationSpeed * dt;

      // Auto-cull after sliding past bottom of screen
      if (obs.z < -0.45) {
        this.obstacles.splice(i, 1);
      }
    }

    // Timer-based spawning
    this.spawnTimer += dt;
    const effectiveInterval = Math.max(0.65, this.spawnInterval / (speed / 300));
    if (this.spawnTimer >= effectiveInterval) {
      this.spawnTimer = 0;
      const difficulty = Math.min(1.0, Math.max(0.1, (speed - 300) / 600));
      this.spawnWave(difficulty);
    }
  }

  public checkCollisions(ship: Ship): CollisionResult[] {
    const results: CollisionResult[] = [];
    const shipHalfWidth = ship.width / 2;

    for (const obs of this.obstacles) {
      if (obs.collided) continue;

      // Check collision at camera plane (z between -0.04 and 0.08)
      if (obs.z <= 0.08 && obs.z >= -0.04) {
        const dx = Math.abs(ship.x - obs.x);
        const combinedWidth = shipHalfWidth + obs.radius * 0.6;

        if (dx <= combinedWidth) {
          obs.collided = true;
          if (obs.type === 'boost-ring') {
            results.push({ obstacle: obs, type: 'boost' });
          } else {
            results.push({ obstacle: obs, type: 'collision' });
          }
        }
      }
    }

    return results;
  }

  public clear(): void {
    this.obstacles = [];
    this.spawnTimer = 0;
  }
}
