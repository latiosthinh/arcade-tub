import { describe, it, expect } from 'vitest';
import { ParticleSystem } from '../src/Particles';

describe('ParticleSystem', () => {
  it('initializes with empty particles list and max bound', () => {
    const ps = new ParticleSystem(100);
    expect(ps.particles.length).toBe(0);
    expect(ps.maxParticles).toBe(100);
  });

  it('emits merge sparkles and rings respecting capacity', () => {
    const ps = new ParticleSystem(20);
    ps.emitMergeSparkles(100, 100, '#00f0ff', 15);
    expect(ps.particles.length).toBe(16); // 15 sparkles + 1 ring

    // Emit more to exceed capacity
    ps.emitMergeSparkles(100, 100, '#00ffa3', 10);
    expect(ps.particles.length).toBe(20); // capped at 20
  });

  it('emits win confetti across width', () => {
    const ps = new ParticleSystem(50);
    ps.emitWinConfetti(400, 600, 25);
    expect(ps.particles.length).toBe(25);
    expect(ps.particles[0].shape).toBe('confetti');
  });

  it('updates kinematics and decays lifespan to culled state', () => {
    const ps = new ParticleSystem(100);
    ps.emitMergeSparkles(100, 100, '#ff0055', 5);

    const initialCount = ps.particles.length;
    expect(initialCount).toBeGreaterThan(0);

    // Update with delta time
    ps.update(0.1);
    expect(ps.particles[0].alpha).toBeLessThan(1.0);

    // Advance past max life
    ps.update(2.0);
    expect(ps.particles.length).toBe(0);
  });

  it('resets particle list', () => {
    const ps = new ParticleSystem(100);
    ps.emitMergeSparkles(100, 100, '#ffffff', 10);
    expect(ps.particles.length).toBeGreaterThan(0);
    ps.reset();
    expect(ps.particles.length).toBe(0);
  });
});
