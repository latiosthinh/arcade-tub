import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleEmitter } from '../src/ParticleEmitter';
import { KirbyRenderer } from '../src/KirbyRenderer';
import { KirbyAudio } from '../src/KirbyAudio';

describe('Papercraft Visuals & Procedural Audio', () => {
  let particles: ParticleEmitter;
  let renderer: KirbyRenderer;
  let audio: KirbyAudio;

  beforeEach(() => {
    particles = new ParticleEmitter();
    renderer = new KirbyRenderer();
    audio = new KirbyAudio();
  });

  it('emits and updates confetti bursts (VISL-05)', () => {
    particles.burst(100, 100, 10);
    expect(particles.getParticles().length).toBe(10);

    particles.update(0.1);
    expect(particles.getParticles().length).toBe(10);

    particles.update(1.2); // Expire particles
    expect(particles.getParticles().length).toBe(0);
  });

  it('toggles audio mute safely without throw (AUDI-01)', () => {
    expect(audio.toggleMute()).toBe(true);
    expect(audio.toggleMute()).toBe(false);

    // Calling audio methods when muted or no window doesn't throw
    expect(() => audio.playInhale()).not.toThrow();
    expect(() => audio.playSpit()).not.toThrow();
    expect(() => audio.playAbilityGain()).not.toThrow();
  });
});
