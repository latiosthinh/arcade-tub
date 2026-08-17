export class InputManager {
  private _pressed = new Set<string>();
  private _justPressed = new Set<string>();
  private _justReleased = new Set<string>();

  private _onKeyDown = (event: KeyboardEvent): void => {
    if (!this._pressed.has(event.code)) {
      this._justPressed.add(event.code);
    }
    this._pressed.add(event.code);
  };

  private _onKeyUp = (event: KeyboardEvent): void => {
    this._pressed.delete(event.code);
    this._justReleased.add(event.code);
  };

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this._onKeyDown);
      window.addEventListener('keyup', this._onKeyUp);
    }
  }

  isDown(key: string): boolean {
    return this._pressed.has(key);
  }

  justPressed(key: string): boolean {
    return this._justPressed.has(key);
  }

  justReleased(key: string): boolean {
    return this._justReleased.has(key);
  }

  update(): void {
    this._justPressed.clear();
    this._justReleased.clear();
  }

  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this._onKeyDown);
      window.removeEventListener('keyup', this._onKeyUp);
    }
  }
}
