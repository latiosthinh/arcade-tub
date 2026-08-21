import { InputState } from './types';

export class TouchControls {
  private activeTouches = new Map<number, { x: number; y: number; role: 'dpad' | 'jump' | 'shuriken' | 'sword' }>();
  private dpadCenter = { x: 70, y: 180 };

  inputState: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    jumpJustPressed: false,
    shuriken: false,
    shurikenJustPressed: false,
    sword: false,
    swordJustPressed: false,
  };

  handleTouchStart(id: number, x: number, y: number, screenWidth: number, screenHeight: number): void {
    if (x < screenWidth * 0.4) {
      this.activeTouches.set(id, { x, y, role: 'dpad' });
      this.updateDpad(x, y);
    } else {
      if (x > screenWidth - 70 && y > screenHeight - 70) {
        // Jump button (bottom right)
        this.activeTouches.set(id, { x, y, role: 'jump' });
        this.inputState.jump = true;
        this.inputState.jumpJustPressed = true;
      } else if (x > screenWidth - 130 && y > screenHeight - 70) {
        // Sword slash button
        this.activeTouches.set(id, { x, y, role: 'sword' });
        this.inputState.sword = true;
        this.inputState.swordJustPressed = true;
      } else if (x > screenWidth - 100 && y > screenHeight - 130) {
        // Shuriken button
        this.activeTouches.set(id, { x, y, role: 'shuriken' });
        this.inputState.shuriken = true;
        this.inputState.shurikenJustPressed = true;
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
      } else if (touch.role === 'sword') {
        this.inputState.sword = false;
      } else if (touch.role === 'shuriken') {
        this.inputState.shuriken = false;
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
    this.inputState.swordJustPressed = false;
    this.inputState.shurikenJustPressed = false;
  }
}
