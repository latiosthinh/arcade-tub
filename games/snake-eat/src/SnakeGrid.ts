export const GRID_COLS = 25;
export const GRID_ROWS = 20;
export const CELL_SIZE = 32;

export interface GridCoord {
  x: number;
  y: number;
}

export class SnakeGrid {
  static isInside(x: number, y: number, cols: number = GRID_COLS, rows: number = GRID_ROWS): boolean {
    return x >= 0 && x < cols && y >= 0 && y < rows;
  }

  static gridToPixel(gx: number, gy: number, cellSize: number = CELL_SIZE): { x: number; y: number } {
    return {
      x: gx * cellSize + cellSize / 2,
      y: gy * cellSize + cellSize / 2,
    };
  }

  static pixelToGrid(px: number, py: number, cellSize: number = CELL_SIZE): { gx: number; gy: number } {
    return {
      gx: Math.floor(px / cellSize),
      gy: Math.floor(py / cellSize),
    };
  }
}
