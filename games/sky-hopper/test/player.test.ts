import { describe, it, expect, beforeEach } from 'vitest';
import { Player } from '../src/Player.js';

describe('Player', () => {
  let player: Player;

  beforeEach(() => {
    player = new Player();
  });

  it('initializes with default physics values', () => {
    expect(player.x).toBe(384);
    expect(player.y).toBe(500);
    expect(player.vx).toBe(0);
    expect(player.vy).toBe(0);
    expect(player.width).toBe(32);
    expect(player.height).toBe(32);
    expect(player.gravity).toBe(1000);
    expect(player.jumpVelocity).toBe(-650);
    expect(player.superJumpVelocity).toBe(-1100);
    expect(player.isRocketing).toBe(false);
    expect(player.projectiles).toEqual([]);
  });

  it('resets to given start coordinates and clears states', () => {
    player.x = 100;
    player.y = 200;
    player.vx = 300;
    player.vy = -400;
    player.isRocketing = true;
    player.projectiles.push({ id: '1', x: 0, y: 0, vx: 0, vy: -900, radius: 4, alive: true });

    player.reset(400, 300);
    expect(player.x).toBe(400);
    expect(player.y).toBe(300);
    expect(player.vx).toBe(0);
    expect(player.vy).toBe(0);
    expect(player.isRocketing).toBe(false);
    expect(player.projectiles).toEqual([]);
  });

  it('accelerates left and right clamped to maxVx', () => {
    player.moveLeft(0.1); // -1400 * 0.1 = -140
    expect(player.vx).toBe(-140);
    expect(player.facing).toBe('left');

    player.moveLeft(1.0); // clamped to -400
    expect(player.vx).toBe(-400);

    player.moveRight(0.5); // -400 + 700 = 300
    expect(player.vx).toBe(300);
    expect(player.facing).toBe('right');

    player.moveRight(1.0); // clamped to 400
    expect(player.vx).toBe(400);
  });

  it('applies friction damping when no input is active', () => {
    player.vx = 200;
    player.applyFriction(0.1);
    expect(player.vx).toBeLessThan(200);
    expect(player.vx).toBeGreaterThan(0);

    player.vx = 4;
    player.applyFriction(0.1);
    expect(player.vx).toBe(0);
  });

  it('applies gravity and integrates position on update', () => {
    player.vx = 100;
    player.vy = 0;
    player.update(0.1); // vy becomes 0 + 1000*0.1 = 100, x = 384 + 10 = 394, y = 500 + 10 = 510
    expect(player.vy).toBe(100);
    expect(player.x).toBe(394);
    expect(player.y).toBe(510);
  });

  it('wraps horizontally across screen bounds', () => {
    player.x = -33; // x + width = -1 < 0
    player.update(0.01, 800);
    expect(player.x).toBe(800);

    player.x = 801; // > screenWidth
    player.update(0.01, 800);
    expect(player.x).toBe(-32);
  });

  it('handles normal and super jumps via bounce', () => {
    player.bounce(false);
    expect(player.vy).toBe(-650);

    player.bounce(true);
    expect(player.vy).toBe(-1100);
  });

  it('activates rocket boost and bypasses gravity until timer expires', () => {
    player.activateRocket(2.0);
    expect(player.isRocketing).toBe(true);
    expect(player.rocketTimer).toBe(2.0);
    expect(player.vy).toBe(-1200);

    player.update(1.0);
    expect(player.isRocketing).toBe(true);
    expect(player.rocketTimer).toBe(1.0);
    expect(player.vy).toBe(-1200);

    player.update(1.0);
    expect(player.isRocketing).toBe(false);
    expect(player.vy).toBe(-650);
  });

  it('shoots projectiles respecting cooldown and updates their positions', () => {
    player.x = 300;
    player.y = 400;
    const shot1 = player.shoot();
    expect(shot1).toBe(true);
    expect(player.projectiles.length).toBe(1);
    expect(player.projectiles[0].x).toBe(300 + 16);
    expect(player.projectiles[0].y).toBe(400);
    expect(player.projectiles[0].vy).toBe(-900);

    // Cooldown prevents immediate re-shoot
    const shot2 = player.shoot();
    expect(shot2).toBe(false);
    expect(player.projectiles.length).toBe(1);

    // Update advances projectile
    player.update(0.1);
    expect(player.projectiles[0].y).toBe(400 - 90);
    expect(player.shootCooldown).toBeCloseTo(0.15);

    // Wait out cooldown
    player.update(0.2);
    expect(player.shootCooldown).toBe(0);
    const shot3 = player.shoot();
    expect(shot3).toBe(true);
    expect(player.projectiles.length).toBe(2);
  });
});
