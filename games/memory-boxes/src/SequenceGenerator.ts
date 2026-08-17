export class SequenceGenerator {
  private _sequence: number[] = [];
  private readonly _boxCount: number;
  private readonly _initialLength: number;
  private readonly _rng: () => number;

  constructor(
    boxCount: number = 9,
    initialLength: number = 3,
    rng: () => number = Math.random
  ) {
    this._boxCount = Math.max(1, Math.floor(boxCount));
    this._initialLength = Math.max(1, Math.floor(initialLength));
    this._rng = rng;
    this.generateNew();
  }

  public get sequence(): number[] {
    return [...this._sequence];
  }

  public get currentLength(): number {
    return this._sequence.length;
  }

  public generateNew(): number[] {
    this._sequence = [];
    for (let i = 0; i < this._initialLength; i++) {
      this._sequence.push(Math.floor(this._rng() * this._boxCount));
    }
    return this.sequence;
  }

  public advance(): number {
    const nextBoxId = Math.floor(this._rng() * this._boxCount);
    this._sequence.push(nextBoxId);
    return nextBoxId;
  }

  public reset(initialLength?: number): void {
    if (initialLength !== undefined && initialLength > 0) {
      this._sequence = [];
      for (let i = 0; i < initialLength; i++) {
        this._sequence.push(Math.floor(this._rng() * this._boxCount));
      }
    } else {
      this.generateNew();
    }
  }
}
