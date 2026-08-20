import type { GameScene } from '@arcade-carnival/game-engine';
import { DrawEngine, DrawMode } from './DrawEngine.js';
import { audio } from '@arcade-carnival/game-engine';

interface ToolbarButton {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
  onClick: () => void;
}

export class RainbowDrawScene implements GameScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private engine: DrawEngine;

  // Scratch mask offscreen canvas
  private maskCanvas: HTMLCanvasElement;
  private maskCtx: CanvasRenderingContext2D;

  // Underlying revelation artwork canvas
  private artCanvas: HTMLCanvasElement;
  private artCtx: CanvasRenderingContext2D;

  // Drawing canvas for rainbow strokes
  private drawCanvas: HTMLCanvasElement;
  private drawCtx: CanvasRenderingContext2D;

  private isPointerDown: boolean = false;
  private buttons: ToolbarButton[] = [];
  private scratchPercent: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    this.width = canvas.width;
    this.height = canvas.height;

    this.engine = new DrawEngine(this.width, this.height);

    // Setup offscreen scratch mask canvas
    this.maskCanvas = document.createElement('canvas');
    this.maskCanvas.width = this.width;
    this.maskCanvas.height = this.height;
    const mCtx = this.maskCanvas.getContext('2d');
    if (!mCtx) throw new Error('Could not get mask context');
    this.maskCtx = mCtx;

    // Setup offscreen artwork canvas
    this.artCanvas = document.createElement('canvas');
    this.artCanvas.width = this.width;
    this.artCanvas.height = this.height;
    const aCtx = this.artCanvas.getContext('2d');
    if (!aCtx) throw new Error('Could not get art context');
    this.artCtx = aCtx;

    // Setup offscreen persistent draw canvas
    this.drawCanvas = document.createElement('canvas');
    this.drawCanvas.width = this.width;
    this.drawCanvas.height = this.height;
    const dCtx = this.drawCanvas.getContext('2d');
    if (!dCtx) throw new Error('Could not get draw context');
    this.drawCtx = dCtx;

    this.initArtCanvas();
    this.initMaskCanvas();
    this.initToolbar();
    this.setupEvents();
  }

  public init(): void {
    this.drawCtx.clearRect(0, 0, this.width, this.height);
    this.initMaskCanvas();
  }

  private initArtCanvas(): void {
    // Render colorful origami carnival castle and paper sun underneath
    const ctx = this.artCtx;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, this.width, this.height);

    // Glowing gradient sun
    const sunGrad = ctx.createRadialGradient(400, 300, 20, 400, 300, 220);
    sunGrad.addColorStop(0, '#fef08a');
    sunGrad.addColorStop(0.5, '#f97316');
    sunGrad.addColorStop(1, '#db2777');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(400, 300, 220, 0, Math.PI * 2);
    ctx.fill();

    // Geometric papercraft castle silhouettes
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    // Central tower
    ctx.rect(340, 260, 120, 240);
    // Roof cone
    ctx.moveTo(320, 260);
    ctx.lineTo(400, 150);
    ctx.lineTo(480, 260);
    ctx.closePath();
    ctx.fill();

    // Left tower
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.rect(220, 320, 90, 180);
    ctx.moveTo(210, 320);
    ctx.lineTo(265, 220);
    ctx.lineTo(320, 320);
    ctx.closePath();
    ctx.fill();

    // Right tower
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.rect(490, 320, 90, 180);
    ctx.moveTo(480, 320);
    ctx.lineTo(535, 220);
    ctx.lineTo(590, 320);
    ctx.closePath();
    ctx.fill();

    // Decorative bunting flags
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(160 + i * 42, 180 + Math.sin(i * 0.5) * 15);
      ctx.lineTo(180 + i * 42, 215 + Math.sin(i * 0.5) * 15);
      ctx.lineTo(160 + i * 42, 215 + Math.sin(i * 0.5) * 15);
      ctx.closePath();
      ctx.fill();
    }
  }

  private initMaskCanvas(): void {
    // Fill mask with kraft paper cardboard texture
    const ctx = this.maskCtx;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#d4b996';
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle paper grain dots
    ctx.fillStyle = 'rgba(120, 80, 40, 0.08)';
    for (let i = 0; i < 1500; i++) {
      const rx = Math.random() * this.width;
      const ry = Math.random() * this.height;
      ctx.fillRect(rx, ry, 2, 2);
    }
  }

  private initToolbar(): void {
    const btnW = 110;
    const btnH = 36;
    const startY = 16;

    this.buttons = [
      {
        id: 'rainbow',
        label: 'Rainbow',
        x: 20,
        y: startY,
        w: btnW,
        h: btnH,
        active: true,
        onClick: () => this.switchMode('rainbow')
      },
      {
        id: 'auto-adjust',
        label: 'Smooth',
        x: 140,
        y: startY,
        w: btnW,
        h: btnH,
        active: false,
        onClick: () => this.switchMode('auto-adjust')
      },
      {
        id: 'scratch',
        label: 'Scratch Art',
        x: 260,
        y: startY,
        w: btnW,
        h: btnH,
        active: false,
        onClick: () => this.switchMode('scratch')
      },
      {
        id: 'size-small',
        label: 'Small',
        x: 390,
        y: startY,
        w: 65,
        h: btnH,
        active: false,
        onClick: () => this.engine.setBrushSize(8)
      },
      {
        id: 'size-med',
        label: 'Med',
        x: 465,
        y: startY,
        w: 65,
        h: btnH,
        active: true,
        onClick: () => this.engine.setBrushSize(16)
      },
      {
        id: 'size-big',
        label: 'Large',
        x: 540,
        y: startY,
        w: 65,
        h: btnH,
        active: false,
        onClick: () => this.engine.setBrushSize(32)
      },
      {
        id: 'clear',
        label: 'Clear All',
        x: 670,
        y: startY,
        w: 100,
        h: btnH,
        active: false,
        onClick: () => this.handleClear()
      }
    ];
  }

  private switchMode(mode: DrawMode): void {
    this.engine.setMode(mode);
    this.buttons.forEach(b => {
      if (['rainbow', 'auto-adjust', 'scratch'].includes(b.id)) {
        b.active = b.id === mode;
      }
    });
    audio.playTone(480, 0.08, 'sine');
  }

  private handleClear(): void {
    this.engine.clearCanvas();
    this.drawCtx.clearRect(0, 0, this.width, this.height);
    this.initMaskCanvas();
    this.scratchPercent = 0;
    audio.playTone(320, 0.12, 'triangle');
  }

  private setupEvents(): void {
    const getPos = (e: MouseEvent | Touch) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    const handleDown = (x: number, y: number) => {
      // Check toolbar button clicks
      for (const btn of this.buttons) {
        if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
          btn.onClick();
          if (btn.id.startsWith('size-')) {
            this.buttons.filter(b => b.id.startsWith('size-')).forEach(b => (b.active = b.id === btn.id));
          }
          return;
        }
      }

      this.isPointerDown = true;
      this.engine.startStroke(x, y);

      if (this.engine.getMode() === 'scratch') {
        this.applyScratchHole(x, y, this.engine.getBrushSize() * 2);
      }
    };

    const handleMove = (x: number, y: number) => {
      if (!this.isPointerDown) return;
      this.engine.addPoint(x, y);

      const points = this.engine.getCurrentStrokePoints();
      if (points.length >= 2) {
        const p1 = points[points.length - 2];
        const p2 = points[points.length - 1];

        if (this.engine.getMode() === 'rainbow') {
          this.drawSegment(this.drawCtx, p1.x, p1.y, p2.x, p2.y, p2.hue, p2.size);
        } else if (this.engine.getMode() === 'scratch') {
          this.applyScratchHole(x, y, this.engine.getBrushSize() * 2);
        }
      }
    };

    const handleUp = () => {
      if (!this.isPointerDown) return;
      this.isPointerDown = false;

      if (this.engine.getMode() === 'auto-adjust') {
        const points = this.engine.getCurrentStrokePoints();
        const smoothed = this.engine.smoothStroke(points);
        for (let i = 0; i < smoothed.length - 1; i++) {
          this.drawSegment(
            this.drawCtx,
            smoothed[i].x,
            smoothed[i].y,
            smoothed[i + 1].x,
            smoothed[i + 1].y,
            smoothed[i + 1].hue,
            smoothed[i + 1].size
          );
        }
      }

      this.engine.endStroke();
      this.scratchPercent = this.engine.getScratchPercent();
    };

    this.canvas.addEventListener('mousedown', (e) => {
      const pos = getPos(e);
      handleDown(pos.x, pos.y);
    });

    window.addEventListener('mousemove', (e) => {
      const pos = getPos(e);
      handleMove(pos.x, pos.y);
    });

    window.addEventListener('mouseup', () => handleUp());

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const pos = getPos(e.touches[0]);
        handleDown(pos.x, pos.y);
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const pos = getPos(e.touches[0]);
        handleMove(pos.x, pos.y);
      }
    }, { passive: false });

    window.addEventListener('touchend', () => handleUp());
  }

  private drawSegment(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    hue: number,
    size: number
  ): void {
    ctx.strokeStyle = `hsl(${hue}, 95%, 60%)`;
    ctx.fillStyle = `hsl(${hue}, 95%, 60%)`;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  private applyScratchHole(x: number, y: number, radius: number): void {
    this.maskCtx.globalCompositeOperation = 'destination-out';
    this.maskCtx.beginPath();
    this.maskCtx.arc(x, y, radius, 0, Math.PI * 2);
    this.maskCtx.fill();
  }

  public update(_dt: number): void {
    // Realtime loop
  }

  public render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.engine.getMode() === 'scratch') {
      // 1. Draw base revealed art
      ctx.drawImage(this.artCanvas, 0, 0);
      // 2. Draw mask layer on top (transparent where scratched)
      ctx.drawImage(this.maskCanvas, 0, 0);
    } else {
      // Standard paper craft canvas background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, this.width, this.height);

      // Grid paper lines
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
      ctx.lineWidth = 1;
      const step = 25;
      for (let x = 0; x < this.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 70);
        ctx.lineTo(x, this.height);
        ctx.stroke();
      }
      for (let y = 70; y < this.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
        ctx.stroke();
      }

      // Draw accumulated strokes
      ctx.drawImage(this.drawCanvas, 0, 0);

      // Draw active in-flight stroke if auto-adjust
      if (this.engine.getMode() === 'auto-adjust') {
        const points = this.engine.getCurrentStrokePoints();
        if (points.length >= 2) {
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.6)';
          ctx.lineWidth = this.engine.getBrushSize();
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.stroke();
        }
      }
    }

    // Render Papercraft Toolbar header
    this.renderToolbar(ctx);
  }

  private renderToolbar(ctx: CanvasRenderingContext2D): void {
    // Cardboard toolbar backing
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, this.width, 68);

    // Decorative stitch line
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(4, 4, this.width - 8, 60);
    ctx.setLineDash([]);

    // Buttons
    for (const btn of this.buttons) {
      if (btn.active) {
        ctx.fillStyle = '#38bdf8';
        ctx.strokeStyle = '#0284c7';
      } else {
        ctx.fillStyle = '#475569';
        ctx.strokeStyle = '#1e293b';
      }

      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = btn.active ? '#0f172a' : '#f8fafc';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }

    if (this.engine.getMode() === 'scratch') {
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`REVEALED: ${this.scratchPercent}%`, this.width - 20, 84);
    }
  }

  public destroy(): void {
    // Teardown
  }
}
