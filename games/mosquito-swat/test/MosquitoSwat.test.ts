import { describe, it, expect, beforeEach } from 'vitest';
import { MosquitoSwarm, Mosquito } from '../src/MosquitoSwarm';

describe('MosquitoSwarm', () => {
  let swarm: MosquitoSwarm;

  beforeEach(() => {
    swarm = new MosquitoSwarm(800, 600);
    swarm.mosquitoes = []; // clear initial swarm for isolated unit tests
  });

  it('spawns initial mosquitoes with types and bounds', () => {
    swarm.spawnMosquito('standard', 100, 100);
    swarm.spawnMosquito('speedy', 200, 200);
    swarm.spawnMosquito('giant', 300, 300);

    expect(swarm.mosquitoes.length).toBe(3);
    expect(swarm.mosquitoes[0].type).toBe('standard');
    expect(swarm.mosquitoes[0].hp).toBe(1);
    expect(swarm.mosquitoes[2].type).toBe('giant');
    expect(swarm.mosquitoes[2].hp).toBe(2);
  });

  it('updates mosquito positions using sine oscillation and respects boundaries', () => {
    const m = swarm.spawnMosquito('standard', 790, 590, 10, 10);
    const prevX = m.x;
    const prevY = m.y;

    swarm.update(0.1);

    expect(m.x).not.toBe(prevX);
    expect(m.y).not.toBe(prevY);
    expect(m.x).toBeLessThanOrEqual(800);
    expect(m.y).toBeLessThanOrEqual(600);
  });

  it('detects net swipe hit-testing within radius', () => {
    swarm.spawnMosquito('standard', 100, 100);
    swarm.spawnMosquito('standard', 110, 105);
    swarm.spawnMosquito('standard', 500, 500);

    // Sweep net at (105, 102) with radius 50
    const hits = swarm.swatAt(105, 102, 50);

    expect(hits.length).toBe(2);
    expect(swarm.mosquitoes.length).toBe(1);
    expect(swarm.score).toBeGreaterThan(0);
  });

  it('requires 2 hits for giant bloodsucker mosquito', () => {
    swarm.spawnMosquito('giant', 200, 200);

    const hit1 = swarm.swatAt(200, 200, 40);
    expect(hit1.length).toBe(0); // Not dead yet
    expect(swarm.mosquitoes.length).toBe(1);
    expect(swarm.mosquitoes[0].hp).toBe(1);

    const hit2 = swarm.swatAt(200, 200, 40);
    expect(hit2.length).toBe(1); // Now dead
    expect(swarm.mosquitoes.length).toBe(0);
  });

  it('tracks combo multiplier when hitting multiple bugs in one swat', () => {
    swarm.spawnMosquito('standard', 100, 100);
    swarm.spawnMosquito('speedy', 105, 105);
    swarm.spawnMosquito('standard', 110, 110);

    const hits = swarm.swatAt(105, 105, 50);
    expect(hits.length).toBe(3);
    expect(swarm.combo).toBe(3);
    // 3 bugs * base score * combo multiplier
    expect(swarm.score).toBeGreaterThan(300);
  });

  it('activates bug spray powerup to stun or clear all mosquitoes', () => {
    swarm.spawnMosquito('standard', 100, 100);
    swarm.spawnMosquito('speedy', 200, 200);
    swarm.spawnMosquito('giant', 300, 300);

    swarm.activatePowerup('spray');
    expect(swarm.powerupState.sprayTimer).toBeGreaterThan(0);

    swarm.update(0.1);
    // Spray stuns / damages mosquitoes
    expect(swarm.mosquitoes.every(m => m.stunned || m.hp < 2)).toBe(true);
  });

  it('activates electric racket powerup for double score', () => {
    swarm.spawnMosquito('standard', 100, 100);
    swarm.activatePowerup('electric');
    const hits = swarm.swatAt(100, 100, 50);
    expect(hits.length).toBe(1);
    expect(swarm.score).toBe(200); // 100 * 2
  });
});
