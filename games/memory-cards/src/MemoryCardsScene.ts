import type { GameScene } from '@arcade-carnival/game-engine';
import { InputManager, audio } from '@arcade-carnival/game-engine';
import { CardGrid } from './CardGrid.js';
import { GameState } from './GameState.js';
import { CardRenderer } from './CardRenderer.js';
import { ParticleSystem } from './Particles.js';

export class MemoryCardsScene implements GameScene {
  public grid: CardGrid;
  public gameState: GameState;
  public cardRenderer: CardRenderer;
  public particles: ParticleSystem;
  public input: InputManager;

  private canvas: HTMLCanvasElement;
  private mismatchCooldown: number = 0;
  private readonly FLIP_SPEED = 4.0; // 0.25s flip animation duration (1 / 0.25 = 4.0)

  // Canvas bounds & layout
  private readonly canvasWidth: number = 800;
  private readonly canvasHeight: number = 600;

  // Restart Button overlay coordinates
  private readonly restartBtn = {
    x: 300,
    y: 390,
    w: 200,
    h: 50,
  };

  private boundOnMouseDown: (e: MouseEvent) => void;
  private boundOnTouchStart: (e: TouchEvent) => void;

  constructor(canvas: HTMLCanvasElement, input?: InputManager) {
    this.canvas = canvas;
    this.input = input || new InputManager();
    this.grid = new CardGrid();
    this.gameState = new GameState();
    this.cardRenderer = new CardRenderer();
    this.particles = new ParticleSystem();

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
    audio.playClick();
    this.gameState.start();
    this.grid.reset();
    this.particles.clear();
    this.mismatchCooldown = 0;
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
    if (this.gameState.status === 'ready' || this.gameState.status === 'gameover' || this.gameState.status === 'victory') {
      if (this.gameState.status === 'ready') {
        this.startNewGame();
        return;
      }
      // Check restart button bounds
      if (
        x >= this.restartBtn.x &&
        x <= this.restartBtn.x + this.restartBtn.w &&
        y >= this.restartBtn.y &&
        y <= this.restartBtn.y + this.restartBtn.h
      ) {
        this.startNewGame();
        return;
      }
      return;
    }

    if (this.gameState.status !== 'playing' || this.mismatchCooldown > 0) {
      return;
    }

    const dims = CardRenderer.getGridDimensions(this.canvasWidth, this.canvasHeight);
    for (let i = 0; i < this.grid.cards.length; i++) {
      const card = this.grid.cards[i];
      if (!card) continue;
      const bounds = CardRenderer.getCardBounds(card, dims);
      if (
        x >= bounds.x &&
        x <= bounds.x + bounds.w &&
        y >= bounds.y &&
        y <= bounds.y + bounds.h
      ) {
        const flipRes = this.grid.selectCard(i);
        if (flipRes.flipped) {
          audio.playClick();
        }
        break;
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
    if (this.input.justPressed('Escape')) {
      if (this.gameState.status === 'playing') {
        this.gameState.pause();
      } else if (this.gameState.status === 'paused') {
        this.gameState.resume();
      }
    }

    if (this.input.justPressed('Space')) {
      if (this.gameState.status === 'ready' || this.gameState.status === 'gameover' || this.gameState.status === 'victory') {
        this.startNewGame();
      }
    }

    const prevStatus = this.gameState.status;
    this.gameState.update(dt);

    if (prevStatus === 'playing' && this.gameState.status === 'gameover') {
      audio.playExplosion();
    }

    if (this.gameState.status === 'playing') {
      // 1. Update Card Flip animations
      let allFlippedUp = true;
      for (const card of this.grid.cards) {
        if (card.state === 'flipping_up') {
          card.flipProgress = Math.min(1, card.flipProgress + dt * this.FLIP_SPEED);
          if (card.flipProgress >= 1) {
            card.state = 'faceup';
          } else {
            allFlippedUp = false;
          }
        } else if (card.state === 'flipping_down') {
          card.flipProgress = Math.max(0, card.flipProgress - dt * this.FLIP_SPEED);
          if (card.flipProgress <= 0) {
            card.state = 'facedown';
          }
        }
      }

      // 2. Handle Match Checking when 2 cards finish flipping up
      if (this.grid.selectedIndices.length === 2 && allFlippedUp) {
        const idxA = this.grid.selectedIndices[0];
        const idxB = this.grid.selectedIndices[1];
        const cardA = idxA !== undefined ? this.grid.cards[idxA] : undefined;
        const cardB = idxB !== undefined ? this.grid.cards[idxB] : undefined;

        if (cardA?.state === 'faceup' && cardB?.state === 'faceup') {
          const matchRes = this.grid.checkMatch();
          if (matchRes.evaluated) {
            if (matchRes.match) {
              const scoreRes = this.gameState.recordMatch();
              if (scoreRes.streak >= 3) {
                audio.playPowerup();
              } else {
                audio.playScore();
              }

              // Sparkle particles at both card centers
              const dims = CardRenderer.getGridDimensions(this.canvasWidth, this.canvasHeight);
              if (matchRes.cardA && matchRes.cardB) {
                const bA = CardRenderer.getCardBounds(matchRes.cardA, dims);
                const bB = CardRenderer.getCardBounds(matchRes.cardB, dims);
                this.particles.emit(bA.x + bA.w / 2, bA.y + bA.h / 2, 25, '#fbbf24', 180, 3.5, 0.6);
                this.particles.emit(bA.x + bA.w / 2, bA.y + bA.h / 2, 20, '#00f0ff', 160, 3, 0.5);
                this.particles.emit(bB.x + bB.w / 2, bB.y + bB.h / 2, 25, '#fbbf24', 180, 3.5, 0.6);
                this.particles.emit(bB.x + bB.w / 2, bB.y + bB.h / 2, 20, '#00f0ff', 160, 3, 0.5);
              }

              // Check if whole board cleared
              if (this.grid.allMatched) {
                const won = this.gameState.checkWin(true);
                if (won) {
                  audio.playVictory();
                }
              }
            } else {
              // Mismatch
              audio.playError();
              this.gameState.recordMismatch();
              this.mismatchCooldown = 0.55; // Brief reveal before flip back
            }
          }
        }
      }

      // 3. Handle Mismatch Cooldown flip back
      if (this.mismatchCooldown > 0) {
        this.mismatchCooldown = Math.max(0, this.mismatchCooldown - dt);
        if (this.mismatchCooldown === 0) {
          this.grid.resolveMismatch();
        }
      }
    }

    this.particles.update(dt);
    this.input.update();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 1. Cyber Matrix Background
    this.renderBackground(ctx);

    // 2. Render Cards
    const dims = CardRenderer.getGridDimensions(this.canvasWidth, this.canvasHeight);
    for (const card of this.grid.cards) {
      this.cardRenderer.renderCard(ctx, card, dims);
    }

    // 3. Particle effects
    this.particles.render(ctx);

    // 4. HUD
    this.renderHUD(ctx);

    // 5. Overlays (Ready / Paused / GameOver / Victory)
    this.renderOverlays(ctx);

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D): void {
    const bgGrad = ctx.createRadialGradient(
      this.canvasWidth / 2,
      this.canvasHeight / 2,
      50,
      this.canvasWidth / 2,
      this.canvasHeight / 2,
      500,
    );
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Cyber digital grid lines
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.canvasWidth; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y < this.canvasHeight; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvasWidth, y);
      ctx.stroke();
    }
  }

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.font = 'bold 20px "Courier New", Courier, monospace';

