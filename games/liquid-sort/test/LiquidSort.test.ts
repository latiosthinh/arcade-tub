import { describe, it, expect, beforeEach } from 'vitest';
import { WaterSortEngine, Tube, WATER_COLORS } from '../src/WaterSortEngine';
import { LevelGenerator } from '../src/LevelGenerator';
import { LiquidAudio } from '../src/LiquidAudio';

describe('WaterSortEngine Core Logic', () => {
  let engine: WaterSortEngine;

  beforeEach(() => {
    engine = new WaterSortEngine(4);
  });

  it('initializes with capacity and empty tubes', () => {
    engine.setTubes([
      ['#FF4444', '#FF4444', '#3388FF', '#3388FF'],
      ['#3388FF', '#3388FF', '#FF4444', '#FF4444'],
      []
    ]);
    expect(engine.tubeCapacity).toBe(4);
    expect(engine.getTubes().length).toBe(3);
    expect(engine.getTubes()[2].length).toBe(0);
  });

  it('allows pouring matching color into non-full tube', () => {
    engine.setTubes([
      ['#FF4444', '#FF4444', '#3388FF', '#3388FF'],
      ['#3388FF', '#3388FF'],
      []
    ]);

    // Top color of tube 0 is #3388FF, top of tube 1 is #3388FF
    expect(engine.canPour(0, 1)).toBe(true);
    expect(engine.getTransferCount(0, 1)).toBe(2);

    const move = engine.pour(0, 1);
    expect(move).toBeDefined();
    expect(move?.fromIndex).toBe(0);
    expect(move?.toIndex).toBe(1);
    expect(move?.color).toBe('#3388FF');
    expect(move?.count).toBe(2);

    expect(engine.getTube(0)).toEqual(['#FF4444', '#FF4444']);
    expect(engine.getTube(1)).toEqual(['#3388FF', '#3388FF', '#3388FF', '#3388FF']);
  });

  it('allows pouring into completely empty tube', () => {
    engine.setTubes([
      ['#FF4444', '#FF4444', '#3388FF', '#3388FF'],
      []
    ]);

    expect(engine.canPour(0, 1)).toBe(true);
    expect(engine.getTransferCount(0, 1)).toBe(2);

    engine.pour(0, 1);
    expect(engine.getTube(0)).toEqual(['#FF4444', '#FF4444']);
    expect(engine.getTube(1)).toEqual(['#3388FF', '#3388FF']);
  });

  it('rejects pour when colors mismatch', () => {
    engine.setTubes([
      ['#FF4444', '#FF4444'],
      ['#3388FF', '#3388FF']
    ]);

    expect(engine.canPour(0, 1)).toBe(false);
    expect(engine.getTransferCount(0, 1)).toBe(0);
    expect(engine.pour(0, 1)).toBeNull();
  });

  it('rejects pour when destination is full or same tube or source is empty', () => {
    engine.setTubes([
      ['#FF4444', '#FF4444', '#FF4444', '#FF4444'],
      ['#FF4444', '#FF4444', '#FF4444', '#FF4444'],
      []
    ]);

    // Destination full
    expect(engine.canPour(0, 1)).toBe(false);
    // Same tube
    expect(engine.canPour(0, 0)).toBe(false);
    // Source empty
    expect(engine.canPour(2, 0)).toBe(false);
    // Out of bounds
    expect(engine.canPour(-1, 0)).toBe(false);
    expect(engine.canPour(0, 5)).toBe(false);
  });

  it('handles partial transfer when destination has limited capacity', () => {
    engine.setTubes([
      ['#FF4444', '#3388FF', '#3388FF', '#3388FF'],
      ['#3388FF', '#3388FF', '#3388FF']
    ]);

    // Source has 3 contiguous #3388FF, but dest only has 1 slot left (capacity 4 - 3 = 1)
    expect(engine.canPour(0, 1)).toBe(true);
    expect(engine.getTransferCount(0, 1)).toBe(1);

    const move = engine.pour(0, 1);
    expect(move?.count).toBe(1);
    expect(engine.getTube(0)).toEqual(['#FF4444', '#3388FF', '#3388FF']);
    expect(engine.getTube(1)).toEqual(['#3388FF', '#3388FF', '#3388FF', '#3388FF']);
  });

  it('supports full multi-step undo history restoration', () => {
    engine.setTubes([
      ['#FF4444', '#3388FF'],
      ['#3388FF'],
      []
    ]);

    expect(engine.canUndo()).toBe(false);

    // Pour 1: tube 0 -> tube 1
    engine.pour(0, 1);
    expect(engine.getTube(0)).toEqual(['#FF4444']);
    expect(engine.getTube(1)).toEqual(['#3388FF', '#3388FF']);
    expect(engine.canUndo()).toBe(true);
    expect(engine.getUndoCount()).toBe(1);

    // Pour 2: tube 0 -> tube 2
    engine.pour(0, 2);
    expect(engine.getTube(0)).toEqual([]);
    expect(engine.getTube(2)).toEqual(['#FF4444']);
    expect(engine.getUndoCount()).toBe(2);

    // Undo pour 2
    const undoneMove1 = engine.undo();
    expect(undoneMove1?.fromIndex).toBe(0);
    expect(undoneMove1?.toIndex).toBe(2);
    expect(engine.getTube(0)).toEqual(['#FF4444']);
    expect(engine.getTube(2)).toEqual([]);

    // Undo pour 1
    const undoneMove2 = engine.undo();
    expect(undoneMove2?.fromIndex).toBe(0);
    expect(undoneMove2?.toIndex).toBe(1);
    expect(engine.getTube(0)).toEqual(['#FF4444', '#3388FF']);
    expect(engine.getTube(1)).toEqual(['#3388FF']);
    expect(engine.canUndo()).toBe(false);
  });

  it('evaluates win condition correctly', () => {
    // Unfinished state
    engine.setTubes([
      ['#FF4444', '#FF4444', '#FF4444', '#3388FF'],
      ['#3388FF', '#3388FF', '#3388FF', '#FF4444'],
      []
    ]);
    expect(engine.isSolved()).toBe(false);

    // Solved state: 4 of each color in full tubes, empty tube empty
    engine.setTubes([
      ['#FF4444', '#FF4444', '#FF4444', '#FF4444'],
      ['#3388FF', '#3388FF', '#3388FF', '#3388FF'],
      []
    ]);
    expect(engine.isSolved()).toBe(true);

    // Incomplete tube (e.g. 3 of a color) is not solved
    engine.setTubes([
      ['#FF4444', '#FF4444', '#FF4444'],
      ['#3388FF', '#3388FF', '#3388FF', '#3388FF'],
      ['#FF4444']
    ]);
    expect(engine.isSolved()).toBe(false);
  });

  it('resets undo stack when resetting or loading new tube layout', () => {
    engine.setTubes([
      ['#FF4444', '#3388FF'],
      ['#3388FF'],
      []
    ]);
    engine.pour(0, 1);
    expect(engine.getUndoCount()).toBe(1);

    engine.restart();
    expect(engine.getUndoCount()).toBe(0);
    expect(engine.getTube(0)).toEqual(['#FF4444', '#3388FF']);
    expect(engine.getTube(1)).toEqual(['#3388FF']);
  });
});

