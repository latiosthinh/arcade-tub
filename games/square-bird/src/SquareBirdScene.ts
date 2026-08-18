import { GameScene } from '@arcade-carnival/game-engine';
import { GameState } from './GameState.js';
import { BirdRenderer } from './BirdRenderer.js';
import { BirdParticles } from './BirdParticles.js';
import { BirdAudio } from './BirdAudio.js';

export class SquareBirdScene implements GameScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private renderer: BirdRenderer;
  private particles: BirdParticles;
  private audio: BirdAudio;
  private isPaused: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not obtain 2D rendering context');
    this.ctx = context;

    this.state = new GameState();
    this.renderer = new BirdRenderer();
    this.particles = new BirdParticles();
    this.audio = new BirdAudio();

    this.setupCallbacks();
    this.setupInputs();
  }

  private setupCallbacks(): void {
    this.state.onEggLay = (egg) => {
      this.audio.playLayEgg();
    };

    this.state.onCrash = (event) => {
      if (event.birdCrashed) {
        this.audio.playCrash();
        this.particles.emitFeathers(
          this.state.bird.x + this.state.bird.size / 2,
          this.state.bird.y + this.state.bird.size / 2
        );
      } else {
        this.audio.playEggShatter();
        this.particles.emitEggShatter(
          this.state.bird.x + this.state.bird.size / 2,
          event.obstacle.groundY - event.obstacle.height / 2,
          event.obstacle.height
        );
      }
    };

    this.state.onFeverStart = () => {
      this.audio.playFeverBurst();
    };

    this.state.onVictory = () => {
      this.audio.playVictory();
      this.particles.emitConfetti(this.canvas.width / 2, this.canvas.height / 2);
    };
  }

  private setupInputs(): void {
    const handleAction = (e?: Event): void => {
      if (e) e.preventDefault();
      if (this.isPaused) return;

      if (this.state.status === 'ready') {
        this.state.startLevel(1);
      } else if (this.state.status === 'playing') {
        this.state.layEgg();
      } else if (this.state.status === 'gameover') {
        this.state.startLevel(1);
      } else if (this.state.status === 'victory') {
        this.state.startLevel(this.state.currentLevel + 1);
      }
    };

    this.canvas.addEventListener('pointerdown', (e) => handleAction(e));
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        handleAction(e);
      }
    });
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public update(dt: number): void {
    if (this.isPaused) return;

    this.state.update(dt);
    this.particles.update(dt);

    if (this.state.isFever && this.state.status === 'playing') {
      this.particles.emitFeverTrail(
        this.state.bird.x,
        this.state.bird.y + this.state.bird.size / 2
      );
    }
  }

  public render(): void {
    this.renderer.render(
      this.ctx,
      this.state,
      this.particles,
      this.canvas.width,
      this.canvas.height
    );

    // Overlays for Ready / Game Over / Victory
    if (this.state.status === 'ready') {
      this.drawCenterOverlay('SQUARE BIRD', 'Tap or Press Space to Lay Eggs & Stack!', '#2B2118');
    } else if (this.state.status === 'gameover') {
      this.drawCenterOverlay('CRASHED!', `Score: ${this.state.score} • Tap to Retry`, '#D63031');
    } else if (this.state.status === 'victory') {
      this.drawCenterOverlay('STAGE CLEAR!', `Score: ${this.state.score} • Tap for Next Level`, '#00B894');
    }
  }

  private drawCenterOverlay(title: string, subtitle: string, titleColor: string): void {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(250, 246, 238, 0.85)';
    this.ctx.fillRect(w / 2 - 240, h / 2 - 80, 480, 160);

    this.ctx.strokeStyle = '#2B2118';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(w / 2 - 240, h / 2 - 80, 480, 160);

    this.ctx.font = 'bold 36px "Cabin Sketch", "Comfortaa", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = titleColor;
    this.ctx.fillText(title, w / 2, h / 2 - 15);

    this.ctx.font = 'bold 16px "Comfortaa", sans-serif';
    this.ctx.fillStyle = '#2B2118';
    this.ctx.fillText(subtitle, w / 2, h / 2 + 35);

    this.ctx.restore();
  }
}
