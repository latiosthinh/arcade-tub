import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../src/Particles.js';

describe('Car Race ParticleSystem', () => {
  let particles: ParticleSystem;

  beforeEach(() => {
    particles = new ParticleSystem();
  });

  it('initializes empty and allows emitting draft stream particles', () => {
    particles.emitDraftStreamlines(400, 480);
    expect(particles.particles.length).toBeGreaterThan(0);
  });

  it('emits crash explosion particles', () => {
    particles.emitCrashExplosion(400, 300);
    expect(particles.particles.length).toBeGreaterThan(15);
  });

  it('updates particles and removes dead particles over time', () => {
    particles.emitDraftStreamlines(400, 480);
    const count = particles.particles.length;
    expect(count).toBeGreaterThan(0);

    particles.update(2.0); // Advance past particle life
    expect(particles.particles.length).toBe(0);
  });

  it('clears particles on reset', () => {
    particles.emitCrashExplosion(400, 300);
    expect(particles.particles.length).toBeGreaterThan(0);

    particles.reset();
    expect(particles.particles.length).toBe(0);
  });
});