describe('LevelGenerator Solvable Levels', () => {
  let generator: LevelGenerator;

  beforeEach(() => {
    generator = new LevelGenerator();
  });

  it('generates scaled configs with 2 buffer tubes', () => {
    const lvl1 = generator.generateLevel(1);
    expect(lvl1.tubes.length).toBe(3); // 1 color + 2 empty or 2 colors (min 3 tubes)
    expect(lvl1.colorsCount).toBeGreaterThanOrEqual(1);

    const lvl5 = generator.generateLevel(5);
    expect(lvl5.tubes.length).toBe(6); // 4 colors + 2 empty
    expect(lvl5.colorsCount).toBe(4);

    const lvl20 = generator.generateLevel(20);
    expect(lvl20.tubes.length).toBe(10); // 8 colors + 2 empty
    expect(lvl20.colorsCount).toBe(8);
  });

  it('produces valid tube configurations without exceeding capacity', () => {
    for (let l = 1; l <= 10; l++) {
      const level = generator.generateLevel(l);
      const totalCapacity = level.tubes.length * 4;
      let totalUnits = 0;
      for (const tube of level.tubes) {
        expect(tube.length).toBeLessThanOrEqual(4);
        totalUnits += tube.length;
      }
      expect(totalUnits).toBe(level.colorsCount * 4);
    }
  });

  it('generates non-solved initial state with empty tubes ready for play', () => {
    const level = generator.generateLevel(4);
    const engine = new WaterSortEngine(4);
    engine.setTubes(level.tubes);
    expect(engine.isSolved()).toBe(false);

    // Should have empty buffer tubes to allow pouring
    const emptyTubes = level.tubes.filter(t => t.length === 0);
    expect(emptyTubes.length).toBeGreaterThanOrEqual(1);
  });
});

describe('LiquidAudio Procedural Audio Synthesizer', () => {
  let audio: LiquidAudio;

  beforeEach(() => {
    audio = new LiquidAudio();
  });

  it('initializes and manages muted state safely', () => {
    expect(audio.isMuted()).toBe(false);
    audio.setMuted(true);
    expect(audio.isMuted()).toBe(true);
  });

  it('triggers audio events without throwing in headless mock environment', () => {
    expect(() => {
      audio.playTubeSelect();
      audio.playGlug(0, 4);
      audio.playGlug(3, 4);
      audio.playPourStream();
      audio.playWinChimes();
      audio.stop();
    }).not.toThrow();
  });
});
