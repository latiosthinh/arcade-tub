import { InputState } from './types';

export class TouchControls {
  private activeTouches = new Map<number, { x: number; y: number; role: 'dpad' | 'jump' | 'attack' | 'discard' }>();
  private dpadCenter = { x: 60, y: 180 };
  private dpadRadius = 40;

  inputState: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    jumpJustPressed: false,
    jumpJustReleased: false,
    attack: false,
    attackJustPressed: false,
    attackJustReleased: false,
    discard: false,
  };

  handleTouchStart(id: number, x: number, y: number, screenWidth: number, screenHeight: number): void {
    if (x < screenWidth * 0.4) {
      // Left side: D-Pad
      this.activeTouches.set(id, { x, y, role: 'dpad' });
      this.updateDpad(x, y);
    } else {
      // Right side: Action buttons
      if (x > screenWidth - 60 && y > screenHeight - 60) {
        // Jump button (bottom-right)
        this.activeTouches.set(id, { x, y, role: 'jump' });
        this.inputState.jump = true;
        this.inputState.jumpJustPressed = true;
      } else if (x > screenWidth - 110 && y > screenHeight - 60) {
        // Attack button (middle-right)
        this.activeTouches.set(id, { x, y, role: 'attack' });
        this.inputState.attack = true;
        this.inputState.attackJustPressed = true;
      } else if (x > screenWidth - 85 && y > screenHeight - 110) {
        // Discard button (top-right)
        this.activeTouches.set(id, { x, y, role: 'discard' });
        this.inputState.discard = true;
      }
    }
  }

  handleTouchMove(id: number, x: number, y: number): void {
    const touch = this.activeTouches.get(id);
    if (touch && touch.role === 'dpad') {
      touch.x = x;
      touch.y = y;
      this.updateDpad(x, y);
    }
  }

  handleTouchEnd(id: number): void {
    const touch = this.activeTouches.get(id);
    if (touch) {
      if (touch.role === 'dpad') {
        this.inputState.left = false;
        this.inputState.right = false;
        this.inputState.up = false;
        this.inputState.down = false;
      } else if (touch.role === 'jump') {
        this.inputState.jump = false;
        this.inputState.jumpJustReleased = true;
      } else if (touch.role === 'attack') {
        this.inputState.attack = false;
        this.inputState.attackJustReleased = true;
      } else if (touch.role === 'discard') {
        this.inputState.discard = false;
      }
      this.activeTouches.delete(id);
    }
  }

  private updateDpad(x: number, y: number): void {
    const dx = x - this.dpadCenter.x;
    const dy = y - this.dpadCenter.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 10) {
      this.inputState.left = false;
      this.inputState.right = false;
      this.inputState.up = false;
      this.inputState.down = false;
      return;
    }

    const angle = Math.atan2(dy, dx);
    this.inputState.right = angle > -Math.PI / 3 && angle < Math.PI / 3;
    this.inputState.left = angle > (2 * Math.PI) / 3 || angle < (-2 * Math.PI) / 3;
    this.inputState.down = angle > Math.PI / 6 && angle < (5 * Math.PI) / 6;
    this.inputState.up = angle < -Math.PI / 6 && angle > (-5 * Math.PI) / 6;
  }

  update(): void {
    this.inputState.jumpJustPressed = false;
    this.inputState.jumpJustReleased = false;
    this.inputState.attackJustPressed = false;
    this.inputState.attackJustReleased = false;
  }
}
