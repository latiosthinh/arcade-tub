import {
  CardinalDirection,
  DPadConfig,
  FireButtonConfig,
  TouchControlState,
} from './types';

export interface TouchControlsOptions {
  dpad: DPadConfig;
  fireButton: FireButtonConfig;
  container?: HTMLElement | Window | null;
}

export class TouchControls {
  private dpadConfig: DPadConfig;
  private fireConfig: FireButtonConfig;
  private container: HTMLElement | Window | null = null;

  private dpadPointerId: number | null = null;
  private firePointerId: number | null = null;

  private state: TouchControlState = {
    direction: null,
    isFiring: false,
    dpadActive: false,
    fireActive: false,
    rawVector: { x: 0, y: 0 },
  };

  private lastDirection: CardinalDirection | null = null;

  // Bound event handlers for clean removal
  private onPointerDownBound: (e: PointerEvent) => void;
  private onPointerMoveBound: (e: PointerEvent) => void;
  private onPointerUpBound: (e: PointerEvent) => void;
  private onPointerCancelBound: (e: PointerEvent) => void;

  constructor(options: TouchControlsOptions) {
    this.dpadConfig = {
      hysteresisAngleDeg: 10,
      ...options.dpad,
    };
    this.fireConfig = { ...options.fireButton };

    this.onPointerDownBound = this.onPointerDown.bind(this);
    this.onPointerMoveBound = this.onPointerMove.bind(this);
    this.onPointerUpBound = this.onPointerUp.bind(this);
    this.onPointerCancelBound = this.onPointerCancel.bind(this);

    if (options.container) {
      this.attach(options.container);
    }
  }

  public attach(container: HTMLElement | Window): void {
    this.detach();
    this.container = container;
    const target = container;

    // Apply touch-action: none to container if HTMLElement
    if (container instanceof HTMLElement) {
      container.style.touchAction = 'none';
      container.style.userSelect = 'none';
      (container.style as any).webkitUserSelect = 'none';
    }

    target.addEventListener('pointerdown', this.onPointerDownBound as EventListener);
    target.addEventListener('pointermove', this.onPointerMoveBound as EventListener);
    target.addEventListener('pointerup', this.onPointerUpBound as EventListener);
    target.addEventListener('pointercancel', this.onPointerCancelBound as EventListener);
  }

  public detach(): void {
    if (!this.container) return;
    const target = this.container;
    target.removeEventListener('pointerdown', this.onPointerDownBound as EventListener);
    target.removeEventListener('pointermove', this.onPointerMoveBound as EventListener);
    target.removeEventListener('pointerup', this.onPointerUpBound as EventListener);
    target.removeEventListener('pointercancel', this.onPointerCancelBound as EventListener);
    this.container = null;
    this.reset();
  }

  public destroy(): void {
    this.detach();
  }

  public getState(): Readonly<TouchControlState> {
    return this.state;
  }

  public setDPadConfig(config: Partial<DPadConfig>): void {
    this.dpadConfig = { ...this.dpadConfig, ...config };
  }

  public setFireConfig(config: Partial<FireButtonConfig>): void {
    this.fireConfig = { ...this.fireConfig, ...config };
  }

  public reset(): void {
    this.dpadPointerId = null;
    this.firePointerId = null;
    this.lastDirection = null;
    this.state = {
      direction: null,
      isFiring: false,
      dpadActive: false,
      fireActive: false,
      rawVector: { x: 0, y: 0 },
    };
  }

  // --- Manual / Simulated Input Handlers (for unit tests & decoupled event dispatch) ---

  public handlePointerDown(pointerId: number, x: number, y: number): void {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;

    // Check Fire Button
    const distToFire = Math.hypot(x - this.fireConfig.centerX, y - this.fireConfig.centerY);
    if (distToFire <= this.fireConfig.radius * 1.5 && this.firePointerId === null) {
      this.firePointerId = pointerId;
      this.state.fireActive = true;
      this.state.isFiring = true;
      return;
    }

    // Check D-Pad
    const distToDPad = Math.hypot(x - this.dpadConfig.centerX, y - this.dpadConfig.centerY);
    if (distToDPad <= this.dpadConfig.radius * 1.5 && this.dpadPointerId === null) {
      this.dpadPointerId = pointerId;
      this.state.dpadActive = true;
      this.updateDPadDirection(x, y);
    }
  }

  public handlePointerMove(pointerId: number, x: number, y: number): void {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;

    if (this.dpadPointerId === pointerId) {
      this.updateDPadDirection(x, y);
    }
  }

  public handlePointerUp(pointerId: number): void {
    if (this.dpadPointerId === pointerId) {
      this.dpadPointerId = null;
      this.state.dpadActive = false;
      this.state.direction = null;
      this.state.rawVector = { x: 0, y: 0 };
      this.lastDirection = null;
    }

    if (this.firePointerId === pointerId) {
      this.firePointerId = null;
      this.state.fireActive = false;
      this.state.isFiring = false;
    }
  }

  public handlePointerCancel(pointerId: number): void {
    this.handlePointerUp(pointerId);
  }

  // --- DOM Event Listeners ---

