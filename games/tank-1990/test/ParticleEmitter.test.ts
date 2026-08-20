import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ParticleEmitter, MAX_PARTICLES } from '../src/ParticleEmitter';
import { Particle } from '../src/types';

describe('ParticleEmitter Unit Tests', () => {
  let emitter: ParticleEmitter;

  beforeEach(() => {
    emitter = new ParticleEmitter();
  });

  describe('1. Particle Spawning & Presets', () => {
    it('spawns multicolored confetti particles on small explosion', () => {
      emitter.emitExplosion(100, 100, false);
      expect(emitter.particles.length).toBe(20);

      const p = emitter.particles[0];
      expect(p.type).toBe('CONFETTI');
      expect(p.x).toBe(100);
      expect(p.y).toBe(100);
      expect(p.alpha).toBe(1.0);
      expect(p.life).toBeGreaterThan(0);
      expect(p.maxLife).toBe(p.life);
      expect(p.drag).toBe(0.92);
      expect(p.gravity).toBe(120);
    });

    it('spawns higher count and faster confetti on big explosion', () => {
      emitter.emitExplosion(200, 200, true);
      expect(emitter.particles.length).toBe(35);

      emitter.particles.forEach((p) => {
        expect(p.type).toBe('CONFETTI');
        expect(p.width).toBeGreaterThanOrEqual(4);
      });
    });

    it('spawns terracotta brick debris with upward kick and heavy gravity', () => {
      emitter.emitBrickDebris(50, 50, 10);
      expect(emitter.particles.length).toBe(10);

      const p = emitter.particles[0];
      expect(p.type).toBe('DEBRIS');
      expect(p.gravity).toBe(260);
      expect(p.drag).toBe(0.95);
      expect(p.life).toBeLessThanOrEqual(0.65);
    });

    it('spawns high-velocity spark streaks with short lifetimes', () => {
      emitter.emitSparks(80, 80, 8);
      expect(emitter.particles.length).toBe(8);

      const p = emitter.particles[0];
      expect(p.type).toBe('SPARK');
      expect(p.width).toBe(p.size * 2);
      expect(p.life).toBeLessThanOrEqual(0.25);
    });

    it('spawns soft tread dust puffs with slight upward float', () => {
      emitter.emitTreadDust(120, 120);
      expect(emitter.particles.length).toBe(1);

      const p = emitter.particles[0];
      expect(p.type).toBe('DUST');
      expect(p.gravity).toBe(-10);
      expect(p.alpha).toBe(0.6);
      expect(p.color).toBe('#a0937d');
    });
  });

  describe('2. Kinematics Simulation & Lifetime Decaying', () => {
    it('updates position based on velocity, drag, and gravity', () => {
      const customParticle: Particle = {
        x: 0,
        y: 0,
        vx: 100,
        vy: 50,
        size: 4,
        width: 4,
        height: 4,
        rotation: 0,
        vRot: 2,
        color: '#ff0000',
        alpha: 1.0,
        life: 1.0,
        maxLife: 1.0,
        type: 'CONFETTI',
        gravity: 200,
        drag: 0.9,
      };

      emitter.emit(customParticle);
      emitter.update(0.1);

      expect(emitter.particles.length).toBe(1);
      const updated = emitter.particles[0];

      expect(updated.x).toBeGreaterThan(0);
      expect(updated.y).toBeGreaterThan(0);
      expect(updated.rotation).toBeCloseTo(0.2, 2);
      expect(updated.life).toBeCloseTo(0.9, 2);
      expect(updated.alpha).toBeCloseTo(0.9, 2);
    });

    it('removes particles automatically when lifetime expires', () => {
      const shortLived: Particle = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        width: 2,
        height: 2,
        rotation: 0,
        vRot: 0,
        color: '#fff',
        alpha: 1.0,
        life: 0.05,
        maxLife: 0.05,
        type: 'SPARK',
      };

      emitter.emit(shortLived);
      expect(emitter.particles.length).toBe(1);

      emitter.update(0.1); // Exceeds 0.05s
      expect(emitter.particles.length).toBe(0);
    });

    it('no-ops on zero or negative delta time', () => {
      emitter.emitExplosion(0, 0, false);
      const initialLife = emitter.particles[0].life;

      emitter.update(0);
      emitter.update(-0.1);

      expect(emitter.particles[0].life).toBe(initialLife);
    });
  });

  describe('3. Max Capacity Capping & Clearing', () => {
    it('recycles oldest particles when exceeding maxParticles cap', () => {
      const capEmitter = new ParticleEmitter(10);

      for (let i = 0; i < 15; i++) {
        capEmitter.emit({
          x: i,
          y: i,
          vx: 0,
          vy: 0,
          size: 2,
          width: 2,
          height: 2,
          rotation: 0,
          vRot: 0,
          color: '#fff',
          alpha: 1.0,
          life: 1.0,
          maxLife: 1.0,
          type: 'DUST',
        });
      }

      expect(capEmitter.particles.length).toBe(10);
      // Oldest particles 0..4 dropped, first element should have x: 5
      expect(capEmitter.particles[0].x).toBe(5);
      expect(capEmitter.particles[9].x).toBe(14);
    });

    it('clears all particles immediately via clear()', () => {
      emitter.emitExplosion(100, 100, true);
      expect(emitter.particles.length).toBe(35);

      emitter.clear();
      expect(emitter.particles.length).toBe(0);
    });
  });

  describe('4. Mock Canvas Rendering', () => {
    it('executes canvas rendering commands across all particle types without errors', () => {
      emitter.emitExplosion(50, 50, false); // CONFETTI
      emitter.emitBrickDebris(50, 50, 2); // DEBRIS
      emitter.emitSparks(50, 50, 2); // SPARK
      emitter.emitTreadDust(50, 50); // DUST

      const mockCtx = {
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        beginPath: vi.fn(),
        ellipse: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        globalAlpha: 1.0,
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1.0,
      } as unknown as CanvasRenderingContext2D;

      expect(() => emitter.render(mockCtx)).not.toThrow();
      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalled();
    });
  });
});
