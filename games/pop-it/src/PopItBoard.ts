export type PopItShape = 'square' | 'heart' | 'hexagon' | 'star';

export interface DimpleCell {
  id: string;
  normalizedX: number; // 0 to 1 relative to board content
  normalizedY: number; // 0 to 1
  radiusRatio: number; // normalized radius
  row: number;
  color: string;
  isPopped: boolean; // popped relative to current front face
  popDepth: number; // 0 (unpressed) to 1.0 (fully inverted)
  x: number; // Screen / local pixel coordinate
  y: number;
  radius: number;
}

export interface ShapeTemplate {
  name: PopItShape;
  dimples: Array<{
    nx: number;
    ny: number;
    row: number;
    color: string;
  }>;
  dimpleRadiusRatio: number;
}

const RAINBOW_PALETTE = [
  '#FF5E7E', // Pink/Red
  '#FFA05E', // Orange
  '#FFDE59', // Yellow
  '#7EDB57', // Green
  '#4EB5FF', // Blue
  '#B266FF'  // Purple
];

function generateSquareTemplate(): ShapeTemplate {
  const dimples = [];
  const rows = 6;
  const cols = 6;
  for (let r = 0; r < rows; r++) {
    const color = RAINBOW_PALETTE[r % RAINBOW_PALETTE.length];
    for (let c = 0; c < cols; c++) {
      dimples.push({
        nx: (c + 1) / (cols + 1),
        ny: (r + 1) / (rows + 1),
        row: r,
        color
      });
    }
  }
  return {
    name: 'square',
    dimples,
    dimpleRadiusRatio: 0.065
  };
}

function generateHexagonTemplate(): ShapeTemplate {
  const dimples = [];
  // Row structure: 4, 5, 6, 5, 4 dimples
  const rowCounts = [4, 5, 6, 5, 4];
  for (let r = 0; r < rowCounts.length; r++) {
    const count = rowCounts[r];
    const color = RAINBOW_PALETTE[r % RAINBOW_PALETTE.length];
    const ny = 0.18 + (r / (rowCounts.length - 1)) * 0.64;
    for (let c = 0; c < count; c++) {
      const nx = 0.5 + (c - (count - 1) / 2) * 0.14;
      dimples.push({
        nx,
        ny,
        row: r,
        color
      });
    }
  }
  return {
    name: 'hexagon',
    dimples,
    dimpleRadiusRatio: 0.058
  };
}

function generateHeartTemplate(): ShapeTemplate {
  const dimples = [];
  // Approximate heart shape grid
  const layout = [
    { row: 0, xs: [0.3, 0.42, 0.58, 0.7] },
    { row: 1, xs: [0.22, 0.35, 0.48, 0.52, 0.65, 0.78] },
    { row: 2, xs: [0.2, 0.32, 0.44, 0.56, 0.68, 0.8] },
    { row: 3, xs: [0.26, 0.38, 0.5, 0.62, 0.74] },
    { row: 4, xs: [0.35, 0.45, 0.55, 0.65] },
    { row: 5, xs: [0.42, 0.5, 0.58] },
    { row: 6, xs: [0.5] }
  ];

  for (let r = 0; r < layout.length; r++) {
    const item = layout[r];
    const color = RAINBOW_PALETTE[r % RAINBOW_PALETTE.length];
    const ny = 0.18 + (r / (layout.length - 1)) * 0.65;
    for (const nx of item.xs) {
      dimples.push({
        nx,
        ny,
        row: r,
        color
      });
    }
  }

  return {
    name: 'heart',
    dimples,
    dimpleRadiusRatio: 0.05
  };
}

function generateStarTemplate(): ShapeTemplate {
  const dimples = [];
  const layout = [
    { row: 0, xs: [0.5] },
    { row: 1, xs: [0.44, 0.56] },
    { row: 2, xs: [0.2, 0.32, 0.44, 0.56, 0.68, 0.8] },
    { row: 3, xs: [0.28, 0.39, 0.5, 0.61, 0.72] },
    { row: 4, xs: [0.35, 0.45, 0.55, 0.65] },
    { row: 5, xs: [0.3, 0.42, 0.58, 0.7] },
    { row: 6, xs: [0.25, 0.75] }
  ];

  for (let r = 0; r < layout.length; r++) {
    const item = layout[r];
    const color = RAINBOW_PALETTE[r % RAINBOW_PALETTE.length];
    const ny = 0.16 + (r / (layout.length - 1)) * 0.68;
    for (const nx of item.xs) {
      dimples.push({
        nx,
        ny,
        row: r,
        color
      });
    }
  }

  return {
    name: 'star',
    dimples,
    dimpleRadiusRatio: 0.05
  };
}

export const BOARD_SHAPES: Record<PopItShape, ShapeTemplate> = {
  square: generateSquareTemplate(),
  hexagon: generateHexagonTemplate(),
  heart: generateHeartTemplate(),
  star: generateStarTemplate()
};

