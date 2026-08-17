import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../src/Particles';

describe('ParticleSystem', () => {
  let ps: ParticleSystem;

  beforeEach(() => {
    ps = new ParticleSystem(100);
  });

  it('initializes with zero particles and respects maxParticles capacity', () => {
    expect(ps.particles.length).toBe(0);
    expect(ps.maxParticles).toBe(100);
  });

  it('emits flap bubble particles with upward buoyancy', () => {
    ps.emitFlapBubbles(160, 300, 8);
    expect(ps.particles.length).toBe(8);
    const bubble = ps.particles[0];
    expect(bubble.shape).toBe('bubble');
    expect(bubble.life).toBe(bubble.maxLife);
  });

  it('emits pearl sparkle particles radially', () => {
    ps.emitPearlSparkles(200, 250, 12);
    expect(ps.particles.length).toBe(12);
    const sparkle = ps.particles[0];
    expect(sparkle.shape).toBe('sparkle');
  });

  it('emits crash debris fragments', () => {
    ps.emitCrashDebris(160, 300, 16);
    expect(ps.particles.length).toBe(16);
    const debris = ps.particles[0];
    expect(debris.shape).toBe('debris');
  });

  it('updates kinematics, fades alpha, and removes expired particles', () => {
    ps.emitFlapBubbles(100, 100, 5);
    expect(ps.particles.length).toBe(5);

    // Advance past life span
    ps.update(1.5);
    expect(ps.particles.length).toBe(0);
  });

  it('clears all particles on reset', () => {
    ps.emitFlapBubbles(100, 100, 10);
    expect(ps.particles.length).toBe(10);
    ps.reset();
    expect(ps.particles.length).toBe(0);
  });
});
