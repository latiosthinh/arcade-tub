import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../src/Particles';

describe('ParticleSystem', () => {
  let ps: ParticleSystem;

  beforeEach(() => {
    ps = new ParticleSystem(100);
  });

  it('emits confetti particles with velocity and lifespan', () => {
    ps.emitConfetti(100, 200, '#00f0ff', 12);
    // 12 shards + 1 ring shockwave = 13
    expect(ps.getParticleCount()).toBe(13);

    ps.update(0.1);
    expect(ps.getParticleCount()).toBe(13);
  });

  it('emits explosion particles and shockwaves on bomb blast', () => {
    ps.emitExplosion(150, 250);
    expect(ps.getParticleCount()).toBeGreaterThanOrEqual(15);
  });

  it('expires dead particles over time', () => {
    ps.emitConfetti(100, 200, '#ec4899', 5);
    expect(ps.getParticleCount()).toBe(6);

    // Update beyond particle lifetime (> 1.2s)
    ps.update(2.0);
    expect(ps.getParticleCount()).toBe(0);
  });

  it('caps max particle count to mitigate DoS', () => {
    const smallPs = new ParticleSystem(20);
    smallPs.emitConfetti(100, 100, '#ffffff', 50);
    expect(smallPs.getParticleCount()).toBeLessThanOrEqual(20);
  });
});