export class PopItBoard {
  public currentShape: PopItShape = 'square';
  public isFlipped: boolean = false;
  private dimples: DimpleCell[] = [];

  // Local bounding layout
  public originX: number = 0;
  public originY: number = 0;
  public width: number = 400;
  public height: number = 400;

  constructor(shape: PopItShape = 'square') {
    this.setShape(shape);
  }

  public setShape(shape: PopItShape): void {
    // Mitigation T-43-04: Validate shape ID against supported enum values
    if (!BOARD_SHAPES[shape]) {
      this.currentShape = 'square';
    } else {
      this.currentShape = shape;
    }
    this.isFlipped = false;
    this.initDimples();
    this.updatePixelCoordinates();
  }

  private initDimples(): void {
    const template = BOARD_SHAPES[this.currentShape];
    this.dimples = template.dimples.map((d, index) => ({
      id: `dimple_${this.currentShape}_${index}`,
      normalizedX: d.nx,
      normalizedY: d.ny,
      radiusRatio: template.dimpleRadiusRatio,
      row: d.row,
      color: d.color,
      isPopped: false,
      popDepth: 0,
      x: 0,
      y: 0,
      radius: 20
    }));
  }

  public setBoardBounds(originX: number, originY: number, width: number, height: number): void {
    this.originX = originX;
    this.originY = originY;
    this.width = Math.max(10, width);
    this.height = Math.max(10, height);
    this.updatePixelCoordinates();
  }

  private updatePixelCoordinates(): void {
    const minDim = Math.min(this.width, this.height);
    for (const d of this.dimples) {
      // Horizontal coordinate accounts for flip state: x' = (1 - nx) if flipped
      const effNx = this.isFlipped ? 1 - d.normalizedX : d.normalizedX;
      d.x = this.originX + effNx * this.width;
      d.y = this.originY + d.normalizedY * this.height;
      d.radius = d.radiusRatio * minDim;
    }
  }

  public getDimples(): DimpleCell[] {
    return this.dimples;
  }

  public getDimpleById(id: string): DimpleCell | null {
    return this.dimples.find((d) => d.id === id) || null;
  }

  public popDimple(id: string): boolean {
    const dimple = this.getDimpleById(id);
    if (!dimple) return false;

    // In pop-it toys:
    // If board is NOT flipped (front): unpopped -> push to pop (isPopped = true).
    // If board IS flipped (back): dimple was popped inward on front, so on back it is protruding (isPopped = true from front = protruding on back).
    // Pressing it from back pushes it back to front (isPopped = false).
    if (!this.isFlipped) {
      if (dimple.isPopped) return false;
      dimple.isPopped = true;
      dimple.popDepth = 1.0;
      return true;
    } else {
      if (!dimple.isPopped) return false;
      dimple.isPopped = false;
      dimple.popDepth = 0.0;
      return true;
    }
  }

  public popDimpleAt(x: number, y: number, hitRadius: number = 20): DimpleCell | null {
    for (const d of this.dimples) {
      const dx = x - d.x;
      const dy = y - d.y;
      const effectiveHitRadius = d.radius + hitRadius * 0.5;
      if (dx * dx + dy * dy <= effectiveHitRadius * effectiveHitRadius) {
        if (this.popDimple(d.id)) {
          return d;
        }
      }
    }
    return null;
  }

  public sweepLine(x1: number, y1: number, x2: number, y2: number, hitRadius: number = 20): DimpleCell[] {
    const newlyPopped: DimpleCell[] = [];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    const stepSize = Math.max(5, this.dimples[0]?.radius || 15);
    const steps = Math.max(1, Math.ceil(dist / stepSize));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const curX = x1 + dx * t;
      const curY = y1 + dy * t;
      const popped = this.popDimpleAt(curX, curY, hitRadius);
      if (popped && !newlyPopped.some((p) => p.id === popped.id)) {
        newlyPopped.push(popped);
      }
    }

    return newlyPopped;
  }

  public flipBoard(): void {
    this.isFlipped = !this.isFlipped;
    this.updatePixelCoordinates();
  }

  public isAllPopped(): boolean {
    if (this.dimples.length === 0) return false;
    // On front face: all isPopped === true
    // On reverse face: all isPopped === false (all pressed through back to front)
    if (!this.isFlipped) {
      return this.dimples.every((d) => d.isPopped);
    } else {
      return this.dimples.every((d) => !d.isPopped);
    }
  }

  public getPoppedCount(): number {
    if (!this.isFlipped) {
      return this.dimples.filter((d) => d.isPopped).length;
    } else {
      return this.dimples.filter((d) => !d.isPopped).length;
    }
  }

  public resetBoard(): void {
    this.isFlipped = false;
    for (const d of this.dimples) {
      d.isPopped = false;
      d.popDepth = 0;
    }
    this.updatePixelCoordinates();
  }
}
