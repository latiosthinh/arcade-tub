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
      if (this.grid.selectedIndices.length === 2 && allFlippedUp && this.mismatchCooldown <= 0) {
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
    // 1. Warm kraft / parchment paper background
    ctx.fillStyle = '#F4EAD4';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Subtle paper grain crosshatch / grid
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 20; x < this.canvasWidth; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvasHeight);
      ctx.stroke();
    }
    for (let y = 20; y < this.canvasHeight; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvasWidth, y);
      ctx.stroke();
    }

    // Stitched inner canvas frame
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(10, 10, this.canvasWidth - 20, this.canvasHeight - 20);
    ctx.setLineDash([]);
  }

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Top-Left Sticky Note: Score & High Score
    this.drawStickyNote(ctx, 25, 18, 160, 64, '#FFFDF8');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#E11D48';
    ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`SCORE: ${this.gameState.score}`, 35, 42);

    ctx.fillStyle = 'rgba(62, 39, 35, 0.7)';
    ctx.font = '13px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`BEST:  ${this.gameState.highScore}`, 35, 66);

    // Top-Center Sticky Note: Round Timer Bar & Text
    this.drawStickyNote(ctx, this.canvasWidth / 2 - 90, 18, 180, 64, '#FFFDF8');
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px "Patrick Hand", cursive, sans-serif';
    const timerVal = this.gameState.timeRemaining.toFixed(1);
    ctx.fillStyle = this.gameState.timeRemaining < 10.0 ? '#E11D48' : '#3B82F6';
    ctx.fillText(`TIME: ${timerVal}s`, this.canvasWidth / 2, 44);

    // Timer Progress Bar
    const barW = 140;
    const barH = 6;
    const barX = this.canvasWidth / 2 - barW / 2;
    const barY = 56;
    const ratio = Math.max(0, Math.min(1, this.gameState.timeRemaining / GameState.ROUND_DURATION));
    ctx.fillStyle = '#D8C3A5';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = this.gameState.timeRemaining < 10.0 ? '#E11D48' : '#10B981';
    ctx.fillRect(barX, barY, barW * ratio, barH);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // Top-Right Sticky Note: Streak & Flip attempts
    this.drawStickyNote(ctx, this.canvasWidth - 185, 18, 160, 64, '#FFFDF8');
    ctx.textAlign = 'right';
    if (this.gameState.streak > 1) {
      ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
      ctx.fillStyle = '#F59E0B';
      ctx.fillText(`★ x${this.gameState.comboMultiplier.toFixed(1)} STREAK!`, this.canvasWidth - 35, 42);
    } else {
      ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
      ctx.fillStyle = '#3B82F6';
      ctx.fillText(`PAIRS: ${this.gameState.matchedPairs}/8`, this.canvasWidth - 35, 42);
    }

    ctx.fillStyle = 'rgba(62, 39, 35, 0.7)';
    ctx.font = '13px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`FLIPS: ${this.gameState.flipAttempts}`, this.canvasWidth - 35, 66);

    // Bottom Help Text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#3E2723';
    ctx.font = '13px "Comfortaa", cursive, sans-serif';
    ctx.fillText(
      'CLICK / TAP: Flip Cards  •  MATCH PAIRS FOR STREAK COMBOS  •  ESC: Pause',
      this.canvasWidth / 2,
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

  private renderOverlays(ctx: CanvasRenderingContext2D): void {
    if (this.gameState.status === 'ready') {
      ctx.save();
      ctx.fillStyle = 'rgba(244, 234, 212, 0.88)';
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      const panelW = 460;
      const panelH = 340;
      const panelX = this.canvasWidth / 2 - panelW / 2;
      const panelY = this.canvasHeight / 2 - panelH / 2 + 10;
      this.drawStickyNote(ctx, panelX, panelY, panelW, panelH, '#FFFDF8');

      ctx.textAlign = 'center';
      ctx.fillStyle = '#E11D48';
      ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('MEMORY CARDS', this.canvasWidth / 2, panelY + 50);

      ctx.fillStyle = '#3E2723';
      ctx.font = '15px "Comfortaa", cursive, sans-serif';
      ctx.fillText('Find and match all 8 papercraft symbol pairs before time expires', this.canvasWidth / 2, panelY + 90);

      ctx.fillStyle = 'rgba(62, 39, 35, 0.8)';
      ctx.font = '14px "Comfortaa", cursive, sans-serif';
      ctx.fillText('■ Match Pair   = +500 Pts × Combo Multiplier', this.canvasWidth / 2, panelY + 130);
      ctx.fillText('■ Consecutive  = +0.5x Multiplier per Streak', this.canvasWidth / 2, panelY + 158);
      ctx.fillText('■ Board Clear  = Remaining Time × 100 Pts Bonus', this.canvasWidth / 2, panelY + 186);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('Click or Press SPACE to Begin', this.canvasWidth / 2, panelY + 250);
      ctx.restore();
      return;
    }

    if (this.gameState.status === 'paused') {
      ctx.save();
      ctx.fillStyle = 'rgba(244, 234, 212, 0.88)';
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      const panelW = 320;
      const panelH = 180;
      const panelX = this.canvasWidth / 2 - panelW / 2;
      const panelY = this.canvasHeight / 2 - panelH / 2;
      this.drawStickyNote(ctx, panelX, panelY, panelW, panelH, '#FFFDF8');

      ctx.textAlign = 'center';
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 34px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('GAME PAUSED', this.canvasWidth / 2, panelY + 65);

      ctx.fillStyle = 'rgba(62, 39, 35, 0.7)';
      ctx.font = '16px "Comfortaa", cursive, sans-serif';
      ctx.fillText('Press ESC to Resume', this.canvasWidth / 2, panelY + 115);
      ctx.restore();
      return;
    }

    if (this.gameState.status === 'gameover' || this.gameState.status === 'victory') {
      const isVictory = this.gameState.status === 'victory';
      ctx.save();
      ctx.fillStyle = 'rgba(244, 234, 212, 0.92)';
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      const panelW = 440;
      const panelH = 340;
      const panelX = this.canvasWidth / 2 - panelW / 2;
      const panelY = this.canvasHeight / 2 - panelH / 2 + 10;
      this.drawStickyNote(ctx, panelX, panelY, panelW, panelH, '#FFFDF8');

      ctx.textAlign = 'center';
      ctx.fillStyle = isVictory ? '#10B981' : '#E11D48';
      ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
      ctx.fillText(isVictory ? 'PUZZLE COMPLETE!' : 'TIME EXPIRED', this.canvasWidth / 2, panelY + 50);

      ctx.fillStyle = '#3E2723';
      ctx.font = 'bold 24px "Patrick Hand", cursive, sans-serif';
      ctx.fillText(`FINAL SCORE: ${this.gameState.score}`, this.canvasWidth / 2, panelY + 100);

      ctx.fillStyle = 'rgba(62, 39, 35, 0.7)';
      ctx.font = '15px "Comfortaa", cursive, sans-serif';
      ctx.fillText(`BEST SCORE:  ${this.gameState.highScore}`, this.canvasWidth / 2, panelY + 135);
      ctx.fillText(`TOTAL FLIPS: ${this.gameState.flipAttempts}`, this.canvasWidth / 2, panelY + 160);

      // Play Again Paper Button
      ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
      ctx.fillRect(this.restartBtn.x + 3, this.restartBtn.y + 3, this.restartBtn.w, this.restartBtn.h);

      ctx.fillStyle = '#10B981';
      ctx.fillRect(
        this.restartBtn.x,
        this.restartBtn.y,
        this.restartBtn.w,
        this.restartBtn.h,
      );
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        this.restartBtn.x,
        this.restartBtn.y,
        this.restartBtn.w,
        this.restartBtn.h,
      );

      ctx.fillStyle = '#FFFDF8';
      ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText('PLAY AGAIN', this.canvasWidth / 2, this.restartBtn.y + this.restartBtn.h / 2);

      ctx.fillStyle = '#3E2723';
      ctx.font = '13px "Comfortaa", cursive, sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('or Press SPACE', this.canvasWidth / 2, panelY + 280);

      ctx.restore();
    }
  }
}
