export interface SoapPalette {
  name: string;
  layers: string[];
  baseColor: string;
}

export const SOAP_PALETTES: SoapPalette[] = [
  {
    name: 'Lavender Mint',
    layers: ['#E8D7F1', '#D3BCE8', '#C3E8BD', '#A1E5AB', '#95D9C3', '#72C1C6'],
    baseColor: '#537A8B'
  },
  {
    name: 'Rose Sunset',
    layers: ['#FFE2E2', '#FFC7C7', '#FFAAA7', '#FF8E8E', '#FFB7B2', '#FFDAC1'],
    baseColor: '#B5525C'
  },
  {
    name: 'Citrus Lime',
    layers: ['#FFFFD2', '#FCF6BD', '#D0F4DE', '#A9DEF9', '#E4C1F9', '#BFFCC6'],
    baseColor: '#789F5F'
  },
  {
    name: 'Ocean Wave',
    layers: ['#E0FBFC', '#C2DFE3', '#9DB4C0', '#5C6B73', '#253237', '#4EA8DE'],
    baseColor: '#1D3557'
  }
];

export interface CarveResult {
  carvedCount: number;
  shavedColors: string[];
}

export class SoapBlock {
  public cols: number;
  public rows: number;
  public maxDepth: number;
  public grid: Int8Array;
  public palette: SoapPalette;

  constructor(cols = 40, rows = 30, maxDepth = 6, paletteIndex = 0) {
    this.cols = cols;
    this.rows = rows;
    this.maxDepth = maxDepth;
    this.grid = new Int8Array(cols * rows);
    this.palette = SOAP_PALETTES[paletteIndex % SOAP_PALETTES.length];
  }

  public getDepth(col: number, row: number): number {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return 0;
    }
    return this.grid[row * this.cols + col];
  }

  public setDepth(col: number, row: number, depth: number): void {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      this.grid[row * this.cols + col] = Math.max(0, Math.min(this.maxDepth, depth));
    }
  }

  public getColorAtDepth(depth: number): string {
    if (depth >= this.maxDepth) {
      return this.palette.baseColor;
    }
    return this.palette.layers[depth % this.palette.layers.length];
  }

  public getOverallCarvedPercentage(): number {
    let totalCarved = 0;
    const maxTotal = this.cols * this.rows * this.maxDepth;
    for (let i = 0; i < this.grid.length; i++) {
      totalCarved += this.grid[i];
    }
    return Math.round((totalCarved / maxTotal) * 100);
  }

  public reset(paletteIndex = 0): void {
    this.grid.fill(0);
    this.palette = SOAP_PALETTES[paletteIndex % SOAP_PALETTES.length];
  }

  public carveSlice(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    bladeRadius = 2,
    cutDepth = 1
  ): CarveResult {
    let carvedCount = 0;
    const shavedColorsSet = new Set<string>();

    // Bresenham line rasterization with radius
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const steps = Math.max(Math.ceil(Math.hypot(dx, dy)), 1);

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const cx = Math.round(x1 + (x2 - x1) * t);
      const cy = Math.round(y1 + (y2 - y1) * t);

      for (let r = -bladeRadius; r <= bladeRadius; r++) {
        for (let c = -bladeRadius; c <= bladeRadius; c++) {
          if (r * r + c * c <= bladeRadius * bladeRadius) {
            const gx = cx + c;
            const gy = cy + r;

            // Bounds check (T-44-01 mitigation)
            if (gx >= 0 && gx < this.cols && gy >= 0 && gy < this.rows) {
              const idx = gy * this.cols + gx;
              const currentDepth = this.grid[idx];
              if (currentDepth < this.maxDepth) {
                const nextDepth = Math.min(this.maxDepth, currentDepth + cutDepth);
                if (nextDepth > currentDepth) {
                  shavedColorsSet.add(this.getColorAtDepth(currentDepth));
                  this.grid[idx] = nextDepth;
                  carvedCount++;
                }
              }
            }
          }
        }
      }
    }

    return {
      carvedCount,
      shavedColors: Array.from(shavedColorsSet)
    };
  }
}
