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

    // Warm Kraft Paper Sky Background
    ctx.fillStyle = '#F4EAD4';
    ctx.fillRect(0, 0, width, height);

    // Subtle paper sky grid
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
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.05)';
    ctx.lineWidth = 1;
    const step = 24;
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

    // Dashed outer frame
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(10, 10, width - 20, height - 20);
    ctx.setLineDash([]);
    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D, width: number): void {
    ctx.save();

    // Top-Left Sticky Note: Score & High Score
    this.drawStickyNote(ctx, 20, 16, 150, 64, '#FFFDF8');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#E11D48';
    ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`SCORE: ${this.gameState.score}`, 30, 40);

    ctx.fillStyle = 'rgba(62, 39, 35, 0.7)';
    ctx.font = '13px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`BEST: ${this.gameState.highScore}`, 30, 64);

    // Top-Center Sticky Note: Round Timer
    const timeSec = Math.ceil(this.gameState.timeRemaining);
    const timerProgress = Math.max(0, this.gameState.timeRemaining / ROUND_DURATION);
    const barWidth = 140;
    const barHeight = 6;
    const barX = width / 2 - barWidth / 2;
    const barY = 52;

    this.drawStickyNote(ctx, width / 2 - 90, 16, 180, 64, '#FFFDF8');
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
    ctx.fillStyle = timeSec <= 10 ? '#E11D48' : '#3B82F6';
    ctx.fillText(`TIME: ${timeSec}s`, width / 2, 40);

    // Timer bar
    ctx.fillStyle = '#D8C3A5';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = timeSec <= 10 ? '#E11D48' : '#10B981';
    ctx.fillRect(barX, barY, barWidth * timerProgress, barHeight);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Top-Right Sticky Note: Combo Streak & Multiplier
    const streak = this.popEngine.getStreak();
    const multiplier = this.popEngine.getMultiplier();
    this.drawStickyNote(ctx, width - 175, 16, 155, 64, '#FFFDF8');
    ctx.textAlign = 'right';

    if (streak > 1) {
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
      ctx.fillText(`★ x${multiplier.toFixed(1)} (${streak})`, width - 30, 40);

      // Combo decay timer bar
      const comboRatio = Math.max(0, this.popEngine.getComboTimer() / this.popEngine.getComboWindow());
      const comboBarWidth = 120;
      const comboBarHeight = 5;
      const comboBarX = width - 30 - comboBarWidth;
      const comboBarY = 52;

      ctx.fillStyle = '#D8C3A5';
      ctx.fillRect(comboBarX, comboBarY, comboBarWidth, comboBarHeight);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(comboBarX, comboBarY, comboBarWidth * comboRatio, comboBarHeight);
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1;
      ctx.strokeRect(comboBarX, comboBarY, comboBarWidth, comboBarHeight);
    } else {
      ctx.fillStyle = 'rgba(62, 39, 35, 0.7)';
      ctx.font = 'bold 13px "Comfortaa", cursive, sans-serif';
      ctx.fillText('COMBO: READY', width - 30, 52);
    }

    ctx.restore();
  }

  private drawStickyNote(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    bg: string,
  ): void {
    ctx.save();
    // Drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
    ctx.fillRect(x + 3, y + 3, w, h);

    // Note card
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    // Tape top strip
    ctx.fillStyle = 'rgba(255, 248, 220, 0.85)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.2)';
    ctx.lineWidth = 1;
    ctx.fillRect(x + w / 2 - 18, y - 5, 36, 10);
    ctx.strokeRect(x + w / 2 - 18, y - 5, 36, 10);
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
    ctx.fillStyle = 'rgba(244, 234, 212, 0.9)';
    ctx.fillRect(0, 0, width, height);

    const panelW = 460;
    const panelH = 260;
    const panelX = width / 2 - panelW / 2;
    const panelY = height / 2 - panelH / 2;
    this.drawStickyNote(ctx, panelX, panelY, panelW, panelH, '#FFFDF8');

    ctx.textAlign = 'center';
    ctx.fillStyle = '#E11D48';
    ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(title, width / 2, panelY + 50);

    ctx.fillStyle = '#3E2723';
    ctx.font = '14px "Comfortaa", cursive, sans-serif';

    const lines = subtitle.split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, width / 2, panelY + 95 + i * 24);
    });

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(prompt, width / 2, panelY + 200);

    ctx.restore();
  }

  private drawGameOverModal(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    ctx.fillStyle = 'rgba(244, 234, 212, 0.92)';
    ctx.fillRect(0, 0, width, height);

    const panelW = 440;
    const panelH = 380;
    const panelX = width / 2 - panelW / 2;
    const panelY = height / 2 - panelH / 2 + 10;
    this.drawStickyNote(ctx, panelX, panelY, panelW, panelH, '#FFFDF8');

    ctx.textAlign = 'center';
    ctx.fillStyle = '#E11D48';
    ctx.font = 'bold 38px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('TIME UP!', width / 2, panelY + 50);

    ctx.fillStyle = '#3E2723';
    ctx.font = 'bold 24px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`FINAL SCORE: ${this.gameState.score}`, width / 2, panelY + 95);

    ctx.font = '14px "Comfortaa", cursive, sans-serif';
    ctx.fillStyle = 'rgba(62, 39, 35, 0.8)';
    ctx.fillText(`Max Combo Streak: ${this.gameState.maxStreak}`, width / 2, panelY + 135);
    ctx.fillText(`Balloons Popped: ${this.gameState.balloonsPopped}`, width / 2, panelY + 160);
    ctx.fillText(`Hazard Bombs Hit: ${this.gameState.bombsHit}`, width / 2, panelY + 185);

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 15px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`High Score: ${this.gameState.highScore}`, width / 2, panelY + 220);

    // Restart button
    ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
    ctx.fillRect(this.restartBtn.x + 3, this.restartBtn.y + 3, this.restartBtn.w, this.restartBtn.h);

    ctx.fillStyle = '#10B981';
    ctx.fillRect(this.restartBtn.x, this.restartBtn.y, this.restartBtn.w, this.restartBtn.h);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.restartBtn.x, this.restartBtn.y, this.restartBtn.w, this.restartBtn.h);

    ctx.fillStyle = '#FFFDF8';
    ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('PLAY AGAIN', width / 2, this.restartBtn.y + this.restartBtn.h / 2);

    ctx.fillStyle = '#3E2723';
    ctx.font = '13px "Comfortaa", cursive, sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('or Press SPACE', width / 2, panelY + 345);

    ctx.restore();
  }
}
