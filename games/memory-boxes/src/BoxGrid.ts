export const NEON_BOX_PALETTE: readonly string[] = [
  '#00f0ff', // 0: Cyan
  '#ec4899', // 1: Pink
  '#10b981', // 2: Emerald
  '#f59e0b', // 3: Amber
  '#8b5cf6', // 4: Purple
  '#3b82f6', // 5: Blue
  '#ef4444', // 6: Red
  '#14b8a6', // 7: Teal
  '#eab308', // 8: Yellow
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
