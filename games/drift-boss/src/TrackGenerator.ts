export interface TrackTile {
  index: number;
  x: number;
  y: number;
  width: number;
  length: number;
  axis: 'X' | 'Y';
  isNarrow: boolean;
  isRamp: boolean;
  isGap: boolean;
}

export interface Coin {
  id: string;
  x: number;
  y: number;
  value: number;
  collected: boolean;
}

export interface TrackGeneratorOptions {
  maxActiveTiles?: number;
  tileLength?: number;
  defaultWidth?: number;
  narrowWidth?: number;
}

export class TrackGenerator {
  private tiles: TrackTile[] = [];
  private coins: Coin[] = [];
  private maxActiveTiles: number;
  private tileLength: number;
  private defaultWidth: number;
  private narrowWidth: number;
  private currentX = 0;
  private currentY = 0;
  private currentAxis: 'X' | 'Y' = 'X';
  private tileCount = 0;
  private runStreak = 0;

  constructor(options: TrackGeneratorOptions = {}) {
    this.maxActiveTiles = options.maxActiveTiles ?? 30;
    this.tileLength = options.tileLength ?? 1.0;
    this.defaultWidth = options.defaultWidth ?? 1.0;
    this.narrowWidth = options.narrowWidth ?? 0.6;
    this.reset();
  }

  public reset(): void {
    this.tiles = [];
    this.coins = [];
    this.currentX = 0;
    this.currentY = 0;
    this.currentAxis = 'X';
    this.tileCount = 0;
    this.runStreak = 0;

    // Initial straight start platform
    for (let i = 0; i < 10; i++) {
      this.appendTile({ forceStraight: true, noItems: true });
    }
  }

  public update(playerProgress: number): void {
    // Generate ahead if needed
    while (this.tiles.length < this.maxActiveTiles) {
      this.appendTile();
    }
  }

  public cullBehind(playerDistance: number): void {
    const keepDistance = 5;
    this.tiles = this.tiles.filter(t => (t.x + t.y) >= playerDistance - keepDistance);
    this.coins = this.coins.filter(c => (c.x + c.y) >= playerDistance - keepDistance);

    // Maintain buffer
    while (this.tiles.length < this.maxActiveTiles) {
      this.appendTile();
    }
  }

  public getTiles(): TrackTile[] {
    return this.tiles;
  }

  public getCoins(): Coin[] {
    return this.coins;
  }

  public removeCoin(id: string): void {
    const coin = this.coins.find(c => c.id === id);
    if (coin) {
      coin.collected = true;
    }
  }

  private appendTile(params?: { forceStraight?: boolean; noItems?: boolean }): TrackTile {
    let axis = this.currentAxis;
    const forceStraight = params?.forceStraight ?? false;
    const noItems = params?.noItems ?? false;

    if (!forceStraight && this.tileCount >= 10) {
      this.runStreak++;
      // Determine turn probability
      const shouldTurn = this.runStreak >= 3 && Math.random() > 0.4;
      if (shouldTurn) {
        axis = this.currentAxis === 'X' ? 'Y' : 'X';
        this.currentAxis = axis;
        this.runStreak = 0;
      }
    }

    const isNarrow = !forceStraight && this.tileCount > 15 && Math.random() < 0.2;
    const isRamp = !forceStraight && this.tileCount > 25 && Math.random() < 0.1;
    const isGap = !forceStraight && this.tileCount > 25 && !isRamp && Math.random() < 0.08;

    const width = isNarrow ? this.narrowWidth : this.defaultWidth;
    const length = this.tileLength;

    const tile: TrackTile = {
      index: this.tileCount,
      x: this.currentX,
      y: this.currentY,
      width,
      length,
      axis,
      isNarrow,
      isRamp,
      isGap
    };

    this.tiles.push(tile);

    // Spawn coin on regular tiles
    if (!noItems && !isGap && Math.random() < 0.35) {
      this.coins.push({
        id: `coin_${this.tileCount}`,
        x: this.currentX,
        y: this.currentY,
        value: 1,
        collected: false
      });
    }

    // Step current position for next tile
    if (axis === 'X') {
      this.currentX += length;
    } else {
      this.currentY += length;
    }

    this.tileCount++;
    return tile;
  }
}
