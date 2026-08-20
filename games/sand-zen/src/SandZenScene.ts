import { SandGrid, CELL_EMPTY, CELL_WALL } from './SandGrid';
import { ZenToolManager } from './ZenTools';
import { sandAudio } from './SandAudio';

export class SandZenScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gridCanvas: HTMLCanvasElement;
  private gridCtx: CanvasRenderingContext2D;
  private imgData: ImageData;

  public sandGrid: SandGrid;
  public zenTools: ZenToolManager;

  private isPointerDown: boolean = false;
  private lastPointerGridX: number = 0;
  private lastPointerGridY: number = 0;
  private animationId: number = 0;
  private lastTime: number = 0;
  private chimeTimer: number = 0;

  // Grid layout in screen coordinates
  private basinX: number = 0;
  private basinY: number = 0;
  private basinWidth: number = 0;
  private basinHeight: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context unavailable');
    this.ctx = context;

    // Internal simulation resolution (160x120 offers rich cellular automaton at 60fps)
    this.sandGrid = new SandGrid(160, 120);
    this.zenTools = new ZenToolManager();

    // Off-screen canvas for direct pixel rasterization
    this.gridCanvas = document.createElement('canvas');
    this.gridCanvas.width = this.sandGrid.width;
    this.gridCanvas.height = this.sandGrid.height;
    const gCtx = this.gridCanvas.getContext('2d');
    if (!gCtx) throw new Error('Grid 2D context unavailable');
    this.gridCtx = gCtx;
    this.imgData = this.gridCtx.createImageData(this.sandGrid.width, this.sandGrid.height);

    this.setupEvents();
    this.resize();
  }

  public start(): void {
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;

      this.update(dt);
      this.render();

      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  public destroy(): void {
    cancelAnimationFrame(this.animationId);
    sandAudio.stop();
  }

  public resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Compute basin dimensions preserving aspect ratio with padding
    const padding = 20;
    const availW = w - padding * 2;
    const availH = h - padding * 2 - 80; // room for top/bottom HUD
    const aspect = this.sandGrid.width / this.sandGrid.height;

    if (availW / availH > aspect) {
      this.basinHeight = availH;
      this.basinWidth = availH * aspect;
    } else {
      this.basinWidth = availW;
      this.basinHeight = availW / aspect;
    }

    this.basinX = (w - this.basinWidth) / 2;
    this.basinY = padding + 10;
  }

  private setupEvents(): void {
    window.addEventListener('resize', () => this.resize());

    const getGridCoords = (e: PointerEvent): { gx: number; gy: number } => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const normX = (clientX - this.basinX) / this.basinWidth;
      const normY = (clientY - this.basinY) / this.basinHeight;

      const gx = Math.floor(normX * this.sandGrid.width);
      const gy = Math.floor(normY * this.sandGrid.height);
      return { gx, gy };
    };

    this.canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      this.isPointerDown = true;
      const { gx, gy } = getGridCoords(e);
      this.lastPointerGridX = gx;
      this.lastPointerGridY = gy;
      this.handlePointerAction(gx, gy, true);
    });

    this.canvas.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isPointerDown) return;
      const { gx, gy } = getGridCoords(e);
      this.handlePointerAction(gx, gy, false);
      this.lastPointerGridX = gx;
      this.lastPointerGridY = gy;
    });

    const stopDrag = () => {
      this.isPointerDown = false;
    };

    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);
  }

  private handlePointerAction(gx: number, gy: number, isInitial: boolean): void {
    if (gx < 0 || gx >= this.sandGrid.width || gy < 0 || gy >= this.sandGrid.height) {
      return;
    }

    switch (this.zenTools.currentTool) {
      case 'stream':
        this.sandGrid.addSand(gx, gy, this.zenTools.activeColor, this.zenTools.brushSize, 0.4);
        break;
      case 'rake':
        this.zenTools.applyRake(
          this.sandGrid,
          this.lastPointerGridX,
          this.lastPointerGridY,
          gx,
          gy,
          8,
          4
        );
        sandAudio.triggerRakeScrape();
        break;
      case 'funnel':
        if (isInitial) {
          this.zenTools.placeFunnel(this.sandGrid, gx, gy, 24);
          sandAudio.triggerChime(1.2);
        }
        break;
      case 'brush':
        this.sandGrid.addSand(gx, gy, CELL_EMPTY, this.zenTools.brushSize + 2, 0.0);
        break;
    }
  }

  public update(dt: number): void {
    // 1. Step continuous hopper
    this.zenTools.updateHopper(this.sandGrid, dt);

    // 2. Continuous pointer pouring when held down
    if (this.isPointerDown && this.zenTools.currentTool === 'stream') {
      this.sandGrid.addSand(
        this.lastPointerGridX,
        this.lastPointerGridY,
        this.zenTools.activeColor,
        this.zenTools.brushSize,
        0.4
      );
    }

    // 3. Step sand cellular automaton
    this.sandGrid.step();

    // 4. Update procedural audio
    const moving = this.sandGrid.getMovingGrainsCount();
    sandAudio.updateMovingGrains(moving);

    // Occasional soothing harmonic chime when grains are flowing actively
    this.chimeTimer += dt;
    if (moving > 20 && this.chimeTimer >= 2.0) {
      if (Math.random() < 0.6) {
        sandAudio.triggerChime(0.7);
      }
      this.chimeTimer = 0;
    }
  }

  public render(): void {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    // 1. Draw Japanese Zen tatami / paper background
    this.ctx.fillStyle = '#171615';
    this.ctx.fillRect(0, 0, width, height);

    // Subtle background gradient
    const bgGrad = this.ctx.createRadialGradient(
      width / 2,
      height / 2,
      50,
      width / 2,
      height / 2,
      width * 0.7
    );
    bgGrad.addColorStop(0, '#22201d');
    bgGrad.addColorStop(1, '#131211');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, width, height);

    // 2. Draw Wooden Zen Basin Frame
    this.drawBasinFrame();

    // 3. Render Sand Grid Pixels to Canvas
    this.renderSandPixels();

    // 4. Draw Hopper Dispenser if Active
    this.drawHopper();
  }

  private drawBasinFrame(): void {
    const bx = this.basinX;
    const by = this.basinY;
    const bw = this.basinWidth;
    const bh = this.basinHeight;
    const border = 12;

    this.ctx.save();

    // Outer shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    this.ctx.shadowBlur = 24;
    this.ctx.shadowOffsetY = 8;

    // Dark lacquer wood frame
    this.ctx.fillStyle = '#3a271d';
    this.ctx.fillRect(bx - border, by - border, bw + border * 2, bh + border * 2);

    this.ctx.restore();

    // Wood inner bevel
    this.ctx.strokeStyle = '#5a3d2e';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(bx - border + 1, by - border + 1, bw + (border - 1) * 2, bh + (border - 1) * 2);

    // Basin sand bed bottom (slate stone base)
    this.ctx.fillStyle = '#1c1b18';
    this.ctx.fillRect(bx, by, bw, bh);
  }

  private renderSandPixels(): void {
    const data32 = new Uint32Array(this.imgData.data.buffer);
    const gridLen = this.sandGrid.grid.length;

    for (let i = 0; i < gridLen; i++) {
      const cell = this.sandGrid.grid[i] ?? CELL_EMPTY;
      if (cell === CELL_EMPTY) {
        data32[i] = 0x00000000; // Transparent
      } else if (cell === CELL_WALL) {
        // Bamboo/stone wall deflector (light birch wood tone with alpha)
        data32[i] = 0xFF4A7596;
      } else {
        // Sand grain color
        data32[i] = cell;
      }
    }

    this.gridCtx.putImageData(this.imgData, 0, 0);

    // Draw upscaled onto scene canvas with smooth pixel filtering
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.gridCanvas, this.basinX, this.basinY, this.basinWidth, this.basinHeight);
  }

  private drawHopper(): void {
    if (!this.zenTools.hopperActive) return;

    const screenX = this.basinX + (this.zenTools.hopperX / this.sandGrid.width) * this.basinWidth;
    const screenY = this.basinY + 10;

    this.ctx.save();
    this.ctx.fillStyle = '#e8ba3c';
    this.ctx.shadowColor = '#e8ba3c';
    this.ctx.shadowBlur = 10;

    // Small glowing nozzle
    this.ctx.beginPath();
    this.ctx.moveTo(screenX - 8, screenY - 12);
    this.ctx.lineTo(screenX + 8, screenY - 12);
    this.ctx.lineTo(screenX + 3, screenY);
    this.ctx.lineTo(screenX - 3, screenY);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }
}
