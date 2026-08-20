import { FruitPhysics, FruitItem } from './FruitPhysics.js';

export interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

export interface SwipeResult {
  totalSliced: number;
  isCombo: boolean;
  comboMultiplier: number;
}

export class BladeEngine {
  public points: TrailPoint[] = [];
  public maxTrailDuration: number = 120; // 120ms trail decay
  public currentSwipeSliced: FruitItem[] = [];
  public isSwiping: boolean = false;

  public startSwipe(x: number, y: number, time: number = Date.now()): void {
    this.isSwiping = true;
    this.points = [{ x, y, time }];
    this.currentSwipeSliced = [];
  }

  public addPoint(x: number, y: number, time: number = Date.now()): void {
    this.points.push({ x, y, time });
    this.update(time);
  }

  public update(currentTime: number = Date.now()): void {
    while (this.points.length > 0 && (currentTime - this.points[0].time) > this.maxTrailDuration) {
      this.points.shift();
    }
  }

  public processSwipeMove(
    x: number,
    y: number,
    time: number = Date.now(),
    physics: FruitPhysics
  ): FruitItem[] {
    const newlySliced: FruitItem[] = [];
    if (this.points.length === 0) {
      this.points.push({ x, y, time });
      return newlySliced;
    }

    const prevPoint = this.points[this.points.length - 1];
    this.points.push({ x, y, time });
    this.update(time);

    // Calculate slice angle
    const dx = x - prevPoint.x;
    const dy = y - prevPoint.y;
    const sliceAngle = Math.atan2(dy, dx);
    const dist = Math.hypot(dx, dy);

    if (dist < 4) return newlySliced; // Skip micro-jitters

    // Check intersection with all active fruits
    for (const fruit of [...physics.fruits]) {
      if (fruit.sliced) continue;
      if (this.checkSegmentCircle(prevPoint.x, prevPoint.y, x, y, fruit.x, fruit.y, fruit.radius)) {
        physics.sliceFruit(fruit, sliceAngle);
        newlySliced.push(fruit);
        this.currentSwipeSliced.push(fruit);
      }
    }

    return newlySliced;
  }

  public endSwipe(): SwipeResult {
    this.isSwiping = false;
    const count = this.currentSwipeSliced.length;
    const isCombo = count >= 3;
    let comboMultiplier = 1;
    if (count === 3) comboMultiplier = 2;
    else if (count === 4) comboMultiplier = 3;
    else if (count >= 5) comboMultiplier = 5;

    const result: SwipeResult = {
      totalSliced: count,
      isCombo,
      comboMultiplier
    };

    this.currentSwipeSliced = [];
    return result;
  }

  /**
   * Distance from line segment (x1, y1) -> (x2, y2) to circle (cx, cy)
   */
  public checkSegmentCircle(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    cx: number,
    cy: number,
    radius: number
  ): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSq = dx * dx + dy * dy;

    if (lengthSq === 0) {
      const d = Math.hypot(cx - x1, cy - y1);
      return d <= radius;
    }

    // Projection scalar t on the line segment [0, 1]
    const t = Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / lengthSq));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;

    const dist = Math.hypot(cx - projX, cy - projY);
    return dist <= radius;
  }
}
