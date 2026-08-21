import { describe, it, expect, beforeEach } from 'vitest';
import { PowerUpManager } from '../src/PowerUpManager';

describe('PowerUpManager (CMBT-04)', () => {
  let powerups: PowerUpManager;

  beforeEach(() => {
    powerups = new PowerUpManager();
  });

  it('spawns and picks up crystal balls and scrolls', () => {
    powerups.spawnItem('crystal_ball', 200, 300);
    expect(powerups.getItems().length).toBe(1);

    const hit = powerups.checkPickup({ x: 195, y: 295, width: 20, height: 20 });
    expect(hit).not.toBeNull();
    expect(hit?.type).toBe('crystal_ball');
    expect(powerups.getItems().length).toBe(0);
  });
});
