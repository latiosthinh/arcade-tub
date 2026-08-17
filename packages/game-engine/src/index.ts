export class GameLoop {
  constructor(_canvas: HTMLCanvasElement) { /* stub */ }
  start(): void { /* stub */ }
  stop(): void { /* stub */ }
}

export class InputManager {
  isDown(_key: string): boolean { return false; }
  justPressed(_key: string): boolean { return false; }
  justReleased(_key: string): boolean { return false; }
}

export class SceneManager {
  push(_scene: string): void { /* stub */ }
  pop(): void { /* stub */ }
  current(): string | null { return null; }
}
