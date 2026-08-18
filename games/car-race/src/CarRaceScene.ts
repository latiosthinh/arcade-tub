import { GameScene } from '@arcade-carnival/game-engine';
import { HighwayLanes, CANVAS_WIDTH, CANVAS_HEIGHT } from './HighwayLanes.js';
import { PlayerCar, CAR_WIDTH, CAR_HEIGHT } from './PlayerCar.js';
import { TrafficManager } from './TrafficManager.js';
import { HighwayRenderer } from './HighwayRenderer.js';
import { GameState } from './GameState.js';
import { CarAudio } from './CarAudio.js';
import { ParticleSystem } from './Particles.js';

export class CarRaceScene implements GameScene {
  private lanes: HighwayLanes;
  private player: PlayerCar;
  private traffic: TrafficManager;
  private renderer: HighwayRenderer;
  private gameState: GameState;
  private audio: CarAudio;
  private particles: ParticleSystem;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private onKeyDownBound: (e: KeyboardEvent) => void;
  private onKeyUpBound: (e: KeyboardEvent) => void;
  private onPointerDownBound: (e: PointerEvent) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    this.lanes = new HighwayLanes();
    this.player = new PlayerCar(this.lanes);
    this.traffic = new TrafficManager();
    this.renderer = new HighwayRenderer();
    this.gameState = new GameState();
    this.audio = new CarAudio();
    this.particles = new ParticleSystem();

    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    this.onKeyDownBound = this.handleKeyDown.bind(this);
    this.onKeyUpBound = this.handleKeyUp.bind(this);
    this.onPointerDownBound = this.handlePointerDown.bind(this);

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.onKeyDownBound);
      window.addEventListener('keyup', this.onKeyUpBound);
      canvas.addEventListener('pointerdown', this.onPointerDownBound);
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.gameState.status === 'ready') {
      if (e.code === 'Space' || e.code === 'Enter' || e.key.startsWith('Arrow') || ['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        this.gameState.startGame();
        this.audio.startEngine();
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
        this.audio.startEngine();
        return;
      }
    }

    if (this.gameState.status === 'playing') {
      if (e.key === 'Escape') {
        this.gameState.pause();
        this.audio.stopEngine();
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.player.setSteer(-1);
        this.audio.playTireScreech();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.player.setSteer(1);
        this.audio.playTireScreech();
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') {
        this.player.setThrottle(true);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        this.player.setBrake(true);
        this.audio.playTireScreech();
      }
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.player.setSteer(0);
    }

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') {
      this.player.setThrottle(false);
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      this.player.setBrake(false);
    }
  }

  private handlePointerDown(e: PointerEvent): void {
    if (this.gameState.status === 'ready') {
      this.gameState.startGame();
      this.audio.startEngine();
      return;
    }
    if (this.gameState.status === 'gameover') {
      this.restart();
      return;
    }
    if (this.gameState.status === 'paused') {
      this.gameState.resume();
      this.audio.startEngine();
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const targetLane = this.lanes.getLaneFromX(x);
    if (targetLane < this.player.currentLane) {
      this.player.setSteer(-1);
      setTimeout(() => this.player.setSteer(0), 120);
    } else if (targetLane > this.player.currentLane) {
      this.player.setSteer(1);
      setTimeout(() => this.player.setSteer(0), 120);
    }
  }

  public update(dt: number): void {
    this.particles.update(dt);

    if (this.gameState.status !== 'playing') {
      return;
    }

    // Update player physics
    this.player.update(dt, this.lanes);

    // Update engine audio pitch
    this.audio.updateEngineSpeed(this.player.speed);

    // Update traffic
    const trafficUpdate = this.traffic.update(dt, this.player.speed, this.lanes);
    if (trafficUpdate.passedCount > 0) {
      this.gameState.addDodgedCar(trafficUpdate.passedCount);
    }

    // Check drafting behind vehicles
    const drafted = this.traffic.checkDrafting(this.player.getHitbox());
    this.gameState.update(dt, this.player.speed, drafted.isDrafting);

    if (drafted.isDrafting) {
      this.audio.playSlipstreamWhoosh();
      this.particles.emitDraftStreamlines(this.player.x, this.player.y);
    }

    // Exhaust particles
    this.particles.emitExhaust(this.player.x, this.player.y + CAR_HEIGHT / 2, this.player.isAccelerating);

    // Check collision
    if (this.traffic.checkCollision(this.player.getHitbox())) {
      this.audio.playCrash();
      this.particles.emitCrashExplosion(this.player.x, this.player.y);
      this.gameState.endGame();
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 1. Road Surface & Markings
    this.renderer.renderRoad(ctx, 0.016, this.player.speed, this.lanes);

    // 2. Traffic Vehicles
    this.renderer.renderTraffic(ctx, this.traffic.vehicles);

    // 3. Player Car
    if (this.gameState.status !== 'gameover') {
      this.renderer.renderPlayer(ctx, this.player);
    }

    // 4. Particles
    this.renderParticles(ctx);

    // 5. Top Storybook HUD
    ctx.fillStyle = '#FFFDF9';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 52);
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 52);
    ctx.lineTo(CANVAS_WIDTH, 52);
    ctx.stroke();

    ctx.font = 'bold 16px "Comfortaa", cursive, sans-serif';
    ctx.textBaseline = 'middle';

    // Left: Speedometer
    ctx.fillStyle = '#C85A32';
    ctx.textAlign = 'left';
    ctx.fillText(`SPEED: ${Math.floor(this.player.speed)} KM/H`, 20, 26);

    // Center: Score & Distance
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2B2118';
    ctx.fillText(`SCORE: ${Math.floor(this.gameState.score)}  |  DIST: ${(this.gameState.distance / 1000).toFixed(1)} KM`, CANVAS_WIDTH / 2, 26);

    // Right: High Score
    ctx.textAlign = 'right';
    ctx.fillStyle = '#4A6D56';
    ctx.fillText(`BEST: ${Math.floor(this.gameState.highScore)}`, CANVAS_WIDTH - 20, 26);

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

  private renderParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;

      if (p.shape === 'line') {
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y + (p.length ?? 20));
        ctx.stroke();
      } else if (p.shape === 'square') {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderReadyOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(250, 246, 238, 0.92)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#C85A32';
    ctx.font = 'bold 44px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('VINTAGE HIGHWAY', CANVAS_WIDTH / 2, 220);

    ctx.fillStyle = '#E09F3E';
    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('SPEEDWAY ADVENTURE', CANVAS_WIDTH / 2, 265);

    ctx.fillStyle = '#2B2118';
    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillText('Steer: Left / Right Arrow or A / D keys', CANVAS_WIDTH / 2, 320);
    ctx.fillText('Throttle / Brake: Up / Down Arrow, W / S, or Space', CANVAS_WIDTH / 2, 350);
    ctx.fillText('Draft close behind traffic to gain slipstream speed bonuses!', CANVAS_WIDTH / 2, 380);

    ctx.fillStyle = '#4A6D56';
    ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PRESS ANY KEY OR TAP TO RACE', CANVAS_WIDTH / 2, 480);
  }

  private renderPausedOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(250, 246, 238, 0.9)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#E09F3E';
    ctx.font = 'bold 40px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('RACE PAUSED', CANVAS_WIDTH / 2, 270);

    ctx.fillStyle = '#2B2118';
    ctx.font = '18px "Comfortaa", cursive, sans-serif';
    ctx.fillText('Press ESC to Resume', CANVAS_WIDTH / 2, 330);
  }

  private renderGameOverOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(250, 246, 238, 0.95)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#C85A32';
    ctx.font = 'bold 44px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('RACE OVER', CANVAS_WIDTH / 2, 200);

    ctx.fillStyle = '#2B2118';
    ctx.font = 'bold 28px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`FINAL SCORE: ${Math.floor(this.gameState.score)}`, CANVAS_WIDTH / 2, 270);

    ctx.fillStyle = '#6A5D4D';
    ctx.font = '18px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`DISTANCE: ${(this.gameState.distance / 1000).toFixed(2)} KM`, CANVAS_WIDTH / 2, 320);
    ctx.fillText(`CARS PASSED: ${this.gameState.carsDodged}`, CANVAS_WIDTH / 2, 355);

    if (this.gameState.score >= this.gameState.highScore && this.gameState.score > 0) {
      ctx.fillStyle = '#E09F3E';
      ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('★ NEW HIGH SCORE! ★', CANVAS_WIDTH / 2, 400);
    }

    ctx.fillStyle = '#4A6D56';
    ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PRESS SPACE OR TAP TO RESTART', CANVAS_WIDTH / 2, 480);
  }

  public restart(): void {
    this.gameState.startGame();
    this.player.reset(this.lanes);
    this.traffic.reset();
    this.particles.reset();
    this.audio.startEngine();
  }

  public pause(): void {
    this.gameState.pause();
    this.audio.stopEngine();
  }

  public resume(): void {
    this.gameState.resume();
    this.audio.startEngine();
  }

  public destroy(): void {
    this.audio.stopEngine();
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.onKeyDownBound);
      window.removeEventListener('keyup', this.onKeyUpBound);
      this.canvas.removeEventListener('pointerdown', this.onPointerDownBound);
    }
  }
}
