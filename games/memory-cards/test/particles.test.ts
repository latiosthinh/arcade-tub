import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../src/Particles.js';

describe('ParticleSystem', () => {
  let ps: ParticleSystem;

  beforeEach(() => {
    ps = new ParticleSystem();
  });

  it('initializes with empty particle list and max limit of 200', () => {
    expect(ps.particles.length).toBe(0);
    expect(ps.maxParticles).toBe(200);
  });

  it('emits specified number of particles with properties', () => {
    ps.emit(100, 150, 15, '#00ffff', 120, 4, 0.6);
    expect(ps.particles.length).toBe(15);
    for (const p of ps.particles) {
      expect(p.x).toBe(100);
      expect(p.y).toBe(150);
      expect(p.color).toBe('#00ffff');
      expect(p.size).toBe(4);
      expect(p.life).toBe(0.6);
      expect(p.maxLife).toBe(0.6);
    }
  });

  it('caps particle count at maxParticles limit', () => {
    ps.emit(0, 0, 250, '#ff00ff');
    expect(ps.particles.length).toBe(200);
  });

  it('updates particle positions and decays life', () => {
    ps.emit(50, 50, 5, '#ffd700', 100, 2, 0.4);
    ps.update(0.1);

    expect(ps.particles.length).toBe(5);
    for (const p of ps.particles) {
      expect(p.life).toBeCloseTo(0.3, 4);
    }

    // Decay past maxLife
    ps.update(0.5);
    expect(ps.particles.length).toBe(0);
  });

  it('clears all particles on clear()', () => {
    ps.emit(0, 0, 20, '#00ffcc');
    expect(ps.particles.length).toBe(20);
    ps.clear();
    expect(ps.particles.length).toBe(0);
  });
});
