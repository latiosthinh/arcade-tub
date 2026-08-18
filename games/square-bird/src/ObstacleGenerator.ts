export interface Obstacle {
  id: number;
  x: number;
  width: number;
  height: number; // Obstacle height in pixels
  groundY: number; // Top of the ground baseline
  blockHeightCount: number; // Height in blocks
  passed: boolean;
  perfectEvaluated: boolean;
}

export interface GeneratorConfig {
  blockSize: number;
  defaultGroundY: number;
  minGap: number;
  maxGap: number;
  minHeightBlocks: number;
  maxHeightBlocks: number;
  levelDistance: number;
}

export class ObstacleGenerator {
  public config: GeneratorConfig;
  public obstacles: Obstacle[];
  private nextId: number;

  constructor(customConfig: Partial<GeneratorConfig> = {}) {
    this.config = {
      blockSize: 36,
      defaultGroundY: 460,
      minGap: 240,
      maxGap: 420,
      minHeightBlocks: 1,
      maxHeightBlocks: 4,
      levelDistance: 6000,
      ...customConfig
    };
    this.obstacles = [];
    this.nextId = 1;
  }

  public reset(): void {
    this.obstacles = [];
    this.nextId = 1;
  }

  /**
   * Generates a deterministic sequence of obstacles for a given level seed
   */
  public generateLevel(level: number, seed: number = 42): Obstacle[] {
    this.reset();
    let rng = (seed + level * 997) % 2147483647;
    const nextRandom = (): number => {
      rng = (rng * 16807) % 2147483647;
      return (rng - 1) / 2147483646;
    };

    let currentX = 600; // First obstacle distance
    const endX = this.config.levelDistance;

    while (currentX < endX) {
      const maxH = Math.min(this.config.maxHeightBlocks, 1 + Math.floor(level * 0.5) + Math.floor(nextRandom() * 3));
      const blockCount = Math.max(1, Math.min(maxH, Math.floor(nextRandom() * maxH) + 1));
      const obstacleWidth = this.config.blockSize + Math.floor(nextRandom() * 2) * (this.config.blockSize * 0.5);
      const height = blockCount * this.config.blockSize;

      this.obstacles.push({
        id: this.nextId++,
        x: currentX,
        width: obstacleWidth,
        height: height,
        groundY: this.config.defaultGroundY,
        blockHeightCount: blockCount,
        passed: false,
        perfectEvaluated: false
      });

      const gap = this.config.minGap + nextRandom() * (this.config.maxGap - this.config.minGap);
      currentX += obstacleWidth + gap;
    }

    return this.obstacles;
  }
}
