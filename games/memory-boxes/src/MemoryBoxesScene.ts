import type { GameScene } from '@arcade-carnival/game-engine';
import { InputManager } from '@arcade-carnival/game-engine';
import { GameState } from './GameState.js';
import { BoxGrid } from './BoxGrid.js';
import { BoxRenderer, GridDimensions } from './BoxRenderer.js';
import { TonePlayer } from './AudioPitches.js';
import { ParticleSystem } from './Particles.js';

export class MemoryBoxesScene implements GameScene {
  public gameState: GameState;
  public grid: BoxGrid;
  public renderer: BoxRenderer;
  public audio: TonePlayer;
  public particles: ParticleSystem;
  public input: InputManager;

  private canvas: HTMLCanvasElement;
  private readonly canvasWidth: number = 800;
  private readonly canvasHeight: number = 600;

  private playbackStepIndex = 0;
  private playbackTimer = 0;
  private playbackActive = false;
  private readonly stepLightDuration = 0.45;
  private readonly stepPauseDuration = 0.2;

  private hoveredBoxId: number | null = null;
  private screenShake = 0;
  private delayBeforePlayback = 0;

  private readonly restartBtn = {
    x: 300,
    y: 390,
    w: 200,
    h: 50,
  };

  private boundOnMouseDown: (e: MouseEvent) => void;
  private boundOnMouseMove: (e: MouseEvent) => void;
  private boundOnTouchStart: (e: TouchEvent) => void;

  constructor(canvas: HTMLCanvasElement, input?: InputManager) {
    this.canvas = canvas;
    this.input = input || new InputManager();
    this.gameState = new GameState();
    this.grid = new BoxGrid();
    this.renderer = new BoxRenderer();
    this.audio = new TonePlayer();
    this.particles = new ParticleSystem();

    this.boundOnMouseDown = this.onMouseDown.bind(this);
    this.boundOnMouseMove = this.onMouseMove.bind(this);
    this.boundOnTouchStart = this.onTouchStart.bind(this);

    this.canvas.addEventListener('mousedown', this.boundOnMouseDown);
    this.canvas.addEventListener('mousemove', this.boundOnMouseMove);
    this.canvas.addEventListener('touchstart', this.boundOnTouchStart, { passive: false });
  }

  public destroy(): void {
    this.canvas.removeEventListener('mousedown', this.boundOnMouseDown);
    this.canvas.removeEventListener('mousemove', this.boundOnMouseMove);
    this.canvas.removeEventListener('touchstart', this.boundOnTouchStart);
    this.input.destroy();
  }

  public pause(): void {
    this.gameState.pause();
  }

  public resume(): void {
    this.gameState.resume();
  }

  private startPlayback(): void {
    this.playbackStepIndex = 0;
    this.playbackTimer = 0;
    this.playbackActive = false;
    this.delayBeforePlayback = 0.5;
  }

