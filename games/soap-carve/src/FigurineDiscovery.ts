import { SoapBlock } from './SoapBlock';

export interface OrigamiFigurine {
  id: string;
  name: string;
  category: 'Animal' | 'Nature' | 'Mythical';
  color: string;
  secondaryColor: string;
  widthCols: number;
  heightRows: number;
  startCol: number;
  startRow: number;
  // Mask is array of 0 or 1 for bounding shape
  mask: number[][];
}

export const FIGURINES: OrigamiFigurine[] = [
  {
    id: 'swan',
    name: 'Origami Swan',
    category: 'Animal',
    color: '#FFFFFF',
    secondaryColor: '#FFCC80',
    widthCols: 20,
    heightRows: 16,
    startCol: 10,
    startRow: 7,
    mask: [
      [0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ]
  },
  {
    id: 'fox',
    name: 'Paper Fox',
    category: 'Animal',
    color: '#FF8A65',
    secondaryColor: '#FFF3E0',
    widthCols: 20,
    heightRows: 16,
    startCol: 10,
    startRow: 7,
    mask: [
      [0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0],
      [0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0],
      [1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ]
  },
  {
    id: 'frog',
    name: 'Lotus Frog',
    category: 'Animal',
    color: '#81C784',
    secondaryColor: '#C8E6C9',
    widthCols: 20,
    heightRows: 16,
    startCol: 10,
    startRow: 7,
    mask: [
      [0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0],
      [0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1],
      [1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1],
      [1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
      [0,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0],
      [1,1,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,1,1],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ]
  },
  {
    id: 'lotus',
    name: 'Paper Lotus',
    category: 'Nature',
    color: '#F48FB1',
    secondaryColor: '#FFF59D',
    widthCols: 20,
    heightRows: 16,
    startCol: 10,
    startRow: 7,
    mask: [
      [0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,1,1,0,1,1,1,1,0,1,1,0,0,0,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
      [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ]
  }
];

const STORAGE_KEY = 'soap_carve_unlocked_figurines';

export class FigurineDiscovery {
  public currentFigurine: OrigamiFigurine;
  public revealPercentage = 0;
  public targetDepth = 4;
  private unlockedSet: Set<string> = new Set();

  constructor(figurine: OrigamiFigurine = FIGURINES[0]) {
    this.currentFigurine = figurine;
    this.loadUnlocked();
  }

  public setFigurine(figurine: OrigamiFigurine): void {
    this.currentFigurine = figurine;
    this.revealPercentage = 0;
  }

  public checkReveal(soapBlock: SoapBlock): boolean {
    let totalMaskCells = 0;
    let revealedCells = 0;

    for (let r = 0; r < this.currentFigurine.heightRows; r++) {
      for (let c = 0; c < this.currentFigurine.widthCols; c++) {
        if (this.currentFigurine.mask[r]?.[c] === 1) {
          totalMaskCells++;
          const gx = this.currentFigurine.startCol + c;
          const gy = this.currentFigurine.startRow + r;
          const depth = soapBlock.getDepth(gx, gy);
          if (depth >= this.targetDepth) {
            revealedCells++;
          }
        }
      }
    }

    if (totalMaskCells === 0) {
      this.revealPercentage = 100;
      return true;
    }

    this.revealPercentage = Math.round((revealedCells / totalMaskCells) * 100);
    return this.revealPercentage >= 80;
  }

  public isUnlocked(id: string): boolean {
    return this.unlockedSet.has(id);
  }

  public unlockFigurine(id: string): void {
    this.unlockedSet.add(id);
    this.saveUnlocked();
  }

  public getUnlockedList(): string[] {
    return Array.from(this.unlockedSet);
  }

  private loadUnlocked(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
          const arr = JSON.parse(data);
          this.unlockedSet = new Set(arr);
        }
      }
    } catch {
      // Ignore storage errors in test / headless
    }
  }

  private saveUnlocked(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.unlockedSet)));
      }
    } catch {
      // Ignore storage errors
    }
  }
}
