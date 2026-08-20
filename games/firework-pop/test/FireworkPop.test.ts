import { describe, it, expect, beforeEach } from 'vitest';
import { FireworkPhysics } from '../src/FireworkPhysics.js';

describe('FireworkPhysics', () => {
  let physics: FireworkPhysics;

  beforeEach(() => {
    physics = new FireworkPhysics(800, 600);
  });

  it('launches rocket shell aiming at apex target', () => {
    physics.launchRocket(400, 600, 400, 200, 'ring');
    const rockets = physics.getRockets();
    expect(rockets.length).toBe(1);
    expect(rockets[0].targetY).toBe(200);
    expect(rockets[0].vy).toBeLessThan(0); // Moving upwards
  });

  it('explodes rocket when reaching apex target', () => {
    physics.launchRocket(400, 210, 400, 200, 'ring');
    
    // Step physics forward until apex is passed
    for (let i = 0; i < 20; i++) {
      physics.update(0.05);
    }

    const rockets = physics.getRockets();
    const sparks = physics.getSparks();

    expect(rockets.length).toBe(0); // Rocket exploded
    expect(sparks.length).toBeGreaterThan(20); // Spawned burst sparks
  });

  it('burst particles follow radial trigonometry and gravity', () => {
    physics.explode(400, 300, 'ring', 45);
    const sparks = physics.getSparks();
    expect(sparks.length).toBeGreaterThan(0);

    const initialY = sparks[0].y;
    physics.update(0.1);
    // Gravity or velocity moves particle
    expect(sparks[0].life).toBeLessThan(1);
  });

  it('caps max total sparks to avoid memory degradation (T-42-01)', () => {
    for (let i = 0; i < 15; i++) {
      physics.explode(200 + i * 20, 200, 'willow', i * 25);
    }
    const sparks = physics.getSparks();
    expect(sparks.length).toBeLessThanOrEqual(350);
  });

  it('culls dead and offscreen particles during update', () => {
    physics.explode(400, 300, 'heart', 120);
    expect(physics.getSparks().length).toBeGreaterThan(0);

    // Update with long duration
    for (let i = 0; i < 50; i++) {
      physics.update(0.1);
    }

    // All short-lived particles should have expired
    expect(physics.getSparks().length).toBe(0);
  });
});