  private startNewGame(): void {
    this.gameState.start();
    this.grid.reset();
    this.particles.clear();
    this.startPlayback();
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

  private handlePointer(x: number, y: number, isClick: boolean): void {
    if (this.gameState.status === 'ready' || this.gameState.status === 'gameover') {
      if (isClick) {
        if (this.gameState.status === 'ready') {
          this.startNewGame();
          return;
        }
        if (
          x >= this.restartBtn.x &&
          x <= this.restartBtn.x + this.restartBtn.w &&
          y >= this.restartBtn.y &&
          y <= this.restartBtn.y + this.restartBtn.h
        ) {
          this.startNewGame();
          return;
        }
      }
      return;
    }

    if (this.gameState.status === 'paused') {
      if (isClick) {
        this.gameState.resume();
      }
      return;
    }

    const dims = this.renderer.getGridDimensions(this.canvasWidth, this.canvasHeight, this.grid.size);
    let foundBoxId: number | null = null;
    for (const box of this.grid.boxes) {
      const bounds = this.renderer.getBoxBounds(box, dims);
      if (
        x >= bounds.x &&
        x <= bounds.x + bounds.w &&
        y >= bounds.y &&
        y <= bounds.y + bounds.h
      ) {
        foundBoxId = box.id;
        break;
      }
    }

    this.hoveredBoxId = foundBoxId;

    if (isClick && foundBoxId !== null && this.gameState.status === 'player_turn') {
      const box = this.grid.getBox(foundBoxId);
      if (!box) return;

      const bounds = this.renderer.getBoxBounds(box, dims);
      const centerX = bounds.x + bounds.w / 2;
      const centerY = bounds.y + bounds.h / 2;

      this.grid.setActive(foundBoxId, 1.0);
      this.audio.playTone(box.frequency, 0.22);
      this.particles.emit(centerX, centerY, 12, box.color, 140, 3, 0.4);
      this.particles.emitRing(centerX, centerY, 45, box.color, 0.35);

      const result = this.gameState.submitStep(foundBoxId);

      if (result.correct) {
        if (result.roundCompleted) {
          this.audio.playRoundComplete();
          this.particles.emit(centerX, centerY, 30, '#ffffff', 220, 4, 0.6);
          this.delayBeforePlayback = 1.0;
        }
      } else {
        // Mistake
        this.audio.playError();
        this.screenShake = 10;
        if (result.gameOver) {
          this.audio.playGameOver();
        } else {
          // Re-play sequence after mistake
          this.gameState.status = 'playback';
          this.startPlayback();
        }
      }
    }
  }

  private onMouseDown(e: MouseEvent): void {
    if (e.button === 0) {
      const { x, y } = this.getCanvasPos(e.clientX, e.clientY);
      this.handlePointer(x, y, true);
    }
  }

  private onMouseMove(e: MouseEvent): void {
    const { x, y } = this.getCanvasPos(e.clientX, e.clientY);
    this.handlePointer(x, y, false);
  }

  private onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      const { x, y } = this.getCanvasPos(touch.clientX, touch.clientY);
      this.handlePointer(x, y, true);
    }
  }

  public update(dt: number): void {
    const safeDt = Number.isFinite(dt) ? Math.max(0, dt) : 0;

    if (this.input.justPressed('Escape')) {
      if (this.gameState.status === 'player_turn' || this.gameState.status === 'playback') {
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
      this.screenShake = Math.max(0, this.screenShake - safeDt * 10);
    }

    this.grid.update(safeDt, 3.5);
    this.particles.update(safeDt);

    // Playback state machine
    if (this.gameState.status === 'playback') {
      if (this.delayBeforePlayback > 0) {
        this.delayBeforePlayback -= safeDt;
        this.input.update();
        return;
      }

      const seq = this.gameState.sequence;
      this.playbackTimer += safeDt;
      const stepDuration = this.stepLightDuration + this.stepPauseDuration;

      if (!this.playbackActive) {
        if (this.playbackStepIndex < seq.length) {
          const currentBoxId = seq[this.playbackStepIndex];
          if (currentBoxId !== undefined) {
            const box = this.grid.getBox(currentBoxId);
            if (box) {
              this.grid.setActive(currentBoxId, 1.0);
              this.audio.playTone(box.frequency, this.stepLightDuration * 0.9);
            }
          }
          this.playbackActive = true;
        }
      }

      if (this.playbackTimer >= stepDuration) {
        this.playbackTimer = 0;
        this.playbackActive = false;
        this.playbackStepIndex++;

        if (this.playbackStepIndex >= seq.length) {
          this.gameState.startPlayerTurn();
        }
      }

      this.input.update();
      return;
    }

    // Round complete transition
    if (this.gameState.status === 'round_complete') {
      if (this.delayBeforePlayback > 0) {
        this.delayBeforePlayback -= safeDt;
        if (this.delayBeforePlayback <= 0) {
          this.gameState.advanceRound();
          this.startPlayback();
        }
      }
      this.input.update();
      return;
    }

    // Player turn
    if (this.gameState.status === 'player_turn') {
      this.gameState.update(safeDt);
    }

    this.input.update();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const width = this.canvasWidth;
    const height = this.canvasHeight;
    const dims = this.renderer.getGridDimensions(width, height, this.grid.size);

    ctx.save();

    // Screen shake
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // Kraft paper desktop background
    ctx.fillStyle = '#F4EAD4';
    ctx.fillRect(0, 0, width, height);

    // Subtle paper grid pattern
    this.renderBackgroundGrid(ctx, width, height);

    // Render HUD
    this.renderHUD(ctx, width);

    // Render Boxes & Cardboard Tray
    this.renderer.render(ctx, this.grid, dims, this.hoveredBoxId);

    // Render Particles & Rings
    this.particles.render(ctx);

    // Render Status Overlays
    this.renderOverlay(ctx, width, height);

    ctx.restore();
  }

  private renderBackgroundGrid(ctx: CanvasRenderingContext2D, width: number, height: number): void {
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

    // Top-Left Sticky Note: Round & Steps
    this.drawStickyNote(ctx, 25, 18, 150, 64, '#FFFDF8');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#E11D48';
    ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`ROUND: ${this.gameState.round}`, 35, 42);

    ctx.fillStyle = 'rgba(62, 39, 35, 0.7)';
    ctx.font = '13px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`STEPS: ${this.gameState.sequence.length}`, 35, 66);

    // Top-Center Sticky Note: Lives (Hearts / Indicators) or Status
    this.drawStickyNote(ctx, width / 2 - 90, 18, 180, 64, '#FFFDF8');
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    ctx.fillStyle = '#E11D48';
    let hearts = '';
    for (let i = 0; i < GameState.INITIAL_LIVES; i++) {
      hearts += i < this.gameState.lives ? '♥ ' : '♡ ';
    }
    ctx.fillText(`LIVES: ${hearts.trim()}`, width / 2, 42);

    // Turn indicator or Timer Bar
    if (this.gameState.status === 'player_turn') {
      const timerProgress = Math.max(0, this.gameState.roundTimer / GameState.MAX_ROUND_TIME);
      const barWidth = 140;
      const barHeight = 6;
      const barX = width / 2 - barWidth / 2;
      const barY = 54;

      ctx.fillStyle = '#D8C3A5';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      ctx.fillStyle = timerProgress > 0.3 ? '#10B981' : '#E11D48';
      ctx.fillRect(barX, barY, barWidth * timerProgress, barHeight);
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
    } else if (this.gameState.status === 'playback') {
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 12px "Comfortaa", cursive, sans-serif';
      ctx.fillText('• WATCH PATTERN •', width / 2, 64);
    }

    // Top-Right Sticky Note: Score & High Score
    this.drawStickyNote(ctx, width - 175, 18, 150, 64, '#FFFDF8');
    ctx.textAlign = 'right';
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`SCORE: ${this.gameState.score}`, width - 35, 42);

    ctx.fillStyle = 'rgba(62, 39, 35, 0.7)';
    ctx.font = '13px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`BEST:  ${this.gameState.highScore}`, width - 35, 66);

    // Bottom Help Text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#3E2723';
    ctx.font = '13px "Comfortaa", cursive, sans-serif';
    ctx.fillText(
      'CLICK / TAP: Follow Sequence  •  REPEAT EXACT ORDER  •  ESC: Pause',
      width / 2,
      585,
    );

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
    ctx.fillRect(x + w / 2 - 20, y - 6, 40, 12);
    ctx.strokeRect(x + w / 2 - 20, y - 6, 40, 12);
    ctx.restore();
  }

  private renderOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (this.gameState.status === 'ready') {
      this.drawModal(ctx, width, height, 'MEMORY BOXES', 'Watch the sequence and repeat the pattern', 'TAP OR PRESS SPACE TO START');
    } else if (this.gameState.status === 'paused') {
      this.drawModal(ctx, width, height, 'PAUSED', 'Game is paused', 'TAP OR PRESS ESC TO RESUME');
    } else if (this.gameState.status === 'gameover') {
      this.drawModal(
        ctx,
        width,
        height,
        'GAME OVER',
        `Final Score: ${this.gameState.score} • Reached Round ${this.gameState.round}`,
        'PLAY AGAIN'
      );
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
    ctx.fillStyle = 'rgba(244, 234, 212, 0.92)';
    ctx.fillRect(0, 0, width, height);

    const isGameOver = title === 'GAME OVER';
    const panelW = 440;
    const panelH = isGameOver ? 340 : 220;
    const panelX = width / 2 - panelW / 2;
    const panelY = height / 2 - panelH / 2;
    this.drawStickyNote(ctx, panelX, panelY, panelW, panelH, '#FFFDF8');

    ctx.textAlign = 'center';
    ctx.fillStyle = isGameOver ? '#E11D48' : '#3B82F6';
    ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(title, width / 2, panelY + 55);

    ctx.fillStyle = '#3E2723';
    ctx.font = '15px "Comfortaa", cursive, sans-serif';
    ctx.fillText(subtitle, width / 2, panelY + 95);

    if (isGameOver) {
      // Paper restart button
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
      ctx.fillText(prompt, width / 2, this.restartBtn.y + this.restartBtn.h / 2);

      ctx.fillStyle = '#3E2723';
      ctx.font = '13px "Comfortaa", cursive, sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('or Press SPACE', width / 2, panelY + 280);
    } else {
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
      ctx.fillText(prompt, width / 2, panelY + 155);
    }

    ctx.restore();
  }
}
