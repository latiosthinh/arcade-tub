import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../src/Particles';

describe('ParticleSystem', () => {
  let ps: ParticleSystem;

  beforeEach(() => {
    ps = new ParticleSystem();
  });

  it('emits shatter debris particles with velocity, rotation, and debris flag', () => {
    ps.emitShatter(100, 200, '#00d2d3', 12);
    expect(ps.particles.length).toBe(12);

    const p = ps.particles[0];
    expect(p.x).toBe(100);
    expect(p.y).toBe(200);
    expect(p.color).toBe('#00d2d3');
    expect(p.isDebris).toBe(true);
    expect(typeof p.vRot).toBe('number');
    expect(p.life).toBeGreaterThan(0);
    expect(p.maxLife).toBeGreaterThan(0);
  });

  it('emits sparks radially with high speed', () => {
    ps.emitSparks(150, 250, '#fed330', 10);
    expect(ps.particles.length).toBe(10);

    const p = ps.particles[0];
    expect(p.x).toBe(150);
    expect(p.y).toBe(250);
    expect(p.color).toBe('#fed330');
    expect(p.isDebris).toBe(false);
  });

  it('updates particle positions, applies gravity and rotation to debris, and purges expired particles', () => {
    ps.emitShatter(100, 100, '#ff3838', 5);
    const initialVy = ps.particles[0].vy;
    const initialAngle = ps.particles[0].angle || 0;

    ps.update(0.1);

    expect(ps.particles[0].vy).toBeGreaterThan(initialVy); // Gravity added
    expect(ps.particles[0].angle).not.toBe(initialAngle); // Rotated
    expect(ps.particles[0].life).toBeLessThan(ps.particles[0].maxLife);

    // Fast-forward past particle lifetime
    ps.update(2.0);
    expect(ps.particles.length).toBe(0);
  });

  it('enforces maximum particle count cap (T-03-03 mitigate)', () => {
    for (let i = 0; i < 30; i++) {
      ps.emitShatter(100, 100, '#00d2d3', 20);
    }
    expect(ps.particles.length).toBeLessThanOrEqual(300);
  });

  it('clears all particles', () => {
    ps.emitSparks(50, 50, '#ffffff', 15);
    expect(ps.particles.length).toBe(15);
    ps.clear();
    expect(ps.particles.length).toBe(0);
  });
});
