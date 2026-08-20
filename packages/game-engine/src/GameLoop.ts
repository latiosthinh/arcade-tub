export interface GameScene {
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export class GameLoop {
  readonly width: number;
  readonly height: number;
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

  constructor(canvas: HTMLCanvasElement, width: number = 800, height: number = 600) {
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');

    const explicitWidth = canvas.getAttribute('width');
    const explicitHeight = canvas.getAttribute('height');

    this.width = explicitWidth ? parseInt(explicitWidth, 10) : width;
    this.height = explicitHeight ? parseInt(explicitHeight, 10) : height;

    this._canvas.width = this.width;
    this._canvas.height = this.height;

    this._setupResizeObserver();
  }

  private _setupResizeObserver(): void {
    const updateSize = () => {
      const parent = this._canvas.parentElement || document.body;
      const containerWidth = parent.clientWidth || window.innerWidth;
      const containerHeight = parent.clientHeight || window.innerHeight;

      if (containerWidth > 0 && containerHeight > 0) {
        const scaleX = containerWidth / this.width;
        const scaleY = containerHeight / this.height;
        // Strict aspect-ratio preservation (contain mode - no stretching or distortion)
        this._scale = Math.min(scaleX, scaleY);

        this._canvas.style.width = `${Math.floor(this.width * this._scale)}px`;
        this._canvas.style.height = `${Math.floor(this.height * this._scale)}px`;
        this._canvas.style.objectFit = 'contain';
      }
    };

    if (typeof ResizeObserver !== 'undefined') {
      const parent = this._canvas.parentElement || document.body;
      this._resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      this._resizeObserver.observe(parent);
    }

    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);
    // Initial size pass
    updateSize();
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
