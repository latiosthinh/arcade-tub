export class SceneManager {
  private _scenes: string[] = [];

  push(scene: string): void {
    this._scenes.push(scene);
  }

  pop(): string | undefined {
    return this._scenes.pop();
  }

  current(): string | null {
    return this._scenes.length > 0 ? (this._scenes[this._scenes.length - 1] ?? null) : null;
  }

  replace(scene: string): void {
    this._scenes.pop();
    this._scenes.push(scene);
  }

  clear(): void {
    this._scenes = [];
  }
}
