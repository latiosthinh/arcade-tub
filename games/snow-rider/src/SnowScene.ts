import { GameScene } from '@arcade-carnival/game-engine';
import { GameState } from './GameState.js';
import { SledPhysics } from './SledPhysics.js';
import { SlopeGenerator, SlopeItem } from './SlopeGenerator.js';
import { SnowRenderer } from './SnowRenderer.js';
import { SnowAudio } from './SnowAudio.js';

export class SnowScene implements GameScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public state: GameState;
  public sled: SledPhysics;
  public generator: SlopeGenerator;
  public renderer: SnowRenderer;
  public audio: SnowAudio;
  private isPaused: boolean = false;
  
  // Touch drag tracking
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private sledStartX: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not obtain 2D rendering context');
    this.ctx = context;

    this.state = new GameState();
    this.sled = new SledPhysics();
    this.generator = new SlopeGenerator();
    this.renderer = new SnowRenderer();
    this.audio = new SnowAudio();

    this.setupInputs();
  }

  private setupInputs(): void {
    const handleActionJump = (): void => {
      if (this.isPaused) return;

      if (this.state.status === 'ready' || this.state.status === 'gameover') {
        this.restart();
        return;
      }

      if (this.state.status === 'playing') {
        const jumped = this.sled.jump();
        if (jumped) {
          this.audio.playJump();
          this.renderer.addSnowBurst(this.canvas.width * 0.5 + this.sled.x * (this.canvas.width * 0.38), this.canvas.height * 0.86, '#FFFFFF', 8);
        }
      }
    };

    // Keyboard handlers
    const keysDown = new Set<string>();

    window.addEventListener('keydown', (e) => {
      keysDown.add(e.code);

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        handleActionJump();
      } else if (e.code === 'Escape') {
        if (this.state.status === 'playing') {
          this.state.pause();
        } else if (this.state.status === 'paused') {
          this.state.resume();
        }
      }

      this.updateKeyboardSteer(keysDown);
    });

    window.addEventListener('keyup', (e) => {
      keysDown.delete(e.code);
      this.updateKeyboardSteer(keysDown);
    });

    // Pointer / Touch Drag
    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.state.status === 'ready' || this.state.status === 'gameover') {
        handleActionJump();
        return;
      }

      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.sledStartX = this.sled.x;

      // Tap on top region acts as jump
      const rect = this.canvas.getBoundingClientRect();
      const relativeY = (e.clientY - rect.top) / rect.height;
      if (relativeY < 0.4) {
        handleActionJump();
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging || this.state.status !== 'playing') return;
      const deltaPx = e.clientX - this.dragStartX;
      const factor = deltaPx / (this.canvas.width * 0.35);
      this.sled.x = Math.max(-0.92, Math.min(0.92, this.sledStartX + factor));
      this.sled.tilt = Math.max(-0.35, Math.min(0.35, factor * 0.4));
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
      if (keysDown.size === 0) {
        this.sled.steer(0);
      }
    });
  }

  private updateKeyboardSteer(keys: Set<string>): void {
    let steerDir = 0;
    if (keys.has('ArrowLeft') || keys.has('KeyA')) {
      steerDir -= 1;
    }
    if (keys.has('ArrowRight') || keys.has('KeyD')) {
      steerDir += 1;
    }
    this.sled.steer(steerDir);
  }

  public restart(): void {
    this.state.reset();
    this.sled.reset();
    this.generator.reset();
  }

  public pause(): void {
    this.isPaused = true;
    this.state.pause();
  }

  public resume(): void {
    this.isPaused = false;
    this.state.resume();
  }

  public update(dt: number): void {
    if (this.isPaused) return;

    this.state.update(dt);

    if (this.state.status === 'playing') {
      this.sled.update(dt);
      this.generator.update(dt, this.state.currentSpeed);
      this.renderer.update(dt, this.state.speedMultiplier);

      // Check collision with slope items
      // Player is at z ≈ 0 to 40
      for (const item of this.generator.items) {
        if (item.z > 0 && item.z < 45 && !item.collected) {
          const lateralDiff = Math.abs(this.sled.x - item.x);
          const hitThreshold = item.type === 'gift' ? 0.22 : 0.16;

          if (lateralDiff < hitThreshold) {
            if (item.type === 'gift') {
              item.collected = true;
              this.state.collectGift();
              this.audio.playGift();
              this.renderer.addSnowBurst(
                this.canvas.width * 0.5 + this.sled.x * (this.canvas.width * 0.38),
                this.canvas.height * 0.86,
                '#F59E0B',
                10
              );
            } else {
              // Obstacle hit: jumping allows clearing low rocks or snowman base if high enough
              const clearedByJump = this.sled.y > 60 && item.type === 'rock';
              if (!clearedByJump) {
                this.state.gameOver();
                this.audio.playCrash();
                this.renderer.addSnowBurst(
                  this.canvas.width * 0.5 + this.sled.x * (this.canvas.width * 0.38),
                  this.canvas.height * 0.86,
                  '#E11D48',
                  14
                );
                break;
              }
            }
          }
        }
      }
    }
  }

  public render(): void {
    this.renderer.render(
      this.ctx,
      this.canvas.width,
      this.canvas.height,
      this.state,
      this.sled,
      this.generator.items
    );
  }
}
