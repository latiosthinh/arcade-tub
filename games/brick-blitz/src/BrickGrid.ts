import { Ball } from './Ball.js';

export type BrickType = 'standard' | 'durable' | 'bonus' | 'life';

export interface Brick {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: BrickType;
  maxHp: number;
  hp: number;
  color: string;
  destroyed: boolean;
}

export interface CollisionResult {
  hit: boolean;
  brick?: Brick;
  pointsAwarded: number;
  isDestroyed: boolean;
  isBonus: boolean;
  isLife: boolean;
}

export class BrickGrid {
  public bricks: Brick[] = [];
  public gridCols: number = 10;
  public brickWidth: number = 70;
  public brickHeight: number = 24;
  public padding: number = 8;
  public offsetTop: number = 70;
  public offsetLeft: number = 15;

  constructor(
    gridCols: number = 10,
    brickWidth: number = 70,
    brickHeight: number = 24,
    padding: number = 8,
    offsetTop: number = 70,
    offsetLeft: number = 15
  ) {
    this.gridCols = gridCols;
    this.brickWidth = brickWidth;
    this.brickHeight = brickHeight;
    this.padding = padding;
    this.offsetTop = offsetTop;
    this.offsetLeft = offsetLeft;
  }

  public loadLevel(level: number): void {
    // T-03-02 mitigate: Clamp level >= 1
    const safeLevel = Math.max(1, Math.floor(level));
    this.bricks = [];

    let rows = 4;
    if (safeLevel === 2) rows = 5;
    else if (safeLevel >= 3) rows = Math.min(7, 4 + safeLevel - 1);

    const standardColors = ['#00d2d3', '#ff7675', '#fed330', '#26de81'];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const x = this.offsetLeft + c * (this.brickWidth + this.padding);
        const y = this.offsetTop + r * (this.brickHeight + this.padding);
        const id = `brick_${r}_${c}`;

        let type: BrickType = 'standard';
        let maxHp = 1;
        let color = standardColors[r % standardColors.length];

        // Specific bonus/life placement
        if (r === 0 && (c === 2 || c === 7)) {
          type = 'bonus';
          maxHp = 1;
          color = '#f1c40f'; // gold
        } else if (r === 1 && c === 4) {
          type = 'life';
          maxHp = 1;
          color = '#e74c3c'; // heart red
        } else if (safeLevel >= 2 && r === 0) {
          type = 'durable';
          maxHp = safeLevel >= 3 ? 3 : 2;
          color = maxHp === 3 ? '#8854d0' : '#575fcf';
        } else if (safeLevel >= 3 && r === 1 && (c % 2 === 0)) {
          type = 'durable';
          maxHp = 2;
          color = '#575fcf';
        }

        this.bricks.push({
          id,
          x,
          y,
          width: this.brickWidth,
          height: this.brickHeight,
          type,
          maxHp,
          hp: maxHp,
          color,
          destroyed: false,
        });
      }
    }
  }

  public checkBallCollision(ball: Ball): CollisionResult {
    for (const b of this.bricks) {
      if (b.destroyed) continue;

      // Circle-AABB intersection
      const closestX = Math.max(b.x, Math.min(ball.x, b.x + b.width));
      const closestY = Math.max(b.y, Math.min(ball.y, b.y + b.height));

      const distanceX = ball.x - closestX;
      const distanceY = ball.y - closestY;
      const distanceSquared = distanceX * distanceX + distanceY * distanceY;

      if (distanceSquared <= ball.radius * ball.radius) {
        // Determine collision normal
        // Penetration depth check
        const overlapX = ball.radius - Math.abs(distanceX);
        const overlapY = ball.radius - Math.abs(distanceY);

        if (distanceX !== 0 && distanceY !== 0) {
          if (Math.abs(distanceX) > Math.abs(distanceY)) {
            ball.vx = -ball.vx;
          } else {
            ball.vy = -ball.vy;
          }
        } else if (distanceX !== 0) {
          ball.vx = -ball.vx;
        } else {
          ball.vy = -ball.vy;
        }

        b.hp--;

        let pointsAwarded = 5;
        if (b.type === 'bonus') {
          pointsAwarded = 50;
        } else if (b.type === 'life') {
          pointsAwarded = 10;
        } else if (b.type === 'durable') {
          pointsAwarded = 5; // 5 per hit
        }

        if (b.hp <= 0) {
          b.destroyed = true;
        }

        return {
          hit: true,
          brick: b,
          pointsAwarded,
          isDestroyed: b.destroyed,
          isBonus: b.type === 'bonus',
          isLife: b.type === 'life',
        };
      }
    }

    return {
      hit: false,
      pointsAwarded: 0,
      isDestroyed: false,
      isBonus: false,
      isLife: false,
    };
  }

  public isLevelCleared(): boolean {
    return this.bricks.every(b => b.destroyed);
  }

  public getRemainingBrickCount(): number {
    return this.bricks.filter(b => !b.destroyed).length;
  }
}
