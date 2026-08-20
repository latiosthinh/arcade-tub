import { SandGrid, CELL_EMPTY, CELL_WALL, SAND_PALETTES, SandPalette } from './SandGrid';

export type ZenToolType = 'stream' | 'rake' | 'funnel' | 'brush' | 'palette';

export interface FunnelObstacle {
  x: number;
  y: number;
  width: number;
}

export class ZenToolManager {
  public currentTool: ZenToolType = 'stream';
  public paletteIndex: number = 0;
  public currentColorIndex: number = 0;
  public funnels: FunnelObstacle[] = [];
  public brushSize: number = 3;

  // Hopper state
  public hopperActive: boolean = false;
  public hopperX: number = 80;
  public hopperDirection: number = 1;
  public hopperSpeed: number = 40; // grid cells per second
  private hopperDropTimer: number = 0;

  public get currentPalette(): SandPalette {
    return SAND_PALETTES[this.paletteIndex % SAND_PALETTES.length];
  }

  public get activeColor(): number {
    const pal = this.currentPalette;
    return pal.colors[this.currentColorIndex % pal.colors.length];
  }

  public setTool(tool: ZenToolType): void {
    this.currentTool = tool;
  }

  public nextPalette(): void {
    this.paletteIndex = (this.paletteIndex + 1) % SAND_PALETTES.length;
    this.currentColorIndex = 0;
  }

  public setColorIndex(idx: number): void {
    this.currentColorIndex = idx % this.currentPalette.colors.length;
  }

  public nextColor(): void {
    this.currentColorIndex = (this.currentColorIndex + 1) % this.currentPalette.colors.length;
  }

  /**
   * Applies rake displacement along line (x1, y1) to (x2, y2).
   * Moves sand grains outwards from the rake tines to create grooves/furrows without destroying grains.
   */
  public applyRake(
    grid: SandGrid,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    rakeWidth = 8,
    tines = 3
  ): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;

    // Normal vector perpendicular to rake drag direction
    const nx = -dy / dist;
    const ny = dx / dist;

    const steps = Math.ceil(dist);
    const tineSpacing = rakeWidth / Math.max(1, tines - 1);

    for (let s = 0; s <= steps; s++) {
      const cx = x1 + (dx * s) / steps;
      const cy = y1 + (dy * s) / steps;

      for (let t = 0; t < tines; t++) {
        const offset = -rakeWidth / 2 + t * tineSpacing;
        const tx = Math.round(cx + nx * offset);
        const ty = Math.round(cy + ny * offset);

        this.carveSingleTine(grid, tx, ty, nx, ny);
      }
    }
  }

  private carveSingleTine(grid: SandGrid, x: number, y: number, nx: number, ny: number): void {
    const val = grid.getCell(x, y);
    if (val === CELL_EMPTY || val === CELL_WALL) return;

    // Find nearest empty spot perpendicular to stroke to displace sand into furrow crest
    for (let disp = 1; disp <= 3; disp++) {
      const sign = disp % 2 === 1 ? 1 : -1;
      const mag = Math.ceil(disp / 2);
      const targetX = Math.round(x + nx * sign * mag);
      const targetY = Math.round(y + ny * sign * mag);

      if (grid.getCell(targetX, targetY) === CELL_EMPTY) {
        grid.setCell(targetX, targetY, val);
        grid.setCell(x, y, CELL_EMPTY);
        return;
      }
    }
  }

  /**
   * Places a V-shaped funnel deflector with a narrow center opening.
   */
  public placeFunnel(grid: SandGrid, x: number, y: number, width = 24): FunnelObstacle {
    const half = Math.floor(width / 2);
    const gap = 3; // center opening
    const depth = Math.floor(width / 3);

    // Left wing
    grid.addWall(x - half, y - depth, x - gap, y, 1);
    // Right wing
    grid.addWall(x + half, y - depth, x + gap, y, 1);

    const funnel: FunnelObstacle = { x, y, width };
    this.funnels.push(funnel);
    return funnel;
  }

  public updateHopper(grid: SandGrid, dt: number): void {
    if (!this.hopperActive) return;

    // Move hopper back and forth across upper grid
    this.hopperX += this.hopperDirection * this.hopperSpeed * dt;
    const minX = 15;
    const maxX = grid.width - 15;

    if (this.hopperX <= minX) {
      this.hopperX = minX;
      this.hopperDirection = 1;
    } else if (this.hopperX >= maxX) {
      this.hopperX = maxX;
      this.hopperDirection = -1;
    }

    this.hopperDropTimer += dt;
    if (this.hopperDropTimer >= 0.04) {
      this.hopperDropTimer = 0;
      grid.addSand(Math.round(this.hopperX), 4, this.activeColor, 2, 0.4);
    }
  }
}
