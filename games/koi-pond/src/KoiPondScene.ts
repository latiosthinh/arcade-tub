import type { GameScene } from '@arcade-carnival/game-engine';
import { PondPhysics, Fish, KOI_COLORS } from './PondPhysics.js';

export class KoiPondScene implements GameScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private physics: PondPhysics;
  private audioCtx: AudioContext | null = null;

  // Touch handling for mobile & tablet (tap = splash, hold/long-touch or 2-finger tap = feed)
  private touchStartTime: number = 0;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private isHoldingTouch: boolean = false;
  private holdFeedInterval: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.physics = new PondPhysics(canvas.width, canvas.height);
    this.setupEvents();
  }

  private initAudio(): void {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private playWaterPlop(isFeed: boolean): void {
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isFeed ? 520 : 380, now);
      osc.frequency.exponentialRampToValueAtTime(isFeed ? 240 : 120, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  private getPos(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  private setupEvents(): void {
    // 1. Mouse Events: Left-click (0) = Splash, Right-click (2) = Feed color food
    this.canvas.addEventListener('mousedown', (e) => {
      this.initAudio();
      const { x, y } = this.getPos(e.clientX, e.clientY);

      if (e.button === 2) {
        // Right click -> Feed random color food
        this.physics.dropFood(x, y);
        this.playWaterPlop(true);
      } else if (e.button === 0) {
        // Left click -> Splash water (fishes scatter)
        this.physics.tapWater(x, y);
        this.playWaterPlop(false);
      }
    });

    // Prevent context menu on right click so feeding is seamless
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // 2. Touch Events for Mobile / Tablet:
    // - Quick tap = Splash water
    // - Press & Hold / Drag or 2-finger tap = Sprinkle color food pellets
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.initAudio();

      if (e.touches.length >= 2) {
        // Two-finger tap -> Feed food at touch position
        const { x, y } = this.getPos(e.touches[0].clientX, e.touches[0].clientY);
        this.physics.dropFood(x, y);
        this.playWaterPlop(true);
        this.isHoldingTouch = false;
        return;
      }

      if (e.touches.length === 1) {
        const { x, y } = this.getPos(e.touches[0].clientX, e.touches[0].clientY);
        this.touchStartTime = performance.now();
        this.touchStartX = x;
        this.touchStartY = y;
        this.isHoldingTouch = true;
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length > 0 && this.isHoldingTouch) {
        const { x, y } = this.getPos(e.touches[0].clientX, e.touches[0].clientY);
        this.touchStartX = x;
        this.touchStartY = y;
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      const elapsed = performance.now() - this.touchStartTime;

      if (this.isHoldingTouch && elapsed < 260) {
        // Quick short tap -> Splash water
        this.physics.tapWater(this.touchStartX, this.touchStartY);
        this.playWaterPlop(false);
      }
      this.isHoldingTouch = false;
    }, { passive: false });
  }

  public update(dt: number): void {
    // Touch hold feeding loop for mobile/tablets
    if (this.isHoldingTouch) {
      const elapsed = performance.now() - this.touchStartTime;
      if (elapsed >= 260) {
        this.holdFeedInterval += dt;
        if (this.holdFeedInterval >= 0.18) {
          this.holdFeedInterval = 0;
          this.physics.dropFood(
            this.touchStartX + (Math.random() - 0.5) * 20,
            this.touchStartY + (Math.random() - 0.5) * 20
          );
          this.playWaterPlop(true);
        }
      }
    }

    this.physics.update(dt);
  }

  public render(ctx?: CanvasRenderingContext2D): void {
    const renderCtx = ctx || this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Water Basin background
    renderCtx.fillStyle = '#E0F2FE';
    renderCtx.fillRect(0, 0, w, h);

    // Subtle water caustics waves
    renderCtx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    renderCtx.lineWidth = 2;
    for (let y = 30; y < h; y += 45) {
      renderCtx.beginPath();
      renderCtx.moveTo(0, y);
      for (let x = 0; x < w; x += 60) {
        renderCtx.quadraticCurveTo(x + 30, y + Math.sin(x * 0.05 + Date.now() * 0.002) * 8, x + 60, y);
      }
      renderCtx.stroke();
    }

    // 2. Lily Pads
    this.renderLilyPad(renderCtx, 120, 140, 48);
    this.renderLilyPad(renderCtx, 680, 460, 56);
    this.renderLilyPad(renderCtx, 240, 480, 42);

    // 3. Water Surface Ripples
    for (const r of this.physics.ripples) {
      renderCtx.strokeStyle = r.color;
      renderCtx.lineWidth = 2.5;
      renderCtx.globalAlpha = r.alpha;
      renderCtx.beginPath();
      renderCtx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      renderCtx.stroke();
      renderCtx.globalAlpha = 1.0;
    }

    // 4. Color-Coded Food Pellets
    for (const food of this.physics.foods) {
      renderCtx.save();
      renderCtx.fillStyle = food.color;
      renderCtx.beginPath();
      renderCtx.arc(food.x, food.y, food.radius, 0, Math.PI * 2);
      renderCtx.fill();
      renderCtx.strokeStyle = '#2B2118';
      renderCtx.lineWidth = 1.5;
      renderCtx.stroke();

      // Shimmer ring
      renderCtx.strokeStyle = '#FFFFFF';
      renderCtx.lineWidth = 1;
      renderCtx.beginPath();
      renderCtx.arc(food.x - 1, food.y - 1, food.radius * 0.45, 0, Math.PI * 2);
      renderCtx.stroke();
      renderCtx.restore();
    }

    // 5. Swimming Koi Fishes
    for (const fish of this.physics.fishes) {
      this.renderFish(renderCtx, fish);
    }

    // 6. Papercraft Boundary Frame
    renderCtx.strokeStyle = '#2B2118';
    renderCtx.lineWidth = 4;
    renderCtx.strokeRect(10, 10, w - 20, h - 20);

    // 7. Minimal Zen HUD Controls Guide
    this.renderZenGuide(renderCtx, w);
  }

  private renderLilyPad(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
    ctx.save();
    // Drop shadow
    ctx.fillStyle = 'rgba(43, 33, 24, 0.15)';
    ctx.beginPath();
    ctx.arc(x + 4, y + 4, r, 0.15 * Math.PI, 1.85 * Math.PI);
    ctx.fill();

    // Pad body
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(x, y, r, 0.15 * Math.PI, 1.85 * Math.PI);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner veins
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI) / 3 + 0.3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * (r - 6), y + Math.sin(a) * (r - 6));
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderFish(ctx: CanvasRenderingContext2D, f: Fish): void {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.angle);

    const len = f.length;
    const wag = Math.sin(f.tailWag) * 0.3;

    // Drop shadow
    ctx.fillStyle = 'rgba(43, 33, 24, 0.12)';
    ctx.beginPath();
    ctx.ellipse(3, 4, len * 0.5, len * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fins
    ctx.fillStyle = f.finColor;
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 1.5;

    // Left Fin
    ctx.beginPath();
    ctx.ellipse(-len * 0.1, -len * 0.25, len * 0.2, len * 0.08, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Fin
    ctx.beginPath();
    ctx.ellipse(-len * 0.1, len * 0.25, len * 0.2, len * 0.08, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tail Fin (animated wag)
    ctx.save();
    ctx.translate(-len * 0.45, 0);
    ctx.rotate(wag);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-len * 0.35, -len * 0.2);
    ctx.lineTo(-len * 0.25, 0);
    ctx.lineTo(-len * 0.35, len * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Fish Body
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, len * 0.5, len * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#2B2118';
    ctx.beginPath();
    ctx.arc(len * 0.32, -len * 0.1, 2.5, 0, Math.PI * 2);
    ctx.arc(len * 0.32, len * 0.1, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderZenGuide(ctx: CanvasRenderingContext2D, width: number): void {
    ctx.save();
    // Top banner
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.fillRect(20, 18, width - 40, 36);
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 18, width - 40, 36);

    ctx.fillStyle = '#2B2118';
    ctx.font = 'bold 13px "Comfortaa", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🐠 ZEN KOI POND', 32, 41);

    ctx.font = '12px "Comfortaa", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('🖱️ LEFT: Splash  •  RIGHT: Feed Colors  |  📱 TAP: Splash  •  HOLD / 2-FINGER: Feed', width - 36, 41);
    ctx.restore();
  }
}
