import { Balloon, BalloonType } from './Balloon';

export interface SpawnerConfig {
  canvasWidth?: number;
  canvasHeight?: number;
  baseSpawnInterval?: number;
  minSpawnInterval?: number;
  maxActiveBalloons?: number;
  bombChance?: number;
  rainbowChance?: number;
}

export class BalloonSpawner {
  private canvasWidth: number;
  private canvasHeight: number;
  private baseSpawnInterval: number;
  private minSpawnInterval: number;
  private maxActiveBalloons: number;
  private bombChance: number;
  private rainbowChance: number;

  private activeBalloons: Balloon[] = [];
  private spawnTimer = 0;
  private nextId = 1;

  constructor(config?: SpawnerConfig) {
    this.canvasWidth = config?.canvasWidth ?? 800;
    this.canvasHeight = config?.canvasHeight ?? 600;
    this.baseSpawnInterval = config?.baseSpawnInterval ?? 1.2;
    this.minSpawnInterval = config?.minSpawnInterval ?? 0.45;
    this.maxActiveBalloons = config?.maxActiveBalloons ?? 30;
    this.bombChance = config?.bombChance ?? 0.20;
    this.rainbowChance = config?.rainbowChance ?? 0.08;
  }

  getSpawnInterval(elapsedTime: number): number {
    // Scales linearly over 60s round down to minSpawnInterval
    const progress = Math.min(1.0, Math.max(0, elapsedTime / 60));
    return this.baseSpawnInterval - progress * (this.baseSpawnInterval - this.minSpawnInterval);
  }

  getBaseSpeed(elapsedTime: number): number {
    // Scales speed from 110 px/s up to 260 px/s over time
    const progress = Math.min(1.0, Math.max(0, elapsedTime / 60));
    return 110 + progress * 150;
  }

  private pickBalloonType(): BalloonType {
    const roll = Math.random();
    if (roll < this.bombChance) {
      return 'bomb';
    }
    if (roll < this.bombChance + this.rainbowChance) {
      return 'rainbow';
    }

    const colorRoll = Math.random();
    if (colorRoll < 0.45) return 'cyan';
    if (colorRoll < 0.75) return 'pink';
    return 'yellow';
  }

  spawn(elapsedTime: number): Balloon {
    if (this.activeBalloons.length >= this.maxActiveBalloons && this.activeBalloons[0]) {
      return this.activeBalloons[0];
    }

    const type = this.pickBalloonType();
    const margin = 40;
    const startX = margin + Math.random() * (this.canvasWidth - margin * 2);
    const startY = this.canvasHeight + 35;
    const baseSpeed = this.getBaseSpeed(elapsedTime);

    const balloon = new Balloon(`balloon_${this.nextId++}`, type, startX, startY, {
      speedY: baseSpeed * (0.9 + Math.random() * 0.25),
    });

    this.activeBalloons.push(balloon);
    return balloon;
  }

  update(dt: number, elapsedTime: number): void {
    this.spawnTimer += dt;
    const interval = this.getSpawnInterval(elapsedTime);

    while (this.spawnTimer >= interval) {
      this.spawnTimer -= interval;
      if (this.activeBalloons.length < this.maxActiveBalloons) {
        this.spawn(elapsedTime);
      }
    }

    const alive: Balloon[] = [];
    for (const b of this.activeBalloons) {
      b.update(dt);

      if (b.y < -b.radius * 2) {
        b.markEscaped();
      }

      if (b.isAlive) {
        alive.push(b);
      }
    }

    this.activeBalloons = alive;
  }

  getActiveBalloons(): Balloon[] {
    return this.activeBalloons;
  }

  reset(): void {
    this.activeBalloons = [];
    this.spawnTimer = 0;
    this.nextId = 1;
  }
}
