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
  public furthestGeneratedX: number;
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
    this.furthestGeneratedX = 0;
    this.nextId = 1;
  }

  public reset(): void {
    this.obstacles = [];
    this.furthestGeneratedX = 0;
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

      // Periodic high ceiling obstacle / overhead gate that punishes over-stacking
      if (nextRandom() > 0.65 && blockCount <= 2) {
        const ceilingClearance = 3 * this.config.blockSize; // 3 blocks clearance
        const ceilingHeight = this.config.defaultGroundY - (height + ceilingClearance);
        if (ceilingHeight > 50) {
          this.obstacles.push({
            id: this.nextId++,
            x: currentX + obstacleWidth * 0.5,
            width: obstacleWidth * 0.8,
            height: ceilingHeight,
            groundY: ceilingHeight, // Starts from top down
            blockHeightCount: Math.ceil(ceilingHeight / this.config.blockSize),
            passed: false,
            perfectEvaluated: false
          });
        }
      }

      const gap = this.config.minGap + nextRandom() * (this.config.maxGap - this.config.minGap);
      currentX += obstacleWidth + gap;
    }

    this.furthestGeneratedX = currentX;
    return this.obstacles;
  }

  /**
   * Generates procedural obstacles dynamically ahead of current player X position (infinite runner)
   */
  public generateAhead(currentX: number, bufferDistance: number = 1800): Obstacle[] {
    if (this.furthestGeneratedX === 0) {
      this.furthestGeneratedX = Math.max(600, currentX + 400);
    }

    const targetX = currentX + bufferDistance;
    const newlyCreated: Obstacle[] = [];

    // Increase difficulty gradually based on distance traveled
    const difficultyLevel = 1 + Math.floor(currentX / 2500);

    while (this.furthestGeneratedX < targetX) {
      // Height variance (1 to max blocks based on difficulty)
      const maxPossibleH = Math.min(this.config.maxHeightBlocks, 1 + Math.floor(difficultyLevel * 0.6));
      const blockCount = Math.max(1, Math.min(maxPossibleH, 1 + Math.floor(Math.random() * maxPossibleH)));
      
      const widthVariance = Math.random() > 0.6 ? 1.5 : 1.0;
      const obstacleWidth = this.config.blockSize * widthVariance;
      const height = blockCount * this.config.blockSize;

      const newObs: Obstacle = {
        id: this.nextId++,
        x: this.furthestGeneratedX,
        width: obstacleWidth,
        height: height,
        groundY: this.config.defaultGroundY,
        blockHeightCount: blockCount,
        passed: false,
        perfectEvaluated: false
      };

      this.obstacles.push(newObs);
      newlyCreated.push(newObs);

      // In infinite mode, spawn ceiling barrier hazards if blockCount is low to prevent infinite sky flying
      if (Math.random() > 0.6 && blockCount <= 2) {
        const ceilingClearance = 3 * this.config.blockSize;
        const ceilingHeight = this.config.defaultGroundY - (height + ceilingClearance);
        if (ceilingHeight > 50) {
          const ceilingObs: Obstacle = {
            id: this.nextId++,
            x: this.furthestGeneratedX + obstacleWidth * 0.4,
            width: obstacleWidth * 0.8,
            height: ceilingHeight,
            groundY: ceilingHeight,
            blockHeightCount: Math.ceil(ceilingHeight / this.config.blockSize),
            passed: false,
            perfectEvaluated: false
          };
          this.obstacles.push(ceilingObs);
          newlyCreated.push(ceilingObs);
        }
      }

      // Adaptive gap distance: 200 - 380px, slightly tighter with high difficulty
      const minG = Math.max(200, this.config.minGap - Math.min(60, difficultyLevel * 8));
      const maxG = Math.max(minG + 60, this.config.maxGap - Math.min(40, difficultyLevel * 5));
      const gap = minG + Math.random() * (maxG - minG);

      this.furthestGeneratedX += obstacleWidth + gap;
    }

    return newlyCreated;
  }

  /**
   * Culls obstacles that have scrolled well behind camera view (prevent unbounded memory growth)
   */
  public cullBehind(camX: number, cullOffset: number = 300): void {
    const minThresholdX = camX - cullOffset;
    if (this.obstacles.length === 0) return;

    let cullCount = 0;
    for (let i = 0; i < this.obstacles.length; i++) {
      if (this.obstacles[i].x + this.obstacles[i].width < minThresholdX) {
        cullCount++;
      } else {
        break; // Obstacles are sorted by x position
      }
    }

    if (cullCount > 0) {
      this.obstacles.splice(0, cullCount);
    }
  }
}
