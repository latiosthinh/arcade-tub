export type ObstacleType = 'cactus-small' | 'cactus-double' | 'cactus-triple' | 'pterodactyl-low' | 'pterodactyl-mid' | 'pterodactyl-high';

export interface Obstacle {
  id: number;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  flappingTimer?: number;
  flapFrame?: number;
  passed: boolean;
}

export interface ObstacleSpawnerOptions {
  groundY?: number;
  minGap?: number;
  maxGap?: number;
}

export class ObstacleSpawner {
  public obstacles: Obstacle[] = [];
  public groundY: number;
  public minGap: number;
  public maxGap: number;
  private nextSpawnDistance: number = 0;
  private nextId: number = 1;

  constructor(options: ObstacleSpawnerOptions = {}) {
    this.groundY = options.groundY ?? 320;
    this.minGap = options.minGap ?? 280;
    this.maxGap = options.maxGap ?? 520;
    this.reset();
  }

  public reset(): void {
    this.obstacles = [];
    this.nextSpawnDistance = 600; // Initial delay before first obstacle
    this.nextId = 1;
  }

  public update(dt: number, currentSpeed: number, distanceTraveled: number): void {
    // Move existing obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= currentSpeed * dt;

      // Pterodactyl extra flight motion and wing flapping
      if (obs.type.startsWith('pterodactyl')) {
        // Pterodactyl flies slightly faster than background
        obs.x -= 35 * dt;
        obs.flappingTimer = (obs.flappingTimer ?? 0) + dt * 8;
        if (obs.flappingTimer >= 1) {
          obs.flapFrame = (obs.flapFrame ?? 0) === 0 ? 1 : 0;
          obs.flappingTimer = 0;
        }
      }

      // Cull offscreen obstacles
      if (obs.x + obs.width < -100) {
        this.obstacles.splice(i, 1);
      }
    }

    // Spawn new obstacles
    this.nextSpawnDistance -= currentSpeed * dt;
    if (this.nextSpawnDistance <= 0) {
      this.spawnObstacle(distanceTraveled);
      // Gap scales dynamically with current speed so jump is always feasible
      const speedFactor = Math.max(1, currentSpeed / 360);
      const gap = (this.minGap + Math.random() * (this.maxGap - this.minGap)) * speedFactor;
      this.nextSpawnDistance = gap;
    }
  }

  public spawnObstacle(distanceTraveled: number): Obstacle {
    const types: ObstacleType[] = ['cactus-small', 'cactus-double', 'cactus-triple'];

    // Pterodactyls unlock after 400m distance
    if (distanceTraveled > 400) {
      types.push('pterodactyl-low', 'pterodactyl-mid', 'pterodactyl-high');
    }

    const chosenType = types[Math.floor(Math.random() * types.length)];
    let width = 24;
    let height = 46;
    let y = this.groundY - height;

    switch (chosenType) {
      case 'cactus-small':
        width = 22;
        height = 42;
        y = this.groundY - height;
        break;
      case 'cactus-double':
        width = 44;
        height = 46;
        y = this.groundY - height;
        break;
      case 'cactus-triple':
        width = 66;
        height = 50;
        y = this.groundY - height;
        break;
      case 'pterodactyl-low':
        // Low: requires jump to clear
        width = 46;
        height = 32;
        y = this.groundY - 36;
        break;
      case 'pterodactyl-mid':
        // Mid: requires duck to pass underneath
        width = 46;
        height = 32;
        y = this.groundY - 58;
        break;
      case 'pterodactyl-high':
        // High: pass without action or jump under
        width = 46;
        height = 32;
        y = this.groundY - 95;
        break;
    }

    const obstacle: Obstacle = {
      id: this.nextId++,
      type: chosenType,
      x: 850,
      y,
      width,
      height,
      flappingTimer: 0,
      flapFrame: 0,
      passed: false,
    };

    this.obstacles.push(obstacle);
    return obstacle;
  }
}
