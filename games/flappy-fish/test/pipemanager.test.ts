import { describe, it, expect, beforeEach } from 'vitest';
import { PipeManager, CoralPillar, PearlBubble } from '../src/PipeManager';
import { Fish } from '../src/Fish';

describe('PipeManager', () => {
  let manager: PipeManager;

  beforeEach(() => {
    manager = new PipeManager({
      pillarWidth: 70,
      gapSize: 150,
      speed: 180,
      spawnIntervalDist: 240,
      pearlSpawnChance: 1.0, // always spawn for predictable tests
    });
  });

  it('spawns coral pillar pair within safe vertical limits', () => {
    const pillar = manager.spawnPillar(400, 600);
    expect(pillar.x).toBe(400);
    expect(pillar.width).toBe(70);
    expect(pillar.gapSize).toBe(150);
    expect(pillar.topHeight).toBeGreaterThanOrEqual(60);
    expect(pillar.bottomY).toBe(pillar.topHeight + pillar.gapSize);
    expect(pillar.bottomY).toBeLessThanOrEqual(540);
    expect(pillar.passed).toBe(false);
    expect(pillar.hasPearl).toBe(true);
    expect(pillar.pearlCollected).toBe(false);
  });

  it('scrolls pillars to the left and culls offscreen ones', () => {
    const pillar = manager.spawnPillar(400, 600);
    manager.update(1.0, 1.0, 400, 600); // moves by 180px left
    expect(pillar.x).toBe(400 - 180);

    // Force pillar offscreen left
    pillar.x = -100;
    manager.update(0.1, 1.0, 400, 600);
    expect(manager.pillars.find(p => p.id === pillar.id)).toBeUndefined();
  });

  it('spawns new pillars when distance traveled reaches threshold', () => {
    manager.spawnPillar(400, 600);
    expect(manager.pillars.length).toBe(1);

    // Advance until another pillar is spawned
    // spawnIntervalDist = 240, speed = 180, dt = 1.5 => 270px
    manager.update(1.5, 1.0, 400, 600);
    expect(manager.pillars.length).toBeGreaterThanOrEqual(2);
  });

  it('detects circle-to-AABB collision between fish and top/bottom pillars', () => {
    const fish = new Fish({ x: 160, y: 100, radius: 18 });
    const pillar: CoralPillar = {
      id: 1,
      x: 140,
      width: 70,
      topHeight: 120, // fish y=100 is inside top pillar [140..210, 0..120]
      bottomY: 270,
      gapSize: 150,
      passed: false,
      hasPearl: false,
      pearlCollected: false,
      pearlX: 175,
      pearlY: 195,
      pearlRadius: 12,
    };
    manager.pillars = [pillar];

    expect(manager.checkPillarCollision(fish, 600)).toBe(true);

    // Position fish cleanly in the gap [120..270]
    fish.y = 195;
    expect(manager.checkPillarCollision(fish, 600)).toBe(false);

    // Position fish inside bottom pillar [140..210, 270..600]
    fish.y = 280;
    expect(manager.checkPillarCollision(fish, 600)).toBe(true);

    // Position fish far to left outside pillar x range
    fish.x = 50;
    fish.y = 100;
    expect(manager.checkPillarCollision(fish, 600)).toBe(false);
  });

  it('detects score pass triggers only once per pillar', () => {
    const fish = new Fish({ x: 160, y: 195 });
    const pillar: CoralPillar = {
      id: 1,
      x: 100, // pillar center = 100 + 35 = 135. fish.x = 160 > 135
      width: 70,
      topHeight: 100,
      bottomY: 250,
      gapSize: 150,
      passed: false,
      hasPearl: false,
      pearlCollected: false,
      pearlX: 135,
      pearlY: 175,
      pearlRadius: 12,
    };
    manager.pillars = [pillar];

    expect(manager.checkScoreTriggers(fish)).toBe(1);
    expect(pillar.passed).toBe(true);

    // Second check should return 0 since already marked passed
    expect(manager.checkScoreTriggers(fish)).toBe(0);
  });

  it('detects circle-to-circle pearl collection and marks collected', () => {
    const fish = new Fish({ x: 160, y: 200, radius: 18 });
    const pillar: CoralPillar = {
      id: 1,
      x: 125,
      width: 70,
      topHeight: 100,
      bottomY: 250,
      gapSize: 150,
      passed: false,
      hasPearl: true,
      pearlCollected: false,
      pearlX: 160,
      pearlY: 200,
      pearlRadius: 12,
    };
    manager.pillars = [pillar];

    const collected = manager.checkPearlCollisions(fish);
    expect(collected.length).toBe(1);
    expect(pillar.pearlCollected).toBe(true);

    // Collecting again returns empty array
    expect(manager.checkPearlCollisions(fish).length).toBe(0);
  });

  it('resets all pillars and spawn counters', () => {
    manager.spawnPillar(400, 600);
    manager.spawnPillar(640, 600);
    expect(manager.pillars.length).toBe(2);

    manager.reset();
    expect(manager.pillars.length).toBe(0);
  });
});
