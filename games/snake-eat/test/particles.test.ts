import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../src/Particles';

describe('ParticleSystem', () => {
  let ps: ParticleSystem;

  beforeEach(() => {
    ps = new ParticleSystem(200);
  });

  it('initializes with zero active particles', () => {
    expect(ps.particles.length).toBe(0);
  });

  it('emits food burst particles', () => {
    ps.emitFoodBurst(100, 100, '#ff007f', 12);
    expect(ps.particles.length).toBe(12);
    const p = ps.particles[0];
    expect(p.color).toBe('#ff007f');
    expect(p.life).toBeGreaterThan(0);
  });

  it('emits golden burst particles with golden colors', () => {
    ps.emitGoldenBurst(200, 200, 20);
    expect(ps.particles.length).toBe(20);
    const goldenColors = ['#ffe066', '#ffd700', '#fff3b0'];
    expect(goldenColors).toContain(ps.particles[0].color);
  });

  it('emits crash explosion from snake segments', () => {
    const segments = [
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ];
    ps.emitCrashExplosion(segments, 32);
    expect(ps.particles.length).toBeGreaterThanOrEqual(18);
  });

  it('emits streak sparkles', () => {
    ps.emitStreakSparkles(150, 150, 8);
    expect(ps.particles.length).toBe(8);
  });

  it('updates particle physics, life decay, and removes dead particles', () => {
    ps.emitFoodBurst(100, 100, '#00ffcc', 5);
    const initialX = ps.particles[0].x;

    ps.update(0.1);
    expect(ps.particles.length).toBe(5);
    expect(ps.particles[0].x).not.toBe(initialX);
    expect(ps.particles[0].alpha).toBeLessThan(1.0);

    // Run for large dt to expire all particles
    ps.update(2.0);
    expect(ps.particles.length).toBe(0);
  });

  it('enforces maximum particle pool limit', () => {
    const smallPs = new ParticleSystem(10);
    smallPs.emitFoodBurst(100, 100, '#fff', 20);
    expect(smallPs.particles.length).toBeLessThanOrEqual(10);
  });

  it('resets particle pool', () => {
    ps.emitFoodBurst(100, 100, '#fff', 10);
    expect(ps.particles.length).toBe(10);
    ps.reset();
    expect(ps.particles.length).toBe(0);
  });
});
