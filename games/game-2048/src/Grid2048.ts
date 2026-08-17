export type Direction = 'up' | 'down' | 'left' | 'right';

export interface TileMoveEvent {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  value: number;
}

export interface TileMergeEvent {
  row: number;
  col: number;
  value: number;
  fromCells: Array<{ row: number; col: number }>;
}

export interface SlideResult {
  moved: boolean;
  scoreGained: number;
  moves: TileMoveEvent[];
  merges: TileMergeEvent[];
  spawnedTile?: { row: number; col: number; value: number } | null;
}

interface GridSnapshot {
  cells: number[][];
  score: number;
}

export class Grid2048 {
  private cells: number[][];
  private undoStack: GridSnapshot[] = [];
  private readonly maxUndoDepth = 20;

  constructor() {
    this.cells = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    this.reset();
  }

  public reset(): void {
    this.cells = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    this.undoStack = [];
    this.spawnTile();
    this.spawnTile();
  }

  public getCells(): number[][] {
    return this.cells.map((row) => [...row]);
  }

  public getCell(r: number, c: number): number {
    return this.cells[r][c];
  }

  public setCells(newCells: number[][]): void {
    this.cells = newCells.map((row) => [...row]);
  }

  public getEmptyCells(): Array<{ row: number; col: number }> {
    const empty: Array<{ row: number; col: number }> = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.cells[r][c] === 0) {
          empty.push({ row: r, col: c });
        }
      }
    }
    return empty;
  }

  public spawnTile(rng: () => number = Math.random): { row: number; col: number; value: number } | null {
    const empty = this.getEmptyCells();
    if (empty.length === 0) return null;

    const randomIndex = Math.floor(rng() * empty.length);
    const cell = empty[Math.min(randomIndex, empty.length - 1)];
    const value = rng() < 0.9 ? 2 : 4;

    this.cells[cell.row][cell.col] = value;
    return { row: cell.row, col: cell.col, value };
  }

  public getMaxTile(): number {
    let max = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.cells[r][c] > max) {
          max = this.cells[r][c];
        }
      }
    }
    return max;
  }

  public hasWon(target: number = 2048): boolean {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.cells[r][c] >= target) {
          return true;
        }
      }
    }
    return false;
  }

  public canMove(): boolean {
    if (this.getEmptyCells().length > 0) return true;

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = this.cells[r][c];
        if (c + 1 < 4 && this.cells[r][c + 1] === val) return true;
        if (r + 1 < 4 && this.cells[r + 1][c] === val) return true;
      }
    }
    return false;
  }

  public canMoveDirection(dir: Direction): boolean {
    const tempGrid = new Grid2048();
    tempGrid.setCells(this.getCells());
    const res = tempGrid.slide(dir, false);
    return res.moved;
  }

  public saveSnapshot(score: number): void {
    if (this.undoStack.length >= this.maxUndoDepth) {
      this.undoStack.shift();
    }
    this.undoStack.push({
      cells: this.getCells(),
      score,
    });
  }

  public undo(): number | null {
    const snapshot = this.undoStack.pop();
    if (!snapshot) return null;
    this.cells = snapshot.cells.map((row) => [...row]);
    return snapshot.score;
  }

  public slide(
    dir: Direction,
    spawnAfter: boolean = true,
    rng: () => number = Math.random
  ): SlideResult {
    const moves: TileMoveEvent[] = [];
    const merges: TileMergeEvent[] = [];
    let scoreGained = 0;
    let moved = false;

    // Create tracking array of line items with original coordinates
    // Process 4 lines (rows or columns)
    for (let i = 0; i < 4; i++) {
      const lineCoords: Array<{ r: number; c: number }> = [];
      for (let j = 0; j < 4; j++) {
        switch (dir) {
          case 'left':
            lineCoords.push({ r: i, c: j });
            break;
          case 'right':
            lineCoords.push({ r: i, c: 3 - j });
            break;
          case 'up':
            lineCoords.push({ r: j, c: i });
            break;
          case 'down':
            lineCoords.push({ r: 3 - j, c: i });
            break;
        }
      }

      // Filter non-zero items in order
      const nonZero = lineCoords
        .map((coord) => ({ ...coord, val: this.cells[coord.r][coord.c] }))
        .filter((item) => item.val !== 0);

      const mergedLine: Array<{ val: number; from: Array<{ r: number; c: number }> }> = [];

      let skipNext = false;
      for (let k = 0; k < nonZero.length; k++) {
        if (skipNext) {
          skipNext = false;
          continue;
        }
        const current = nonZero[k];
        const next = nonZero[k + 1];

        if (next && current.val === next.val) {
          const mergedVal = current.val * 2;
          scoreGained += mergedVal;
          mergedLine.push({
            val: mergedVal,
            from: [
              { r: current.r, c: current.c },
              { r: next.r, c: next.c },
            ],
          });
          skipNext = true;
        } else {
          mergedLine.push({
            val: current.val,
            from: [{ r: current.r, c: current.c }],
          });
        }
      }

      // Reconstruct target line and record movements/merges
      for (let targetIndex = 0; targetIndex < 4; targetIndex++) {
        const targetCoord = lineCoords[targetIndex];
        const targetItem = mergedLine[targetIndex];
        const targetVal = targetItem ? targetItem.val : 0;

        if (this.cells[targetCoord.r][targetCoord.c] !== targetVal) {
          moved = true;
        }

        if (targetItem) {
          if (targetItem.from.length === 1) {
            const src = targetItem.from[0];
            if (src.r !== targetCoord.r || src.c !== targetCoord.c) {
              moved = true;
            }
            moves.push({
              fromRow: src.r,
              fromCol: src.c,
              toRow: targetCoord.r,
              toCol: targetCoord.c,
              value: targetVal,
            });
          } else if (targetItem.from.length === 2) {
            moved = true;
            merges.push({
              row: targetCoord.r,
              col: targetCoord.c,
              value: targetVal,
              fromCells: targetItem.from.map((f) => ({ row: f.r, col: f.c })),
            });
            for (const src of targetItem.from) {
              moves.push({
                fromRow: src.r,
                fromCol: src.c,
                toRow: targetCoord.r,
                toCol: targetCoord.c,
                value: src === targetItem.from[0] ? targetVal / 2 : targetVal / 2,
              });
            }
          }
        }
      }

      // Apply new row/column to actual cells
      for (let targetIndex = 0; targetIndex < 4; targetIndex++) {
        const targetCoord = lineCoords[targetIndex];
        const targetItem = mergedLine[targetIndex];
        this.cells[targetCoord.r][targetCoord.c] = targetItem ? targetItem.val : 0;
      }
    }

    if (!moved) {
      return {
        moved: false,
        scoreGained: 0,
        moves: [],
        merges: [],
        spawnedTile: null,
      };
    }

    let spawnedTile: { row: number; col: number; value: number } | null = null;
    if (spawnAfter) {
      spawnedTile = this.spawnTile(rng);
    }

    return {
      moved: true,
      scoreGained,
      moves,
      merges,
      spawnedTile,
    };
  }
}
