import { describe, it, expect, beforeEach } from 'vitest';
import { NucleusState } from '../src/NucleusState';

describe('NucleusState', () => {
  let nucleus: NucleusState;

  beforeEach(() => {
    nucleus = new NucleusState(400, 300);
  });

  it('initializes with full health and default radius', () => {
    expect(nucleus.centerX).toBe(400);
    expect(nucleus.centerY).toBe(300);
    expect(nucleus.radius).toBe(45);
    expect(nucleus.hp).toBe(100);
    expect(nucleus.maxHp).toBe(100);
    expect(nucleus.isDestroyed).toBe(false);
  });

  it('decreases health when taking damage and clamps to 0', () => {
    const breached = nucleus.takeDamage(30);
    expect(breached).toBe(true);
    expect(nucleus.hp).toBe(70);

    nucleus.takeDamage(80);
    expect(nucleus.hp).toBe(0);
    expect(nucleus.isDestroyed).toBe(true);
  });

  it('heals health and clamps to maxHp', () => {
    nucleus.takeDamage(50);
    expect(nucleus.hp).toBe(50);

    nucleus.heal(20);
    expect(nucleus.hp).toBe(70);

    nucleus.heal(50);
    expect(nucleus.hp).toBe(100);
  });

  it('spawns and collects floating repair antibodies', () => {
    const antibody = nucleus.spawnAntibody();
    expect(antibody).toBeDefined();
    expect(antibody.active).toBe(true);
    expect(nucleus.antibodies.length).toBe(1);

    nucleus.takeDamage(40);
    expect(nucleus.hp).toBe(60);

    const healed = nucleus.collectAntibody(antibody.id);
    expect(healed).toBe(true);
    expect(nucleus.hp).toBe(75); // 60 + 15 = 75
    expect(antibody.active).toBe(false);
  });

  it('provides scaled wave configuration curves', () => {
    const w1 = nucleus.getWaveConfig(1);
    const w5 = nucleus.getWaveConfig(5);

    expect(w1.enemyCount).toBeGreaterThan(0);
    expect(w5.enemyCount).toBeGreaterThan(w1.enemyCount);
    expect(w5.speedMultiplier).toBeGreaterThan(w1.speedMultiplier);
    expect(w5.spawnInterval).toBeLessThan(w1.spawnInterval);
    expect(w5.types.length).toBeGreaterThanOrEqual(w1.types.length);
  });

  it('updates antibody wobble animation state', () => {
    const antibody = nucleus.spawnAntibody();
    const initialY = antibody.y;
    nucleus.update(0.5);
    expect(antibody.timeAlive).toBeCloseTo(0.5);
  });
});
