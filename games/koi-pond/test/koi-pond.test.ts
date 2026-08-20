import { describe, it, expect, beforeEach } from 'vitest';
import { PondPhysics } from '../src/PondPhysics.js';

describe('Zen Koi Pond Physics & Simulation', () => {
  let pond: PondPhysics;

  beforeEach(() => {
    pond = new PondPhysics(800, 600);
  });

  it('spawns initial school of swimming koi fish', () => {
    expect(pond.fishes.length).toBe(6);
    for (const f of pond.fishes) {
      expect(f.x).toBeGreaterThan(0);
      expect(f.x).toBeLessThan(800);
      expect(f.y).toBeGreaterThan(0);
      expect(f.y).toBeLessThan(600);
    }
  });

  it('drops food pellet and attracts nearest koi', () => {
    const food = pond.dropFood(400, 300);
    expect(pond.foods.length).toBe(1);
    expect(food.x).toBe(400);
    expect(food.y).toBe(300);

    // Place fish near food (distance > eating radius)
    pond.fishes[0].x = 480;
    pond.fishes[0].y = 300;

    // Step simulation
    pond.update(0.1);
    expect(pond.fishes[0].speed).toBeGreaterThan(80);
  });

  it('scares fish away when water is tapped', () => {
    pond.fishes[0].x = 300;
    pond.fishes[0].y = 300;
    pond.tapWater(300, 300);

    expect(pond.fishes[0].scaredTimer).toBeGreaterThan(0);
    expect(pond.fishes[0].speed).toBe(180);
    expect(pond.ripples.length).toBe(1);
  });
});
