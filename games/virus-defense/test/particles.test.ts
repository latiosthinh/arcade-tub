import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../src/Particles';

describe('ParticleSystem', () => {
  let ps: ParticleSystem;

  beforeEach(() => {
    ps = new ParticleSystem(100);
  });

  it('initializes with empty particle array', () => {
    expect(ps.particles.length).toBe(0);
  });

  it('creates explosion bursts with capped count', () => {
    ps.burst(400, 300, '#ef4444', 20);
    expect(ps.particles.length).toBe(20);

    const p = ps.particles[0];
    expect(p.color).toBe('#ef4444');
    expect(p.life).toBe(1.0);
    expect(p.maxLife).toBeGreaterThan(0);
  });

  it('creates sparks on impact and sparkles on heal', () => {
    ps.spark(400, 300, '#22d3ee', 10);
    expect(ps.particles.length).toBe(10);

    ps.healSparkles(400, 300, 400, 300, 15);
    expect(ps.particles.length).toBe(25);
  });

  it('updates particles, reduces life, and removes dead particles', () => {
    ps.burst(400, 300, '#10b981', 10);

    // Advance 0.1s
    ps.update(0.1);
    expect(ps.particles.length).toBe(10);
    expect(ps.particles[0].life).toBeLessThan(1.0);

    // Advance beyond maxLife (e.g. 2.0s)
    ps.update(2.0);
    expect(ps.particles.length).toBe(0);
  });

  it('enforces maximum particle ceiling (T-17-04 mitigation)', () => {
    for (let i = 0; i < 15; i++) {
      ps.burst(400, 300, '#8b5cf6', 20);
    }
    expect(ps.particles.length).toBeLessThanOrEqual(100);
  });

  it('clears all particles upon reset', () => {
    ps.burst(400, 300, '#f97316', 15);
    expect(ps.particles.length).toBe(15);
    ps.clear();
    expect(ps.particles.length).toBe(0);
  });
});