    // Top-Left: Score & High Score
    ctx.textAlign = 'left';
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
    ctx.shadowBlur = 6;
    ctx.fillText(`SCORE: ${this.gameState.score}`, 30, 38);

    ctx.fillStyle = '#94a3b8';
    ctx.shadowBlur = 0;
    ctx.font = '15px "Courier New", Courier, monospace';
    ctx.fillText(`HIGH:  ${this.gameState.highScore}`, 30, 60);

    // Top-Center: Round Timer Bar & Text
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px "Courier New", Courier, monospace';
    const timerVal = this.gameState.timeRemaining.toFixed(1);
    if (this.gameState.timeRemaining < 10.0) {
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
      ctx.shadowBlur = 8;
    } else {
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
      ctx.shadowBlur = 6;
    }
    ctx.fillText(`TIME: ${timerVal}s`, this.canvasWidth / 2, 38);
    ctx.shadowBlur = 0;

    // Timer Progress Bar
    const barW = 200;
    const barH = 6;
    const barX = (this.canvasWidth - barW) / 2;
    const barY = 48;
    const ratio = Math.max(0, Math.min(1, this.gameState.timeRemaining / GameState.ROUND_DURATION));
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = this.gameState.timeRemaining < 10.0 ? '#ef4444' : '#00f0ff';
    ctx.fillRect(barX, barY, barW * ratio, barH);

