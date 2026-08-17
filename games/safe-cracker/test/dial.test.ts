import { describe, it, expect } from 'vitest';
import { Dial } from '../src/Dial.js';

describe('Dial', () => {
  it('initializes with default values and normalized pointer angle', () => {
    const dial = new Dial();
    expect(dial.pointerAngle).toBe(0);
    expect(dial.baseSpeed).toBe(2.0);
    expect(dial.speedBoostMultiplier).toBe(2.5);
    expect(dial.radius).toBe(170);
    expect(dial.zones).toBeDefined();
    expect(dial.zones.length).toBe(2);
  });

  it('updates pointer angle with speed multiplier and delta time', () => {
    const dial = new Dial();
    // dt = 1.0, speedMultiplier = 1.0, unboosted: angle = 0 + 2.0 * 1.0 * 1.0 * 1.0 = 2.0 rad
    dial.update(1.0, 1.0, false);
    expect(dial.pointerAngle).toBeCloseTo(2.0, 5);

    // Boosted: 2.0 * 1.5 * 2.5 * 0.5 = 3.75 rad -> total = 5.75 rad
    dial.update(0.5, 1.5, true);
    expect(dial.pointerAngle).toBeCloseTo(5.75, 5);

    // Wraparound modulo 2*PI:
    dial.update(1.0, 1.0, false); // 5.75 + 2.0 = 7.75 rad -> 7.75 - 2*PI ~= 1.4668 rad
    expect(dial.pointerAngle).toBeCloseTo(7.75 % (2 * Math.PI), 5);
  });

  it('clamps dt and prevents NaN in update', () => {
    const dial = new Dial();
    dial.update(-1.0, 1.0, false);
    expect(dial.pointerAngle).toBe(0);

    dial.update(100.0, 1.0, false);
    expect(dial.pointerAngle).toBeLessThan(2 * Math.PI);
    expect(dial.pointerAngle).toBeGreaterThanOrEqual(0);
  });

  it('correctly detects hits within normal arc (start < end)', () => {
    const dial = new Dial();
    dial.zones = [
      { startAngle: 1.0, endAngle: 1.5, type: 'score' },
      { startAngle: 3.0, endAngle: 3.5, type: 'time' },
    ];

    dial.pointerAngle = 0.5;
    expect(dial.checkHit()).toEqual({ hit: false });

    dial.pointerAngle = 1.0;
    expect(dial.checkHit()).toEqual({ hit: true, type: 'score' });

    dial.pointerAngle = 1.25;
    expect(dial.checkHit()).toEqual({ hit: true, type: 'score' });

    dial.pointerAngle = 1.5;
    expect(dial.checkHit()).toEqual({ hit: true, type: 'score' });

    dial.pointerAngle = 3.2;
    expect(dial.checkHit()).toEqual({ hit: true, type: 'time' });

    dial.pointerAngle = 2.0;
    expect(dial.checkHit()).toEqual({ hit: false });
  });

  it('correctly detects hits across wrap-around arc (start > end crossing 0 / 2*PI boundary)', () => {
    const dial = new Dial();
    dial.zones = [
      { startAngle: 6.0, endAngle: 0.5, type: 'score' },
    ];

    dial.pointerAngle = 6.1;
    expect(dial.checkHit()).toEqual({ hit: true, type: 'score' });

    dial.pointerAngle = 0.2;
    expect(dial.checkHit()).toEqual({ hit: true, type: 'score' });

    dial.pointerAngle = 6.0;
    expect(dial.checkHit()).toEqual({ hit: true, type: 'score' });

    dial.pointerAngle = 0.5;
    expect(dial.checkHit()).toEqual({ hit: true, type: 'score' });

    dial.pointerAngle = 3.0;
    expect(dial.checkHit()).toEqual({ hit: false });
  });

  it('resets zones with non-overlapping score and time targets', () => {
    const dial = new Dial();
    dial.resetZones(0);

    expect(dial.zones.length).toBe(2);
    const scoreZone = dial.zones.find(z => z.type === 'score');
    const timeZone = dial.zones.find(z => z.type === 'time');

    expect(scoreZone).toBeDefined();
    expect(timeZone).toBeDefined();

    // Check arc sizes
    const arcLength = (start: number, end: number) => {
      return (end - start + 2 * Math.PI) % (2 * Math.PI);
    };

    expect(arcLength(scoreZone!.startAngle, scoreZone!.endAngle)).toBeCloseTo(0.45, 4);
    expect(arcLength(timeZone!.startAngle, timeZone!.endAngle)).toBeCloseTo(0.35, 4);
  });

  it('narrows zone arc width on higher difficulty and enforces minZoneArc clamp', () => {
    const dial = new Dial();
    dial.resetZones(5);

    const scoreZoneL5 = dial.zones.find(z => z.type === 'score')!;
    const arcLength = (start: number, end: number) => {
      return (end - start + 2 * Math.PI) % (2 * Math.PI);
    };

    // initialYellowArc (0.45) - 5 * 0.02 = 0.35
    expect(arcLength(scoreZoneL5.startAngle, scoreZoneL5.endAngle)).toBeCloseTo(0.35, 4);

    // extreme difficulty clamping to minZoneArc (0.15)
    dial.resetZones(100);
    const scoreZoneL100 = dial.zones.find(z => z.type === 'score')!;
    const timeZoneL100 = dial.zones.find(z => z.type === 'time')!;

    expect(arcLength(scoreZoneL100.startAngle, scoreZoneL100.endAngle)).toBeCloseTo(0.15, 4);
    expect(arcLength(timeZoneL100.startAngle, timeZoneL100.endAngle)).toBeCloseTo(0.15, 4);
  });
});
