import { describe, it, expect } from 'vitest';
import { ParticleSystem } from '../src/Particles.js';

describe('ParticleSystem', () => {
  it('emits explosion particles within bounds', () => {
    const ps = new ParticleSystem();
    ps.emitExplosion(100, 200, 24);
    expect(ps.particles.length).toBe(24);
    expect(ps.particles[0].x).toBe(100);
    expect(ps.particles[0].y).toBe(200);
    expect(ps.particles[0].life).toBeGreaterThan(0);
  });

  it('emits crate landing wood dust particles', () => {
    const ps = new ParticleSystem();
    ps.emitCrateLand(200, 300, 40, 8);
    expect(ps.particles.length).toBe(8);
  });

  it('emits electric sparks and golden sparkles', () => {
    const ps = new ParticleSystem();
    ps.emitSparks(150, 250, 12);
    expect(ps.particles.length).toBe(12);

    ps.emitGoldenSparkle(150, 250, 10);
    expect(ps.particles.length).toBe(22);
  });

  it('emits steam puffs with gentle rise', () => {
    const ps = new ParticleSystem();
    ps.emitSteam(300, 400, 4);
    expect(ps.particles.length).toBe(4);
    expect(ps.particles[0].vy).toBeLessThan(0);
    expect(ps.particles[0].isSmoke).toBe(true);
  });

  it('adds and updates floating score texts', () => {
    const ps = new ParticleSystem();
    ps.addFloatingText('+500 (3x)', 350, 500, '#ffd32a', 24);
    expect(ps.floatingTexts.length).toBe(1);
    expect(ps.floatingTexts[0].text).toBe('+500 (3x)');
    expect(ps.floatingTexts[0].y).toBe(500);

    ps.update(0.1);
    expect(ps.floatingTexts[0].y).toBeLessThan(500);
    expect(ps.floatingTexts[0].life).toBeLessThan(1.2);
  });

  it('updates kinematics, decays life, and removes dead particles', () => {
    const ps = new ParticleSystem();
    ps.emitExplosion(100, 100, 10);
    expect(ps.particles.length).toBe(10);

    // After large dt, all particles should expire
    ps.update(1.5);
    expect(ps.particles.length).toBe(0);
  });

  it('enforces maximum particle pool limit', () => {
    const ps = new ParticleSystem();
    ps.maxParticles = 50;
    for (let i = 0; i < 5; i++) {
      ps.emitExplosion(100, 100, 20);
    }
    expect(ps.particles.length).toBeLessThanOrEqual(50);
  });

  it('clears all particles and floating texts', () => {
    const ps = new ParticleSystem();
    ps.emitExplosion(100, 100, 10);
    ps.addFloatingText('TEST', 100, 100);
    expect(ps.particles.length).toBe(10);
    expect(ps.floatingTexts.length).toBe(1);

    ps.clear();
    expect(ps.particles.length).toBe(0);
    expect(ps.floatingTexts.length).toBe(0);
  });
});
