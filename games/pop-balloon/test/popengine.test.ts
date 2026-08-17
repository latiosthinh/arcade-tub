import { describe, it, expect, beforeEach } from 'vitest';
import { PopEngine, PopResult } from '../src/PopEngine';
import { Balloon } from '../src/Balloon';

describe('PopEngine', () => {
  let engine: PopEngine;

  beforeEach(() => {
    engine = new PopEngine({ comboWindow: 1.8, maxMultiplier: 5.0 });
  });

  it('selects top-most / matching balloon on click', () => {
    const b1 = new Balloon('b1', 'cyan', 100, 100, { radius: 25 });
    const b2 = new Balloon('b2', 'pink', 100, 100, { radius: 25 });
    // In reverse search (top-most in array), b2 should be popped
    const res = engine.handleClick(100, 100, [b1, b2]);
    expect(res).not.toBeNull();
    expect(res?.balloon.id).toBe('b2');
    expect(b2.popped).toBe(true);
    expect(b1.popped).toBe(false);
  });

  it('chains same-color combo streak and multiplier', () => {
    const b1 = new Balloon('b1', 'cyan', 100, 100);
    const b2 = new Balloon('b2', 'cyan', 200, 200);

    const res1 = engine.handleClick(100, 100, [b1]);
    expect(res1?.streak).toBe(1);
    expect(res1?.multiplier).toBe(1.0);
    expect(res1?.pointsAwarded).toBe(100);

    const res2 = engine.handleClick(200, 200, [b2]);
    expect(res2?.streak).toBe(2);
    expect(res2?.multiplier).toBe(1.5);
    expect(res2?.pointsAwarded).toBe(150); // 100 * 1.5
  });

  it('treats rainbow balloon as wild card maintaining combo color', () => {
    const b1 = new Balloon('b1', 'cyan', 100, 100);
    const bRainbow = new Balloon('b2', 'rainbow', 200, 200);
    const b3 = new Balloon('b3', 'cyan', 300, 300);

    engine.handleClick(100, 100, [b1]); // streak 1, color cyan
    const res2 = engine.handleClick(200, 200, [bRainbow]); // streak 2, rainbow
    expect(res2?.streak).toBe(2);
    expect(res2?.isRainbow).toBe(true);

    const res3 = engine.handleClick(300, 300, [b3]); // streak 3, cyan matches active streak
    expect(res3?.streak).toBe(3);
    expect(res3?.multiplier).toBe(2.0);
  });

  it('resets streak to 1 when popping different color balloon', () => {
    const bCyan = new Balloon('b1', 'cyan', 100, 100);
    const bPink = new Balloon('b2', 'pink', 200, 200);

    engine.handleClick(100, 100, [bCyan]); // streak 1
    const res2 = engine.handleClick(200, 200, [bPink]); // streak resets
    expect(res2?.streak).toBe(1);
    expect(res2?.multiplier).toBe(1.0);
  });

  it('resets streak when combo window expires', () => {
    const b1 = new Balloon('b1', 'cyan', 100, 100);
    const b2 = new Balloon('b2', 'cyan', 200, 200);

    engine.handleClick(100, 100, [b1]);
    expect(engine.getStreak()).toBe(1);

    // Elapse 2.0s (> 1.8s combo window)
    engine.update(2.0);
    expect(engine.getStreak()).toBe(0);

    const res2 = engine.handleClick(200, 200, [b2]);
    expect(res2?.streak).toBe(1);
  });

  it('handles hazard bomb hit with penalty and resets streak', () => {
    const bCyan = new Balloon('b1', 'cyan', 100, 100);
    const bBomb = new Balloon('b2', 'bomb', 200, 200);

    engine.handleClick(100, 100, [bCyan]);
    expect(engine.getStreak()).toBe(1);

    const resBomb = engine.handleClick(200, 200, [bBomb]);
    expect(resBomb?.isBomb).toBe(true);
    expect(resBomb?.pointsAwarded).toBe(-300);
    expect(resBomb?.streak).toBe(0);
    expect(engine.getStreak()).toBe(0);
  });
});
