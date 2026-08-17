import { describe, it, expect } from 'vitest';
import { ParticleSystem } from '../src/Particles.js';

describe('ParticleSystem', () => {
  it('emits rocket flame particles with downward velocity and short life', () => {
    const ps = new ParticleSystem();
    ps.emitRocketFlame(100, 200, 5);

    expect(ps.particles.length).toBe(5);
    for (const p of ps.particles) {
      expect(p.vy).toBeGreaterThanOrEqual(200);
      expect(p.vy).toBeLessThanOrEqual(450);
      expect(p.vx).toBeGreaterThanOrEqual(-30);
      expect(p.vx).toBeLessThanOrEqual(30);
      expect(p.life).toBeGreaterThanOrEqual(0.15);
      expect(p.life).toBeLessThanOrEqual(0.3);
    }
  });

  it('emits jump dust puffs spreading laterally', () => {
    const ps = new ParticleSystem();
    ps.emitJumpDust(100, 200, 8);

    expect(ps.particles.length).toBe(8);
    for (const p of ps.particles) {
      expect(p.color).toBe('#dfe6e9');
      expect(p.life).toBeGreaterThanOrEqual(0.25);
    }
  });

  it('emits spring sparks glowing upward', () => {
    const ps = new ParticleSystem();
    ps.emitSpringSparks(100, 200, 14);

    expect(ps.particles.length).toBe(14);
    for (const p of ps.particles) {
      expect(p.color).toBe('#ffeaa7');
      expect(p.vy).toBeLessThan(0); // Upward
    }
  });

  it('emits fragile crumble with gravity and debris properties', () => {
    const ps = new ParticleSystem();
    ps.emitFragileCrumble(100, 200, 80, 12);

    expect(ps.particles.length).toBe(12);
    for (const p of ps.particles) {
      expect(p.gravity).toBe(400);
      expect(p.color).toBe('#74b9ff');
    }
  });

  it('emits radial explosion particles and balloon pops', () => {
    const ps = new ParticleSystem();
    ps.emitExplosion(100, 200, '#ff7675', 16);
    expect(ps.particles.length).toBe(16);

    ps.emitBalloonPop(100, 200, 10);
    expect(ps.particles.length).toBe(26);
  });

  it('updates particle kinematics, applies gravity, ticks life down, and prunes dead particles', () => {
    const ps = new ParticleSystem();
    ps.emitRocketFlame(100, 200, 5);

    const initialY = ps.particles[0].y;
    ps.update(0.1);

    expect(ps.particles[0].y).toBeGreaterThan(initialY);

    // Advance past max life (0.3s)
    ps.update(0.5);
    expect(ps.particles.length).toBe(0);
  });

  it('caps particles at max limit (250)', () => {
    const ps = new ParticleSystem();
    for (let i = 0; i < 30; i++) {
      ps.emitExplosion(100, 200, '#ff7675', 20);
    }

    expect(ps.particles.length).toBeLessThanOrEqual(250);
  });

  it('clears particles on reset', () => {
    const ps = new ParticleSystem();
    ps.emitJumpDust(100, 200, 8);
    expect(ps.particles.length).toBe(8);

    ps.clear();
    expect(ps.particles.length).toBe(0);
  });
});
