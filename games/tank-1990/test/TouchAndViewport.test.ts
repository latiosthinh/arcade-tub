import { describe, it, expect, beforeEach } from 'vitest';
import { TouchControls } from '../src/TouchControls';
import { ViewportManager } from '../src/ViewportManager';

describe('TouchControls & ViewportManager Unit Tests', () => {
  describe('TouchControls', () => {
    let container: HTMLElement;
    let controls: TouchControls;

    beforeEach(() => {
      container = document.createElement('div');
      controls = new TouchControls({
        dpad: { centerX: 100, centerY: 100, radius: 50, deadzone: 10, hysteresisAngleDeg: 10 },
        fireButton: { centerX: 300, centerY: 100, radius: 40 },
        container,
      });
    });

    it('should initialize with default idle state', () => {
      const state = controls.getState();
      expect(state.direction).toBeNull();
      expect(state.isFiring).toBe(false);
      expect(state.dpadActive).toBe(false);
      expect(state.fireActive).toBe(false);
    });

    it('should ignore deadzone movement inside D-Pad center', () => {
      controls.handlePointerDown(1, 103, 102); // distance < 10
      expect(controls.getState().direction).toBeNull();
      expect(controls.getState().dpadActive).toBe(true);
    });

    it('should detect 4 cardinal directions correctly', () => {
      // RIGHT: dx = 30, dy = 0
      controls.handlePointerDown(1, 130, 100);
      expect(controls.getState().direction).toBe('RIGHT');
      controls.handlePointerUp(1);
      expect(controls.getState().direction).toBeNull();

      // DOWN: dx = 0, dy = 30
      controls.handlePointerDown(1, 100, 130);
      expect(controls.getState().direction).toBe('DOWN');
      controls.handlePointerUp(1);

      // LEFT: dx = -30, dy = 0
      controls.handlePointerDown(1, 70, 100);
      expect(controls.getState().direction).toBe('LEFT');
      controls.handlePointerUp(1);

      // UP: dx = 0, dy = -30
      controls.handlePointerDown(1, 100, 70);
      expect(controls.getState().direction).toBe('UP');
      controls.handlePointerUp(1);
    });

    it('should apply angular hysteresis buffer across sector boundaries', () => {
      // Start in RIGHT sector (angle ~ 0 deg)
      controls.handlePointerDown(1, 130, 100);
      expect(controls.getState().direction).toBe('RIGHT');

      // Move to 40 deg (within standard DOWN boundary if >45, but hysteresis keeps it RIGHT up to 55 deg)
      // 40 deg: dx = cos(40)*30 ~ 23, dy = sin(40)*30 ~ 19.3
      controls.handlePointerMove(1, 100 + 23, 100 + 19.3);
      expect(controls.getState().direction).toBe('RIGHT');

      // Move to 50 deg (boundary + hysteresis requires > 55 deg to switch from RIGHT to DOWN)
      // 50 deg: dx = cos(50)*30 ~ 19.3, dy = sin(50)*30 ~ 23
      controls.handlePointerMove(1, 100 + 19.3, 100 + 23);
      expect(controls.getState().direction).toBe('RIGHT');

      // Move to 60 deg (> 55 deg buffer) -> switches to DOWN
      // 60 deg: dx = cos(60)*30 = 15, dy = sin(60)*30 = 26
      controls.handlePointerMove(1, 100 + 15, 100 + 26);
      expect(controls.getState().direction).toBe('DOWN');
    });

    it('should support multi-touch isolation between D-Pad and Fire button', () => {
      // Hold D-Pad DOWN with pointerId 10
      controls.handlePointerDown(10, 100, 135);
      expect(controls.getState().direction).toBe('DOWN');
      expect(controls.getState().isFiring).toBe(false);

      // Tap Fire button with pointerId 20
      controls.handlePointerDown(20, 300, 100);
      expect(controls.getState().direction).toBe('DOWN');
      expect(controls.getState().isFiring).toBe(true);

      // Release Fire button with pointerId 20 -> D-Pad still active
      controls.handlePointerUp(20);
      expect(controls.getState().direction).toBe('DOWN');
      expect(controls.getState().isFiring).toBe(false);

      // Release D-Pad
      controls.handlePointerUp(10);
      expect(controls.getState().direction).toBeNull();
      expect(controls.getState().dpadActive).toBe(false);
    });

    it('should handle pointercancel cleanly', () => {
      controls.handlePointerDown(5, 130, 100);
      expect(controls.getState().dpadActive).toBe(true);
      controls.handlePointerCancel(5);
      expect(controls.getState().dpadActive).toBe(false);
      expect(controls.getState().direction).toBeNull();
    });
  });

  describe('ViewportManager', () => {
    let canvas: HTMLCanvasElement;
    let viewport: ViewportManager;

    beforeEach(() => {
      canvas = document.createElement('canvas');
      viewport = new ViewportManager({
        canvas,
        virtualWidth: 512,
        virtualHeight: 448,
      });
    });

    it('should compute letterboxed aspect ratio and center offsets for landscape', () => {
      // Container 1024 x 448 (wide) -> scale = min(1024/512, 448/448) = 1
      const metrics = viewport.resize(1024, 448);
      expect(metrics.scale).toBe(1);
      expect(metrics.offsetX).toBe((1024 - 512) / 2); // 256
      expect(metrics.offsetY).toBe(0);
    });

    it('should compute pillarboxed aspect ratio and center offsets for portrait', () => {
      // Container 512 x 896 (tall) -> scale = min(512/512, 896/448) = 1
      const metrics = viewport.resize(512, 896);
      expect(metrics.scale).toBe(1);
      expect(metrics.offsetX).toBe(0);
      expect(metrics.offsetY).toBe((896 - 448) / 2); // 224
    });

    it('should project client coordinates into virtual game coordinates', () => {
      // Scale 2x, container 1024 x 896
      viewport.resize(1024, 896);
      // rect offset at 0, 0
      const containerRect = { left: 0, top: 0, width: 1024, height: 896 } as DOMRect;

      const point = viewport.clientToVirtual(512, 448, containerRect);
      expect(point.x).toBe(256);
      expect(point.y).toBe(224);
    });

    it('should guard against zero or negative dimensions', () => {
      const metrics = viewport.resize(0, -10);
      expect(metrics.scale).toBeGreaterThan(0);
      expect(Number.isFinite(metrics.scale)).toBe(true);
    });
  });
});
