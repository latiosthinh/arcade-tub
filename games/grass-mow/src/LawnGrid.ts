export enum CellType {
  BORDER = -1,
  CUT_TURF = 0,
  TALL_GRASS = 1,
  OBSTACLE = 2,
}

export interface GrassCell {
  type: CellType;
  height: number; // 0 to 1
  bladePattern: number; // cosmetic random offset
}

export interface LawnTheme {
  name: string;
  tallGrassColor: string;
  cutTurfColor1: string;
  cutTurfColor2: string;
  obstacleColor: string;
  borderColor: string;
}

export const LAWN_THEMES: LawnTheme[] = [
  {
    name: 'Emerald Garden',
    tallGrassColor: '#388E3C',
    cutTurfColor1: '#81C784',
    cutTurfColor2: '#A5D6A7',
    obstacleColor: '#8D6E63',
    borderColor: '#4E342E',
  },
  {
    name: 'Sunny Meadow',
    tallGrassColor: '#2E7D32',
    cutTurfColor1: '#AED581',
    cutTurfColor2: '#C5E1A5',
    obstacleColor: '#795548',
    borderColor: '#3E2723',
  },
  {
    name: 'Twilight Oasis',
    tallGrassColor: '#1B5E20',
    cutTurfColor1: '#4DB6AC',
    cutTurfColor2: '#80CBC4',
    obstacleColor: '#607D8B',
    borderColor: '#263238',
  },
];

export class LawnGrid {
  public cols: number;
  public rows: number;
  public cellSize: number;
  public cells: GrassCell[][];
  public totalCuttableCells: number = 0;
  public totalCutCells: number = 0;
  public currentLevel: number = 0;

  constructor(cols = 40, rows = 30, cellSize = 16) {
    this.cols = cols;
    this.rows = rows;
    this.cellSize = cellSize;
    this.cells = [];
    this.initEmptyGrid();
  }

  private initEmptyGrid(): void {
    this.cells = [];
    for (let r = 0; r < this.rows; r++) {
      const row: GrassCell[] = [];
      for (let c = 0; c < this.cols; c++) {
        row.push({
          type: CellType.TALL_GRASS,
          height: 1.0,
          bladePattern: Math.random(),
        });
      }
      this.cells.push(row);
    }
  }

  public loadLevel(levelIndex: number): void {
    this.currentLevel = levelIndex;
    this.initEmptyGrid();
    this.totalCuttableCells = 0;
    this.totalCutCells = 0;

    const levelType = levelIndex % 4;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.cells[r][c];

        // Borders
        if (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) {
          cell.type = CellType.BORDER;
          continue;
        }

        // Layout variations
        if (levelType === 0) {
          // Open suburban lawn with 2 flowerbed planters
          const isPlanter1 = c >= 8 && c <= 11 && r >= 6 && r <= 8;
          const isPlanter2 = c >= 28 && c <= 31 && r >= 20 && r <= 22;
          if (isPlanter1 || isPlanter2) {
            cell.type = CellType.OBSTACLE;
          } else {
            cell.type = CellType.TALL_GRASS;
            this.totalCuttableCells++;
          }
        } else if (levelType === 1) {
          // Garden maze corridors
          const isPillar = (c % 6 === 0 && r % 6 === 0) || (c >= 18 && c <= 22 && r >= 12 && r <= 16);
          if (isPillar) {
            cell.type = CellType.OBSTACLE;
          } else {
            cell.type = CellType.TALL_GRASS;
            this.totalCuttableCells++;
          }
        } else if (levelType === 2) {
          // Circular Island Zen Yard
          const centerC = this.cols / 2;
          const centerR = this.rows / 2;
          const dist = Math.hypot(c - centerC, r - centerR);
          if (dist < 4 || (dist > 10 && dist < 12 && (c % 4 !== 0))) {
            cell.type = CellType.OBSTACLE;
          } else {
            cell.type = CellType.TALL_GRASS;
            this.totalCuttableCells++;
          }
        } else {
          // Stepping stones layout
          const isStone = (c + r) % 7 === 0 && c > 4 && c < this.cols - 4 && r > 4 && r < this.rows - 4;
          if (isStone) {
            cell.type = CellType.OBSTACLE;
          } else {
            cell.type = CellType.TALL_GRASS;
            this.totalCuttableCells++;
          }
        }
      }
    }
  }

  public cutRadius(worldX: number, worldY: number, radius: number): number {
    const minCol = Math.max(0, Math.floor((worldX - radius) / this.cellSize));
    const maxCol = Math.min(this.cols - 1, Math.floor((worldX + radius) / this.cellSize));
    const minRow = Math.max(0, Math.floor((worldY - radius) / this.cellSize));
    const maxRow = Math.min(this.rows - 1, Math.floor((worldY + radius) / this.cellSize));

    const radiusSq = radius * radius;
    let freshlyCut = 0;

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const cell = this.cells[r][c];
        if (cell.type === CellType.TALL_GRASS) {
          const cellCenterX = (c + 0.5) * this.cellSize;
          const cellCenterY = (r + 0.5) * this.cellSize;
          const distSq = (cellCenterX - worldX) ** 2 + (cellCenterY - worldY) ** 2;

          if (distSq <= radiusSq) {
            cell.type = CellType.CUT_TURF;
            cell.height = 0.0;
            this.totalCutCells++;
            freshlyCut++;
          }
        }
      }
    }

    return freshlyCut;
  }

  public isObstacle(worldX: number, worldY: number): boolean {
    const c = Math.floor(worldX / this.cellSize);
    const r = Math.floor(worldY / this.cellSize);
    if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return true;
    const type = this.cells[r][c].type;
    return type === CellType.BORDER || type === CellType.OBSTACLE;
  }

  public getCutPercentage(): number {
    if (this.totalCuttableCells === 0) return 100;
    return Math.min(100, Math.round((this.totalCutCells / this.totalCuttableCells) * 1000) / 10);
  }

  public isCleared(): boolean {
    if (this.totalCuttableCells === 0) return true;
    return (this.totalCutCells / this.totalCuttableCells) >= 0.995;
  }
}
