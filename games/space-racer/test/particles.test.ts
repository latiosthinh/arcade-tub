import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../src/Particles';

describe('ParticleSystem', () => {
  let particles: ParticleSystem;

  beforeEach(() => {
    particles = new ParticleSystem(100);
  });

  it('initializes with empty particle list', () => {
    expect(particles.getCount()).toBe(0);
  });

  it('emits thruster trail particles', () => {
    particles.emitThruster(400, 520, 0);
    expect(particles.getCount()).toBeGreaterThan(0);
  });

  it('emits explosion debris particles', () => {
    particles.emitExplosion(400, 300);
    expect(particles.getCount()).toBeGreaterThan(5);
  });

  it('emits near-miss shockwave particles', () => {
    particles.emitNearMiss(400, 400);
    expect(particles.getCount()).toBeGreaterThan(0);
  });

  it('updates and decays particle lifespans, cleaning up dead particles', () => {
    particles.emitExplosion(400, 300);
    const countBefore = particles.getCount();
    particles.update(2.0); // 2 seconds exceeds particle life
    expect(particles.getCount()).toBeLessThan(countBefore);
    expect(particles.getCount()).toBe(0);
  });

  it('enforces maximum particle count cap', () => {
    for (let i = 0; i < 50; i++) {
      particles.emitExplosion(400, 300);
    }
    expect(particles.getCount()).toBeLessThanOrEqual(100);
  });
});
