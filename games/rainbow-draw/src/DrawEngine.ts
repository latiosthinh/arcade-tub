export interface Point {
  x: number;
  y: number;
  hue: number;
  size: number;
}

export type DrawMode = 'rainbow' | 'auto-adjust' | 'scratch';

export class DrawEngine {
  private width: number;
  private height: number;
  private mode: DrawMode = 'rainbow';
  private currentHue: number = 0;
  private hueSpeed: number = 2.5;
  private brushSize: number = 14;
  private currentStroke: Point[] = [];
  private completedStrokes: Point[][] = [];
  
  // Scratch reveal grid tracking (40x30 cells for 800x600)
  private readonly gridCols: number = 40;
  private readonly gridRows: number = 30;
  private scratchedGrid: boolean[];
  private maxStrokePoints: number = 1000;

  constructor(width: number = 800, height: number = 600) {
    this.width = width;
    this.height = height;
    this.scratchedGrid = new Array(this.gridCols * this.gridRows).fill(false);
  }

  public setMode(mode: DrawMode): void {
    this.mode = mode;
  }

  public getMode(): DrawMode {
    return this.mode;
  }

  public setBrushSize(size: number): void {
    this.brushSize = Math.max(2, Math.min(60, size));
  }

  public getBrushSize(): number {
    return this.brushSize;
  }

  public getCurrentHue(): number {
    return this.currentHue;
  }

  public startStroke(x: number, y: number): void {
    this.currentStroke = [{
      x,
      y,
      hue: this.currentHue,
      size: this.brushSize
    }];

    if (this.mode === 'scratch') {
      this.scratchAt(x, y, this.brushSize * 2);
    }
  }

  public addPoint(x: number, y: number): void {
    if (this.currentStroke.length >= this.maxStrokePoints) {
      return; // Cap stroke length to prevent unbounded memory growth (T-42-02)
    }

    const last = this.currentStroke[this.currentStroke.length - 1];
    if (last) {
      const dist = Math.hypot(x - last.x, y - last.y);
      if (dist < 2) return; // Ignore micro-jitters
      
      this.currentHue = (this.currentHue + dist * this.hueSpeed * 0.15) % 360;
    }

    this.currentStroke.push({
      x,
      y,
      hue: this.currentHue,
      size: this.brushSize
    });

    if (this.mode === 'scratch') {
      this.scratchAt(x, y, this.brushSize * 2);
    }
  }

  public endStroke(): void {
    if (this.currentStroke.length === 0) return;

    if (this.mode === 'auto-adjust') {
      const smoothed = this.smoothStroke(this.currentStroke);
      this.completedStrokes.push(smoothed);
    } else if (this.mode === 'rainbow') {
      this.completedStrokes.push([...this.currentStroke]);
    }
    this.currentStroke = [];
  }

  public smoothStroke(points: Point[]): Point[] {
    if (points.length <= 2) return [...points];

    // Douglas-Peucker / Catmull-Rom hybrid interpolation for smooth curves
    const result: Point[] = [];
    result.push(points[0]);

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      // Interpolate 3 sub-points per segment
      const steps = 3;
      for (let t = 1; t <= steps; t++) {
        const u = t / steps;
        const u2 = u * u;
        const u3 = u2 * u;

        const x = 0.5 * (
          (2 * p1.x) +
          (-p0.x + p2.x) * u +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3
        );

        const y = 0.5 * (
          (2 * p1.y) +
          (-p0.y + p2.y) * u +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3
        );

        const hue = p1.hue + (p2.hue - p1.hue) * u;
        result.push({ x, y, hue, size: p1.size });
      }
    }

    return result;
  }

  public scratchAt(x: number, y: number, radius: number): void {
    const cellW = this.width / this.gridCols;
    const cellH = this.height / this.gridRows;

    const minCol = Math.max(0, Math.floor((x - radius) / cellW));
    const maxCol = Math.min(this.gridCols - 1, Math.floor((x + radius) / cellW));
    const minRow = Math.max(0, Math.floor((y - radius) / cellH));
    const maxRow = Math.min(this.gridRows - 1, Math.floor((y + radius) / cellH));

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const cx = (c + 0.5) * cellW;
        const cy = (r + 0.5) * cellH;
        if (Math.hypot(cx - x, cy - y) <= radius) {
          this.scratchedGrid[r * this.gridCols + c] = true;
        }
      }
    }
  }

  public getScratchPercent(): number {
    const scratchedCount = this.scratchedGrid.reduce((acc, val) => acc + (val ? 1 : 0), 0);
    return Math.round((scratchedCount / this.scratchedGrid.length) * 100);
  }

  public resetScratch(): void {
    this.scratchedGrid.fill(false);
  }

  public clearCanvas(): void {
    this.completedStrokes = [];
    this.currentStroke = [];
    this.resetScratch();
  }

  public getCurrentStrokePoints(): Point[] {
    return this.currentStroke;
  }

  public getCompletedStrokes(): Point[][] {
    return this.completedStrokes;
  }
}
