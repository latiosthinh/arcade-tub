import { TileType, Rect, Point } from './types';

export class TileMap {
  readonly cols: number;
  readonly rows: number;
  readonly tileSize: number;
  readonly tiles: TileType[];

  constructor(cols: number, rows: number, tileSize: number, tiles: TileType[]) {
    this.cols = Math.max(0, cols);
    this.rows = Math.max(0, rows);
    this.tileSize = tileSize;
    this.tiles = tiles;
  }

  get widthInPixels(): number {
    return this.cols * this.tileSize;
  }

  get heightInPixels(): number {
    return this.rows * this.tileSize;
  }

  static fromString(ascii: string[] | string, tileSize = 16): TileMap {
    const lines = Array.isArray(ascii)
      ? ascii
      : ascii.split(/\r?\n/).filter((l, idx, arr) => idx < arr.length - 1 || l.length > 0);

    const rows = lines.length;
    let cols = 0;
    for (const line of lines) {
      if (line.length > cols) cols = line.length;
    }

    const tiles = new Array<TileType>(cols * rows).fill(TileType.AIR);

    for (let r = 0; r < rows; r++) {
      const line = lines[r];
      for (let c = 0; c < cols; c++) {
        const char = c < line.length ? line[c] : '.';
        let type = TileType.AIR;
        switch (char) {
          case '#':
            type = TileType.SOLID;
            break;
          case '=':
            type = TileType.ONE_WAY;
            break;
          case '^':
            type = TileType.HAZARD;
            break;
          case '*':
            type = TileType.BREAKABLE;
            break;
          case 'D':
            type = TileType.DOOR;
            break;
          case '.':
          default:
            type = TileType.AIR;
            break;
        }
        tiles[r * cols + c] = type;
      }
    }

    return new TileMap(cols, rows, tileSize, tiles);
  }

  getTile(col: number, row: number): TileType {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return TileType.AIR;
    }
    return this.tiles[row * this.cols + col];
  }

  setTile(col: number, row: number, type: TileType): void {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return;
    }
    this.tiles[row * this.cols + col] = type;
  }

  isSolid(col: number, row: number): boolean {
    return this.getTile(col, row) === TileType.SOLID;
  }

  isOneWay(col: number, row: number): boolean {
    return this.getTile(col, row) === TileType.ONE_WAY;
  }

  isHazard(col: number, row: number): boolean {
    return this.getTile(col, row) === TileType.HAZARD;
  }

  isBreakable(col: number, row: number): boolean {
    return this.getTile(col, row) === TileType.BREAKABLE;
  }

  worldToTile(x: number, y: number): { col: number; row: number } {
    return {
      col: Math.floor(x / this.tileSize),
      row: Math.floor(y / this.tileSize),
    };
  }

  tileToWorld(col: number, row: number): Point {
    return {
      x: col * this.tileSize,
      y: row * this.tileSize,
    };
  }

  queryRect(rect: Rect): Array<{ col: number; row: number; type: TileType; bounds: Rect }> {
    const results: Array<{ col: number; row: number; type: TileType; bounds: Rect }> = [];

    const minCol = Math.floor(rect.x / this.tileSize);
    const maxCol = Math.floor((rect.x + rect.width) / this.tileSize);
    const minRow = Math.floor(rect.y / this.tileSize);
    const maxRow = Math.floor((rect.y + rect.height) / this.tileSize);

    const startCol = Math.max(0, minCol);
    const endCol = Math.min(this.cols - 1, maxCol);
    const startRow = Math.max(0, minRow);
    const endRow = Math.min(this.rows - 1, maxRow);

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const type = this.getTile(c, r);
        const bounds: Rect = {
          x: c * this.tileSize,
          y: r * this.tileSize,
          width: this.tileSize,
          height: this.tileSize,
        };

        // Check if actually intersects
        if (
          rect.x < bounds.x + bounds.width &&
          rect.x + rect.width > bounds.x &&
          rect.y < bounds.y + bounds.height &&
          rect.y + rect.height > bounds.y
        ) {
          results.push({ col: c, row: r, type, bounds });
        }
      }
    }

    return results;
  }
}
