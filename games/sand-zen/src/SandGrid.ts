export const CELL_EMPTY = 0;
export const CELL_WALL = 0xFFFFFFFF; // Fixed obstacle / boundary

export interface SandPalette {
  name: string;
  colors: number[]; // Packed 0xAABBGGRR or hex numbers
}

export const SAND_PALETTES: SandPalette[] = [
  {
    name: 'Sunset Dunes',
    colors: [
      0xFF4278F5, // Coral/Orange
      0xFF36B3F7, // Gold/Amber
      0xFF6851ED, // Crimson
      0xFF82A9FA, // Warm Peach
      0xFF2B5DF2, // Terracotta
    ],
  },
  {
    name: 'Bioluminescent Aqua',
    colors: [
      0xFFE0E000, // Cyan
      0xFFD6FF38, // Mint / Neon Aqua
      0xFF80FF00, // Seafoam
      0xFFE8A838, // Electric Blue
      0xFFF0F060, // Light Cyan
    ],
  },
  {
    name: 'Matcha & Sakura',
    colors: [
      0xFF78B868, // Matcha Green
      0xFF9FD08D, // Soft Leaf
      0xFFC0A0E8, // Sakura Pink
      0xFFDDB4F5, // Light Sakura
      0xFF568048, // Deep Moss
    ],
  },
  {
    name: 'Neon Cyber',
    colors: [
      0xFFF030E0, // Magenta Neon
      0xFF30F0F0, // Bright Cyan
      0xFF00FF7F, // Spring Neon
      0xFFF0E030, // Electric Gold
      0xFF8A2BE2, // Purple Glow
    ],
  },
  {
    name: 'Zen Monolith',
    colors: [
      0xFFE0E8EA, // Silver Quartz
      0xFFB5BFC2, // Granite Sand
      0xFF8E999E, // Slate Ash
      0xFFD0D6D8, // Marble Powder
      0xFF585F63, // Basalt Dust
    ],
  },
];

export interface Grain {
  x: number;
  y: number;
  color: number;
}

export class SandGrid {
  public readonly width: number;
  public readonly height: number;
  public grid: Uint32Array;
  private nextGrid: Uint32Array;
  private movingGrainsCount: number = 0;
  private scanDirection: number = 1; // Alternates 1 and -1 to avoid bias

  constructor(width = 160, height = 120) {
    this.width = width;
    this.height = height;
    this.grid = new Uint32Array(width * height);
    this.nextGrid = new Uint32Array(width * height);
    this.clear();
  }

