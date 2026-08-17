export interface GameScene {
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export class GameLoop {
  readonly width: number = 800;
  readonly height: number = 600;
  private _scale: number = 1;

  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D | null;
  private _scene: GameScene | null = null;
  private _running: boolean = false;
  private _animationFrameId: number | null = null;
  private _lastTime: number = 0;
  private _accumulator: number = 0;
  private _resizeObserver: ResizeObserver | null = null;

  private static readonly TICK_RATE: number = 1000 / 60; // 60fps (~16.66ms)

  get scale(): number {
    return this._scale;
  }

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');

    this._canvas.width = this.width;
    this._canvas.height = this.height;

    this._setupResizeObserver();
  }

  private _setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const parent = this._canvas.parentElement;
    if (!parent) {
      return;
    }

    this._resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: containerWidth, height: containerHeight } = entry.contentRect;
        if (containerWidth > 0 && containerHeight > 0) {
          const scaleX = containerWidth / this.width;
          const scaleY = containerHeight / this.height;
          this._scale = Math.min(scaleX, scaleY);

          this._canvas.style.width = `${this.width * this._scale}px`;
          this._canvas.style.height = `${this.height * this._scale}px`;
        }
      }
    });

    this._resizeObserver.observe(parent);
  }

  setScene(scene: GameScene): void {
    this._scene = scene;
  }

  start(): void {
    if (this._running) {
      return;
    }
    this._running = true;
    this._lastTime = performance.now();
    this._accumulator = 0;

    const loop = (currentTime: number): void => {
      if (!this._running) {
        return;
      }

      const elapsed = currentTime - this._lastTime;
      this._lastTime = currentTime;

      // Prevent spiral of death if tab was backgrounded (cap at 250ms)
      this._accumulator += Math.min(elapsed, 250);

      while (this._accumulator >= GameLoop.TICK_RATE) {
        if (this._scene) {
          this._scene.update(GameLoop.TICK_RATE / 1000);
        }
        this._accumulator -= GameLoop.TICK_RATE;
      }

      if (this._ctx && this._scene) {
        this._scene.render(this._ctx);
      }

      this._animationFrameId = requestAnimationFrame(loop);
    };

    this._animationFrameId = requestAnimationFrame(loop);
  }

  stop(): void {
    this._running = false;
    if (this._animationFrameId !== null) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
  }

  destroy(): void {
    this.stop();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }
}
