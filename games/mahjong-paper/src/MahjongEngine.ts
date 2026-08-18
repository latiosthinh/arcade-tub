import { MahjongTile, MahjongLayoutGenerator, TileSlot } from './MahjongLayoutGenerator.js';
import { GameState, TILE_TYPES } from './GameState.js';

export interface MoveRecord {
  tile1Id: number;
  tile2Id: number;
}

export class MahjongEngine {
  public tiles: MahjongTile[] = [];
  public state: GameState;
  public selectedTileId: number | null = null;
  public moveHistory: MoveRecord[] = [];

  constructor(state?: GameState) {
    this.state = state || new GameState();
    this.initBoard();
  }

  public initBoard(): void {
    const slots = MahjongLayoutGenerator.generateTurtleSlots();
    this.tiles = MahjongLayoutGenerator.generateGuaranteedBoard(slots);
    this.state.start(this.tiles.length);
    this.selectedTileId = null;
    this.moveHistory = [];
  }

  /**
   * Free-edge algorithm:
   * A tile is FREE if:
   * 1. No other tile is directly on top (layer > current.layer, overlapping col in (-2, 2) and row in (-2, 2))
   * 2. AND at least ONE lateral side (left or right) is completely unobstructed by tiles in the same layer.
   */
  public isTileFree(tile: MahjongTile): boolean {
    if (tile.removed) return false;

    // Check 1: Top obstruction (higher layer)
    for (const other of this.tiles) {
      if (other.removed || other.id === tile.id) continue;
      if (other.layer > tile.layer) {
        // Tile bounding box is 2x2 half-grid units
        if (Math.abs(other.col - tile.col) < 2 && Math.abs(other.row - tile.row) < 2) {
          return false; // Covered from above
        }
      }
    }

    // Check 2: Lateral obstructions (same layer)
    let leftBlocked = false;
    let rightBlocked = false;

    for (const other of this.tiles) {
      if (other.removed || other.id === tile.id || other.layer !== tile.layer) continue;

      // Overlaps vertically (row diff < 2)
      if (Math.abs(other.row - tile.row) < 2) {
        // Obstructing left edge (other.col is to the left: other.col = tile.col - 2)
        if (tile.col - other.col > 0 && tile.col - other.col <= 2) {
          leftBlocked = true;
        }
        // Obstructing right edge (other.col is to the right: other.col = tile.col + 2)
        if (other.col - tile.col > 0 && other.col - tile.col <= 2) {
          rightBlocked = true;
        }
      }
    }

    // Free if left side is open OR right side is open
    return !leftBlocked || !rightBlocked;
  }

  public getFreeTiles(): MahjongTile[] {
    return this.tiles.filter(t => !t.removed && this.isTileFree(t));
  }

  public findAvailableMatches(): [MahjongTile, MahjongTile] | null {
    const freeTiles = this.getFreeTiles();
    for (let i = 0; i < freeTiles.length; i++) {
      for (let j = i + 1; j < freeTiles.length; j++) {
        if (freeTiles[i].typeId === freeTiles[j].typeId) {
          return [freeTiles[i], freeTiles[j]];
        }
      }
    }
    return null;
  }

  public selectTile(tileId: number): { matched: boolean; cleared: boolean; points: number } {
    const tile = this.tiles.find(t => t.id === tileId);
    if (!tile || tile.removed || !this.isTileFree(tile)) {
      return { matched: false, cleared: false, points: 0 };
    }

    // Clear highlights
    this.clearHints();

    // If clicking same tile, unselect
    if (this.selectedTileId === tile.id) {
      tile.selected = false;
      this.selectedTileId = null;
      return { matched: false, cleared: false, points: 0 };
    }

    // If no previous selection, select this one
    if (this.selectedTileId === null) {
      this.selectedTileId = tile.id;
      tile.selected = true;
      return { matched: false, cleared: false, points: 0 };
    }

    // Attempt match with previously selected tile
    const prevTile = this.tiles.find(t => t.id === this.selectedTileId);
    if (!prevTile) {
      this.selectedTileId = tile.id;
      tile.selected = true;
      return { matched: false, cleared: false, points: 0 };
    }

    if (prevTile.typeId === tile.typeId) {
      // Match found!
      prevTile.removed = true;
      prevTile.selected = false;
      tile.removed = true;
      tile.selected = false;
      this.selectedTileId = null;

      this.moveHistory.push({ tile1Id: prevTile.id, tile2Id: tile.id });
      const pts = this.state.recordMatch();

      // Check if any more matches exist
      if (this.state.tilesRemaining > 0 && !this.findAvailableMatches()) {
        // If shuffles remain, we can auto-shuffle or allow manual shuffle
      }

      return { matched: true, cleared: this.state.tilesRemaining === 0, points: pts };
    } else {
      // Mismatch: transfer selection to new tile
      prevTile.selected = false;
      tile.selected = true;
      this.selectedTileId = tile.id;
      return { matched: false, cleared: false, points: 0 };
    }
  }

  public undoMove(): boolean {
    if (this.moveHistory.length === 0 || this.state.undosRemaining <= 0) {
      return false;
    }

    const lastMove = this.moveHistory.pop();
    if (!lastMove) return false;

    const t1 = this.tiles.find(t => t.id === lastMove.tile1Id);
    const t2 = this.tiles.find(t => t.id === lastMove.tile2Id);

    if (t1) t1.removed = false;
    if (t2) t2.removed = false;

    this.state.undosRemaining--;
    this.state.recordUndo();
    this.clearHints();
    return true;
  }

  public showHint(): boolean {
    if (this.state.hintsRemaining <= 0) return false;
    const match = this.findAvailableMatches();
    if (!match) return false;

    this.clearHints();
    match[0].highlighted = true;
    match[1].highlighted = true;
    this.state.hintsRemaining--;
    return true;
  }

  public shuffleRemaining(): boolean {
    if (this.state.shufflesRemaining <= 0) return false;

    const activeTiles = this.tiles.filter(t => !t.removed);
    if (activeTiles.length < 2) return false;

    // Collect typeIds
    const typeIds = activeTiles.map(t => t.typeId);

    // Shuffle array
    for (let i = typeIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [typeIds[i], typeIds[j]] = [typeIds[j], typeIds[i]];
    }

    // Reassign typeIds and update categories
    activeTiles.forEach((tile, index) => {
      tile.typeId = typeIds[index];
      const info = TILE_TYPES.find(t => t.id === tile.typeId) || TILE_TYPES[0];
      tile.category = info.category;
      tile.selected = false;
      tile.highlighted = false;
    });

    this.selectedTileId = null;
    this.state.shufflesRemaining--;
    return true;
  }

  public clearHints(): void {
    for (const t of this.tiles) {
      t.highlighted = false;
    }
  }
}