  public getCell(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return CELL_WALL;
    }
    return this.grid[y * this.width + x] ?? CELL_EMPTY;
  }

  public setCell(x: number, y: number, value: number): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.grid[y * this.width + x] = value;
    }
  }

  public clear(): void {
    this.grid.fill(CELL_EMPTY);
  }

  public clearSandKeepWalls(): void {
    for (let i = 0; i < this.grid.length; i++) {
      if (this.grid[i] !== CELL_WALL) {
        this.grid[i] = CELL_EMPTY;
      }
    }
  }

  public countGrains(): number {
    let count = 0;
    for (let i = 0; i < this.grid.length; i++) {
      const val = this.grid[i];
      if (val !== CELL_EMPTY && val !== CELL_WALL) {
        count++;
      }
    }
    return count;
  }

  public getMovingGrainsCount(): number {
    return this.movingGrainsCount;
  }

  public addSand(x: number, y: number, color: number, radius = 2, jitter = 0.5): void {
    const rSq = radius * radius;
    const startX = Math.max(0, Math.floor(x - radius));
    const endX = Math.min(this.width - 1, Math.ceil(x + radius));
    const startY = Math.max(0, Math.floor(y - radius));
    const endY = Math.min(this.height - 1, Math.ceil(y + radius));

    for (let py = startY; py <= endY; py++) {
      for (let px = startX; px <= endX; px++) {
        const dx = px - x;
        const dy = py - y;
        if (dx * dx + dy * dy <= rSq) {
          if (Math.random() < 1 - jitter * 0.5) {
            const current = this.getCell(px, py);
            if (current === CELL_EMPTY) {
              this.setCell(px, py, color);
            }
          }
        }
      }
    }
  }

  public addWall(x1: number, y1: number, x2: number, y2: number, thickness = 1): void {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    let cx = x1;
    let cy = y1;

    while (true) {
      this.drawWallDot(cx, cy, thickness);
      if (cx === x2 && cy === y2) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        cx += sx;
      }
      if (e2 < dx) {
        err += dx;
        cy += sy;
      }
    }
  }

  private drawWallDot(x: number, y: number, thickness: number): void {
    const half = Math.floor(thickness / 2);
    for (let oy = -half; oy <= half; oy++) {
      for (let ox = -half; ox <= half; ox++) {
        const px = x + ox;
        const py = y + oy;
        if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
          this.setCell(px, py, CELL_WALL);
        }
      }
    }
  }

  public step(): void {
    let moved = 0;
    this.nextGrid.set(this.grid);

    // Alternate scan direction per step to prevent directional bias
    this.scanDirection = -this.scanDirection;
    const leftToRight = this.scanDirection > 0;

    // Scan from bottom to top
    for (let y = this.height - 2; y >= 0; y--) {
      const rowOffset = y * this.width;
      const nextRowOffset = (y + 1) * this.width;

      const startX = leftToRight ? 0 : this.width - 1;
      const endX = leftToRight ? this.width : -1;
      const stepX = leftToRight ? 1 : -1;

      for (let x = startX; x !== endX; x += stepX) {
        const cell = this.nextGrid[rowOffset + x] ?? CELL_EMPTY;

        // Only process sand grains
        if (cell === CELL_EMPTY || cell === CELL_WALL) {
          continue;
        }

        // 1. Check straight down
        const down = this.nextGrid[nextRowOffset + x] ?? CELL_WALL;
        if (down === CELL_EMPTY) {
          this.nextGrid[nextRowOffset + x] = cell;
          this.nextGrid[rowOffset + x] = CELL_EMPTY;
          moved++;
          continue;
        }

        // 2. Check diagonals with random / alternating preference
        const preferLeft = Math.random() < 0.5;
        const dir1 = preferLeft ? -1 : 1;
        const dir2 = -dir1;

        const x1 = x + dir1;
        const x2 = x + dir2;

        let slid = false;
        if (x1 >= 0 && x1 < this.width && (this.nextGrid[nextRowOffset + x1] ?? CELL_WALL) === CELL_EMPTY) {
          this.nextGrid[nextRowOffset + x1] = cell;
          this.nextGrid[rowOffset + x] = CELL_EMPTY;
          moved++;
          slid = true;
        } else if (x2 >= 0 && x2 < this.width && (this.nextGrid[nextRowOffset + x2] ?? CELL_WALL) === CELL_EMPTY) {
          this.nextGrid[nextRowOffset + x2] = cell;
          this.nextGrid[rowOffset + x] = CELL_EMPTY;
          moved++;
          slid = true;
        }

        if (slid) continue;

        // 3. Steep dune angle of repose slide (lateral slide if pile is > 2 grains steep)
        if (y + 2 < this.height) {
          const lateral1 = x + dir1;
          const lateral2 = x + dir2;
          if (
            lateral1 >= 0 && lateral1 < this.width &&
            (this.nextGrid[rowOffset + lateral1] ?? CELL_WALL) === CELL_EMPTY &&
            (this.nextGrid[(y + 2) * this.width + lateral1] ?? CELL_WALL) === CELL_EMPTY
          ) {
            this.nextGrid[rowOffset + lateral1] = cell;
            this.nextGrid[rowOffset + x] = CELL_EMPTY;
            moved++;
          } else if (
            lateral2 >= 0 && lateral2 < this.width &&
            (this.nextGrid[rowOffset + lateral2] ?? CELL_WALL) === CELL_EMPTY &&
            (this.nextGrid[(y + 2) * this.width + lateral2] ?? CELL_WALL) === CELL_EMPTY
          ) {
            this.nextGrid[rowOffset + lateral2] = cell;
            this.nextGrid[rowOffset + x] = CELL_EMPTY;
            moved++;
          }
        }
      }
    }

    this.grid.set(this.nextGrid);
    this.movingGrainsCount = moved;
  }
}
