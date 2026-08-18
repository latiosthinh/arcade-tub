export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface SnakeSegment {
  x: number;
  y: number;
}

export interface SnakeStepResult {
  stepped: boolean;
  head: SnakeSegment;
  tailRemoved?: SnakeSegment;
}

const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  [Direction.UP]: Direction.DOWN,
  [Direction.DOWN]: Direction.UP,
  [Direction.LEFT]: Direction.RIGHT,
  [Direction.RIGHT]: Direction.LEFT,
};

const DIRECTION_VECTORS: Record<Direction, { dx: number; dy: number }> = {
  [Direction.UP]: { dx: 0, dy: -1 },
  [Direction.DOWN]: { dx: 0, dy: 1 },
  [Direction.LEFT]: { dx: -1, dy: 0 },
  [Direction.RIGHT]: { dx: 1, dy: 0 },
};

export class Snake {
  body: SnakeSegment[] = [];
  currentDirection: Direction = Direction.RIGHT;
  directionQueue: Direction[] = [];
  baseStepInterval: number = 0.16;
  minStepInterval: number = 0.065;
  stepTimer: number = 0;
  growPending: number = 0;
  alive: boolean = true;

  constructor(
    startX: number = 10,
    startY: number = 10,
    initialLength: number = 3,
    initialDir: Direction = Direction.RIGHT
  ) {
    this.reset(startX, startY, initialLength, initialDir);
  }

  reset(
    startX: number = 10,
    startY: number = 10,
    initialLength: number = 3,
    initialDir: Direction = Direction.RIGHT
  ): void {
    this.currentDirection = initialDir;
    this.directionQueue = [];
    this.stepTimer = 0;
    this.growPending = 0;
    this.alive = true;
    this.body = [];

    const vec = DIRECTION_VECTORS[initialDir];
    // Head at startX, startY; body trailing behind
    for (let i = 0; i < initialLength; i++) {
      this.body.push({
        x: startX - vec.dx * i,
        y: startY - vec.dy * i,
      });
    }
  }

  getStepInterval(): number {
    const lengthPenalty = Math.max(0, this.body.length - 3) * 0.0025;
    return Math.max(this.minStepInterval, this.baseStepInterval - lengthPenalty);
  }

  queueDirection(dir: Direction): void {
    if (this.directionQueue.length >= 2) {
      return;
    }

    const lastQueued = this.directionQueue[this.directionQueue.length - 1];
    const lastEffectiveDir: Direction = lastQueued !== undefined ? lastQueued : this.currentDirection;

    // Prevent 180-degree instant reverse
    if (dir === lastEffectiveDir || dir === OPPOSITE_DIRECTIONS[lastEffectiveDir]) {
      return;
    }

    this.directionQueue.push(dir);
  }

  update(dt: number): SnakeStepResult {
    if (!this.alive || this.body.length === 0) {
      return { stepped: false, head: this.body[0] || { x: 0, y: 0 } };
    }

    this.stepTimer += dt;
    const interval = this.getStepInterval();

    if (this.stepTimer < interval) {
      return { stepped: false, head: this.body[0] || { x: 0, y: 0 } };
    }

    this.stepTimer -= interval;

    if (this.directionQueue.length > 0) {
      const nextDir = this.directionQueue.shift();
      if (nextDir && nextDir !== OPPOSITE_DIRECTIONS[this.currentDirection]) {
        this.currentDirection = nextDir;
      }
    }

    const vec = DIRECTION_VECTORS[this.currentDirection];
    const oldHead = this.body[0]!;
    const newHead: SnakeSegment = {
      x: oldHead.x + vec.dx,
      y: oldHead.y + vec.dy,
    };

    this.body.unshift(newHead);

    let tailRemoved: SnakeSegment | undefined;
    if (this.growPending > 0) {
      this.growPending--;
    } else {
      tailRemoved = this.body.pop();
    }

    return {
      stepped: true,
      head: newHead,
      tailRemoved,
    };
  }

  grow(amount: number = 1): void {
    this.growPending += amount;
  }

  checkSelfCollision(): boolean {
    if (this.body.length <= 4) {
      return false;
    }
    const head = this.body[0];
    if (!head) return false;
    for (let i = 1; i < this.body.length; i++) {
      const seg = this.body[i];
      if (seg && seg.x === head.x && seg.y === head.y) {
        return true;
      }
    }
    return false;
  }

  occupies(x: number, y: number): boolean {
    return this.body.some((seg) => seg.x === x && seg.y === y);
  }
}
