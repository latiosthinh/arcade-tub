import {
  TileType,
  SubTileMask,
  CardinalDirection,
  Rect,
  GridCell,
  EagleState,
  TerrainQueryResult,
} from './types';

export const GRID_COLS = 26;
export const GRID_ROWS = 26;
export const CELL_SIZE = 16;
export const ARENA_SIZE = GRID_COLS * CELL_SIZE; // 416
export const SUB_TILE_SIZE = 8;

export interface DamageBrickResult {
  destroyed: boolean;
  newMask: number;
  hitQuadrant: number;
}

export interface IntersectingCellInfo {
  col: number;
  row: number;
  cell: GridCell;
  overlapRect: Rect;
}

export class GridMap {
  private cells: GridCell[][] = [];
  public eagleState: EagleState = {
    col: 12,
    row: 24,
    width: 2,
    height: 2,
    destroyed: false,
  };
  private fortificationCache: Map<string, GridCell> = new Map();

  constructor() {
    this.initEmpty();
  }

  /**
   * Resets all cells to EMPTY (mask 0) and initializes intact Eagle HQ at bottom-center (12..13, 24..25).
   */
  public initEmpty(): void {
    this.cells = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      const row: GridCell[] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        row.push({ type: TileType.EMPTY, mask: SubTileMask.EMPTY });
      }
      this.cells.push(row);
    }

    this.eagleState = {
      col: 12,
      row: 24,
      width: 2,
      height: 2,
      destroyed: false,
    };
    this.fortificationCache.clear();

    // Place intact Eagle HQ in 2x2 footprint
    for (let r = 24; r <= 25; r++) {
      for (let c = 12; c <= 13; c++) {
        const row = this.cells[r];
        if (row) {
          row[c] = { type: TileType.EAGLE, mask: SubTileMask.FULL };
        }
      }
    }
  }

  /**
   * Bounds check helper.
   */
  public isInside(col: number, row: number): boolean {
    return col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS;
  }

  /**
   * Safe getter for cell. Returns null if out of bounds.
   */
  public getCell(col: number, row: number): GridCell | null {
    if (!this.isInside(col, row)) return null;
    const rowData = this.cells[row];
    if (!rowData) return null;
    return rowData[col] ?? null;
  }

  /**
   * Safe setter for cell. Clamps mask to 4-bit range.
   */
  public setCell(col: number, row: number, type: TileType, mask?: number): void {
    if (!this.isInside(col, row)) return;
    const rowData = this.cells[row];
    if (!rowData) return;
    const resolvedMask = mask !== undefined
      ? (mask & SubTileMask.FULL)
      : (type === TileType.EMPTY ? SubTileMask.EMPTY : SubTileMask.FULL);

    rowData[col] = {
      type,
      mask: resolvedMask,
    };
  }

  /**
   * Handles brick destruction and 4-quadrant chipping.
   * UP bullet moves UP -> strikes bottom face -> chips bottom quadrants first.
   * DOWN bullet moves DOWN -> strikes top face -> chips top quadrants first.
   * LEFT bullet moves LEFT -> strikes right face -> chips right quadrants first.
   * RIGHT bullet moves RIGHT -> strikes left face -> chips left quadrants first.
   */
  public damageBrick(
    col: number,
    row: number,
    hitDirection: CardinalDirection,
    tier4Heavy: boolean = false
  ): DamageBrickResult {
    const cell = this.getCell(col, row);
    if (!cell || cell.type !== TileType.BRICK) {
      return { destroyed: false, newMask: 0, hitQuadrant: 0 };
    }

    if (tier4Heavy) {
      this.setCell(col, row, TileType.EMPTY, SubTileMask.EMPTY);
      return { destroyed: true, newMask: SubTileMask.EMPTY, hitQuadrant: SubTileMask.FULL };
    }

    let primaryMask = 0;
    let secondaryMask = 0;

    switch (hitDirection) {
      case 'UP':
        primaryMask = SubTileMask.BOTTOM_LEFT | SubTileMask.BOTTOM_RIGHT;
        secondaryMask = SubTileMask.TOP_LEFT | SubTileMask.TOP_RIGHT;
        break;
      case 'DOWN':
        primaryMask = SubTileMask.TOP_LEFT | SubTileMask.TOP_RIGHT;
        secondaryMask = SubTileMask.BOTTOM_LEFT | SubTileMask.BOTTOM_RIGHT;
        break;
      case 'LEFT':
        primaryMask = SubTileMask.TOP_RIGHT | SubTileMask.BOTTOM_RIGHT;
        secondaryMask = SubTileMask.TOP_LEFT | SubTileMask.BOTTOM_LEFT;
        break;
      case 'RIGHT':
        primaryMask = SubTileMask.TOP_LEFT | SubTileMask.BOTTOM_LEFT;
        secondaryMask = SubTileMask.TOP_RIGHT | SubTileMask.BOTTOM_RIGHT;
        break;
    }

    let hitQuadrant = 0;
    let currentMask = cell.mask & SubTileMask.FULL;

    if ((currentMask & primaryMask) !== 0) {
      hitQuadrant = currentMask & primaryMask;
      currentMask &= ~primaryMask;
    } else if ((currentMask & secondaryMask) !== 0) {
      hitQuadrant = currentMask & secondaryMask;
      currentMask &= ~secondaryMask;
    }

    if (currentMask === SubTileMask.EMPTY) {
      this.setCell(col, row, TileType.EMPTY, SubTileMask.EMPTY);
      return { destroyed: true, newMask: SubTileMask.EMPTY, hitQuadrant };
    }

    this.setCell(col, row, TileType.BRICK, currentMask);
    return { destroyed: false, newMask: currentMask, hitQuadrant };
  }

  /**
   * Damages steel tile. Only tier 4 heavy bullets can destroy steel.
   */
  public damageSteel(col: number, row: number, tier4Heavy: boolean = false): boolean {
    const cell = this.getCell(col, row);
    if (!cell || cell.type !== TileType.STEEL) return false;

    if (tier4Heavy) {
      this.setCell(col, row, TileType.EMPTY, SubTileMask.EMPTY);
      return true;
    }
    return false;
  }

  /**
   * Damages Eagle HQ. Transitions HQ to destroyed state across 2x2 cell footprint.
   */
  public damageEagle(): boolean {
    if (this.eagleState.destroyed) return false;

    this.eagleState.destroyed = true;
    for (let r = this.eagleState.row; r < this.eagleState.row + this.eagleState.height; r++) {
      for (let c = this.eagleState.col; c < this.eagleState.col + this.eagleState.width; c++) {
        if (this.isInside(c, r)) {
          const rowData = this.cells[r];
          if (rowData) {
            rowData[c] = { type: TileType.EAGLE, mask: SubTileMask.EMPTY };
          }
        }
      }
    }
    return true;
  }

  public destroyEagle(): boolean {
    return this.damageEagle();
  }

  /**
   * Returns true if Eagle HQ is destroyed.
   */
  public isEagleDestroyed(): boolean {
    return this.eagleState.destroyed;
  }

  /**
   * Shovel powerup fortification.
   * Perimeter cells around HQ (12..13, 24..25):
   * (11, 23), (12, 23), (13, 23), (14, 23),
   * (11, 24),                   (14, 24),
   * (11, 25),                   (14, 25)
   */
  public fortifyEagle(enableSteel: boolean): void {
    const perimeterCoords: Array<[number, number]> = [
      [11, 23], [12, 23], [13, 23], [14, 23],
      [11, 24],                   [14, 24],
      [11, 25],                   [14, 25],
    ];

    if (enableSteel) {
      // Cache current cells if not already cached
      for (const [c, r] of perimeterCoords) {
        if (this.isInside(c, r)) {
          const key = `${c},${r}`;
          if (!this.fortificationCache.has(key)) {
            const current = this.getCell(c, r);
            if (current) {
              this.fortificationCache.set(key, { type: current.type, mask: current.mask });
            }
          }
          this.setCell(c, r, TileType.STEEL, SubTileMask.FULL);
        }
      }
    } else {
      // Restore cached cells
      for (const [c, r] of perimeterCoords) {
        if (this.isInside(c, r)) {
          const key = `${c},${r}`;
          const cached = this.fortificationCache.get(key);
          if (cached) {
            this.setCell(c, r, cached.type, cached.mask);
          } else {
            // Default fallback if not cached is BRICK
            this.setCell(c, r, TileType.BRICK, SubTileMask.FULL);
          }
        }
      }
      this.fortificationCache.clear();
    }
  }

  /**
   * Returns bounding boxes for all active 8x8px sub-quadrants of a cell.
   */
  public getSubTileBoxes(col: number, row: number): Rect[] {
    const cell = this.getCell(col, row);
    if (!cell || cell.mask === SubTileMask.EMPTY) return [];

    const boxes: Rect[] = [];
    const baseX = col * CELL_SIZE;
    const baseY = row * CELL_SIZE;

    if ((cell.mask & SubTileMask.TOP_LEFT) !== 0) {
      boxes.push({ x: baseX, y: baseY, width: SUB_TILE_SIZE, height: SUB_TILE_SIZE });
    }
    if ((cell.mask & SubTileMask.TOP_RIGHT) !== 0) {
      boxes.push({ x: baseX + SUB_TILE_SIZE, y: baseY, width: SUB_TILE_SIZE, height: SUB_TILE_SIZE });
    }
    if ((cell.mask & SubTileMask.BOTTOM_LEFT) !== 0) {
      boxes.push({ x: baseX, y: baseY + SUB_TILE_SIZE, width: SUB_TILE_SIZE, height: SUB_TILE_SIZE });
    }
    if ((cell.mask & SubTileMask.BOTTOM_RIGHT) !== 0) {
      boxes.push({ x: baseX + SUB_TILE_SIZE, y: baseY + SUB_TILE_SIZE, width: SUB_TILE_SIZE, height: SUB_TILE_SIZE });
    }

    return boxes;
  }

  /**
   * Returns list of grid cells intersected by given bounding box.
   */
  public getIntersectingCells(rect: Rect): IntersectingCellInfo[] {
    const results: IntersectingCellInfo[] = [];

    const minCol = Math.max(0, Math.floor(rect.x / CELL_SIZE));
    const maxCol = Math.min(GRID_COLS - 1, Math.floor((rect.x + rect.width - 0.001) / CELL_SIZE));
    const minRow = Math.max(0, Math.floor(rect.y / CELL_SIZE));
    const maxRow = Math.min(GRID_ROWS - 1, Math.floor((rect.y + rect.height - 0.001) / CELL_SIZE));

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const cell = this.getCell(c, r);
        if (!cell) continue;

        const cellX = c * CELL_SIZE;
        const cellY = r * CELL_SIZE;

        const overlapX = Math.max(rect.x, cellX);
        const overlapY = Math.max(rect.y, cellY);
        const overlapRight = Math.min(rect.x + rect.width, cellX + CELL_SIZE);
        const overlapBottom = Math.min(rect.y + rect.height, cellY + CELL_SIZE);

        if (overlapRight > overlapX && overlapBottom > overlapY) {
          results.push({
            col: c,
            row: r,
            cell,
            overlapRect: {
              x: overlapX,
              y: overlapY,
              width: overlapRight - overlapX,
              height: overlapBottom - overlapY,
            },
          });
        }
      }
    }

    return results;
  }

  /**
   * Queries terrain properties for bounding box rect.
   */
  public queryRect(rect: Rect): TerrainQueryResult {
    let solid = false;
    let bulletSolid = false;
    let isWater = false;
    let isIce = false;
    let isTrees = false;
    let isEagle = false;

    // Out of bounds is solid boundary
    if (
      rect.x < 0 ||
      rect.y < 0 ||
      rect.x + rect.width > ARENA_SIZE ||
      rect.y + rect.height > ARENA_SIZE
    ) {
      return {
        solid: true,
        bulletSolid: true,
        isWater: false,
        isIce: false,
        isTrees: false,
        isEagle: false,
      };
    }

    const intersecting = this.getIntersectingCells(rect);

    for (const item of intersecting) {
      const { col, row, cell } = item;

      switch (cell.type) {
        case TileType.BRICK:
          if (cell.mask > SubTileMask.EMPTY) {
            // Check sub-quadrant collision
            const subBoxes = this.getSubTileBoxes(col, row);
            for (const box of subBoxes) {
              if (
                rect.x < box.x + box.width &&
                rect.x + rect.width > box.x &&
                rect.y < box.y + box.height &&
                rect.y + rect.height > box.y
              ) {
                solid = true;
                bulletSolid = true;
                break;
              }
            }
          }
          break;

        case TileType.STEEL:
          solid = true;
          bulletSolid = true;
          break;

        case TileType.WATER:
          solid = true; // Tanks cannot traverse water
          isWater = true;
          // Water is NOT bulletSolid (bullets fly across)
          break;

        case TileType.TREES:
          isTrees = true; // Provides visual camouflage, non-solid
          break;

        case TileType.ICE:
          isIce = true; // Reduces traction / induces slide, non-solid
          break;

        case TileType.EAGLE:
          solid = true;
          bulletSolid = true;
          isEagle = true;
          break;

        case TileType.EMPTY:
        default:
          break;
      }
    }

    const firstItem = intersecting[0];
    return {
      solid,
      bulletSolid,
      isWater,
      isIce,
      isTrees,
      isEagle,
      cell: intersecting.length === 1 && firstItem ? firstItem.cell : undefined,
    };
  }
}