  private getEventCoords(e: PointerEvent): { x: number; y: number } {
    if (this.container && this.container instanceof HTMLElement) {
      const rect = this.container.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    return { x: e.clientX, y: e.clientY };
  }

  private onPointerDown(e: PointerEvent): void {
    const coords = this.getEventCoords(e);
    this.handlePointerDown(e.pointerId, coords.x, coords.y);
  }

  private onPointerMove(e: PointerEvent): void {
    const coords = this.getEventCoords(e);
    this.handlePointerMove(e.pointerId, coords.x, coords.y);
  }

  private onPointerUp(e: PointerEvent): void {
    this.handlePointerUp(e.pointerId);
  }

  private onPointerCancel(e: PointerEvent): void {
    this.handlePointerCancel(e.pointerId);
  }

  // --- Kinematics & Angular Hysteresis ---

  private updateDPadDirection(x: number, y: number): void {
    const dx = x - this.dpadConfig.centerX;
    const dy = y - this.dpadConfig.centerY;
    const dist = Math.hypot(dx, dy);

    this.state.rawVector = { x: dx, y: dy };

    if (dist < this.dpadConfig.deadzone) {
      this.state.direction = null;
      this.lastDirection = null;
      return;
    }

    // Angle in degrees: 0 = RIGHT, 90 = DOWN, 180/-180 = LEFT, -90 = UP
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angle < 0) angle += 360; // Normalize to [0, 360)

    const hysteresis = this.dpadConfig.hysteresisAngleDeg || 10;
    const current = this.lastDirection;

    const getNominalDir = (deg: number): CardinalDirection => {
      if (deg >= 45 && deg < 135) return 'DOWN';
      if (deg >= 135 && deg < 225) return 'LEFT';
      if (deg >= 225 && deg < 315) return 'UP';
      return 'RIGHT';
    };

    let dir: CardinalDirection;

    if (!current) {
      dir = getNominalDir(angle);
    } else {
      let centerAngle = 0;
      switch (current) {
        case 'RIGHT':
          centerAngle = 0;
          break;
        case 'DOWN':
          centerAngle = 90;
          break;
        case 'LEFT':
          centerAngle = 180;
          break;
        case 'UP':
          centerAngle = 270;
          break;
      }

      let diff = Math.abs(angle - centerAngle);
      if (diff > 180) {
        diff = 360 - diff;
      }

      if (diff <= 45 + hysteresis) {
        dir = current;
      } else {
        dir = getNominalDir(angle);
      }
    }

    this.state.direction = dir;
    this.lastDirection = dir;
  }

  // --- Tactile Virtual Controls Renderer ---

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 1. Draw D-Pad Base
    const { centerX: dX, centerY: dY, radius: dR } = this.dpadConfig;
    const armWidth = dR * 0.7;
    const armLength = dR * 2.2;

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.roundRect(dX - armLength / 2 + 2, dY - armWidth / 2 + 2, armLength, armWidth, 6);
    ctx.roundRect(dX - armWidth / 2 + 2, dY - armLength / 2 + 2, armWidth, armLength, 6);
    ctx.fill();

    // Cardboard cross body
    ctx.fillStyle = '#C8AD7F'; // Cardboard light
    ctx.strokeStyle = '#8B6508';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(dX - armLength / 2, dY - armWidth / 2, armLength, armWidth, 6);
    ctx.roundRect(dX - armWidth / 2, dY - armLength / 2, armWidth, armLength, 6);
    ctx.fill();
    ctx.stroke();

    // Active directional highlights
    const activeDir = this.state.direction;
    ctx.fillStyle = '#5A3D28'; // Dark Kraft pressed
    if (activeDir === 'UP') {
      ctx.fillRect(dX - armWidth / 2 + 2, dY - armLength / 2 + 2, armWidth - 4, armLength / 2 - 2);
    } else if (activeDir === 'DOWN') {
      ctx.fillRect(dX - armWidth / 2 + 2, dY, armWidth - 4, armLength / 2 - 2);
    } else if (activeDir === 'LEFT') {
      ctx.fillRect(dX - armLength / 2 + 2, dY - armWidth / 2 + 2, armLength / 2 - 2, armWidth - 4);
    } else if (activeDir === 'RIGHT') {
      ctx.fillRect(dX, dY - armWidth / 2 + 2, armLength / 2 - 2, armWidth - 4);
    }

    // Directional Arrows
    this.drawArrow(ctx, dX, dY - dR * 0.7, 'UP', activeDir === 'UP');
    this.drawArrow(ctx, dX, dY + dR * 0.7, 'DOWN', activeDir === 'DOWN');
    this.drawArrow(ctx, dX - dR * 0.7, dY, 'LEFT', activeDir === 'LEFT');
    this.drawArrow(ctx, dX + dR * 0.7, dY, 'RIGHT', activeDir === 'RIGHT');

    // 2. Draw Fire Button
    const { centerX: fX, centerY: fY, radius: fR } = this.fireConfig;
    const isPressed = this.state.isFiring;

    // Fire button shadow
    if (!isPressed) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(fX + 3, fY + 3, fR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fire button body (tactile stamp look)
    ctx.fillStyle = isPressed ? '#A32A2A' : '#D32F2F'; // Punchy red stamp
    ctx.strokeStyle = '#5E1010';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(fX + (isPressed ? 1 : 0), fY + (isPressed ? 1 : 0), fR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Fire Button Label (FIRE / A)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.round(fR * 0.45)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FIRE', fX + (isPressed ? 1 : 0), fY + (isPressed ? 1 : 0));

    ctx.restore();
  }

  private drawArrow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    dir: CardinalDirection,
    active: boolean
  ): void {
    ctx.save();
    ctx.translate(x, y);
    if (dir === 'DOWN') ctx.rotate(Math.PI);
    else if (dir === 'LEFT') ctx.rotate(-Math.PI / 2);
    else if (dir === 'RIGHT') ctx.rotate(Math.PI / 2);

    ctx.fillStyle = active ? '#F5DEB3' : '#6B4226';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(6, 4);
    ctx.lineTo(-6, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
