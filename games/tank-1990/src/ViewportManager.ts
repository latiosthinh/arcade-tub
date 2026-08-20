import { ViewportMetrics, ViewportTransform } from './types';

export interface ViewportManagerOptions {
  canvas: HTMLCanvasElement;
  virtualWidth?: number;
  virtualHeight?: number;
  autoResize?: boolean;
}

export class ViewportManager {
  private canvas: HTMLCanvasElement;
  private virtualWidth: number;
  private virtualHeight: number;

  private metrics: ViewportMetrics = {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    canvasWidth: 512,
    canvasHeight: 448,
    gameWidth: 512,
    gameHeight: 448,
    isLandscape: true,
  };

  private resizeListenerBound: () => void;
  private isListening = false;

  constructor(options: ViewportManagerOptions) {
    this.canvas = options.canvas;
    this.virtualWidth = options.virtualWidth || 480;
    this.virtualHeight = options.virtualHeight || 416;

    this.resizeListenerBound = () => {
      const parent = this.canvas.parentElement || document.body;
      this.resize(parent.clientWidth || window.innerWidth, parent.clientHeight || window.innerHeight);
    };

    if (options.autoResize) {
      this.enableAutoResize();
    }
  }

  public enableAutoResize(): void {
    if (this.isListening) return;
    window.addEventListener('resize', this.resizeListenerBound);
    window.addEventListener('orientationchange', this.resizeListenerBound);
    this.isListening = true;
  }

  public disableAutoResize(): void {
    if (!this.isListening) return;
    window.removeEventListener('resize', this.resizeListenerBound);
    window.removeEventListener('orientationchange', this.resizeListenerBound);
    this.isListening = false;
  }

  public destroy(): void {
    this.disableAutoResize();
  }

  /**
   * Recalculates aspect ratio, scale factor, and centering letterbox offsets based on container dimensions.
   */
  public resize(containerWidth: number, containerHeight: number): ViewportMetrics {
    // Guard against zero / negative or non-finite inputs
    const width = Math.max(1, Number.isFinite(containerWidth) ? containerWidth : 1);
    const height = Math.max(1, Number.isFinite(containerHeight) ? containerHeight : 1);

    const scaleX = width / this.virtualWidth;
    const scaleY = height / this.virtualHeight;
    const scale = Math.max(0.001, Math.min(scaleX, scaleY));

    const scaledWidth = this.virtualWidth * scale;
    const scaledHeight = this.virtualHeight * scale;

    const offsetX = Math.max(0, (width - scaledWidth) / 2);
    const offsetY = Math.max(0, (height - scaledHeight) / 2);

    const isLandscape = width >= height;

    this.metrics = {
      scale,
      offsetX,
      offsetY,
      canvasWidth: width,
      canvasHeight: height,
      gameWidth: this.virtualWidth,
      gameHeight: this.virtualHeight,
      isLandscape,
    };

    this.applyCanvasStyles();

    return this.metrics;
  }

  /**
   * Applies CSS transforms and crisp pixelated styling to the target canvas.
   */
  private applyCanvasStyles(): void {
    if (!this.canvas) return;

    // Ensure native internal buffer resolution remains crisp virtual resolution
    if (this.canvas.width !== this.virtualWidth) {
      this.canvas.width = this.virtualWidth;
    }
    if (this.canvas.height !== this.virtualHeight) {
      this.canvas.height = this.virtualHeight;
    }

    const style = this.canvas.style;
    (style as any).imageRendering = 'pixelated';
  }

  /**
   * Projects client/screen coordinates (e.g. from pointer events) into virtual game coordinates.
   */
  public clientToVirtual(
    clientX: number,
    clientY: number,
    containerRect?: DOMRect | { left: number; top: number; width?: number; height?: number }
  ): { x: number; y: number } {
    let baseLeft = 0;
    let baseTop = 0;

    if (containerRect) {
      baseLeft = containerRect.left;
      baseTop = containerRect.top;
    } else if (this.canvas.parentElement) {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      baseLeft = rect.left;
      baseTop = rect.top;
    } else {
      const rect = this.canvas.getBoundingClientRect();
      baseLeft = rect.left;
      baseTop = rect.top;
    }

    const relativeX = clientX - baseLeft - this.metrics.offsetX;
    const relativeY = clientY - baseTop - this.metrics.offsetY;

    const scale = Math.max(0.001, this.metrics.scale);
    const virtualX = Math.max(0, Math.min(this.virtualWidth, relativeX / scale));
    const virtualY = Math.max(0, Math.min(this.virtualHeight, relativeY / scale));

    return {
      x: virtualX,
      y: virtualY,
    };
  }

  public getMetrics(): Readonly<ViewportMetrics> {
    return this.metrics;
  }

  public getTransform(): ViewportTransform {
    return {
      scale: this.metrics.scale,
      offsetX: this.metrics.offsetX,
      offsetY: this.metrics.offsetY,
    };
  }
}
