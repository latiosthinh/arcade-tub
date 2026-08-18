import { describe, it, expect, beforeEach } from 'vitest';
import { UrgentTimer } from '../src/UrgentTimer';

describe('UrgentTimer', () => {
  let timer: UrgentTimer;

  beforeEach(() => {
    timer = new UrgentTimer();
  });

  it('initializes with default time and maxTime', () => {
    expect(timer.timeRemaining).toBe(UrgentTimer.INITIAL_TIME);
    expect(timer.maxTime).toBe(UrgentTimer.DEFAULT_MAX_TIME);
    expect(timer.getTimeFraction()).toBeCloseTo(UrgentTimer.INITIAL_TIME / UrgentTimer.DEFAULT_MAX_TIME);
    expect(timer.isUrgent).toBe(false);
  });

  it('drains time proportionally to dt and base drain rate at altitude 0', () => {
    const res = timer.update(1.0, 0);
    expect(timer.timeRemaining).toBeCloseTo(UrgentTimer.INITIAL_TIME - 1.0);
    expect(res.expired).toBe(false);
    expect(res.isUrgent).toBe(false);
  });

  it('accelerates drain rate as altitude increases', () => {
    // at altitude 100, bonus drain = min(2.5, 100 * 0.015) = 1.5 -> total rate 2.5
    timer.update(1.0, 100);
    expect(timer.timeRemaining).toBeCloseTo(UrgentTimer.INITIAL_TIME - 2.5);
  });

  it('adds step bonus time and clamps to maxTime', () => {
    timer.timeRemaining = 2.0;
    timer.addStepBonus(0.5);
    expect(timer.timeRemaining).toBe(2.5);

    // Overshoot maxTime
    timer.addStepBonus(10.0);
    expect(timer.timeRemaining).toBe(timer.maxTime);
  });

  it('flags isUrgent when remaining time <= 25% maxTime', () => {
    timer.timeRemaining = timer.maxTime * 0.2;
    const res = timer.update(0.01, 0);
    expect(res.isUrgent).toBe(true);
    expect(timer.isUrgent).toBe(true);
  });

  it('detects expiration when timeRemaining hits 0', () => {
    const res = timer.update(10.0, 0);
    expect(timer.timeRemaining).toBe(0);
    expect(res.expired).toBe(true);
  });

  it('resets timer state', () => {
    timer.update(10.0, 0);
    timer.reset();
    expect(timer.timeRemaining).toBe(UrgentTimer.INITIAL_TIME);
    expect(timer.isUrgent).toBe(false);
  });
});
