import { describe, it, expect, beforeEach } from 'vitest';
import { CardGrid, CYBER_GLYPHS } from '../src/CardGrid.js';

describe('CardGrid', () => {
  let grid: CardGrid;

  beforeEach(() => {
    grid = new CardGrid();
  });

  it('initializes a 4x4 grid with 16 cards and 8 pairs', () => {
    expect(grid.cards.length).toBe(16);
    expect(grid.selectedIndices).toEqual([]);

    const counts: Record<string, number> = {};
    for (const card of grid.cards) {
      expect(card.state).toBe('facedown');
      expect(card.flipProgress).toBe(0);
      expect(CYBER_GLYPHS).toContain(card.glyph);
      counts[card.glyph] = (counts[card.glyph] || 0) + 1;
    }

    const uniqueGlyphs = Object.keys(counts);
    expect(uniqueGlyphs.length).toBe(8);
    for (const glyph of uniqueGlyphs) {
      expect(counts[glyph]).toBe(2);
    }
  });

  it('correctly maps row and column coordinates', () => {
    for (let i = 0; i < grid.cards.length; i++) {
      const card = grid.cards[i];
      expect(card.id).toBe(i);
      expect(card.row).toBe(Math.floor(i / 4));
      expect(card.col).toBe(i % 4);
    }
  });

  it('allows selecting facedown cards up to 2 simultaneously', () => {
    const res1 = grid.selectCard(0);
    expect(res1.flipped).toBe(true);
    expect(grid.cards[0].state).toBe('flipping_up');
    expect(grid.selectedIndices).toEqual([0]);

    // Reselecting same card
    const resSame = grid.selectCard(0);
    expect(resSame.flipped).toBe(false);
    expect(resSame.reason).toBe('not_facedown');

    const res2 = grid.selectCard(1);
    expect(res2.flipped).toBe(true);
    expect(grid.selectedIndices).toEqual([0, 1]);

    // Attempting 3rd card selection
    const res3 = grid.selectCard(2);
    expect(res3.flipped).toBe(false);
    expect(res3.reason).toBe('max_selected');
  });

  it('evaluates matching pairs correctly', () => {
    // Force specific card glyphs for deterministic test
    grid.cards[0].glyph = 'CYBER_CHIP';
    grid.cards[1].glyph = 'CYBER_CHIP';

    grid.selectCard(0);
    grid.selectCard(1);

    const matchRes = grid.checkMatch();
    expect(matchRes.evaluated).toBe(true);
    expect(matchRes.match).toBe(true);
    expect(grid.cards[0].state).toBe('matched');
    expect(grid.cards[1].state).toBe('matched');
    expect(grid.cards[0].flipProgress).toBe(1);
    expect(grid.cards[1].flipProgress).toBe(1);
    expect(grid.selectedIndices).toEqual([]);
  });

  it('evaluates mismatching pairs and resolves flip down', () => {
    grid.cards[0].glyph = 'CYBER_CHIP';
    grid.cards[1].glyph = 'NEON_SKULL';

    grid.selectCard(0);
    grid.selectCard(1);

    const matchRes = grid.checkMatch();
    expect(matchRes.evaluated).toBe(true);
    expect(matchRes.match).toBe(false);
    expect(grid.selectedIndices).toEqual([0, 1]);

    grid.resolveMismatch();
    expect(grid.cards[0].state).toBe('flipping_down');
    expect(grid.cards[1].state).toBe('flipping_down');
    expect(grid.selectedIndices).toEqual([]);
  });

  it('identifies allMatched state', () => {
    expect(grid.allMatched).toBe(false);
    for (const card of grid.cards) {
      card.state = 'matched';
    }
    expect(grid.allMatched).toBe(true);
  });

  it('shuffles and resets grid properly', () => {
    grid.cards[0].state = 'matched';
    grid.cards[1].state = 'matched';
    grid.reset();

    expect(grid.cards.length).toBe(16);
    expect(grid.cards.every((c) => c.state === 'facedown')).toBe(true);
    expect(grid.selectedIndices).toEqual([]);
  });

  it('rejects out of bounds index selections', () => {
    const resNegative = grid.selectCard(-1);
    expect(resNegative.flipped).toBe(false);
    expect(resNegative.reason).toBe('out_of_bounds');

    const resTooLarge = grid.selectCard(99);
    expect(resTooLarge.flipped).toBe(false);
    expect(resTooLarge.reason).toBe('out_of_bounds');
  });
});
