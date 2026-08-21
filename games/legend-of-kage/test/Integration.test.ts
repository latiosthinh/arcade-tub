import { describe, it, expect } from 'vitest';
import { GAMES } from '../../../src/data/games';
import { TouchControls } from '../src/TouchControls';

describe('Legend of Kage Integration (VISL-01, AUDI-01, CTRL-01, INTG-01)', () => {
  it('registers in central games catalog as retro category', () => {
    const kage = GAMES.find((g) => g.id === 'legend-of-kage');
    expect(kage).toBeDefined();
    expect(kage?.title).toBe('The Legend of Kage');
    expect(kage?.category).toBe('retro');
    expect(kage?.howToPlay).toBeDefined();
  });

  it('handles multi-touch D-pad and sword/shuriken action buttons (CTRL-01)', () => {
    const touch = new TouchControls();
    touch.handleTouchStart(1, 100, 180, 400, 300); // D-pad
    expect(touch.inputState.right).toBe(true);

    touch.handleTouchStart(2, 300, 260, 400, 300); // Sword button (middle-right)
    expect(touch.inputState.sword).toBe(true);
    expect(touch.inputState.swordJustPressed).toBe(true);
  });
});
