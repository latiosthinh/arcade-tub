import { GameScene } from '@arcade-carnival/game-engine';
import { GameState } from './GameState.js';
import { DinoPhysics } from './DinoPhysics.js';
import { ObstacleSpawner, Obstacle } from './ObstacleSpawner.js';
import { DinoRenderer } from './DinoRenderer.js';
import { DinoAudio } from './DinoAudio.js';

export class DinoScene implements GameScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public state: GameState;
  public dino: DinoPhysics;
  public spawner: ObstacleSpawner;
  public renderer: DinoRenderer;
  public audio: DinoAudio;
  private isPaused: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not obtain 2D rendering context');
    this.ctx = context;

    this.state = new GameState();
    this.dino = new DinoPhysics({ groundY: 320 });
    this.spawner = new ObstacleSpawner({ groundY: 320 });
    this.renderer = new DinoRenderer();
    this.audio = new DinoAudio();

    this.setupInputs();
  }

  private setupInputs(): void {
    const handleActionJump = (e?: Event): void => {
      if (e) e.preventDefault();
      if (this.isPaused) return;

      if (this.state.status === 'ready' || this.state.status === 'gameover') {
        this.restart();
        return;
      }

      if (this.state.status === 'playing') {
        const jumped = this.dino.jump();
        if (jumped) {
          this.audio.playJump();
          this.renderer.addDust(this.dino.x + 10, this.dino.groundY, '#C5A880', 6);
        }
      }
    };

    const handleDuckStart = (e?: Event): void => {
      if (e) e.preventDefault();
      if (this.isPaused) return;

      if (this.state.status === 'playing') {
        this.dino.duck(true);
        this.audio.playDuck();
      }
    };

    const handleDuckEnd = (e?: Event): void => {
      if (e) e.preventDefault();
      if (this.state.status === 'playing') {
        this.dino.duck(false);
      }
    };

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        handleActionJump(e);
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        handleDuckStart(e);
      } else if (e.code === 'Escape') {
        if (this.state.status === 'playing') {
          this.state.pause();
        } else if (this.state.status === 'paused') {
          this.state.resume();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        handleDuckEnd(e);
      }
    });

    // Pointer / Touch controls (Tap top half to jump, bottom half to duck)
    this.canvas.addEventListener('pointerdown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const relativeY = clickY / rect.height;

      if (this.state.status === 'ready' || this.state.status === 'gameover') {
        handleActionJump(e);
        return;
      }

      if (relativeY < 0.6) {
        handleActionJump(e);
      } else {
        handleDuckStart(e);
      }
    });

    this.canvas.addEventListener('pointerup', (e) => {
      handleDuckEnd(e);
    });
  }

  public restart(): void {
    this.state.reset();
    this.dino.reset();
    this.spawner.reset();
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
    if (this.state.milestonePending) {
      this.audio.playMilestone();
      this.state.milestonePending = false;
    }

    if (this.state.status === 'playing') {
      const speedMultiplier = this.state.currentSpeed / this.state.baseSpeed;
      this.dino.update(dt, speedMultiplier);
      this.spawner.update(dt, this.state.currentSpeed, this.state.distanceTraveled);
      this.renderer.update(dt, this.state.currentSpeed);

      // Check collisions between Dino and Obstacles
      const dinoBounds = this.dino.getBounds();
      for (const obs of this.spawner.obstacles) {
        if (this.checkCollision(dinoBounds, obs)) {
          this.state.gameOver();
          this.audio.playHit();
          this.renderer.addDust(dinoBounds.x + dinoBounds.width / 2, dinoBounds.y + dinoBounds.height / 2, '#E11D48', 12);
          break;
        }
      }
    }
  }

  public checkCollision(a: { x: number; y: number; width: number; height: number }, b: Obstacle): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  public render(): void {
    this.renderer.render(
      this.ctx,
      this.canvas.width,
      this.canvas.height,
      this.state,
      this.dino,
      this.spawner.obstacles
    );
  }
}
