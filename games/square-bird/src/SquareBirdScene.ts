import { GameScene } from '@arcade-carnival/game-engine';
import { GameState, GameMode } from './GameState.js';
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
  private selectedMenuMode: GameMode = 'levels';

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
    this.state.onEggLay = (_egg) => {
      this.audio.playLayEgg();
    };

    this.state.bird.onEggExpire = (egg) => {
      this.audio.playEggExpire();
      this.particles.emitEggExpire(
        this.state.bird.x + this.state.bird.size / 2,
        egg.y + egg.size / 2,
        egg.size
      );
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

  // T-41-05: Validate mode string argument to only allow 'levels' | 'infinite'
  public startSelectedMode(mode?: GameMode): void {
    const targetMode: GameMode = mode === 'infinite' || mode === 'levels' 
      ? mode 
      : this.selectedMenuMode;
    this.state.startMode(targetMode, 1);
  }

  private setupInputs(): void {
    const handlePointer = (e: PointerEvent): void => {
      e.preventDefault();
      if (this.isPaused) return;

      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      // Scale coordinates relative to canvas internal dimensions
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clickX = clientX * scaleX;
      const clickY = clientY * scaleY;

      if (this.state.status === 'ready') {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Button 1 Bounds (Levels): Left button
        const b1X = w / 2 - 200;
        const b1Y = h / 2 + 10;
        const bW = 180;
        const bH = 55;

        // Button 2 Bounds (Infinite): Right button
        const b2X = w / 2 + 20;
        const b2Y = h / 2 + 10;

        if (clickX >= b1X && clickX <= b1X + bW && clickY >= b1Y && clickY <= b1Y + bH) {
          this.selectedMenuMode = 'levels';
          this.startSelectedMode('levels');
          return;
        }

        if (clickX >= b2X && clickX <= b2X + bW && clickY >= b2Y && clickY <= b2Y + bH) {
          this.selectedMenuMode = 'infinite';
          this.startSelectedMode('infinite');
          return;
        }

        // Click elsewhere starts selected mode
        this.startSelectedMode();
      } else if (this.state.status === 'playing') {
        this.state.layEgg();
      } else if (this.state.status === 'gameover') {
        this.startSelectedMode(this.state.mode);
      } else if (this.state.status === 'victory') {
        this.state.startMode('levels', this.state.currentLevel + 1);
      }
    };

    this.canvas.addEventListener('pointerdown', handlePointer);
    window.addEventListener('keydown', (e) => {
      if (this.isPaused) return;

      if (e.code === 'Digit1' || e.code === 'KeyL') {
        e.preventDefault();
        this.selectedMenuMode = 'levels';
        if (this.state.status === 'ready') {
          this.startSelectedMode('levels');
        }
      } else if (e.code === 'Digit2' || e.code === 'KeyI') {
        e.preventDefault();
        this.selectedMenuMode = 'infinite';
        if (this.state.status === 'ready') {
          this.startSelectedMode('infinite');
        }
      } else if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (this.state.status === 'ready') {
          this.startSelectedMode();
        } else if (this.state.status === 'playing') {
          this.state.layEgg();
        } else if (this.state.status === 'gameover') {
          this.startSelectedMode(this.state.mode);
        } else if (this.state.status === 'victory') {
          this.state.startMode('levels', this.state.currentLevel + 1);
        }
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
      this.drawReadyOverlay();
    } else if (this.state.status === 'gameover') {
      const isInfinite = this.state.mode === 'infinite';
      const isNewBest = isInfinite && this.state.score >= this.state.infiniteHighScore && this.state.score > 0;
      const subtitle = isInfinite
        ? `Dist: ${Math.floor(this.state.distanceTraveled / 10)}m • Score: ${this.state.score}${isNewBest ? ' ★ NEW BEST!' : ''} • Tap to Retry`
        : `Score: ${this.state.score} • Tap or Space to Retry`;
      this.drawCenterOverlay('CRASHED!', subtitle, '#D63031');
    } else if (this.state.status === 'victory') {
      this.drawCenterOverlay('STAGE CLEAR!', `Score: ${this.state.score} • Tap for Next Level`, '#00B894');
    }
  }

  private drawReadyOverlay(): void {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.save();
    // Cardboard Backdrop Panel
    this.ctx.fillStyle = 'rgba(250, 246, 238, 0.92)';
    this.ctx.fillRect(w / 2 - 250, h / 2 - 130, 500, 260);

    this.ctx.strokeStyle = '#2B2118';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(w / 2 - 250, h / 2 - 130, 500, 260);

    // Title
    this.ctx.font = 'bold 36px "Cabin Sketch", "Comfortaa", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#2B2118';
    this.ctx.fillText('SQUARE BIRD', w / 2, h / 2 - 75);

    this.ctx.font = 'bold 15px "Comfortaa", sans-serif';
    this.ctx.fillStyle = '#636E72';
    this.ctx.fillText('Stack egg blocks to clear cardboard obstacles!', w / 2, h / 2 - 40);

    // Mode Option Buttons
    const bW = 180;
    const bH = 55;

    // Button 1: STAGE LEVELS
    const b1X = w / 2 - 200;
    const b1Y = h / 2 + 10;
    const b1Selected = this.selectedMenuMode === 'levels';
    this.ctx.fillStyle = b1Selected ? '#00B894' : '#DFE6E9';
    this.ctx.fillRect(b1X, b1Y, bW, bH);
    this.ctx.strokeRect(b1X, b1Y, bW, bH);

    this.ctx.fillStyle = b1Selected ? '#FFFFFF' : '#2B2118';
    this.ctx.font = 'bold 15px "Comfortaa", sans-serif';
    this.ctx.fillText('[1] LEVELS', b1X + bW / 2, b1Y + 24);
    this.ctx.font = '11px "Comfortaa", sans-serif';
    this.ctx.fillText('Course stages', b1X + bW / 2, b1Y + 42);

    // Button 2: INFINITE SURVIVAL
    const b2X = w / 2 + 20;
    const b2Y = h / 2 + 10;
    const b2Selected = this.selectedMenuMode === 'infinite';
    this.ctx.fillStyle = b2Selected ? '#6C5CE7' : '#DFE6E9';
    this.ctx.fillRect(b2X, b2Y, bW, bH);
    this.ctx.strokeRect(b2X, b2Y, bW, bH);

    this.ctx.fillStyle = b2Selected ? '#FFFFFF' : '#2B2118';
    this.ctx.font = 'bold 15px "Comfortaa", sans-serif';
    this.ctx.fillText('[2] INFINITE', b2X + bW / 2, b2Y + 24);
    this.ctx.font = '11px "Comfortaa", sans-serif';
    this.ctx.fillText(`Best: ${this.state.infiniteHighScore}`, b2X + bW / 2, b2Y + 42);

    // Bottom Action Prompt
    this.ctx.fillStyle = '#2B2118';
    this.ctx.font = 'bold 13px "Comfortaa", sans-serif';
    this.ctx.fillText('Tap Mode or Press Space to Start!', w / 2, h / 2 + 105);

    this.ctx.restore();
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

    this.ctx.font = 'bold 36px "Cabin Sketch", "Comfortaa", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = titleColor;
    this.ctx.fillText(title, w / 2, h / 2 - 15);

    this.ctx.font = 'bold 15px "Comfortaa", sans-serif';
    this.ctx.fillStyle = '#2B2118';
    this.ctx.fillText(subtitle, w / 2, h / 2 + 35);

    this.ctx.restore();
  }
}
