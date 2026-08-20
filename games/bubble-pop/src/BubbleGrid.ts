export interface BubbleCell {
  col: number;
  row: number;
  popped: boolean;
  isGolden: boolean;
  popProgress: number; // 0 (unpopped) to 1.0 (fully burst animation complete)
  scale: number;
  hueOffset: number;
}

export interface GridStats {
  total: number;
  popped: number;
  goldenCount: number;
  percent: number;
}

export class BubbleGrid {
  public cols: number;
  public rows: number;
  public totalBubbles: number;
  public goldenChance: number;
  private cells: BubbleCell[][] = [];

  // Layout metrics for coordinate projection
  public originX: number = 0;
  public originY: number = 0;
  public cellWidth: number = 40;
  public cellHeight: number = 40;

  constructor(cols: number = 8, rows: number = 10, goldenChance: number = 0.05) {
    this.cols = Math.max(1, Math.floor(cols));
    this.rows = Math.max(1, Math.floor(rows));
    this.goldenChance = Math.max(0, Math.min(1, goldenChance));
    this.totalBubbles = this.cols * this.rows;
    this.initGrid();
  }

  private initGrid(): void {
    this.cells = [];
    for (let r = 0; r < this.rows; r++) {
      const row: BubbleCell[] = [];
      for (let c = 0; c < this.cols; c++) {
        const isGolden = Math.random() < this.goldenChance;
        row.push({
          col: c,
          row: r,
          popped: false,
          isGolden,
          popProgress: 0,
          scale: 1.0,
          hueOffset: Math.floor(Math.random() * 360)
        });
      }
      this.cells.push(row);
    }
  }

  public setLayout(originX: number, originY: number, cellWidth: number, cellHeight: number): void {
    this.originX = originX;
    this.originY = originY;
    this.cellWidth = Math.max(1, cellWidth);
    this.cellHeight = Math.max(1, cellHeight);
  }

  public getCell(col: number, row: number): BubbleCell | null {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return null;
    }
    return this.cells[row]?.[col] ?? null;
  }

  public popCell(col: number, row: number): boolean {
    const cell = this.getCell(col, row);
    if (!cell || cell.popped) return false;
    cell.popped = true;
    cell.popProgress = 0.01;
    return true;
  }

  public getCellCenter(col: number, row: number): { x: number; y: number } {
    return {
      x: this.originX + (col + 0.5) * this.cellWidth,
      y: this.originY + (row + 0.5) * this.cellHeight
    };
  }

  public popAt(x: number, y: number, radius: number = 20): BubbleCell[] {
    const newlyPopped: BubbleCell[] = [];
    const radSq = radius * radius;

    // Fast bounding box grid query
    const minCol = Math.max(0, Math.floor((x - radius - this.originX) / this.cellWidth));
    const maxCol = Math.min(this.cols - 1, Math.floor((x + radius - this.originX) / this.cellWidth));
    const minRow = Math.max(0, Math.floor((y - radius - this.originY) / this.cellHeight));
    const maxRow = Math.min(this.rows - 1, Math.floor((y + radius - this.originY) / this.cellHeight));

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const cell = this.getCell(c, r);
        if (cell && !cell.popped) {
          const center = this.getCellCenter(c, r);
          const dx = x - center.x;
          const dy = y - center.y;
          const bubbleRadius = Math.min(this.cellWidth, this.cellHeight) * 0.45;
          const combinedRadius = radius + bubbleRadius;
          if (dx * dx + dy * dy <= combinedRadius * combinedRadius) {
            cell.popped = true;
            cell.popProgress = 0.01;
            newlyPopped.push(cell);
          }
        }
      }
    }

    return newlyPopped;
  }

  public sweepLine(x1: number, y1: number, x2: number, y2: number, radius: number = 20): BubbleCell[] {
    const newlyPopped: BubbleCell[] = [];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(dist / (Math.min(this.cellWidth, this.cellHeight) * 0.4)));

    // Track popped in this sweep to avoid duplicates
    const poppedKeys = new Set<string>();

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const curX = x1 + dx * t;
      const curY = y1 + dy * t;
      const batch = this.popAt(curX, curY, radius);
      for (const b of batch) {
        const key = `${b.col},${b.row}`;
        if (!poppedKeys.has(key)) {
          poppedKeys.add(key);
          newlyPopped.push(b);
        }
      }
    }

    return newlyPopped;
  }

  public reload(cols?: number, rows?: number, goldenChance?: number): void {
    if (cols !== undefined) this.cols = Math.max(1, Math.floor(cols));
    if (rows !== undefined) this.rows = Math.max(1, Math.floor(rows));
    if (goldenChance !== undefined) this.goldenChance = Math.max(0, Math.min(1, goldenChance));
    this.totalBubbles = this.cols * this.rows;
    this.initGrid();
  }

  public getStats(): GridStats {
    let popped = 0;
    let goldenCount = 0;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.cells[r]?.[c];
        if (cell?.popped) popped++;
        if (cell?.isGolden) goldenCount++;
      }
    }

    const percent = this.totalBubbles > 0 ? Math.round((popped / this.totalBubbles) * 100) : 0;
    return {
      total: this.totalBubbles,
      popped,
      goldenCount,
      percent
    };
  }
}
