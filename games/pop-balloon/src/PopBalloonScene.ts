import type { GameScene } from '@arcade-carnival/game-engine';
import { InputManager } from '@arcade-carnival/game-engine';
import { GameState, ROUND_DURATION } from './GameState.js';
import { BalloonSpawner } from './BalloonSpawner.js';
import { PopEngine } from './PopEngine.js';
import { BalloonRenderer } from './BalloonRenderer.js';
import { PopAudio } from './PopAudio.js';
import { ParticleSystem } from './Particles.js';
import { FloatingScoreManager } from './FloatingScore.js';

export class PopBalloonScene implements GameScene {
  public gameState: GameState;
  public spawner: BalloonSpawner;
  public popEngine: PopEngine;
  public renderer: BalloonRenderer;
  public audio: PopAudio;
  public particles: ParticleSystem;
  public floatingScore: FloatingScoreManager;
  public input: InputManager;

  private canvas: HTMLCanvasElement;
  private readonly canvasWidth: number = 800;
  private readonly canvasHeight: number = 600;

  private screenShake = 0;
  private elapsedTime = 0;

  private readonly restartBtn = {
    x: 300,
    y: 430,
    w: 200,
    h: 50,
  };

  private boundOnMouseDown: (e: MouseEvent) => void;
  private boundOnTouchStart: (e: TouchEvent) => void;

  constructor(canvas: HTMLCanvasElement, input?: InputManager) {
    this.canvas = canvas;
    this.input = input || new InputManager();
    this.gameState = new GameState();
    this.spawner = new BalloonSpawner({
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
    });
    this.popEngine = new PopEngine();
    this.renderer = new BalloonRenderer();
    this.audio = new PopAudio();
    this.particles = new ParticleSystem(250);
    this.floatingScore = new FloatingScoreManager(30);

    this.boundOnMouseDown = this.onMouseDown.bind(this);
    this.boundOnTouchStart = this.onTouchStart.bind(this);

    this.canvas.addEventListener('mousedown', this.boundOnMouseDown);
    this.canvas.addEventListener('touchstart', this.boundOnTouchStart, { passive: false });
  }

  public destroy(): void {
    this.canvas.removeEventListener('mousedown', this.boundOnMouseDown);
    this.canvas.removeEventListener('touchstart', this.boundOnTouchStart);
    this.input.destroy();
  }

  public pause(): void {
    this.gameState.pause();
  }

  public resume(): void {
    this.gameState.resume();
  }

  private startNewGame(): void {
    this.gameState.start();
    this.spawner.reset();
    this.popEngine.resetCombo();
    this.particles.clear();
    this.floatingScore.clear();
    this.elapsedTime = 0;
    this.screenShake = 0;
  }

