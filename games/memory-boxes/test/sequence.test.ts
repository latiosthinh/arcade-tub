import { describe, it, expect } from 'vitest';
import { SequenceGenerator } from '../src/SequenceGenerator.js';

describe('SequenceGenerator', () => {
  it('initializes with default box count 9 and initial length 3', () => {
    const gen = new SequenceGenerator();
    expect(gen.currentLength).toBe(3);
    expect(gen.sequence.length).toBe(3);
    for (const step of gen.sequence) {
      expect(step).toBeGreaterThanOrEqual(0);
      expect(step).toBeLessThan(9);
    }
  });

  it('allows custom box count and initial length', () => {
    const gen = new SequenceGenerator(16, 5);
    expect(gen.currentLength).toBe(5);
    expect(gen.sequence.length).toBe(5);
    for (const step of gen.sequence) {
      expect(step).toBeGreaterThanOrEqual(0);
      expect(step).toBeLessThan(16);
    }
  });

  it('generates a new sequence of configured length', () => {
    const gen = new SequenceGenerator(9, 4);
    const seq1 = [...gen.sequence];
    const seq2 = gen.generateNew();
    expect(seq2.length).toBe(4);
    expect(gen.sequence).toEqual(seq2);
  });

  it('advances sequence by adding one step within bounds', () => {
    const gen = new SequenceGenerator(9, 3);
    const initial = [...gen.sequence];
    const nextStep = gen.advance();
    expect(gen.currentLength).toBe(4);
    expect(gen.sequence.length).toBe(4);
    expect(gen.sequence.slice(0, 3)).toEqual(initial);
    expect(gen.sequence[3]).toBe(nextStep);
    expect(nextStep).toBeGreaterThanOrEqual(0);
    expect(nextStep).toBeLessThan(9);
  });

  it('resets sequence to initial length', () => {
    const gen = new SequenceGenerator(9, 3);
    gen.advance();
    gen.advance();
    expect(gen.currentLength).toBe(5);

    gen.reset();
    expect(gen.currentLength).toBe(3);
    expect(gen.sequence.length).toBe(3);

    gen.reset(2);
    expect(gen.currentLength).toBe(2);
    expect(gen.sequence.length).toBe(2);
  });

  it('handles custom random function for deterministic test sequences', () => {
    let callIndex = 0;
    const fakeRng = () => {
      const vals = [0.1, 0.5, 0.8]; // With 9 boxes -> floor(0.9)=0, floor(4.5)=4, floor(7.2)=7
      const val = vals[callIndex % vals.length];
      callIndex++;
      return val;
    };

    const gen = new SequenceGenerator(9, 3, fakeRng);
    expect(gen.sequence).toEqual([0, 4, 7]);
  });
});
