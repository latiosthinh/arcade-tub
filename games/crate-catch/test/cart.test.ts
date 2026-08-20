import { describe, it, expect, beforeEach } from 'vitest';
import { Cart } from '../src/Cart.js';

describe('Cart', () => {
  let cart: Cart;

  beforeEach(() => {
    cart = new Cart();
  });

  it('initializes on front lane with default values', () => {
    expect(cart.x).toBe(330);
    expect(cart.y).toBe(520);
    expect(cart.width).toBe(140);
    expect(cart.height).toBe(30);
    expect(cart.lane).toBe('front');
    expect(cart.maxSpeed).toBe(500);
    expect(cart.getEffectiveScale()).toBe(1.0);
  });

  it('switches lane and toggles lane correctly', () => {
    cart.switchLane('back');
    expect(cart.lane).toBe('back');
    expect(cart.targetY).toBe(440);
    expect(cart.getEffectiveScale()).toBe(0.85);

    cart.switchLane('front');
    expect(cart.lane).toBe('front');
    expect(cart.targetY).toBe(520);
    expect(cart.getEffectiveScale()).toBe(1.0);

    cart.toggleLane();
    expect(cart.lane).toBe('back');
    expect(cart.targetY).toBe(440);

    cart.toggleLane();
    expect(cart.lane).toBe('front');
    expect(cart.targetY).toBe(520);
  });

  it('accelerates left and right within maxSpeed limits', () => {
    cart.moveRight(0.1);
    expect(cart.vx).toBeGreaterThan(0);
    expect(cart.vx).toBeLessThanOrEqual(500);

    cart.moveRight(1.0);
    expect(cart.vx).toBe(500);

    cart.moveLeft(1.0);
    expect(cart.vx).toBeLessThan(500);

    cart.moveLeft(2.0);
    expect(cart.vx).toBe(-500);
  });

  it('applies friction damping to zero when no input', () => {
    cart.vx = 200;
    cart.applyFriction(0.05);
    expect(cart.vx).toBeLessThan(200);

    cart.vx = 4;
    cart.applyFriction(0.1);
    expect(cart.vx).toBe(0);
  });

  it('updates horizontal position and clamps within screen bounds', () => {
    cart.vx = 500;
    cart.update(0.1);
    expect(cart.x).toBe(330 + 50);

    // Test right clamp (800 - 140 = 660)
    cart.x = 650;
    cart.vx = 500;
    cart.update(0.1);
    expect(cart.x).toBe(660);

    // Test left clamp (0)
    cart.x = 20;
    cart.vx = -500;
    cart.update(0.1);
    expect(cart.x).toBe(0);
  });

  it('interpolates y smoothly towards targetY on update', () => {
    cart.switchLane('back');
    expect(cart.y).toBe(520);
    expect(cart.targetY).toBe(440);

    cart.update(0.01);
    expect(cart.y).toBeLessThan(520);
    expect(cart.y).toBeGreaterThan(440);

    // Step several frames to reach target
    for (let i = 0; i < 20; i++) {
      cart.update(0.1);
    }
    expect(Math.abs(cart.y - 440)).toBeLessThan(0.01);
  });

  it('resets to starting state', () => {
    cart.x = 100;
    cart.vx = 300;
    cart.switchLane('back');
    cart.y = 440;

    cart.reset(330);
    expect(cart.x).toBe(330);
    expect(cart.vx).toBe(0);
    expect(cart.lane).toBe('front');
    expect(cart.y).toBe(520);
    expect(cart.targetY).toBe(520);
  });

  it('returns valid bounding box info', () => {
    const bounds = cart.getBounds();
    expect(bounds).toEqual({
      x: 330,
      y: 520,
      width: 140,
      height: 30,
      lane: 'front'
    });
  });
});