    // Top-Right: Streak & Combo Multiplier
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';
    ctx.shadowBlur = 6;
    ctx.font = 'bold 18px "Courier New", Courier, monospace';
    ctx.fillText(`STREAK: ${this.gameState.streak}`, this.canvasWidth - 30, 38);

    ctx.fillStyle = '#94a3b8';
    ctx.shadowBlur = 0;
    ctx.font = '15px "Courier New", Courier, monospace';
    ctx.fillText(`COMBO:  ${this.gameState.comboMultiplier.toFixed(1)}x`, this.canvasWidth - 30, 60);

    // Bottom Help Text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '13px sans-serif';
    ctx.fillText(
      'CLICK / TAP: Flip Cards  •  MATCH PAIRS FOR STREAK COMBOS  •  ESC: Pause',
      this.canvasWidth / 2,
      585,
    );

    ctx.restore();
  }

  private renderOverlays(ctx: CanvasRenderingContext2D): void {
    if (this.gameState.status === 'ready') {
      ctx.save();
      ctx.fillStyle = 'rgba(2, 6, 23, 0.82)';
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.font = 'bold 38px "Courier New", Courier, monospace';
      ctx.fillText('MEMORY CARDS', this.canvasWidth / 2, 210);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffffff';
      ctx.font = '18px sans-serif';
      ctx.fillText('Find and match all 8 cyber glyph pairs before time expires', this.canvasWidth / 2, 260);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '15px monospace';
      ctx.fillText('■ Match Pair   = +500 Pts × Combo Multiplier', this.canvasWidth / 2, 305);
      ctx.fillText('■ Consecutive  = +0.5x Multiplier per Streak', this.canvasWidth / 2, 330);
      ctx.fillText('■ Board Clear  = Remaining Time × 100 Pts Bonus', this.canvasWidth / 2, 355);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('Click or Press SPACE to Begin', this.canvasWidth / 2, 420);
      ctx.restore();
      return;
    }

    if (this.gameState.status === 'paused') {
      ctx.save();
      ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 36px "Courier New", Courier, monospace';
      ctx.fillText('SYSTEM PAUSED', this.canvasWidth / 2, 270);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px sans-serif';
      ctx.fillText('Press ESC to Resume', this.canvasWidth / 2, 330);
      ctx.restore();
      return;
    }

    if (this.gameState.status === 'gameover' || this.gameState.status === 'victory') {
      const isVictory = this.gameState.status === 'victory';
      ctx.save();
      ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      ctx.textAlign = 'center';
      ctx.fillStyle = isVictory ? '#fbbf24' : '#ef4444';
      ctx.shadowColor = isVictory ? '#fbbf24' : '#ef4444';
      ctx.shadowBlur = 12;
      ctx.font = 'bold 38px "Courier New", Courier, monospace';
      ctx.fillText(isVictory ? 'SYSTEM OVERRIDE CLEARED!' : 'TIME EXPIRED', this.canvasWidth / 2, 200);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 26px "Courier New", Courier, monospace';
      ctx.fillText(`FINAL SCORE: ${this.gameState.score}`, this.canvasWidth / 2, 260);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px "Courier New", Courier, monospace';
      ctx.fillText(`HIGH SCORE:  ${this.gameState.highScore}`, this.canvasWidth / 2, 295);
      ctx.fillText(`TOTAL FLIPS: ${this.gameState.flipAttempts}`, this.canvasWidth / 2, 325);

      // Play Again Button
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = isVictory ? '#fbbf24' : '#00f0ff';
      ctx.lineWidth = 2;
      ctx.fillRect(
        this.restartBtn.x,
        this.restartBtn.y,
        this.restartBtn.w,
        this.restartBtn.h,
      );
      ctx.strokeRect(
        this.restartBtn.x,
        this.restartBtn.y,
        this.restartBtn.w,
        this.restartBtn.h,
      );

      ctx.fillStyle = isVictory ? '#fbbf24' : '#00f0ff';
      ctx.font = 'bold 19px sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText('PLAY AGAIN', this.canvasWidth / 2, this.restartBtn.y + this.restartBtn.h / 2);

      ctx.fillStyle = '#64748b';
      ctx.font = '13px sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('or Press SPACE', this.canvasWidth / 2, 470);

      ctx.restore();
    }
  }
}
