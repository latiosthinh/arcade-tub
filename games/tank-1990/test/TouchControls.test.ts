import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TouchControls } from '../src/TouchControls';

describe('TouchControls', () => {
  let touchControls: TouchControls;
  const dpadConfig = {
    centerX: 100,
    centerY: 300,
    radius: 60,
    deadzone: 15,
    hysteresisAngleDeg: 10,
  };
  const fireConfig = {
    centerX: 400,
    centerY: 300,
    radius: 40,
  };

  beforeEach(() => {
    touchControls = new TouchControls({
      dpad: dpadConfig,
      fireButton: fireConfig,
    });
  });

  afterEach(() => {
    touchControls.destroy();
  });

  describe('Initial State & Defaults', () => {
    it('initializes with inactive default control state', () => {
      const state = touchControls.getState();
      expect(state.direction).toBeNull();
      expect(state.isFiring).toBe(false);
      expect(state.dpadActive).toBe(false);
      expect(state.fireActive).toBe(false);
      expect(state.rawVector).toEqual({ x: 0, y: 0 });
    });
  });

  describe('Deadzone Handling', () => {
    it('returns null direction when pointer displacement is within deadzone radius', () => {
      // deadzone is 15px, tap at distance 10px (100+10, 300)
      touchControls.handlePointerDown(1, 110, 300);
      const state = touchControls.getState();

      expect(state.dpadActive).toBe(true);
      expect(state.direction).toBeNull();
      expect(state.rawVector).toEqual({ x: 10, y: 0 });
    });

    it('sets direction when pointer moves outside deadzone', () => {
      touchControls.handlePointerDown(1, 105, 300); // 5px -> deadzone
      expect(touchControls.getState().direction).toBeNull();

      touchControls.handlePointerMove(1, 130, 300); // 30px -> outside deadzone
      expect(touchControls.getState().direction).toBe('RIGHT');
    });

    it('clears direction when pointer moves back inside deadzone', () => {
      touchControls.handlePointerDown(1, 135, 300); // outside
      expect(touchControls.getState().direction).toBe('RIGHT');

      touchControls.handlePointerMove(1, 105, 300); // inside deadzone
      expect(touchControls.getState().direction).toBeNull();
    });
  });

  describe('Cardinal Direction Sectors (Nominal 4-way Angles)', () => {
    it('resolves pure RIGHT (0 deg)', () => {
      touchControls.handlePointerDown(1, 140, 300); // dx=40, dy=0
      expect(touchControls.getState().direction).toBe('RIGHT');
    });

    it('resolves pure DOWN (90 deg)', () => {
      touchControls.handlePointerDown(1, 100, 340); // dx=0, dy=40
      expect(touchControls.getState().direction).toBe('DOWN');
    });

    it('resolves pure LEFT (180 deg)', () => {
      touchControls.handlePointerDown(1, 60, 300); // dx=-40, dy=0
      expect(touchControls.getState().direction).toBe('LEFT');
    });

    it('resolves pure UP (270 deg)', () => {
      touchControls.handlePointerDown(1, 100, 260); // dx=0, dy=-40
      expect(touchControls.getState().direction).toBe('UP');
    });

    it('resolves near-center quadrant directions without prior state', () => {
      // 30 deg -> RIGHT (nominal [315, 45))
      touchControls.reset();
      touchControls.handlePointerDown(1, 100 + 40 * Math.cos((30 * Math.PI) / 180), 300 + 40 * Math.sin((30 * Math.PI) / 180));
      expect(touchControls.getState().direction).toBe('RIGHT');

      // 60 deg -> DOWN (nominal [45, 135))
      touchControls.reset();
      touchControls.handlePointerDown(1, 100 + 40 * Math.cos((60 * Math.PI) / 180), 300 + 40 * Math.sin((60 * Math.PI) / 180));
      expect(touchControls.getState().direction).toBe('DOWN');

      // 150 deg -> LEFT (nominal [135, 225))
      touchControls.reset();
      touchControls.handlePointerDown(1, 100 + 40 * Math.cos((150 * Math.PI) / 180), 300 + 40 * Math.sin((150 * Math.PI) / 180));
      expect(touchControls.getState().direction).toBe('LEFT');

      // 250 deg -> UP (nominal [225, 315))
      touchControls.reset();
      touchControls.handlePointerDown(1, 100 + 40 * Math.cos((250 * Math.PI) / 180), 300 + 40 * Math.sin((250 * Math.PI) / 180));
      expect(touchControls.getState().direction).toBe('UP');
    });
  });

  describe('Angular Hysteresis Buffering', () => {
    it('holds RIGHT when moving to 48 deg (within 45 + 10 deg buffer)', () => {
      // Start at 0 deg (RIGHT)
      touchControls.handlePointerDown(1, 140, 300);
      expect(touchControls.getState().direction).toBe('RIGHT');

      // Move to 48 deg (past 45 deg, but below 55 deg threshold)
      const rad48 = (48 * Math.PI) / 180;
      touchControls.handlePointerMove(1, 100 + 40 * Math.cos(rad48), 300 + 40 * Math.sin(rad48));
      expect(touchControls.getState().direction).toBe('RIGHT');
    });

    it('switches from RIGHT to DOWN once exceeding 55 deg threshold', () => {
      touchControls.handlePointerDown(1, 140, 300);
      expect(touchControls.getState().direction).toBe('RIGHT');

      // Move to 58 deg (exceeds 45 + 10 = 55 deg)
      const rad58 = (58 * Math.PI) / 180;
      touchControls.handlePointerMove(1, 100 + 40 * Math.cos(rad58), 300 + 40 * Math.sin(rad58));
      expect(touchControls.getState().direction).toBe('DOWN');
    });

    it('holds DOWN when moving back to 40 deg (within 45 - 10 = 35 deg buffer)', () => {
      // Start DOWN at 90 deg
      touchControls.handlePointerDown(1, 100, 340);
      expect(touchControls.getState().direction).toBe('DOWN');

      // Move to 40 deg (below 45 deg, but above 35 deg threshold)
      const rad40 = (40 * Math.PI) / 180;
      touchControls.handlePointerMove(1, 100 + 40 * Math.cos(rad40), 300 + 40 * Math.sin(rad40));
      expect(touchControls.getState().direction).toBe('DOWN');

      // Move to 30 deg (below 35 deg threshold) -> switches to RIGHT
      const rad30 = (30 * Math.PI) / 180;
      touchControls.handlePointerMove(1, 100 + 40 * Math.cos(rad30), 300 + 40 * Math.sin(rad30));
      expect(touchControls.getState().direction).toBe('RIGHT');
    });

    it('holds LEFT across 135 and 225 deg boundaries within hysteresis buffer', () => {
      touchControls.handlePointerDown(1, 60, 300); // 180 deg (LEFT)
      expect(touchControls.getState().direction).toBe('LEFT');

      // Move towards DOWN (130 deg > 135 - 10 = 125 deg) -> remains LEFT
      const rad130 = (130 * Math.PI) / 180;
      touchControls.handlePointerMove(1, 100 + 40 * Math.cos(rad130), 300 + 40 * Math.sin(rad130));
      expect(touchControls.getState().direction).toBe('LEFT');

      // Move towards UP (230 deg < 225 + 10 = 235 deg) -> remains LEFT
      const rad230 = (230 * Math.PI) / 180;
      touchControls.handlePointerMove(1, 100 + 40 * Math.cos(rad230), 300 + 40 * Math.sin(rad230));
      expect(touchControls.getState().direction).toBe('LEFT');

      // Move to 240 deg (> 235 deg threshold) -> switches to UP
      const rad240 = (240 * Math.PI) / 180;
      touchControls.handlePointerMove(1, 100 + 40 * Math.cos(rad240), 300 + 40 * Math.sin(rad240));
      expect(touchControls.getState().direction).toBe('UP');
    });
  });

  describe('Multi-Touch Pointer ID Isolation', () => {
    it('isolates D-Pad and Fire button interactions across separate pointer IDs', () => {
      // Pointer 1 touches D-Pad
      touchControls.handlePointerDown(1, 140, 300);
      expect(touchControls.getState().dpadActive).toBe(true);
      expect(touchControls.getState().direction).toBe('RIGHT');
      expect(touchControls.getState().fireActive).toBe(false);
      expect(touchControls.getState().isFiring).toBe(false);

      // Pointer 2 touches Fire button simultaneously
      touchControls.handlePointerDown(2, 400, 300);
      expect(touchControls.getState().dpadActive).toBe(true);
      expect(touchControls.getState().direction).toBe('RIGHT');
      expect(touchControls.getState().fireActive).toBe(true);
      expect(touchControls.getState().isFiring).toBe(true);

      // Pointer 2 released (tap fire done), Pointer 1 still held on D-Pad
      touchControls.handlePointerUp(2);
      expect(touchControls.getState().dpadActive).toBe(true);
      expect(touchControls.getState().direction).toBe('RIGHT');
      expect(touchControls.getState().fireActive).toBe(false);
      expect(touchControls.getState().isFiring).toBe(false);

      // Pointer 1 released
      touchControls.handlePointerUp(1);
      expect(touchControls.getState().dpadActive).toBe(false);
      expect(touchControls.getState().direction).toBeNull();
    });

    it('ignores extraneous third pointer or touches outside control zones', () => {
      // Pointer 1 on D-Pad
      touchControls.handlePointerDown(1, 100, 260); // UP
      // Pointer 99 touches middle of nowhere
      touchControls.handlePointerDown(99, 250, 100);

      expect(touchControls.getState().direction).toBe('UP');
      expect(touchControls.getState().isFiring).toBe(false);

      // Lifting pointer 99 does not alter D-Pad or Fire state
      touchControls.handlePointerUp(99);
      expect(touchControls.getState().direction).toBe('UP');
    });

    it('handles pointer cancel identically to pointer up', () => {
      touchControls.handlePointerDown(1, 100, 260);
      touchControls.handlePointerDown(2, 400, 300);

      expect(touchControls.getState().dpadActive).toBe(true);
      expect(touchControls.getState().fireActive).toBe(true);

      touchControls.handlePointerCancel(1);
      expect(touchControls.getState().dpadActive).toBe(false);
      expect(touchControls.getState().direction).toBeNull();
      expect(touchControls.getState().fireActive).toBe(true);

      touchControls.handlePointerCancel(2);
      expect(touchControls.getState().fireActive).toBe(false);
    });
  });

  describe('DOM Event Binding & Container Attachment', () => {
    it('attaches pointer event listeners and processes simulated DOM events', () => {
      const mockContainer = document.createElement('div');
      mockContainer.getBoundingClientRect = () =>
        ({ left: 50, top: 50, width: 600, height: 400, right: 650, bottom: 450, x: 50, y: 50, toJSON: () => {} } as DOMRect);

      const attachedControls = new TouchControls({
        dpad: dpadConfig,
        fireButton: fireConfig,
        container: mockContainer,
      });

      // Dispatch PointerEvent on container: clientX=190 (rel=140), clientY=350 (rel=300) -> DPad RIGHT
      const downEvent = new Event('pointerdown') as any;
      downEvent.pointerId = 10;
      downEvent.clientX = 190;
      downEvent.clientY = 350;
      mockContainer.dispatchEvent(downEvent);

      expect(attachedControls.getState().dpadActive).toBe(true);
      expect(attachedControls.getState().direction).toBe('RIGHT');

      // Dispatch PointerUp
      const upEvent = new Event('pointerup') as any;
      upEvent.pointerId = 10;
      mockContainer.dispatchEvent(upEvent);

      expect(attachedControls.getState().dpadActive).toBe(false);
      expect(attachedControls.getState().direction).toBeNull();

      attachedControls.destroy();
    });

    it('detaches cleanly and resets state', () => {
      const mockContainer = document.createElement('div');
      const attachedControls = new TouchControls({
        dpad: dpadConfig,
        fireButton: fireConfig,
        container: mockContainer,
      });

      attachedControls.handlePointerDown(1, 140, 300);
      expect(attachedControls.getState().dpadActive).toBe(true);

      attachedControls.detach();
      expect(attachedControls.getState().dpadActive).toBe(false);
      expect(attachedControls.getState().direction).toBeNull();
    });
  });

  describe('Dynamic Configuration & Rendering', () => {
    it('updates D-Pad and Fire configurations via setters', () => {
      touchControls.setDPadConfig({ deadzone: 25 });
      touchControls.setFireConfig({ radius: 50 });

      // Inside new deadzone 25 (e.g. 20px)
      touchControls.handlePointerDown(1, 120, 300);
      expect(touchControls.getState().direction).toBeNull();
    });

    it('renders without error to CanvasRenderingContext2D', () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        touchControls.handlePointerDown(1, 100, 260); // UP
        touchControls.handlePointerDown(2, 400, 300); // FIRE
        expect(() => touchControls.render(ctx)).not.toThrow();
      }
    });
  });
});
