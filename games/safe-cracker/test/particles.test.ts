import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../src/Particles.js';

describe('ParticleSystem', () => {
  let ps: ParticleSystem;

  beforeEach(() => {
    ps = new ParticleSystem();
  });

  it('emit creates specified number of active particles with bounded capacity', () => {
    ps.emit(400, 300, 20, '#ffd32a', 100, 4, 0.6);
    expect(ps.particles.length).toBe(20);

    const p = ps.particles[0];
    expect(p.x).toBe(400);
    expect(p.y).toBe(300);
    expect(p.color).toBe('#ffd32a');
    expect(p.size).toBe(4);
    expect(p.life).toBe(0.6);
    expect(p.maxLife).toBe(0.6);

    // Test max cap (200)
    for (let i = 0; i < 15; i++) {
      ps.emit(400, 300, 20, '#ffffff');
    }
    expect(ps.particles.length).toBeLessThanOrEqual(200);
  });

  it('update moves particles and decays lifetime', () => {
    ps.emit(100, 100, 10, '#00d2d3', 100, 3, 1.0);
    const initialLife = ps.particles[0].life;

    ps.update(0.1);
    expect(ps.particles[0].life).toBeCloseTo(initialLife - 0.1, 5);
  });

  it('update purges dead particles', () => {
    ps.emit(100, 100, 5, '#ff3838', 100, 3, 0.2);
    expect(ps.particles.length).toBe(5);

    ps.update(0.1);
    expect(ps.particles.length).toBe(5);

    ps.update(0.15); // Total 0.25s > 0.2s maxLife
    expect(ps.particles.length).toBe(0);
  });

  it('clear removes all particles', () => {
    ps.emit(100, 100, 10, '#ff3838');
    expect(ps.particles.length).toBe(10);
    ps.clear();
    expect(ps.particles.length).toBe(0);
  });
});
