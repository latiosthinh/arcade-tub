import { describe, it, expect, beforeEach } from 'vitest';
import { DrawEngine, Point } from '../src/DrawEngine.js';

describe('DrawEngine', () => {
  let engine: DrawEngine;

  beforeEach(() => {
    engine = new DrawEngine(800, 600);
  });

  it('calculates stepping rainbow hues along stroke points', () => {
    engine.startStroke(100, 100);
    const initialHue = engine.getCurrentHue();
    
    // Add point distant from start
    engine.addPoint(150, 100);
    const nextHue = engine.getCurrentHue();
    
    expect(nextHue).toBeGreaterThanOrEqual(initialHue);
    expect(nextHue).toBeLessThanOrEqual(360);
  });

  it('smooths raw stroke points using Catmull-Rom or Bézier interpolation', () => {
    const rawPoints: Point[] = [
      { x: 0, y: 0, hue: 0, size: 10 },
      { x: 10, y: 20, hue: 10, size: 10 },
      { x: 20, y: 5, hue: 20, size: 10 },
      { x: 30, y: 25, hue: 30, size: 10 },
      { x: 40, y: 0, hue: 40, size: 10 }
    ];

    const smoothed = engine.smoothStroke(rawPoints);
    expect(smoothed.length).toBeGreaterThanOrEqual(rawPoints.length);
    expect(smoothed[0].x).toBe(0);
    expect(smoothed[smoothed.length - 1].x).toBe(40);
  });

  it('switches modes between rainbow, auto-adjust, and scratch', () => {
    expect(engine.getMode()).toBe('rainbow');
    engine.setMode('scratch');
    expect(engine.getMode()).toBe('scratch');
    engine.setMode('auto-adjust');
    expect(engine.getMode()).toBe('auto-adjust');
  });

  it('tracks scratch reveal percentage', () => {
    const initialRevealed = engine.getScratchPercent();
    expect(initialRevealed).toBe(0);

    // Scratch circular area
    engine.scratchAt(400, 300, 50);
    const afterScratch = engine.getScratchPercent();
    expect(afterScratch).toBeGreaterThan(0);
    expect(afterScratch).toBeLessThanOrEqual(100);
  });

  it('caps max points in a stroke to prevent memory degradation (T-42-02)', () => {
    engine.startStroke(0, 0);
    for (let i = 0; i < 2000; i++) {
      engine.addPoint(i, i % 100);
    }
    const currentPoints = engine.getCurrentStrokePoints();
    expect(currentPoints.length).toBeLessThanOrEqual(1000);
  });

  it('clears canvas and resets scratch percentage', () => {
    engine.scratchAt(100, 100, 40);
    expect(engine.getScratchPercent()).toBeGreaterThan(0);
    engine.resetScratch();
    expect(engine.getScratchPercent()).toBe(0);
  });
});
