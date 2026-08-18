export const NEON_BOX_PALETTE: readonly string[] = [
  '#3B82F6', // 0: Craft Blue
  '#EC4899', // 1: Craft Pink
  '#10B981', // 2: Craft Emerald
  '#F59E0B', // 3: Craft Amber
  '#8B5CF6', // 4: Craft Purple
  '#E11D48', // 5: Craft Red
  '#14B8A6', // 6: Craft Teal
  '#F97316', // 7: Craft Orange
  '#6366F1', // 8: Craft Indigo
];

// Harmonic pentatonic/diatonic scale frequencies (A3, C4, D4, E4, F4, G4, A4, B4, C5)
export const BOX_FREQUENCIES: readonly number[] = [
  220.0,  // Box 0: A3
  261.63, // Box 1: C4
  293.66, // Box 2: D4
  329.63, // Box 3: E4
  349.23, // Box 4: F4
  392.0,  // Box 5: G4
  440.0,  // Box 6: A4
  493.88, // Box 7: B4
  523.25, // Box 8: C5
];

export interface Box {
  id: number;
  row: number;
  col: number;
  color: string;
  frequency: number;
  activeIntensity: number; // 0 to 1
}

export class BoxGrid {
  public readonly size: number;
  public readonly totalBoxes: number;
  public readonly boxes: Box[];

  constructor(size: number = 3) {
    this.size = Math.max(2, Math.floor(size));
    this.totalBoxes = this.size * this.size;
    this.boxes = [];

    for (let i = 0; i < this.totalBoxes; i++) {
      const row = Math.floor(i / this.size);
      const col = i % this.size;
      const color = NEON_BOX_PALETTE[i % NEON_BOX_PALETTE.length] ?? '#00f0ff';
      const frequency = BOX_FREQUENCIES[i % BOX_FREQUENCIES.length] ?? 220.0;

      this.boxes.push({
        id: i,
        row,
        col,
        color,
        frequency,
        activeIntensity: 0,
      });
    }
  }

  public getBox(id: number): Box | undefined {
    if (id < 0 || id >= this.totalBoxes) {
      return undefined;
    }
    return this.boxes[id];
  }

  public getBoxAt(row: number, col: number): Box | undefined {
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
      return undefined;
    }
    const id = row * this.size + col;
    return this.boxes[id];
  }

  public setActive(id: number, intensity: number = 1.0): void {
    const box = this.getBox(id);
    if (box) {
      box.activeIntensity = Math.max(0, Math.min(1, intensity));
    }
  }

  public update(dt: number, decayRate: number = 4.0): void {
    const decay = dt * decayRate;
    for (const box of this.boxes) {
      if (box.activeIntensity > 0) {
        box.activeIntensity = Math.max(0, box.activeIntensity - decay);
      }
    }
  }

  public reset(): void {
    for (const box of this.boxes) {
      box.activeIntensity = 0;
    }
  }
}
