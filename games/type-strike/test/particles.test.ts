import { describe, it, expect } from 'vitest';
import { ParticleSystem } from '../src/Particles.js';

describe('ParticleSystem', () => {
  it('fireLaserBeam() creates an active laser beam with decay timer', () => {
    const ps = new ParticleSystem();
    ps.fireLaserBeam(60, 260, 400, 300, '#00ffcc', 3);

    expect(ps.laserBeams.length).toBe(1);
    const beam = ps.laserBeams[0]!;
    expect(beam.x1).toBe(60);
    expect(beam.y1).toBe(260);
    expect(beam.x2).toBe(400);
    expect(beam.y2).toBe(300);
    expect(beam.life).toBe(0.15);

    ps.update(0.1);
    expect(ps.laserBeams.length).toBe(1);

    ps.update(0.1);
    expect(ps.laserBeams.length).toBe(0);
  });

  it('emitExplosion() spawns radial neon explosion particles', () => {
    const ps = new ParticleSystem();
    ps.emitExplosion(200, 150, 20);

    expect(ps.particles.length).toBe(20);
    const p = ps.particles[0]!;
    expect(p.x).toBe(200);
    expect(p.y).toBe(150);
    expect(p.life).toBeGreaterThan(0);

    ps.update(0.8);
    expect(ps.particles.length).toBe(0);
  });

  it('emitLaserHitSparks() spawns deflection spark particles', () => {
    const ps = new ParticleSystem();
    ps.emitLaserHitSparks(300, 200, 10);

    expect(ps.particles.length).toBe(10);
    ps.update(0.4);
    expect(ps.particles.length).toBe(0);
  });

  it('emitShieldBreachWave() spawns alarm warning particles', () => {
    const ps = new ParticleSystem();
    ps.emitShieldBreachWave(60, 260, 30);

    expect(ps.particles.length).toBe(30);
    ps.update(0.9);
    expect(ps.particles.length).toBe(0);
  });

  it('addFloatingText() spawns rising text with alpha fade out', () => {
    const ps = new ParticleSystem();
    ps.addFloatingText('+500 (2x)', 100, 200, '#ffeaa7', 22);

    expect(ps.floatingTexts.length).toBe(1);
    const ft = ps.floatingTexts[0]!;
    expect(ft.text).toBe('+500 (2x)');
    expect(ft.y).toBe(200);

    ps.update(0.5);
    expect(ft.y).toBeLessThan(200);
    expect(ps.floatingTexts.length).toBe(1);

    ps.update(1.0);
    expect(ps.floatingTexts.length).toBe(0);
  });

  it('bounds particle pool to maxParticles (300)', () => {
    const ps = new ParticleSystem();
    for (let i = 0; i < 20; i++) {
      ps.emitExplosion(100, 100, 30);
    }
    expect(ps.particles.length).toBeLessThanOrEqual(300);
  });

  it('clear() empties all active entities', () => {
    const ps = new ParticleSystem();
    ps.fireLaserBeam(0, 0, 100, 100);
    ps.emitExplosion(100, 100, 10);
    ps.addFloatingText('TEST', 10, 10);

    expect(ps.laserBeams.length).toBe(1);
    expect(ps.particles.length).toBe(10);
    expect(ps.floatingTexts.length).toBe(1);

    ps.clear();
    expect(ps.laserBeams.length).toBe(0);
    expect(ps.particles.length).toBe(0);
    expect(ps.floatingTexts.length).toBe(0);
  });
});
