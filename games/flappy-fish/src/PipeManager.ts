import { Fish } from './Fish.js';

export interface CoralPillar {
  id: number;
  x: number;
  width: number;
  topHeight: number;
  bottomY: number;
  gapSize: number;
  passed: boolean;
  hasPearl: boolean;
  pearlCollected: boolean;
  pearlX: number;
  pearlY: number;
  pearlRadius: number;
}

export interface PearlBubble {
  pillarId: number;
  x: number;
  y: number;
  radius: number;
}

export interface PipeManagerConfig {
  pillarWidth?: number;
  gapSize?: number;
  speed?: number;
  spawnIntervalDist?: number;
  pearlSpawnChance?: number;
  minPillarHeight?: number;
  maxActivePillars?: number;
}

export class PipeManager {
  pillars: CoralPillar[] = [];
  pillarWidth: number;
  gapSize: number;
  speed: number;
  spawnIntervalDist: number;
  pearlSpawnChance: number;
  minPillarHeight: number;
  maxActivePillars: number;

  private nextId = 1;
  private distanceSinceLastSpawn = 0;

  constructor(config: PipeManagerConfig = {}) {
    this.pillarWidth = config.pillarWidth ?? 70;
    this.gapSize = config.gapSize ?? 150;
    this.speed = config.speed ?? 180;
    this.spawnIntervalDist = config.spawnIntervalDist ?? 240;
    this.pearlSpawnChance = config.pearlSpawnChance ?? 0.35;
    this.minPillarHeight = config.minPillarHeight ?? 60;
    this.maxActivePillars = config.maxActivePillars ?? 10;
  }

  spawnPillar(canvasWidth: number, canvasHeight: number): CoralPillar {
    const minTop = this.minPillarHeight;
    const maxTop = canvasHeight - this.gapSize - this.minPillarHeight;
    const topHeight = Math.floor(minTop + Math.random() * Math.max(10, maxTop - minTop));
    const bottomY = topHeight + this.gapSize;
    const x = canvasWidth;

    const hasPearl = Math.random() < this.pearlSpawnChance;
    const pearlX = x + this.pillarWidth / 2;
    const pearlY = topHeight + this.gapSize / 2;
    const pearlRadius = 12;

    const pillar: CoralPillar = {
      id: this.nextId++,
      x,
      width: this.pillarWidth,
      topHeight,
      bottomY,
      gapSize: this.gapSize,
      passed: false,
      hasPearl,
      pearlCollected: false,
      pearlX,
      pearlY,
      pearlRadius,
    };

    // T-18-02: prevent boundless growth
    if (this.pillars.length >= this.maxActivePillars) {
      this.pillars.shift();
    }

    this.pillars.push(pillar);
    return pillar;
  }

  update(dt: number, speedMultiplier: number = 1, canvasWidth: number = 400, canvasHeight: number = 600): void {
    if (dt <= 0) return;

    const moveDistance = this.speed * speedMultiplier * dt;
    this.distanceSinceLastSpawn += moveDistance;

    // Scroll pillars
    for (const pillar of this.pillars) {
      pillar.x -= moveDistance;
      pillar.pearlX -= moveDistance;
    }

    // Cull offscreen pillars
    this.pillars = this.pillars.filter((p) => p.x + p.width >= -20);

    // Spawn new pillar if distance threshold reached
    if (this.distanceSinceLastSpawn >= this.spawnIntervalDist) {
      this.spawnPillar(canvasWidth, canvasHeight);
      this.distanceSinceLastSpawn = 0;
    }
  }

  checkPillarCollision(fish: Fish, canvasHeight: number): boolean {
    for (const pillar of this.pillars) {
      // 1. Top pillar AABB: [pillar.x, 0, pillar.width, pillar.topHeight]
      if (this.circleIntersectsAABB(fish.x, fish.y, fish.radius, pillar.x, 0, pillar.width, pillar.topHeight)) {
        return true;
      }

      // 2. Bottom pillar AABB: [pillar.x, pillar.bottomY, pillar.width, canvasHeight - pillar.bottomY]
      const bottomHeight = Math.max(0, canvasHeight - pillar.bottomY);
      if (this.circleIntersectsAABB(fish.x, fish.y, fish.radius, pillar.x, pillar.bottomY, pillar.width, bottomHeight)) {
        return true;
      }
    }

    return false;
  }

  private circleIntersectsAABB(
    cx: number,
    cy: number,
    radius: number,
    rx: number,
    ry: number,
    rw: number,
    rh: number
  ): boolean {
    // Find closest point on AABB to circle center
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));

    // Calculate squared distance
    const distX = cx - closestX;
    const distY = cy - closestY;
    const distSq = distX * distX + distY * distY;

    return distSq <= radius * radius;
  }

  checkScoreTriggers(fish: Fish): number {
    let newlyPassed = 0;
    for (const pillar of this.pillars) {
      if (!pillar.passed && fish.x > pillar.x + pillar.width / 2) {
        pillar.passed = true;
        newlyPassed++;
      }
    }
    return newlyPassed;
  }

  checkPearlCollisions(fish: Fish): PearlBubble[] {
    const collected: PearlBubble[] = [];
    for (const pillar of this.pillars) {
      if (pillar.hasPearl && !pillar.pearlCollected) {
        const dx = fish.x - pillar.pearlX;
        const dy = fish.y - pillar.pearlY;
        const distSq = dx * dx + dy * dy;
        const minDist = fish.radius + pillar.pearlRadius;

        if (distSq <= minDist * minDist) {
          pillar.pearlCollected = true;
          collected.push({
            pillarId: pillar.id,
            x: pillar.pearlX,
            y: pillar.pearlY,
            radius: pillar.pearlRadius,
          });
        }
      }
    }
    return collected;
  }

  reset(): void {
    this.pillars = [];
    this.distanceSinceLastSpawn = 0;
    this.nextId = 1;
  }
}
