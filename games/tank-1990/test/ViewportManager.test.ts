import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ViewportManager } from '../src/ViewportManager';

describe('ViewportManager', () => {
  let canvas: HTMLCanvasElement;
  let viewportManager: ViewportManager;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    viewportManager = new ViewportManager({
      canvas,
      virtualWidth: 512,
      virtualHeight: 448,
    });
  });

  afterEach(() => {
    viewportManager.destroy();
  });

  describe('Aspect Ratio and Uniform Scaling', () => {
    it('calculates 1:1 exact fit metrics when container matches virtual resolution', () => {
      const metrics = viewportManager.resize(512, 448);

      expect(metrics.scale).toBe(1.0);
      expect(metrics.offsetX).toBe(0);
      expect(metrics.offsetY).toBe(0);
      expect(metrics.canvasWidth).toBe(512);
      expect(metrics.canvasHeight).toBe(448);
      expect(metrics.gameWidth).toBe(512);
      expect(metrics.gameHeight).toBe(448);
      expect(metrics.isLandscape).toBe(true);
    });

    it('calculates integer 2x scaling with no offset when scaled proportionally', () => {
      const metrics = viewportManager.resize(1024, 896);

      expect(metrics.scale).toBe(2.0);
      expect(metrics.offsetX).toBe(0);
      expect(metrics.offsetY).toBe(0);
    });

    it('calculates horizontal pillarbox offset (letterbox sides) for ultra-wide displays', () => {
      // 1200 x 896 -> height fits 2x (896), width scaled is 1024.
      // Leftover width = 1200 - 1024 = 176 -> offsetX = 88
      const metrics = viewportManager.resize(1200, 896);

      expect(metrics.scale).toBe(2.0);
      expect(metrics.offsetX).toBe(88);
      expect(metrics.offsetY).toBe(0);
    });

    it('calculates vertical letterbox offset (top/bottom) for tall portrait displays', () => {
      // 800 x 1000 container -> scale limited by width: 800 / 512 = 1.5625
      // Scaled height: 448 * 1.5625 = 700
      // Leftover height = 1000 - 700 = 300 -> offsetY = 150
      const metrics = viewportManager.resize(800, 1000);

      expect(metrics.scale).toBeCloseTo(1.5625, 4);
      expect(metrics.offsetX).toBe(0);
      expect(metrics.offsetY).toBeCloseTo(150, 4);
      expect(metrics.isLandscape).toBe(false);
    });
  });

  describe('Canvas Element DOM Styling', () => {
    it('applies pixelated image rendering, absolute positioning and dimensions to canvas element', () => {
      viewportManager.resize(1024, 896);

      expect(canvas.width).toBe(512);
      expect(canvas.height).toBe(448);
      expect(canvas.style.position).toBe('absolute');
      expect(canvas.style.width).toBe('1024px');
      expect(canvas.style.height).toBe('896px');
      expect(canvas.style.left).toBe('0px');
      expect(canvas.style.top).toBe('0px');
      expect(canvas.style.imageRendering).toBe('pixelated');
    });

    it('updates position offsets on canvas styling during pillarboxing', () => {
      viewportManager.resize(1200, 896);

      expect(canvas.style.width).toBe('1024px');
      expect(canvas.style.height).toBe('896px');
      expect(canvas.style.left).toBe('88px');
      expect(canvas.style.top).toBe('0px');
    });
  });

  describe('Client to Virtual Coordinate Mapping', () => {
    it('maps client click coordinates to virtual game space at 1:1 scale', () => {
      viewportManager.resize(512, 448);

      const virtual = viewportManager.clientToVirtual(256, 224, { left: 0, top: 0 });
      expect(virtual.x).toBe(256);
      expect(virtual.y).toBe(224);
    });

    it('maps scaled and offset client coordinates back to virtual space', () => {
      // 1200 x 896 -> scale = 2.0, offsetX = 88, offsetY = 0
      viewportManager.resize(1200, 896);

      // Top-left of virtual canvas on screen is (88, 0)
      const topLeft = viewportManager.clientToVirtual(88, 0, { left: 0, top: 0 });
      expect(topLeft.x).toBe(0);
      expect(topLeft.y).toBe(0);

      // Center of virtual canvas on screen is (88 + 256 * 2, 224 * 2) = (600, 448)
      const center = viewportManager.clientToVirtual(600, 448, { left: 0, top: 0 });
      expect(center.x).toBe(256);
      expect(center.y).toBe(224);
    });

    it('clamps out-of-bounds clicks to virtual canvas limits [0, virtualDimension]', () => {
      viewportManager.resize(512, 448);

      const negative = viewportManager.clientToVirtual(-100, -50, { left: 0, top: 0 });
      expect(negative.x).toBe(0);
      expect(negative.y).toBe(0);

      const overflow = viewportManager.clientToVirtual(800, 600, { left: 0, top: 0 });
      expect(overflow.x).toBe(512);
      expect(overflow.y).toBe(448);
    });

    it('accounts for containerRect parent offset correctly', () => {
      viewportManager.resize(512, 448);

      // Container positioned at (100, 50) on screen. Click at (356, 274) -> rel = (256, 224)
      const point = viewportManager.clientToVirtual(356, 274, { left: 100, top: 50 });
      expect(point.x).toBe(256);
      expect(point.y).toBe(224);
    });
  });

  describe('Edge Cases & Resilience', () => {
    it('handles zero or negative container dimensions gracefully', () => {
      const zeroMetrics = viewportManager.resize(0, 0);
      expect(zeroMetrics.scale).toBeGreaterThan(0);
      expect(zeroMetrics.canvasWidth).toBe(1);
      expect(zeroMetrics.canvasHeight).toBe(1);

      const negMetrics = viewportManager.resize(-500, -300);
      expect(negMetrics.scale).toBeGreaterThan(0);
      expect(negMetrics.canvasWidth).toBe(1);
      expect(negMetrics.canvasHeight).toBe(1);
    });

    it('returns valid transform snapshot via getTransform', () => {
      viewportManager.resize(1024, 896);
      const transform = viewportManager.getTransform();

      expect(transform.scale).toBe(2.0);
      expect(transform.offsetX).toBe(0);
      expect(transform.offsetY).toBe(0);
    });

    it('enables and disables window autoResize event listeners cleanly', () => {
      const autoManager = new ViewportManager({
        canvas,
        autoResize: true,
      });

      expect(() => autoManager.disableAutoResize()).not.toThrow();
      expect(() => autoManager.enableAutoResize()).not.toThrow();
      autoManager.destroy();
    });
  });
});
