import type { GameScene } from '@arcade-carnival/game-engine';
import { reportScore, saveData, loadData } from '@arcade-carnival/playables-adapter';
import { FruitPhysics, FruitItem, FruitHalf } from './FruitPhysics.js';
import { BladeEngine } from './BladeEngine.js';
import { FruitAudio } from './FruitAudio.js';

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  scale: number;
}

export class FruitFloodScene implements GameScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private physics: FruitPhysics;
  private blade: BladeEngine;
  private audio: FruitAudio;

  private score: number = 0;
  private highScore: number = 0;
  private spawnTimer: number = 0;
  private spawnInterval: number = 0.6; // flood intensity
  private gameTime: number = 0;
  private isPaused: boolean = false;
  private floatingTexts: FloatingText[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.physics = new FruitPhysics(canvas.width, canvas.height);
    this.blade = new BladeEngine();
    this.audio = new FruitAudio();

    this.loadSavedData();
    this.setupInputs();
  }

  private async loadSavedData(): Promise<void> {
    try {
      const data = await loadData();
      if (data && typeof data.highScore === 'number') {
        this.highScore = data.highScore;
      }
    } catch {
      // ignore
    }
  }

  private setupInputs(): void {
    const getPos = (e: MouseEvent | Touch): { x: number; y: number } => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    this.canvas.addEventListener('mousedown', (e) => {
      const { x, y } = getPos(e);
      this.blade.startSwipe(x, y);
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.blade.isSwiping) return;
      const { x, y } = getPos(e);
      this.handleSliceMove(x, y);
    });

    window.addEventListener('mouseup', () => {
      if (this.blade.isSwiping) {
        this.finishSwipe();
      }
    });

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const { x, y } = getPos(e.touches[0]);
        this.blade.startSwipe(x, y);
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!this.blade.isSwiping || e.touches.length === 0) return;
      const { x, y } = getPos(e.touches[0]);
      this.handleSliceMove(x, y);
    }, { passive: false });

    window.addEventListener('touchend', () => {
      if (this.blade.isSwiping) {
        this.finishSwipe();
      }
    });
  }

  private handleSliceMove(x: number, y: number): void {
    const sliced = this.blade.processSwipeMove(x, y, Date.now(), this.physics);
    if (sliced.length > 0) {
      this.audio.playSlice();
      this.audio.playSplat();
      for (const fruit of sliced) {
        this.score += fruit.points;
        this.addFloatingText(fruit.x, fruit.y, `+${fruit.points}`, fruit.innerColor);
      }
      if (this.score > this.highScore) {
        this.highScore = this.score;
        saveData({ highScore: this.highScore });
        reportScore(this.highScore);
      }
    }
  }

  private finishSwipe(): void {
    const result = this.blade.endSwipe();
    if (result.isCombo) {
      const bonus = result.totalSliced * 20 * result.comboMultiplier;
      this.score += bonus;
      this.audio.playCombo(result.comboMultiplier);
      const centerPoint = this.blade.points[Math.floor(this.blade.points.length / 2)] || { x: 400, y: 300 };
      this.addFloatingText(
        centerPoint.x,
        centerPoint.y - 20,
        `${result.totalSliced}x COMBO! +${bonus}`,
        '#FF5722',
        1.5
      );
      if (this.score > this.highScore) {
        this.highScore = this.score;
        saveData({ highScore: this.highScore });
        reportScore(this.highScore);
      }
    }
  }

  private addFloatingText(x: number, y: number, text: string, color: string, scale: number = 1.0): void {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 0.8,
      maxLife: 0.8,
      scale
    });
  }

  public update(dt: number): void {
    if (this.isPaused) return;

    this.gameTime += dt;
    this.physics.update(dt);
    this.blade.update();

    // Spawning wave logic: scaling flood frequency
    this.spawnTimer += dt;
    const currentInterval = Math.max(0.35, 0.85 - (this.gameTime / 90) * 0.5);
    if (this.spawnTimer >= currentInterval) {
      this.spawnTimer = 0;
      // Spawn batch of 1-4 fruits
      const count = 1 + Math.floor(Math.random() * (1 + Math.min(3, Math.floor(this.gameTime / 20))));
      for (let i = 0; i < count; i++) {
        this.physics.spawnFruit();
      }
    }

    // Update floating score texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 45 * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  public render(ctx?: CanvasRenderingContext2D): void {
    const renderCtx = ctx || this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background kraft paper wash
    renderCtx.fillStyle = '#FAF6EE';
    renderCtx.fillRect(0, 0, w, h);

    // Decorative wood-cutting board boundary border
    renderCtx.strokeStyle = '#2B2118';
    renderCtx.lineWidth = 4;
    renderCtx.strokeRect(10, 10, w - 20, h - 20);

    // Render juice particles
    for (const p of this.physics.particles) {
      renderCtx.fillStyle = p.color;
      renderCtx.beginPath();
      renderCtx.arc(p.x, p.y, Math.max(1, p.radius * (p.life / p.maxLife)), 0, Math.PI * 2);
      renderCtx.fill();
    }

    // Render fruit halves
    for (const half of this.physics.fruitHalves) {
      this.renderFruitHalf(renderCtx, half);
    }

    // Render whole active fruits
    for (const fruit of this.physics.fruits) {
      this.renderFruit(renderCtx, fruit);
    }

    // Render blade slice trail
    this.renderBladeTrail(renderCtx);

    // Render floating texts
    for (const ft of this.floatingTexts) {
      const alpha = Math.max(0, ft.life / ft.maxLife);
      renderCtx.save();
      renderCtx.globalAlpha = alpha;
      renderCtx.font = `bold ${Math.round(20 * ft.scale)}px 'Cabin Sketch', cursive, sans-serif`;
      renderCtx.fillStyle = ft.color;
      renderCtx.strokeStyle = '#2B2118';
      renderCtx.lineWidth = 3;
      renderCtx.textAlign = 'center';
      renderCtx.strokeText(ft.text, ft.x, ft.y);
      renderCtx.fillText(ft.text, ft.x, ft.y);
      renderCtx.restore();
    }

    // Render UI overlay (Score & Highscore)
    this.renderUI(renderCtx, w);
  }

  private renderFruit(ctx: CanvasRenderingContext2D, f: FruitItem): void {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rotation);

    // Cardboard drop shadow
    ctx.fillStyle = 'rgba(43, 33, 24, 0.15)';
    ctx.beginPath();
    ctx.arc(4, 4, f.radius, 0, Math.PI * 2);
    ctx.fill();

    // Outer skin
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner pulp layer
    ctx.fillStyle = f.innerColor;
    ctx.beginPath();
    ctx.arc(0, 0, f.radius * 0.75, 0, Math.PI * 2);
    ctx.fill();

    // Papercraft dashed line texture
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(0, 0, f.radius * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  private renderFruitHalf(ctx: CanvasRenderingContext2D, h: FruitHalf): void {
    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.rotate(h.rotation);

    ctx.beginPath();
    // Semi-circle based on side
    if (h.side === 1) {
      ctx.arc(0, 0, h.radius, -Math.PI / 2, Math.PI / 2);
    } else {
      ctx.arc(0, 0, h.radius, Math.PI / 2, (3 * Math.PI) / 2);
    }
    ctx.closePath();

    ctx.fillStyle = h.color;
    ctx.fill();
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner pulp exposed cut
    ctx.fillStyle = h.innerColor;
    ctx.beginPath();
    if (h.side === 1) {
      ctx.arc(0, 0, h.radius * 0.75, -Math.PI / 2, Math.PI / 2);
    } else {
      ctx.arc(0, 0, h.radius * 0.75, Math.PI / 2, (3 * Math.PI) / 2);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private renderBladeTrail(ctx: CanvasRenderingContext2D): void {
    const pts = this.blade.points;
    if (pts.length < 2) return;

    ctx.save();
    for (let i = 1; i < pts.length; i++) {
      const p1 = pts[i - 1];
      const p2 = pts[i];
      const alpha = (i / pts.length);
      const width = (i / pts.length) * 8;

      ctx.strokeStyle = '#FF3D00';
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // White inner glowing core
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = width * 0.4;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderUI(ctx: CanvasRenderingContext2D, w: number): void {
    ctx.fillStyle = '#2B2118';
    ctx.font = "bold 26px 'Cabin Sketch', cursive, sans-serif";
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${this.score}`, 25, 45);

    ctx.textAlign = 'right';
    ctx.fillText(`BEST: ${this.highScore}`, w - 25, 45);

    // Header title
    ctx.textAlign = 'center';
    ctx.font = "bold 20px 'Patrick Hand', cursive, sans-serif";
    ctx.fillStyle = '#795548';
    ctx.fillText("FRUIT FLOOD: SWIPE TO SLICE", w / 2, 40);
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }
}
