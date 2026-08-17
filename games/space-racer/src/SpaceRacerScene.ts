import { GameScene } from '@arcade-carnival/game-engine';
import { GameState } from './GameState.js';
import { Ship } from './Ship.js';
import { TrackHazardManager } from './TrackHazardManager.js';
import { HighwaySpeedPhysics } from './HighwaySpeedPhysics.js';
import { WarpRenderer } from './WarpRenderer.js';
import { RacerAudio } from './RacerAudio.js';
import { ParticleSystem } from './Particles.js';

export class SpaceRacerScene implements GameScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private ship: Ship;
  private hazardManager: TrackHazardManager;
  private renderer: WarpRenderer;
  private audio: RacerAudio;
  private particles: ParticleSystem;

  private totalTime: number = 0;
  private shakeTimer: number = 0;
  private shakeIntensity: number = 0;

  // Input states
  private leftPressed: boolean = false;
  private rightPressed: boolean = false;
  private isPointerDown: boolean = false;
  private pointerX: number = 400;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.state = new GameState();
    this.ship = new Ship();
    this.hazardManager = new TrackHazardManager();
    this.renderer = new WarpRenderer();
    this.audio = new RacerAudio();
    this.particles = new ParticleSystem();

    this.setupInputs();
  }

  private setupInputs(): void {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.leftPressed = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.rightPressed = true;
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (this.state.status === 'ready') {
          this.state.start();
          this.audio.startEngine();
        } else if (this.state.status === 'gameover') {
          this.state.restart(this.ship, this.hazardManager);
          this.particles.clear();
          this.audio.startEngine();
        }
      } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (this.state.status === 'playing') {
          this.state.pause();
          this.audio.stopEngine();
        } else if (this.state.status === 'paused') {
          this.state.resume();
          this.audio.startEngine();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.leftPressed = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.rightPressed = false;
      }
    });

    const handlePointer = (clientX: number, isDown: boolean) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      this.pointerX = (clientX - rect.left) * scaleX;
      this.isPointerDown = isDown;

      if (isDown) {
        if (this.state.status === 'ready') {
          this.state.start();
          this.audio.startEngine();
        } else if (this.state.status === 'gameover') {
          this.state.restart(this.ship, this.hazardManager);
          this.particles.clear();
          this.audio.startEngine();
        }
      }
    };

    this.canvas.addEventListener('mousedown', (e) => handlePointer(e.clientX, true));
    window.addEventListener('mousemove', (e) => {
      if (this.isPointerDown) handlePointer(e.clientX, true);
    });
    window.addEventListener('mouseup', () => { this.isPointerDown = false; });

    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      if (touch) handlePointer(touch.clientX, true);
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      if (touch) handlePointer(touch.clientX, true);
    }, { passive: false });

    window.addEventListener('touchend', () => { this.isPointerDown = false; });
  }

  public update(dt: number): void {
    this.totalTime += dt;
    this.audio.checkMute();

    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      if (this.shakeTimer <= 0) {
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
      }
    }

    if (this.state.status !== 'playing') {
      this.particles.update(dt);
      return;
    }

    // Process steering
    if (this.isPointerDown) {
      this.ship.setTargetX(this.pointerX, dt);
    } else {
      let dir = 0;
      if (this.leftPressed) dir -= 1;
      if (this.rightPressed) dir += 1;
      this.ship.steer(dir, dt);
    }

    const prevShield = this.ship.shieldHp;
    const prevGates = this.state.gatesCleared;
    const prevNearMisses = this.state.nearMisses;

    // Advance models
    this.state.update(dt, this.ship, this.hazardManager);
    this.renderer.updateStars(dt, this.state.speed);

    // Audio engine pitch
    this.audio.updateEngine(this.state.speed, 900, this.ship.isBoosting);

    // Thruster flame particles
    this.particles.emitThruster(this.ship.x, this.ship.y, this.ship.tilt, this.ship.isBoosting);

    // Check hit feedback
    if (this.ship.shieldHp < prevShield) {
      this.audio.playHit();
      this.shakeTimer = 0.3;
      this.shakeIntensity = 12;
      this.particles.emitExplosion(this.ship.x, this.ship.y);
      if (this.ship.shieldHp <= 0) {
        this.audio.stopEngine();
        this.audio.playGameOver();
      }
    }

    // Check boost gate feedback
    if (this.state.gatesCleared > prevGates) {
      this.audio.playGatePass();
      this.audio.playBoost();
      this.particles.emitGateClear(this.ship.x, this.ship.y);
    }

    // Check near-miss feedback
    if (this.state.nearMisses > prevNearMisses) {
      this.audio.playNearMiss();
      this.particles.emitNearMiss(this.ship.x, this.ship.y);
    }

    this.particles.update(dt);
  }

  public render(): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();

    // Screen shake
    if (this.shakeIntensity > 0) {
      const sx = (Math.random() - 0.5) * this.shakeIntensity;
      const sy = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(sx, sy);
    }

    // Background & Track
    this.renderer.renderBackground(ctx, w, h);
    this.renderer.renderTrack(ctx, this.state.distance);

    // Obstacles
    this.renderer.renderObstacles(ctx, this.hazardManager.getObstacles());

    // Particles (under ship)
    this.particles.render(ctx);

    // Ship
    if (this.state.status !== 'gameover') {
      this.renderer.renderShip(ctx, this.ship, this.totalTime);
    }

    ctx.restore();

    // HUD & Overlays
    this.renderHUD(ctx, w, h);
  }

  private renderHUD(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.save();

    // Top-Left: Distance & Speed
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText(`DIST: ${Math.floor(this.state.distance)}m`, 20, 30);
    ctx.fillStyle = this.ship.isBoosting ? '#ec4899' : '#00f0ff';
    ctx.fillText(`SPEED: ${Math.floor(this.state.speed)} KM/H`, 20, 52);

    // Top-Center: Score & Multiplier
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`${this.state.score}`, w / 2, 35);
    const mult = HighwaySpeedPhysics.getSpeedMultiplier(this.state.speed);
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = mult > 1.5 ? '#f59e0b' : '#38bdf8';
    ctx.fillText(`${mult.toFixed(1)}x SPEED BONUS`, w / 2, 52);

    // Top-Right: High Score & Shields
    ctx.textAlign = 'right';
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`HI: ${Math.max(this.state.score, this.state.highScore)}`, w - 20, 30);

    // Shield Pips
    const pips = 3;
    for (let i = 0; i < pips; i++) {
      ctx.fillStyle = i < this.ship.shieldHp ? '#00f0ff' : '#1e293b';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.fillRect(w - 20 - (pips - i) * 22, 40, 16, 12);
      ctx.strokeRect(w - 20 - (pips - i) * 22, 40, 16, 12);
    }

    // Boost timer bar
    if (this.ship.isBoosting) {
      const boostRatio = this.ship.boostTimer / 3.0;
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(w / 2 - 100, h - 30, 200 * boostRatio, 8);
      ctx.strokeStyle = '#f43f5e';
      ctx.strokeRect(w / 2 - 100, h - 30, 200, 8);
    }

    // Status Overlays
    if (this.state.status === 'ready') {
      this.renderReadyOverlay(ctx, w, h);
    } else if (this.state.status === 'paused') {
      this.renderPausedOverlay(ctx, w, h);
    } else if (this.state.status === 'gameover') {
      this.renderGameOverOverlay(ctx, w, h);
    }

    ctx.restore();
  }

  private renderReadyOverlay(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.fillStyle = 'rgba(3, 7, 18, 0.75)';
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 42px monospace';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 15;
    ctx.fillText('SPACE RACER', w / 2, h / 2 - 50);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px monospace';
    ctx.fillText('DODGE ASTEROIDS • HIT TURBO RINGS', w / 2, h / 2 - 10);
    ctx.fillText('Steer: [A]/[D], [←]/[→], or Drag Pointer', w / 2, h / 2 + 20);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('PRESS SPACE OR TAP TO LAUNCH', w / 2, h / 2 + 70);
  }

  private renderPausedOverlay(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.fillStyle = 'rgba(3, 7, 18, 0.7)';
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('PAUSED', w / 2, h / 2 - 20);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px monospace';
    ctx.fillText('Press [ESC] or [P] to Resume', w / 2, h / 2 + 20);
  }

  private renderGameOverOverlay(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.fillStyle = 'rgba(3, 7, 18, 0.85)';
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 40px monospace';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 15;
    ctx.fillText('CRITICAL FAILURE', w / 2, h / 2 - 70);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`FINAL SCORE: ${this.state.score}`, w / 2, h / 2 - 20);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px monospace';
    ctx.fillText(`DISTANCE: ${Math.floor(this.state.distance)}m  •  GATES: ${this.state.gatesCleared}  •  DODGES: ${this.state.asteroidsDodged}`, w / 2, h / 2 + 15);

    if (this.state.score >= this.state.highScore && this.state.score > 0) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('★ NEW HIGH SCORE! ★', w / 2, h / 2 + 45);
    }

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('PRESS SPACE OR TAP TO RETRY', w / 2, h / 2 + 85);
  }

  public pause(): void {
    if (this.state.status === 'playing') {
      this.state.pause();
      this.audio.stopEngine();
    }
  }

  public resume(): void {
    if (this.state.status === 'paused') {
      this.state.resume();
      this.audio.startEngine();
    }
  }

  public destroy(): void {
    this.audio.stopEngine();
  }
}
