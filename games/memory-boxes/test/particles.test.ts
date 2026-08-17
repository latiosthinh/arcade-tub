import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../src/Particles.js';

describe('ParticleSystem', () => {
  let system: ParticleSystem;

  beforeEach(() => {
    system = new ParticleSystem();
  });

  it('emits particles within limit and sets properties', () => {
    system.emit(100, 100, 10, '#00f0ff', 150, 4, 0.5);
    expect(system.particles.length).toBe(10);
    expect(system.particles[0]?.x).toBe(100);
    expect(system.particles[0]?.y).toBe(100);
    expect(system.particles[0]?.color).toBe('#00f0ff');
    expect(system.particles[0]?.size).toBe(4);
    expect(system.particles[0]?.maxLife).toBe(0.5);
  });

  it('emits shockwave rings', () => {
    system.emitRing(200, 200, 50, '#ec4899', 0.6);
    expect(system.rings.length).toBe(1);
    expect(system.rings[0]?.x).toBe(200);
    expect(system.rings[0]?.y).toBe(200);
    expect(system.rings[0]?.maxRadius).toBe(50);
    expect(system.rings[0]?.color).toBe('#ec4899');
  });

  it('updates particles and rings with decay and removes expired', () => {
    system.emit(100, 100, 5, '#00f0ff', 100, 3, 0.2);
    system.emitRing(100, 100, 40, '#00f0ff', 0.2);

    expect(system.particles.length).toBe(5);
    expect(system.rings.length).toBe(1);

    system.update(0.1);
    expect(system.particles.length).toBe(5);
    expect(system.rings.length).toBe(1);

    system.update(0.15); // Exceeds 0.2s life
    expect(system.particles.length).toBe(0);
    expect(system.rings.length).toBe(0);
  });

  it('clears all particles and rings', () => {
    system.emit(100, 100, 10, '#00f0ff');
    system.emitRing(100, 100, 50, '#00f0ff');
    system.clear();

    expect(system.particles.length).toBe(0);
    expect(system.rings.length).toBe(0);
  });
});
