import { GameScene } from '@arcade-carnival/game-engine';
import { Fish } from './Fish.js';
import { PipeManager } from './PipeManager.js';
import { GameState } from './GameState.js';
import { ParticleSystem } from './Particles.js';
import { FishAudio } from './FishAudio.js';
import { FishRenderer } from './FishRenderer.js';

export class FlappyFishScene implements GameScene {
  private width: number = 800;
  private height: number = 600;
  public fish: Fish;
  public pipeManager: PipeManager;
  public gameState: GameState;
  public particles: ParticleSystem;
  public audio: FishAudio;
  public renderer: FishRenderer;

  constructor(canvas?: HTMLCanvasElement) {
    if (canvas) {
      canvas.width = this.width;
      canvas.height = this.height;
    }
    this.fish = new Fish({ x: 180, y: 280 });
    this.pipeManager = new PipeManager();
    this.gameState = new GameState();
    this.particles = new ParticleSystem(200);
    this.audio = new FishAudio();
    this.renderer = new FishRenderer();

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
      this.gameState.start();
      this.fish.flap();
      this.audio.playFlap();
      this.particles.emitFlapBubbles(this.fish.x, this.fish.y, 6);
    } else if (this.gameState.status === 'playing') {
      this.fish.flap();
      this.audio.playFlap();
      this.particles.emitFlapBubbles(this.fish.x, this.fish.y, 6);
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

  private resetGame(): void {
    this.gameState.reset();
    this.fish.reset(140, 280);
    this.pipeManager.reset();
    this.particles.reset();
  }

  update(dt: number): void {
    this.renderer.update(dt, this.width, this.height);

    if (this.gameState.status === 'playing') {
      // 1. Update Fish
      this.fish.update(dt);

      // 2. Check Boundary Collisions
      const boundHit = this.fish.checkBounds(0, this.height);
      if (boundHit) {
        this.handleCrash();
        return;
      }

      // 3. Update Coral Pillars
      this.pipeManager.update(dt, 1.0, this.width, this.height);

      // 4. Check Coral Pillar Collisions
      if (this.pipeManager.checkPillarCollision(this.fish, this.height)) {
        this.handleCrash();
        return;
      }

      // 5. Check Score Triggers
      const scorePassed = this.pipeManager.checkScoreTriggers(this.fish);
      if (scorePassed > 0) {
        this.gameState.addScore(scorePassed);
        this.audio.playScore();
      }

      // 6. Check Pearl Collisions
      const pearlsCollected = this.pipeManager.checkPearlCollisions(this.fish);
      if (pearlsCollected.length > 0) {
        this.gameState.addPearls(pearlsCollected.length);
        this.audio.playPearl();
        for (const pearl of pearlsCollected) {
          this.particles.emitPearlSparkles(pearl.x, pearl.y, 14);
        }
      }
    }

    // Always update particles
    this.particles.update(dt);
  }

  private handleCrash(): void {
    this.gameState.gameOver();
    this.audio.playCrash();
    this.particles.emitCrashDebris(this.fish.x, this.fish.y, 22);
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.renderer.render(
      ctx,
      this.width,
      this.height,
      this.fish,
      this.pipeManager,
      this.gameState,
      this.particles
    );
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
}
