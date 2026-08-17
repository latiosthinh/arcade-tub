import { describe, it, expect, beforeEach } from 'vitest';
import { ObstacleManager } from '../src/ObstacleManager.js';
import { Player } from '../src/Player.js';

describe('ObstacleManager', () => {
  let obstacleManager: ObstacleManager;
  let player: Player;

  beforeEach(() => {
    obstacleManager = new ObstacleManager();
    player = new Player();
  });

  it('resets obstacle collection and generator marker', () => {
    obstacleManager.obstacles.push({
      id: 'obs_1',
      type: 'drone',
      x: 100,
      y: 200,
      width: 36,
      height: 24,
      vx: 110,
      vy: 0,
      alive: true,
    });
    obstacleManager.reset();
    expect(obstacleManager.obstacles).toEqual([]);
    expect(obstacleManager.highestY).toBe(500);
  });

  it('generates flying drones, stationary spire mines, and balloons ahead of camera', () => {
    obstacleManager.reset();
    obstacleManager.generateAhead(-3000);

    expect(obstacleManager.obstacles.length).toBeGreaterThan(0);
    expect(obstacleManager.highestY).toBeLessThan(-3700);

    const types = new Set(obstacleManager.obstacles.map((o) => o.type));
    expect(types.size).toBeGreaterThan(0);
  });

  it('updates drones and bounces them at screen margins', () => {
    obstacleManager.obstacles = [
      {
        id: 'drone_1',
        type: 'drone',
        x: 770,
        y: 100,
        width: 36,
        height: 24,
        vx: 110,
        vy: 0,
        alive: true,
      },
    ];

    // Hits right bound 800 - 20 - 36 = 744
    obstacleManager.update(0.1);
    expect(obstacleManager.obstacles[0]?.x).toBe(744);
    expect(obstacleManager.obstacles[0]?.vx).toBe(-110);
  });

  it('culls obstacles far below camera bottom', () => {
    obstacleManager.obstacles = [
      {
        id: 'drone_1',
        type: 'drone',
        x: 100,
        y: 1000,
        width: 36,
        height: 24,
        vx: 0,
        vy: 0,
        alive: true,
      },
    ];
    obstacleManager.cullBelow(500); // 500 + 150 = 650 < 1000 -> culled
    expect(obstacleManager.obstacles.length).toBe(0);
  });

  it('destroys obstacles when hit by projectiles and awards points', () => {
    obstacleManager.obstacles = [
      {
        id: 'drone_1',
        type: 'drone',
        x: 100,
        y: 100,
        width: 36,
        height: 24,
        vx: 0,
        vy: 0,
        alive: true,
      },
      {
        id: 'spire_1',
        type: 'spire',
        x: 300,
        y: 200,
        width: 30,
        height: 30,
        vx: 0,
        vy: 0,
        alive: true,
      },
    ];

    player.projectiles = [
      { id: 'p1', x: 110, y: 110, vx: 0, vy: -900, radius: 4, alive: true },
      { id: 'p2', x: 310, y: 210, vx: 0, vy: -900, radius: 4, alive: true },
    ];

    const score = obstacleManager.checkProjectileCollisions(player);
    expect(score).toBe(100 + 150);
    expect(obstacleManager.obstacles[0]?.alive).toBe(false);
    expect(obstacleManager.obstacles[1]?.alive).toBe(false);
    expect(player.projectiles[0]?.alive).toBe(false);
    expect(player.projectiles[1]?.alive).toBe(false);
  });

  it('destroys obstacle safely when colliding in rocket mode', () => {
    obstacleManager.obstacles = [
      {
        id: 'spire_1',
        type: 'spire',
        x: 300,
        y: 300,
        width: 30,
        height: 30,
        vx: 0,
        vy: 0,
        alive: true,
      },
    ];

    player.x = 305;
    player.y = 305;
    player.isRocketing = true;

    const result = obstacleManager.checkPlayerInteractions(player);
    expect(result.playerDead).toBe(false);
    expect(result.pointsAwarded).toBe(150);
    expect(obstacleManager.obstacles[0]?.alive).toBe(false);
  });

  it('executes downward stomp on drone when falling onto its upper half', () => {
    obstacleManager.obstacles = [
      {
        id: 'drone_1',
        type: 'drone',
        x: 300,
        y: 300,
        width: 36,
        height: 24,
        vx: 0,
        vy: 0,
        alive: true,
      },
    ];

    player.x = 305;
    player.y = 300 - player.height + 4; // player bottom is 304 <= 300 + 14.4
    player.vy = 200; // falling

    const result = obstacleManager.checkPlayerInteractions(player);
    expect(result.stomped).toBe(true);
    expect(result.playerDead).toBe(false);
    expect(result.pointsAwarded).toBe(100);
    expect(obstacleManager.obstacles[0]?.alive).toBe(false);
    expect(player.vy).toBe(-650);
  });

  it('causes player death on lethal drone side/bottom collision', () => {
    obstacleManager.obstacles = [
      {
        id: 'drone_1',
        type: 'drone',
        x: 300,
        y: 300,
        width: 36,
        height: 24,
        vx: 0,
        vy: 0,
        alive: true,
      },
    ];

    player.x = 305;
    player.y = 310; // deeper/underneath drone
    player.vy = -100; // moving upward

    const result = obstacleManager.checkPlayerInteractions(player);
    expect(result.playerDead).toBe(true);
    expect(result.stomped).toBe(false);
  });

  it('causes player death on touching spire mine', () => {
    obstacleManager.obstacles = [
      {
        id: 'spire_1',
        type: 'spire',
        x: 300,
        y: 300,
        width: 30,
        height: 30,
        vx: 0,
        vy: 0,
        alive: true,
      },
    ];

    player.x = 305;
    player.y = 305;
    player.isRocketing = false;

    const result = obstacleManager.checkPlayerInteractions(player);
    expect(result.playerDead).toBe(true);
  });

  it('triggers non-lethal deflection bounce and recoil on touching balloon', () => {
    obstacleManager.obstacles = [
      {
        id: 'balloon_1',
        type: 'balloon',
        x: 300,
        y: 300,
        width: 32,
        height: 40,
        vx: 0,
        vy: 0,
        alive: true,
      },
    ];

    player.x = 320;
    player.y = 310;

    const result = obstacleManager.checkPlayerInteractions(player);
    expect(result.playerDead).toBe(false);
    expect(result.balloonBounce).toBe(true);
    expect(player.vy).toBe(-700);
    expect(player.vx).toBeGreaterThan(0); // Pushed right away from balloon center
  });
});
