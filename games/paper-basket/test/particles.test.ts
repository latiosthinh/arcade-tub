import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../src/Particles';

describe('ParticleSystem', () => {
  let system: ParticleSystem;

  beforeEach(() => {
    system = new ParticleSystem(100);
  });

  it('emits paper confetti particles', () => {
    system.emitConfetti(200, 300, 15);
    expect(system.particles.length).toBe(15);
    const p = system.particles[0];
    expect(p?.x).toBe(200);
    expect(p?.y).toBe(300);
    expect(p?.alpha).toBe(1.0);
  });

  it('updates particles physics and culls dead ones', () => {
    system.emitConfetti(200, 300, 5);
    system.update(0.1);
    expect(system.particles[0]?.y).not.toBe(300);

    // Force decay
    system.update(2.0);
    expect(system.particles.length).toBe(0);
  });

  it('resets particles', () => {
    system.emitConfetti(200, 300, 10);
    expect(system.particles.length).toBe(10);
    system.reset();
    expect(system.particles.length).toBe(0);
  });
});
