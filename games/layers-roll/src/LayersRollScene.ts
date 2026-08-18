import { GameScene } from '@arcade-carnival/game-engine';
import { GameState } from './GameState.js';
import { LayersRenderer } from './LayersRenderer.js';
import { LayersParticles } from './LayersParticles.js';
import { LayersAudio } from './LayersAudio.js';

export class LayersRollScene implements GameScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private renderer: LayersRenderer;
  private particles: LayersParticles;
  private audio: LayersAudio;
  private isPaused: boolean = false;
  private isPointerDown: boolean = false;
  private pointerStartX: number = 0;
  private rollStartX: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not obtain 2D rendering context');
    this.ctx = context;

    this.state = new GameState();
    this.renderer = new LayersRenderer();
    this.particles = new LayersParticles();
    this.audio = new LayersAudio();

    this.setupCallbacks();
    this.setupInputs();
  }

  private setupCallbacks(): void {
    this.state.onPickup = (e) => {
      this.audio.playPickup();
      const pCenter = this.renderer.project(
        e.pickup.x,
        e.pickup.z,
        this.state.roll.z,
        this.canvas.width,
        this.canvas.height
      );
      this.particles.emitPaperShreds(pCenter.sx, pCenter.sy, e.layer.color, 12);
    };

    this.state.onTrim = (e) => {
      this.audio.playSawBuzz();
      const pCenter = this.renderer.project(
        this.state.roll.x,
        this.state.roll.z,
        this.state.roll.z,
        this.canvas.width,
        this.canvas.height
      );
      this.particles.emitPaperShreds(pCenter.sx, pCenter.sy, '#E74C3C', 24);
    };

    this.state.onCutRibbon = (e) => {
      this.audio.playRibbonCut();
      const pCenter = this.renderer.project(
        this.state.roll.x,
        e.ribbon.z,
        this.state.roll.z,
        this.canvas.width,
        this.canvas.height
      );
      this.particles.emitConfetti(pCenter.sx, pCenter.sy, 30);
    };

    this.state.onGameOver = () => {
      this.audio.playGameOver();
    };

    this.state.onVictory = () => {
      this.audio.playVictory();
      this.particles.emitConfetti(this.canvas.width / 2, this.canvas.height / 2, 70);
    };
  }

  private setupInputs(): void {
    const handlePointerDown = (e: PointerEvent) => {
      if (this.isPaused) return;

      if (this.state.status === 'ready') {
        this.state.startLevel(1);
        return;
      } else if (this.state.status === 'gameover') {
        this.state.startLevel(1);
        return;
      } else if (this.state.status === 'victory') {
        this.state.startLevel(this.state.currentLevel + 1);
        return;
      }

      this.isPointerDown = true;
      this.pointerStartX = e.clientX;
      this.rollStartX = this.state.roll.x;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!this.isPointerDown || this.state.status !== 'playing') return;
      const deltaX = e.clientX - this.pointerStartX;
      const sensitivity = 0.85;
      this.state.setLateralTarget(this.rollStartX + deltaX * sensitivity);
    };

    const handlePointerUp = () => {
      this.isPointerDown = false;
      this.state.steer(0);
    };

    this.canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Keyboard Steering
    window.addEventListener('keydown', (e) => {
      if (this.isPaused) return;
      if (this.state.status === 'ready' && (e.code === 'Space' || e.key === 'Enter')) {
        this.state.startLevel(1);
      } else if (this.state.status === 'gameover' && (e.code === 'Space' || e.key === 'Enter')) {
        this.state.startLevel(1);
      } else if (this.state.status === 'victory' && (e.code === 'Space' || e.key === 'Enter')) {
        this.state.startLevel(this.state.currentLevel + 1);
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.state.steer(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.state.steer(1);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (
        e.key === 'ArrowLeft' ||
        e.key === 'a' ||
        e.key === 'A' ||
        e.key === 'ArrowRight' ||
        e.key === 'd' ||
        e.key === 'D'
      ) {
        this.state.steer(0);
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
      this.drawCenterOverlay('LAYERS ROLL', 'Drag or Use A/D to Steer & Roll Up Paper Layers!', '#2B2118');
    } else if (this.state.status === 'gameover') {
      this.drawCenterOverlay('SLICED DOWN!', `Final Score: ${this.state.score} • Tap to Retry`, '#D63031');
    } else if (this.state.status === 'victory') {
      this.drawCenterOverlay(
        'FINISH LINE CUT!',
        `Score: ${this.state.finalScore} (x${this.state.highestMultiplier}) • Tap for Next Level`,
        '#00B894'
      );
    }
  }

  private drawCenterOverlay(title: string, subtitle: string, titleColor: string): void {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(250, 246, 238, 0.88)';
    this.ctx.fillRect(w / 2 - 250, h / 2 - 80, 500, 160);

    this.ctx.strokeStyle = '#2B2118';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(w / 2 - 250, h / 2 - 80, 500, 160);

    this.ctx.font = 'bold 34px "Cabin Sketch", "Comfortaa", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = titleColor;
    this.ctx.fillText(title, w / 2, h / 2 - 15);

    this.ctx.font = 'bold 15px "Comfortaa", sans-serif';
    this.ctx.fillStyle = '#2B2118';
    this.ctx.fillText(subtitle, w / 2, h / 2 + 35);

    this.ctx.restore();
  }
}
