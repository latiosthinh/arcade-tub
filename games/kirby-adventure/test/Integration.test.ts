import { describe, it, expect } from 'vitest';
import { TouchControls } from '../src/TouchControls';
import { GoalGame } from '../src/GoalGame';
import { GAMES } from '../../../src/data/games';

describe('Mobile Controls, HUD & Hub Integration', () => {
  it('handles multi-touch D-pad and action buttons (CTRL-01)', () => {
    const touch = new TouchControls();
    touch.handleTouchStart(1, 100, 180, 400, 300); // D-pad right
    expect(touch.inputState.right).toBe(true);

    touch.handleTouchStart(2, 380, 280, 400, 300); // Jump button
    expect(touch.inputState.jump).toBe(true);
    expect(touch.inputState.jumpJustPressed).toBe(true);

    touch.handleTouchEnd(2);
    expect(touch.inputState.jump).toBe(false);
  });

  it('runs goal game timing minigame (CTRL-04)', () => {
    const goal = new GoalGame();
    goal.update(0.2);
    const res = goal.jump();
    expect(res.tier).toBeGreaterThanOrEqual(1);
    expect(res.reward).toBeDefined();
    expect(goal.isComplete).toBe(true);
  });

  it('registers kirby-adventure in central games catalog (INTG-01, INTG-02)', () => {
    const kirby = GAMES.find((g) => g.id === 'kirby-adventure');
    expect(kirby).toBeDefined();
    expect(kirby?.title).toBe("Kirby's Adventure");
    expect(kirby?.category).toBe('retro');
  });
});
