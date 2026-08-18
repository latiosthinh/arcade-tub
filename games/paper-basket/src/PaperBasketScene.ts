import { GameScene } from '@arcade-carnival/game-engine';
import { Ball } from './Ball.js';
import { HoopManager } from './HoopManager.js';
import { GameState } from './GameState.js';
import { ParticleSystem } from './Particles.js';
import { BasketAudio } from './BasketAudio.js';
import { BasketRenderer } from './BasketRenderer.js';

export class PaperBasketScene implements GameScene {
  private width: number = 800;
  private height: number = 600;
  public ball: Ball;
  public hoopManager: HoopManager;
  public gameState: GameState;
  public particles: ParticleSystem;
  public audio: BasketAudio;
  public renderer: BasketRenderer;

  constructor(canvas?: HTMLCanvasElement) {
    if (canvas) {
      canvas.width = this.width;
      canvas.height = this.height;
    }
    this.ball = new Ball(200, 300);
    this.hoopManager = new HoopManager(this.width);
    this.gameState = new GameState();
    this.particles = new ParticleSystem(200);
    this.audio = new BasketAudio();
    this.renderer = new BasketRenderer();

    if (canvas) {
      this.initInputs(canvas);
    }
  }

  public initInputs(canvas: HTMLCanvasElement): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Space' || e.key === 'ArrowUp') {
        this.handleActionInput();
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        this.togglePause();
      }
    });

    canvas.addEventListener('mousedown', () => {
      this.handleActionInput();
    });

    canvas.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        e.preventDefault();
        this.handleActionInput();
      },
      { passive: false }
    );
  }

  private handleActionInput(): void {
    if (this.gameState.status === 'ready') {
      this.gameState.startGame();
      this.ball.flap(this.hoopManager.currentHoop.isRightSide);
      this.audio.playBounce();
    } else if (this.gameState.status === 'playing') {
      this.ball.flap(this.hoopManager.currentHoop.isRightSide);
      this.audio.playBounce();
    } else if (this.gameState.status === 'gameover') {
      this.resetGame();
    }
  }

  public togglePause(): void {
    if (this.gameState.status === 'playing') {
      this.gameState.pause();
    } else if (this.gameState.status === 'paused') {
      this.gameState.resume();
    }
  }

  public pause(): void {
    if (this.gameState.status === 'playing') {
      this.gameState.pause();
    }
  }

  public resume(): void {
    if (this.gameState.status === 'paused') {
      this.gameState.resume();
    }
  }

  public resetGame(): void {
    this.gameState.reset();
    this.ball.reset(200, 300);
    this.hoopManager.reset(this.width);
    this.particles.reset();
  }

  update(dt: number): void {
    if (this.gameState.status === 'playing') {
      // 1. Update ball physics
      const physicsRes = this.ball.update(dt, this.width, this.height);
      if (physicsRes.hitFloor) {
        this.handleCrash('floor');
        return;
      }

      // 2. Update hoop movement and shot timer
      const hoopRes = this.hoopManager.update(dt, this.width);
      if (hoopRes.timeout) {
        this.handleCrash('timeout');
        return;
      }

      // 3. Check score trigger and rim bounce
      const scoreRes = this.hoopManager.checkScore(this.ball, this.width);
      if (scoreRes.scored) {
        this.gameState.addScore(scoreRes.isSwish);
        this.audio.playSwish(this.gameState.swishStreak);
        this.particles.emitConfetti(this.ball.x, this.ball.y, 22);
      }
    }

    // Always update particle animations
    this.particles.update(dt);
  }

  private handleCrash(reason: 'floor' | 'timeout'): void {
    this.gameState.endGame(reason);
    this.audio.playWhistle();
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.renderer.renderBackground(ctx, this.width, this.height);
    this.renderer.renderHoop(ctx, this.hoopManager.currentHoop);
    this.renderer.renderBall(ctx, this.ball);
    this.renderer.renderParticles(ctx, this.particles);
    this.renderer.renderHUD(
      ctx,
      this.width,
      this.gameState,
      this.hoopManager.shotTimeRemaining,
      this.hoopManager.maxShotTime
    );
    this.renderer.renderOverlays(ctx, this.width, this.height, this.gameState);
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
}
