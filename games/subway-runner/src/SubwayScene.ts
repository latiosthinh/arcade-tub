import { GameScene } from '@arcade-carnival/game-engine';
import { LaneRunnerEngine } from './LaneRunnerEngine.js';
import { TrainTrackGenerator } from './TrainTrackGenerator.js';
import { GameState } from './GameState.js';
import { SubwayRenderer, CANVAS_WIDTH, CANVAS_HEIGHT } from './SubwayRenderer.js';
import { SubwayAudio } from './SubwayAudio.js';

export class SubwayScene implements GameScene {
  private runner: LaneRunnerEngine;
  private track: TrainTrackGenerator;
  private gameState: GameState;
  private renderer: SubwayRenderer;
  private audio: SubwayAudio;

  private canvas: HTMLCanvasElement;
  private scrollZ: number = 0;

  // Touch Swipe Tracking
  private touchStartX: number = 0;
  private touchStartY: number = 0;

  private onKeyDownBound: (e: KeyboardEvent) => void;
  private onPointerDownBound: (e: PointerEvent) => void;
  private onPointerUpBound: (e: PointerEvent) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.runner = new LaneRunnerEngine();
    this.track = new TrainTrackGenerator();
    this.gameState = new GameState();
    this.renderer = new SubwayRenderer();
    this.audio = new SubwayAudio();

    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    this.onKeyDownBound = this.handleKeyDown.bind(this);
    this.onPointerDownBound = this.handlePointerDown.bind(this);
    this.onPointerUpBound = this.handlePointerUp.bind(this);

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.onKeyDownBound);
      canvas.addEventListener('pointerdown', this.onPointerDownBound);
      window.addEventListener('pointerup', this.onPointerUpBound);
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.gameState.status === 'ready') {
      if (['Space', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        this.gameState.startGame();
        return;
      }
    }

    if (this.gameState.status === 'gameover') {
      if (e.code === 'Space' || e.code === 'Enter') {
        this.restart();
        return;
      }
    }

    if (this.gameState.status === 'paused') {
      if (e.key === 'Escape') {
        this.gameState.resume();
        return;
      }
    }

    if (this.gameState.status === 'playing') {
      if (e.key === 'Escape') {
        this.gameState.pause();
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (this.runner.moveLeft()) this.audio.playLaneShift();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (this.runner.moveRight()) this.audio.playLaneShift();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') {
        if (this.runner.jump()) this.audio.playJump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        if (this.runner.slide()) this.audio.playSlide();
      }
    }
  }

  private handlePointerDown(e: PointerEvent): void {
    if (this.gameState.status === 'ready') {
      this.gameState.startGame();
      return;
    }
    if (this.gameState.status === 'gameover') {
      this.restart();
      return;
    }
    if (this.gameState.status === 'paused') {
      this.gameState.resume();
      return;
    }

    this.touchStartX = e.clientX;
    this.touchStartY = e.clientY;
  }

  private handlePointerUp(e: PointerEvent): void {
    if (this.gameState.status !== 'playing') return;

    const dx = e.clientX - this.touchStartX;
    const dy = e.clientY - this.touchStartY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    const minSwipe = 25;
    if (absX > minSwipe || absY > minSwipe) {
      if (absX > absY) {
        // Horizontal Swipe
        if (dx > 0) {
          if (this.runner.moveRight()) this.audio.playLaneShift();
        } else {
          if (this.runner.moveLeft()) this.audio.playLaneShift();
        }
      } else {
        // Vertical Swipe
        if (dy < 0) {
          if (this.runner.jump()) this.audio.playJump();
        } else {
          if (this.runner.slide()) this.audio.playSlide();
        }
      }
    }
  }

  public update(dt: number): void {
    if (this.gameState.status !== 'playing') return;

    this.runner.update(dt);
    this.track.update(dt, this.gameState.currentSpeed);
    this.gameState.update(dt, this.runner.has2xMultiplier);
    this.scrollZ += this.gameState.currentSpeed * dt;

    // Magnet coin attract
    if (this.runner.hasMagnet) {
      this.track.attractCoins(this.runner.currentLane, 0, 400, dt);
    }

    // Collect overlapping items
    const items = this.track.collectOverlappingItems(
      this.runner.laneOffset,
      this.runner.yOffset,
      this.runner.hasMagnet
    );

    for (const item of items) {
      if (item.type === 'coin') {
        this.gameState.addCoin(this.runner.has2xMultiplier);
        this.audio.playCoin();
      } else if (item.type === 'powerup_magnet') {
        this.runner.activateMagnet(10);
        this.audio.playPowerup();
      } else if (item.type === 'powerup_hoverboard') {
        this.runner.activateHoverboard(12);
        this.audio.playPowerup();
      } else if (item.type === 'powerup_2x') {
        this.runner.activate2xMultiplier(12);
        this.audio.playPowerup();
      }
    }

    // Collision detection
    const col = this.track.checkCollision(
      this.runner.laneOffset,
      this.runner.yOffset,
      this.runner.actionState
    );

    if (col.collided) {
      if (this.runner.consumeHoverboardShield()) {
        // Hoverboard absorbed crash
        this.audio.playPowerup();
        if (col.obstacle) {
          col.obstacle.z = -100; // clear obstacle
        }
      } else {
        // Fatal crash
        this.audio.playCrash();
        this.gameState.endGame();
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 1. Render Subway Track & Environment
    this.renderer.renderTrack(ctx, this.scrollZ);

    // 2. Render Obstacles
    this.renderer.renderObstacles(ctx, this.track.obstacles);

    // 3. Render Coins & Power-ups
    this.renderer.renderItems(ctx, this.track.items);

    // 4. Render Runner Player
    if (this.gameState.status !== 'gameover') {
      this.renderer.renderPlayer(ctx, this.runner);
    }

    // 5. Header HUD
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 56);
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 56);
    ctx.lineTo(CANVAS_WIDTH, 56);
    ctx.stroke();

    ctx.font = 'bold 16px "Comfortaa", cursive, sans-serif';
    ctx.textBaseline = 'middle';

    // Left: Coins
    ctx.fillStyle = '#D97706';
    ctx.textAlign = 'left';
    ctx.fillText(`💰 ${this.gameState.coinsCollected}`, 16, 28);

    // Center: Distance / Speed
    ctx.fillStyle = '#2B2118';
    ctx.textAlign = 'center';
    ctx.fillText(`SCORE: ${Math.floor(this.gameState.score)}`, CANVAS_WIDTH / 2, 28);

    // Right: High Score
    ctx.fillStyle = '#4A6D56';
    ctx.textAlign = 'right';
    ctx.fillText(`BEST: ${Math.floor(this.gameState.highScore)}`, CANVAS_WIDTH - 16, 28);

    // Power-up HUD Indicators
    let pOffset = 70;
    if (this.runner.hasHoverboard) {
      this.renderPowerupBadge(ctx, 16, pOffset, '🛹 SHIELD', this.runner.hoverboardTimer, '#3B82F6');
      pOffset += 30;
    }
    if (this.runner.hasMagnet) {
      this.renderPowerupBadge(ctx, 16, pOffset, '🧲 MAGNET', this.runner.magnetTimer, '#E11D48');
      pOffset += 30;
    }
    if (this.runner.has2xMultiplier) {
      this.renderPowerupBadge(ctx, 16, pOffset, '✨ 2X SCORE', this.runner.multiplierTimer, '#8B5CF6');
      pOffset += 30;
    }

    // 6. Overlays
    if (this.gameState.status === 'ready') {
      this.renderReadyOverlay(ctx);
    } else if (this.gameState.status === 'paused') {
      this.renderPausedOverlay(ctx);
    } else if (this.gameState.status === 'gameover') {
      this.renderGameOverOverlay(ctx);
    }

    ctx.restore();
  }

  private renderPowerupBadge(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, timeLeft: number, color: string): void {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 120, 24);
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, 120, 24);

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 12px "Comfortaa", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${label} ${timeLeft.toFixed(1)}s`, x + 6, y + 12);
  }

  private renderReadyOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(250, 246, 238, 0.93)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#E11D48';
    ctx.font = 'bold 38px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('SUBWAY SURFER', CANVAS_WIDTH / 2, 220);

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PAPERCRAFT ADVENTURE', CANVAS_WIDTH / 2, 260);

    ctx.fillStyle = '#2B2118';
    ctx.font = '15px "Comfortaa", cursive, sans-serif';
    ctx.fillText('Left / Right: Swipe or A / D keys', CANVAS_WIDTH / 2, 330);
    ctx.fillText('Jump over low barriers: Up / Space', CANVAS_WIDTH / 2, 365);
    ctx.fillText('Slide under high signs: Down / S', CANVAS_WIDTH / 2, 400);
    ctx.fillText('Grab Hoverboards for Crash Shields!', CANVAS_WIDTH / 2, 435);

    ctx.fillStyle = '#4A6D56';
    ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('TAP OR PRESS ANY KEY TO RUN', CANVAS_WIDTH / 2, 530);
  }

  private renderPausedOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(250, 246, 238, 0.9)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('GAME PAUSED', CANVAS_WIDTH / 2, 320);

    ctx.fillStyle = '#2B2118';
    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillText('Press ESC to resume', CANVAS_WIDTH / 2, 370);
  }

  private renderGameOverOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(250, 246, 238, 0.95)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#E11D48';
    ctx.font = 'bold 42px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('BUSTED!', CANVAS_WIDTH / 2, 220);

    ctx.fillStyle = '#2B2118';
    ctx.font = 'bold 26px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`SCORE: ${Math.floor(this.gameState.score)}`, CANVAS_WIDTH / 2, 290);

    ctx.fillStyle = '#6A5D4D';
    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`DISTANCE: ${Math.floor(this.gameState.distance)} M`, CANVAS_WIDTH / 2, 340);
    ctx.fillText(`COINS: ${this.gameState.coinsCollected}`, CANVAS_WIDTH / 2, 375);

    if (this.gameState.score >= this.gameState.highScore && this.gameState.score > 0) {
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('★ NEW HIGH SCORE! ★', CANVAS_WIDTH / 2, 430);
    }

    ctx.fillStyle = '#4A6D56';
    ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PRESS SPACE OR TAP TO RETRY', CANVAS_WIDTH / 2, 510);
  }

  public restart(): void {
    this.gameState.startGame();
    this.runner.reset();
    this.track.reset();
    this.scrollZ = 0;
  }

  public pause(): void {
    this.gameState.pause();
  }

  public resume(): void {
    this.gameState.resume();
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.onKeyDownBound);
      this.canvas.removeEventListener('pointerdown', this.onPointerDownBound);
      window.removeEventListener('pointerup', this.onPointerUpBound);
    }
  }
}
