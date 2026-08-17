import { describe, it, expect, beforeEach } from 'vitest';
import { FallingItemManager } from '../src/FallingItemManager.js';
import { Cart } from '../src/Cart.js';
import { StackPhysics } from '../src/StackPhysics.js';

describe('FallingItemManager', () => {
  let manager: FallingItemManager;
  let cart: Cart;
  let stack: StackPhysics;

  beforeEach(() => {
    manager = new FallingItemManager();
    cart = new Cart();
    stack = new StackPhysics();
  });

  it('initializes with empty items and default parameters', () => {
    expect(manager.items).toEqual([]);
    expect(manager.round).toBe(1);
    expect(manager.baseFallSpeed).toBe(180);
    expect(manager.spawnInterval).toBe(1.2);
    expect(manager.missedCrates).toBe(0);
  });

  it('updates parameters when round changes', () => {
    manager.setRound(3);
    expect(manager.round).toBe(3);
    expect(manager.baseFallSpeed).toBe(180 + 2 * 35);
    expect(manager.spawnInterval).toBeCloseTo(1.0, 2);
  });

  it('spawns items on front and back lanes with correct scale and dimensions', () => {
    manager.spawnItem('crate_small', 'front', 200);
    expect(manager.items.length).toBe(1);
    const itemFront = manager.items[0];
    expect(itemFront.type).toBe('crate_small');
    expect(itemFront.lane).toBe('front');
    expect(itemFront.width).toBe(32);
    expect(itemFront.height).toBe(24);
    expect(itemFront.basePoints).toBe(100);

    manager.spawnItem('crate_medium', 'back', 200);
    expect(manager.items.length).toBe(2);
    const itemBack = manager.items[1];
    expect(itemBack.type).toBe('crate_medium');
    expect(itemBack.lane).toBe('back');
    expect(itemBack.width).toBeCloseTo(44 * 0.85, 2);
    expect(itemBack.height).toBeCloseTo(30 * 0.85, 2);
    expect(itemBack.basePoints).toBe(150);
  });

  it('moves items downward and counts missed crates offscreen', () => {
    manager.spawnItem('crate_small', 'front', 350);
    const item = manager.items[0];
    item.y = 590;
    item.vy = 200;

    manager.update(0.2); // y becomes 630 > screenHeight + 20 (620)
    expect(item.alive).toBe(false);
    expect(manager.missedCrates).toBe(1);

    manager.cullOffscreen();
    expect(manager.items.length).toBe(0);
  });

  it('does not increment missed crates for bombs or powerups offscreen', () => {
    manager.spawnItem('bomb', 'front', 350);
    manager.spawnItem('powerup_repair', 'front', 350);
    manager.items.forEach(i => {
      i.y = 610;
      i.vy = 100;
    });

    manager.update(0.2);
    expect(manager.missedCrates).toBe(0);
  });

  it('ignores catch when item and cart are in different lanes', () => {
    cart.switchLane('front');
    manager.spawnItem('crate_small', 'back', 390);
    const item = manager.items[0];
    item.y = 520 - item.height; // Exactly at cart top Y

    const collisions = manager.checkCatch(cart, stack);
    expect(collisions.length).toBe(0);
    expect(item.alive).toBe(true);
    expect(stack.crates.length).toBe(0);
  });

  it('catches crate on cart top when in same lane and within bounds', () => {
    cart.switchLane('front');
    cart.x = 350; // Width 100 -> center 400
    manager.spawnItem('crate_small', 'front', 380); // Center ~396
    const item = manager.items[0];
    item.y = 520 - item.height;

    const collisions = manager.checkCatch(cart, stack);
    expect(collisions.length).toBe(1);
    expect(collisions[0].caught).toBe(true);
    expect(collisions[0].isBomb).toBe(false);
    expect(item.alive).toBe(false);
    expect(stack.crates.length).toBe(1);
  });

  it('catches crate on top of existing stack', () => {
    cart.switchLane('front');
    cart.x = 350;
    stack.addCrate({ id: 'c1', type: 'crate_small', width: 32, height: 24, basePoints: 100 });

    const stackTopY = stack.getStackTopY(cart.y); // 520 - 24 = 496
    manager.spawnItem('crate_medium', 'front', 380);
    const item = manager.items[0];
    item.y = stackTopY - item.height;

    const collisions = manager.checkCatch(cart, stack);
    expect(collisions.length).toBe(1);
    expect(collisions[0].caught).toBe(true);
    expect(stack.crates.length).toBe(2);
  });

  it('handles power-up repair and shield collisions', () => {
    cart.switchLane('front');
    manager.spawnItem('powerup_repair', 'front', 380);
    manager.items[0].y = 520 - 30;

    let hits = manager.checkCatch(cart, stack);
    expect(hits.length).toBe(1);
    expect(hits[0].isRepair).toBe(true);
    expect(hits[0].caught).toBe(true);

    manager.spawnItem('powerup_shield', 'front', 380);
    manager.items[1].y = 520 - 30;

    hits = manager.checkCatch(cart, stack);
    expect(hits.length).toBe(1);
    expect(hits[0].isShield).toBe(true);
    expect(hits[0].caught).toBe(true);
  });

  it('handles bomb collision and triggers explosion result', () => {
    cart.switchLane('front');
    manager.spawnItem('bomb', 'front', 380);
    manager.items[0].y = 520 - 32;

    const hits = manager.checkCatch(cart, stack);
    expect(hits.length).toBe(1);
    expect(hits[0].isBomb).toBe(true);
    expect(hits[0].caught).toBe(false);
    expect(hits[0].hit).toBe(true);
  });
});
