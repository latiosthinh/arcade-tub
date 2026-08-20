import { describe, it, expect, beforeEach } from 'vitest';
import { PlatformManager } from '../src/PlatformManager.js';
import { Player } from '../src/Player.js';

describe('PlatformManager', () => {
  let platformManager: PlatformManager;
  let player: Player;

  beforeEach(() => {
    platformManager = new PlatformManager();
    player = new Player();
  });

  it('initializes with base ground platform and initial starter platforms', () => {
    platformManager.reset();
    expect(platformManager.platforms.length).toBeGreaterThanOrEqual(15);
    const base = platformManager.platforms[0];
    expect(base?.x).toBe(350);
    expect(base?.y).toBe(560);
    expect(base?.width).toBe(100);
    expect(base?.type).toBe('standard');
    expect(platformManager.highestY).toBeLessThan(0);
  });

  it('generates reachable platforms upward ahead of camera', () => {
    platformManager.reset();
    const initialCount = platformManager.platforms.length;
    const initialHighestY = platformManager.highestY;

    platformManager.generateAhead(-2000);
    expect(platformManager.platforms.length).toBeGreaterThan(initialCount);
    expect(platformManager.highestY).toBeLessThan(initialHighestY);
    expect(platformManager.highestY).toBeLessThan(-2700);

    // Verify spacing between adjacent platforms
    for (let i = 1; i < platformManager.platforms.length; i++) {
      const pPrev = platformManager.platforms[i - 1];
      const pCurr = platformManager.platforms[i];
      if (pPrev && pCurr) {
        const gap = pPrev.y - pCurr.y;
        expect(gap).toBeGreaterThanOrEqual(60);
        expect(gap).toBeLessThanOrEqual(115);
      }
    }
  });

  it('generates varied platform types at higher altitudes', () => {
    platformManager.reset();
    platformManager.generateAhead(-40000); // reaches high altitude

    const types = new Set(platformManager.platforms.map((p) => p.type));
    expect(types.has('standard')).toBe(true);
    expect(types.has('fragile')).toBe(true);
    expect(types.has('moving')).toBe(true);
    expect(types.has('spring')).toBe(true);
  });

  it('updates moving platforms and bounces at screen edges', () => {
    platformManager.reset();
    const movingPlatform = {
      id: 'moving_1',
      x: 700,
      y: 300,
      width: 74,
      height: 16,
      type: 'moving' as const,
      vx: 120,
      broken: false,
      hasRocket: false,
    };
    platformManager.platforms.push(movingPlatform);

    // Moves right and hits boundary 800 - 20 - 74 = 706
    platformManager.update(0.1);
    expect(movingPlatform.x).toBe(706);
    expect(movingPlatform.vx).toBe(-120);

    // Moves left towards 20
    movingPlatform.x = 25;
    movingPlatform.vx = -120;
    platformManager.update(0.1);
    expect(movingPlatform.x).toBe(20);
    expect(movingPlatform.vx).toBe(120);
  });

  it('culls platforms far below camera bottom', () => {
    platformManager.reset();
    const p1 = platformManager.platforms[0];
    if (p1) {
      p1.y = 1000;
    }
    platformManager.cullBelow(500); // 500 + 150 = 650 < 1000 -> culled
    expect(platformManager.platforms.some((p) => p.y === 1000)).toBe(false);
  });

  it('ignores landing collision when player is jumping upward (vy <= 0)', () => {
    platformManager.reset();
    const base = platformManager.platforms[0];
    if (!base) return;

    player.x = base.x;
    player.y = base.y - 10;
    player.vy = -500; // moving UP

    const result = platformManager.checkLanding(player, 0.016);
    expect(result.hit).toBe(false);
    expect(player.vy).toBe(-500);
  });

  it('detects falling landing collision on standard platform and bounces player', () => {
    platformManager.reset();
    const base = platformManager.platforms[0];
    if (!base) return;

    player.x = base.x + 10;
    player.y = base.y - player.height + 4; // crossing top
    player.vy = 400; // falling DOWN

    const result = platformManager.checkLanding(player, 0.02);
    expect(result.hit).toBe(true);
    expect(result.isSuperBounce).toBe(false);
    expect(result.gotRocket).toBe(false);
    expect(player.y).toBe(base.y - player.height);
    expect(player.vy).toBe(-650);
  });

  it('breaks fragile platform on landing bounce', () => {
    platformManager.platforms = [
      {
        id: 'frag_1',
        x: 300,
        y: 400,
        width: 74,
        height: 16,
        type: 'fragile',
        vx: 0,
        broken: false,
        hasRocket: false,
      },
    ];

    player.x = 320;
    player.y = 400 - player.height + 2;
    player.vy = 300;

    const result = platformManager.checkLanding(player, 0.016);
    expect(result.hit).toBe(true);
    expect(platformManager.platforms[0]?.broken).toBe(true);
    expect(player.vy).toBe(-650);

    // Second fall passes through broken platform
    player.y = 400 - player.height + 2;
    player.vy = 300;
    const result2 = platformManager.checkLanding(player, 0.016);
    expect(result2.hit).toBe(false);
  });

  it('triggers super bounce on spring platform', () => {
    platformManager.platforms = [
      {
        id: 'spring_1',
        x: 300,
        y: 400,
        width: 74,
        height: 16,
        type: 'spring',
        vx: 0,
        broken: false,
        hasRocket: false,
      },
    ];

    player.x = 320;
    player.y = 400 - player.height + 2;
    player.vy = 300;

    const result = platformManager.checkLanding(player, 0.016);
    expect(result.hit).toBe(true);
    expect(result.isSuperBounce).toBe(true);
    expect(player.vy).toBe(-1100);
  });

  it('collects rocket item and activates rocket boost on landing', () => {
    platformManager.platforms = [
      {
        id: 'rocket_1',
        x: 300,
        y: 400,
        width: 74,
        height: 16,
        type: 'standard',
        vx: 0,
        broken: false,
        hasRocket: true,
      },
    ];

    player.x = 320;
    player.y = 400 - player.height + 2;
    player.vy = 300;

    const result = platformManager.checkLanding(player, 0.016);
    expect(result.hit).toBe(true);
    expect(result.gotRocket).toBe(true);
    expect(platformManager.platforms[0]?.hasRocket).toBe(false);
    expect(player.isRocketing).toBe(true);
    expect(player.vy).toBe(-1200);
  });
});
