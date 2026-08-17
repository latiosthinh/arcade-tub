import { describe, it, expect, beforeEach } from 'vitest';
import { BalloonSpawner } from '../src/BalloonSpawner';

describe('BalloonSpawner', () => {
  let spawner: BalloonSpawner;

  beforeEach(() => {
    spawner = new BalloonSpawner({
      canvasWidth: 800,
      canvasHeight: 600,
      baseSpawnInterval: 1.2,
      minSpawnInterval: 0.4,
      maxActiveBalloons: 30,
    });
  });

  it('spawns balloons within horizontal safe margins below bottom boundary', () => {
    const balloon = spawner.spawn(0);
    expect(balloon.y).toBeGreaterThanOrEqual(600);
    expect(balloon.baseX).toBeGreaterThanOrEqual(40);
    expect(balloon.baseX).toBeLessThanOrEqual(760);
    expect(spawner.getActiveBalloons().length).toBe(1);
  });

  it('scales spawn interval and ascent speed as match time progresses', () => {
    const initialInterval = spawner.getSpawnInterval(0);
    const lateInterval = spawner.getSpawnInterval(50); // 50s into 60s round
    expect(lateInterval).toBeLessThan(initialInterval);

    const initialSpeed = spawner.getBaseSpeed(0);
    const lateSpeed = spawner.getBaseSpeed(50);
    expect(lateSpeed).toBeGreaterThan(initialSpeed);
  });

  it('updates all active balloons and purges escaped balloons', () => {
    // Spawn a balloon and force its position above screen top
    const b1 = spawner.spawn(0);
    b1.y = 500;
    spawner.update(0.1, 0);
    expect(spawner.getActiveBalloons().length).toBe(1);

    // Move beyond top purge boundary (e.g. y < -radius * 2)
    b1.y = -100;
    spawner.update(0.1, 0);
    expect(spawner.getActiveBalloons().length).toBe(0);
  });

  it('respects max active balloon cap to mitigate DoS', () => {
    for (let i = 0; i < 40; i++) {
      spawner.spawn(0);
    }
    expect(spawner.getActiveBalloons().length).toBeLessThanOrEqual(30);
  });

  it('removes popped balloons during update or explicit removal', () => {
    const b1 = spawner.spawn(0);
    expect(spawner.getActiveBalloons().length).toBe(1);
    b1.pop();
    spawner.update(0.01, 0);
    expect(spawner.getActiveBalloons().length).toBe(0);
  });
});