  private getCanvasPos(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvasWidth / (rect.width || this.canvasWidth);
    const scaleY = this.canvasHeight / (rect.height || this.canvasHeight);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  private handlePointerClick(x: number, y: number): void {
    if (this.gameState.status === 'ready') {
      this.startNewGame();
      return;
    }

    if (this.gameState.status === 'paused') {
      this.gameState.resume();
      return;
    }

    if (this.gameState.status === 'gameover') {
      if (
        x >= this.restartBtn.x &&
        x <= this.restartBtn.x + this.restartBtn.w &&
        y >= this.restartBtn.y &&
        y <= this.restartBtn.y + this.restartBtn.h
      ) {
        this.startNewGame();
      }
      return;
    }

    if (this.gameState.status === 'playing') {
      const activeBalloons = this.spawner.getActiveBalloons();
      const popRes = this.popEngine.handleClick(x, y, activeBalloons);

      if (popRes) {
        if (popRes.isBomb) {
          this.audio.playBombExplosion();
          this.particles.emitExplosion(popRes.balloon.x, popRes.balloon.y);
          this.floatingScore.spawn(popRes.balloon.x, popRes.balloon.y, '-300 (-5s)', '#ef4444', 1.25);
          this.screenShake = 16;
        } else {
          this.audio.playPop(1.0 + (popRes.streak - 1) * 0.08);
          if (popRes.streak > 1) {
            this.audio.playComboChime(popRes.streak);
          }
          this.particles.emitConfetti(popRes.balloon.x, popRes.balloon.y, popRes.balloon.color, 16);

          const multiplierText = popRes.multiplier > 1.0 ? ` x${popRes.multiplier.toFixed(1)}!` : '';
          const scoreText = `+${popRes.pointsAwarded}${multiplierText}`;
          const labelColor = popRes.isRainbow ? '#a855f7' : popRes.balloon.color;
          this.floatingScore.spawn(
            popRes.balloon.x,
            popRes.balloon.y,
            scoreText,
            labelColor,
            popRes.multiplier > 1.0 ? 1.2 : 1.0
          );
        }

        this.gameState.recordPop(popRes);
      }
    }
  }

  private onMouseDown(e: MouseEvent): void {
    if (e.button === 0) {
      const { x, y } = this.getCanvasPos(e.clientX, e.clientY);
      this.handlePointerClick(x, y);
    }
  }

  private onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      const { x, y } = this.getCanvasPos(touch.clientX, touch.clientY);
      this.handlePointerClick(x, y);
    }
  }

  public update(dt: number): void {
    const safeDt = Number.isFinite(dt) ? Math.max(0, dt) : 0;

    if (this.input.justPressed('Escape')) {
      if (this.gameState.status === 'playing') {
        this.gameState.pause();
      } else if (this.gameState.status === 'paused') {
        this.gameState.resume();
      }
    }

    if (this.input.justPressed('Space')) {
      if (this.gameState.status === 'ready' || this.gameState.status === 'gameover') {
        this.startNewGame();
      }
    }

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - safeDt * 30);
    }

    if (this.gameState.status === 'playing') {
      this.elapsedTime += safeDt;
      this.gameState.update(safeDt);
      this.spawner.update(safeDt, this.elapsedTime);
      this.popEngine.update(safeDt);
    }

    this.particles.update(safeDt);
    this.floatingScore.update(safeDt);
    this.input.update();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const width = this.canvasWidth;
    const height = this.canvasHeight;

    ctx.save();

    // Screen Shake
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#090d1a');
    bgGrad.addColorStop(0.6, '#13192f');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle background cyber grid / star dust
    this.renderBackgroundDetails(ctx, width, height);

    // Render active ascending balloons
    const activeBalloons = this.spawner.getActiveBalloons();
    for (const b of activeBalloons) {
      this.renderer.renderBalloon(ctx, b, this.elapsedTime);
    }

    // Render particles
    this.particles.render(ctx);

    // Render floating score indicators
    this.floatingScore.render(ctx);

    // Render HUD
    this.renderHUD(ctx, width);

    // Render modal overlays
    this.renderOverlay(ctx, width, height);

    ctx.restore();
  }

  private renderBackgroundDetails(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
    ctx.lineWidth = 1;
    const step = 50;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D, width: number): void {
    ctx.save();

    // Top-Left: Score & High Score
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`SCORE: ${this.gameState.score}`, 25, 38);

    ctx.fillStyle = '#64748b';
    ctx.font = '14px monospace';
    ctx.fillText(`BEST: ${this.gameState.highScore}`, 25, 60);

    // Top-Center: Round Timer
    const timeSec = Math.ceil(this.gameState.timeRemaining);
    const timerProgress = Math.max(0, this.gameState.timeRemaining / ROUND_DURATION);
    const barWidth = 220;
    const barHeight = 8;
    const barX = width / 2 - barWidth / 2;
    const barY = 48;

    ctx.textAlign = 'center';
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = timeSec <= 10 ? '#ef4444' : '#00f0ff';
    ctx.fillText(`TIME: ${timeSec}s`, width / 2, 38);

    // Timer bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = timeSec <= 10 ? '#ef4444' : '#00f0ff';
    ctx.fillRect(barX, barY, barWidth * timerProgress, barHeight);

    // Top-Right: Combo Streak & Multiplier
    const streak = this.popEngine.getStreak();
    const multiplier = this.popEngine.getMultiplier();
    ctx.textAlign = 'right';

    if (streak > 1) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`COMBO x${multiplier.toFixed(1)} (${streak})`, width - 25, 38);

      // Combo decay timer bar
      const comboRatio = Math.max(0, this.popEngine.getComboTimer() / this.popEngine.getComboWindow());
      const comboBarWidth = 140;
      const comboBarHeight = 5;
      const comboBarX = width - 25 - comboBarWidth;
      const comboBarY = 48;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(comboBarX, comboBarY, comboBarWidth, comboBarHeight);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(comboBarX, comboBarY, comboBarWidth * comboRatio, comboBarHeight);
    } else {
      ctx.fillStyle = '#475569';
      ctx.font = '14px monospace';
      ctx.fillText('COMBO: READY', width - 25, 38);
    }

    ctx.restore();
  }

  private renderOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (this.gameState.status === 'ready') {
      this.drawModal(
        ctx,
        width,
        height,
        'POP BALLOON',
        'Pop ascending balloons! Match colors for combo multipliers.\nAvoid hazard spike bombs (-300 pts, -5s).',
        'TAP OR PRESS SPACE TO START'
      );
    } else if (this.gameState.status === 'paused') {
      this.drawModal(
        ctx,
        width,
        height,
        'PAUSED',
        'Game is paused',
        'TAP OR PRESS ESC TO RESUME'
      );
    } else if (this.gameState.status === 'gameover') {
      this.drawGameOverModal(ctx, width, height);
    }
  }

  private drawModal(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    title: string,
    subtitle: string,
    prompt: string
  ): void {
    ctx.save();
    ctx.fillStyle = 'rgba(3, 7, 18, 0.85)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 38px monospace';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 18;
    ctx.fillText(title, width / 2, height / 2 - 60);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '15px monospace';

    const lines = subtitle.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, width / 2, height / 2 - 10 + i * 24);
    });

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(prompt, width / 2, height / 2 + 75);

    ctx.restore();
  }

  private drawGameOverModal(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.fillStyle = 'rgba(3, 7, 18, 0.88)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 38px monospace';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 18;
    ctx.fillText('TIME UP!', width / 2, 170);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`FINAL SCORE: ${this.gameState.score}`, width / 2, 230);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Max Combo Streak: ${this.gameState.maxStreak}`, width / 2, 275);
    ctx.fillText(`Balloons Popped: ${this.gameState.balloonsPopped}`, width / 2, 305);
    ctx.fillText(`Hazard Bombs Hit: ${this.gameState.bombsHit}`, width / 2, 335);

    ctx.fillStyle = '#00f0ff';
    ctx.fillText(`High Score: ${this.gameState.highScore}`, width / 2, 375);

    // Restart button
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.fillRect(this.restartBtn.x, this.restartBtn.y, this.restartBtn.w, this.restartBtn.h);
    ctx.strokeRect(this.restartBtn.x, this.restartBtn.y, this.restartBtn.w, this.restartBtn.h);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('PLAY AGAIN', width / 2, this.restartBtn.y + this.restartBtn.h / 2);

    ctx.fillStyle = '#64748b';
    ctx.font = '13px sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('or Press SPACE', width / 2, 510);

    ctx.restore();
  }
}
