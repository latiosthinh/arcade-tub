export type CardState = 'facedown' | 'flipping_up' | 'faceup' | 'flipping_down' | 'matched';

export interface Card {
  id: number;
  row: number;
  col: number;
  glyph: string;
  state: CardState;
  flipProgress: number;
}

export const CYBER_GLYPHS = [
  'CYBER_CHIP',
  'NEON_SKULL',
  'QUANTUM_NODE',
  'MATRIX_KEY',
  'CIRCUIT_CORE',
  'DATA_ORB',
  'WARP_GATE',
  'BIO_HAZARD',
] as const;

export type CyberGlyph = (typeof CYBER_GLYPHS)[number];

export class CardGrid {
  public static readonly ROWS = 4;
  public static readonly COLS = 4;
  public static readonly TOTAL_CARDS = 16;
  public static readonly PAIR_COUNT = 8;

  public cards: Card[] = [];
  public selectedIndices: number[] = [];

  constructor() {
    this.initialize();
  }

  public initialize(customGlyphs?: string[]): void {
    const glyphList: string[] = [];
    const sourceGlyphs = customGlyphs && customGlyphs.length >= CardGrid.PAIR_COUNT
      ? customGlyphs.slice(0, CardGrid.PAIR_COUNT)
      : [...CYBER_GLYPHS];

    for (let i = 0; i < CardGrid.PAIR_COUNT; i++) {
      const glyph = sourceGlyphs[i];
      glyphList.push(glyph, glyph);
    }

    this.shuffleArray(glyphList);

    this.cards = [];
    this.selectedIndices = [];

    for (let i = 0; i < CardGrid.TOTAL_CARDS; i++) {
      const row = Math.floor(i / CardGrid.COLS);
      const col = i % CardGrid.COLS;
      this.cards.push({
        id: i,
        row,
        col,
        glyph: glyphList[i],
        state: 'facedown',
        flipProgress: 0,
      });
    }
  }

  public shuffle(): void {
    const glyphs = this.cards.map((c) => c.glyph);
    this.shuffleArray(glyphs);
    for (let i = 0; i < this.cards.length; i++) {
      this.cards[i].glyph = glyphs[i];
      this.cards[i].state = 'facedown';
      this.cards[i].flipProgress = 0;
    }
    this.selectedIndices = [];
  }

  public reset(): void {
    this.initialize();
  }

  public get allMatched(): boolean {
    return this.cards.length > 0 && this.cards.every((c) => c.state === 'matched');
  }

  public selectCard(index: number): { flipped: boolean; reason?: string } {
    if (index < 0 || index >= this.cards.length) {
      return { flipped: false, reason: 'out_of_bounds' };
    }

    const card = this.cards[index];
    if (card.state !== 'facedown') {
      return { flipped: false, reason: 'not_facedown' };
    }

    if (this.selectedIndices.length >= 2) {
      return { flipped: false, reason: 'max_selected' };
    }

    if (this.selectedIndices.includes(index)) {
      return { flipped: false, reason: 'already_selected' };
    }

    card.state = 'flipping_up';
    this.selectedIndices.push(index);
    return { flipped: true };
  }

  public checkMatch(): {
    evaluated: boolean;
    match: boolean;
    cardA?: Card;
    cardB?: Card;
  } {
    if (this.selectedIndices.length < 2) {
      return { evaluated: false, match: false };
    }

    const idxA = this.selectedIndices[0];
    const idxB = this.selectedIndices[1];
    const cardA = this.cards[idxA];
    const cardB = this.cards[idxB];

    if (!cardA || !cardB) {
      this.selectedIndices = [];
      return { evaluated: false, match: false };
    }

    const isMatch = cardA.glyph === cardB.glyph;

    if (isMatch) {
      cardA.state = 'matched';
      cardB.state = 'matched';
      cardA.flipProgress = 1;
      cardB.flipProgress = 1;
      this.selectedIndices = [];
      return { evaluated: true, match: true, cardA, cardB };
    }

    return { evaluated: true, match: false, cardA, cardB };
  }

  public resolveMismatch(): void {
    if (this.selectedIndices.length >= 2) {
      const idxA = this.selectedIndices[0];
      const idxB = this.selectedIndices[1];
      const cardA = this.cards[idxA];
      const cardB = this.cards[idxB];

      if (cardA && cardA.state !== 'matched') {
        cardA.state = 'flipping_down';
      }
      if (cardB && cardB.state !== 'matched') {
        cardB.state = 'flipping_down';
      }
    }
    this.selectedIndices = [];
  }

  private shuffleArray<T>(array: T[]): void {
    // Fisher-Yates shuffle with bounded O(N) execution
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }
}
