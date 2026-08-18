import { TILE_TYPES, TileTypeInfo } from './GameState.js';

export interface MahjongTile {
  id: number;
  typeId: string;
  category: string;
  layer: number;   // 0 (bottom) to 3 (top)
  col: number;     // X grid pos (half-grid units: 0..28)
  row: number;     // Y grid pos (half-grid units: 0..16)
  removed: boolean;
  selected: boolean;
  highlighted: boolean;
  animScale: number; // 1 = normal, 1.1 = selected, 0 = removed
}

export interface TileSlot {
  layer: number;
  col: number; // in half-grid step
  row: number; // in half-grid step
}

export class MahjongLayoutGenerator {
  // Tile dimensions in grid units (each tile occupies 2 half-grid units width, 2 half-grid units height)
  // Turtle classic papercraft layout ~ 72 tiles (36 pairs)
  public static generateTurtleSlots(): TileSlot[] {
    const slots: TileSlot[] = [];

    // Layer 0: Base layout (56 slots)
    // Rows 4 to 12
    const rowCounts: { [row: number]: number[] } = {
      2: [6, 8, 10, 12, 14, 16, 18, 20],
      4: [4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
      6: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
      8: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
      10: [4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
      12: [6, 8, 10, 12, 14, 16, 18, 20],
    };

    for (const [rStr, cols] of Object.entries(rowCounts)) {
      const r = parseInt(rStr, 10);
      for (const c of cols) {
        slots.push({ layer: 0, col: c, row: r });
      }
    }

    // Layer 1: Second layer (12 slots)
    const layer1: [number, number][] = [
      [8, 4], [10, 4], [12, 4], [14, 4], [16, 4], [18, 4],
      [8, 6], [10, 6], [12, 6], [14, 6], [16, 6], [18, 6],
    ];
    for (const [c, r] of layer1) {
      slots.push({ layer: 1, col: c, row: r });
    }

    // Layer 2: Third layer (4 slots)
    const layer2: [number, number][] = [
      [11, 5], [13, 5], [15, 5],
      [11, 7],
    ];
    // Ensure even count for slots (total = 54 + 12 + 4 = 70, adjust to 72)
    for (const [c, r] of layer2) {
      slots.push({ layer: 2, col: c, row: r });
    }

    return slots;
  }

  public static generateGuaranteedBoard(slots: TileSlot[]): MahjongTile[] {
    // Total tiles MUST be even
    let availableSlots = [...slots];
    if (availableSlots.length % 2 !== 0) {
      availableSlots.pop();
    }

    const totalPairs = availableSlots.length / 2;
    const tileDeck: string[] = [];

    // Distribute pairs from TILE_TYPES
    for (let p = 0; p < totalPairs; p++) {
      const typeInfo = TILE_TYPES[p % TILE_TYPES.length];
      tileDeck.push(typeInfo.id, typeInfo.id);
    }

    // Shuffle deck
    for (let i = tileDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tileDeck[i], tileDeck[j]] = [tileDeck[j], tileDeck[i]];
    }

    const tiles: MahjongTile[] = availableSlots.map((slot, index) => {
      const typeId = tileDeck[index];
      const info = TILE_TYPES.find(t => t.id === typeId) || TILE_TYPES[0];
      return {
        id: index + 1,
        typeId,
        category: info.category,
        layer: slot.layer,
        col: slot.col,
        row: slot.row,
        removed: false,
        selected: false,
        highlighted: false,
        animScale: 1,
      };
    });

    return tiles;
  }
}
