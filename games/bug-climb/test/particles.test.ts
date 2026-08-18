import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../src/Particles';

describe('ParticleSystem', () => {
  let particles: ParticleSystem;

  beforeEach(() => {
    particles = new ParticleSystem(100);
  });

  it('initializes with empty particle list', () => {
    expect(particles.particles.length).toBe(0);
    expect(particles.maxParticles).toBe(100);
  });

  it('emits wood chip burst particles', () => {
    particles.emitWoodChips(100, 200, 'LEFT', 12);
    expect(particles.particles.length).toBe(12);
    const p = particles.particles[0];
    expect(p.x).toBe(100);
    expect(p.y).toBe(200);
    expect(p.life).toBeGreaterThan(0);
  });

  it('emits leaf debris particles', () => {
    particles.emitLeaves(150, 250, 8);
    expect(particles.particles.length).toBe(8);
  });

  it('emits streak combo sparkles', () => {
    particles.emitStreakSparkles(200, 300, 10);
    expect(particles.particles.length).toBe(10);
  });

  it('emits crash burst particles', () => {
    particles.emitCrashBurst(240, 500);
    expect(particles.particles.length).toBeGreaterThanOrEqual(20);
  });

  it('updates particle physics, drag, alpha fade, and culls dead particles', () => {
    particles.emitWoodChips(100, 200, 'RIGHT', 5);
    expect(particles.particles.length).toBe(5);

    // Partial update
    particles.update(0.1);
    expect(particles.particles.length).toBe(5);
    expect(particles.particles[0].alpha).toBeLessThan(1.0);

    // Large update to expire all particles
    particles.update(2.0);
    expect(particles.particles.length).toBe(0);
  });

  it('resets particle pool', () => {
    particles.emitCrashBurst(240, 500);
    expect(particles.particles.length).toBeGreaterThan(0);
    particles.reset();
    expect(particles.particles.length).toBe(0);
  });
});
