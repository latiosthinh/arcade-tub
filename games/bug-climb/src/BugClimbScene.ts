import { GameScene } from '@arcade-carnival/game-engine';
import { TrunkLanes, CANVAS_WIDTH, CANVAS_HEIGHT } from './TrunkLanes';
import { BugClimber, BUG_WIDTH, BUG_HEIGHT } from './BugClimber';
import { TreeTrunk } from './TreeTrunk';
import { TreeRenderer } from './TreeRenderer';
import { GameState } from './GameState';
import { ClimbAudio } from './ClimbAudio';
import { ParticleSystem } from './Particles';

export class BugClimbScene implements GameScene {
  public lanes: TrunkLanes;
  public climber: BugClimber;
  public trunk: TreeTrunk;
  public renderer: TreeRenderer;
  public gameState: GameState;
  public audio: ClimbAudio;
  public particles: ParticleSystem;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private onKeyDownBound: (e: KeyboardEvent) => void;
  private onKeyUpBound: (e: KeyboardEvent) => void;
  private onPointerDownBound: (e: PointerEvent) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    this.lanes = new TrunkLanes();
    this.climber = new BugClimber(0);
    this.trunk = new TreeTrunk();
    this.renderer = new TreeRenderer();
    this.gameState = new GameState();
    this.audio = new ClimbAudio();
    this.particles = new ParticleSystem(250);

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
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        this.gameState.resume();
        return;
      }
    }

    if (this.gameState.status === 'playing') {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        this.gameState.pause();
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.climber.setSteer(-1);
        this.audio.playStep('LEFT');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.climber.setSteer(1);
        this.audio.playStep('RIGHT');
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') {
        this.climber.setThrottle(true);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        this.climber.setBrake(true);
      }
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') {
      this.climber.setThrottle(false);
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      this.climber.setBrake(false);
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

    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const targetLane = this.lanes.getLaneFromX(x);
    if (targetLane < this.climber.currentLane) {
      this.climber.setSteer(-1);
      this.audio.playStep('LEFT');
      setTimeout(() => this.climber.setSteer(0), 120);
    } else if (targetLane > this.climber.currentLane) {
      this.climber.setSteer(1);
      this.audio.playStep('RIGHT');
      setTimeout(() => this.climber.setSteer(0), 120);
    }
  }

  public update(dt: number): void {
    this.particles.update(dt);

    if (this.gameState.status !== 'playing') {
      return;
    }

    // Update climber physics
    this.climber.update(dt);

    // Update obstacles scrolling down
    const trunkUpdate = this.trunk.update(dt, this.climber.speed);
    if (trunkUpdate.passedCount > 0) {
      this.gameState.addDodgedBranches(trunkUpdate.passedCount);
      this.audio.playComboChime(this.gameState.multiplier);
    }

    this.gameState.update(dt, this.climber.speed);

    // Trail wood particles
    if (Math.random() < 0.3) {
      this.particles.emitWoodChips(this.climber.x, this.climber.y + 15, this.climber.currentLane === 0 ? 'LEFT' : 'RIGHT', 2);
    }

    // Check collision
    const hit = this.trunk.checkCollision(this.climber.getHitbox());
    if (hit) {
      this.climber.alive = false;
      this.audio.playCrash();
      this.particles.emitCrashBurst(this.climber.x, this.climber.y);
      this.gameState.endGame();
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 1. Trunk Surface
    this.renderer.renderTrunk(ctx, this.trunk);

    // 2. Branch Obstacles
    this.renderer.renderBranches(ctx, this.trunk.obstacles);

    // 3. Climbing Ladybug
    if (this.gameState.status !== 'gameover' || !this.climber.alive) {
      this.renderer.renderBug(ctx, this.climber);
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

    // Left: Altitude
    ctx.fillStyle = '#C85A32';
    ctx.textAlign = 'left';
    ctx.fillText(`ALT: ${Math.floor(this.gameState.altitude)} M`, 20, 26);

    // Center: Score & Multiplier
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2B2118';
    ctx.fillText(`SCORE: ${Math.floor(this.gameState.score)}  |  SPEED: ${Math.floor(this.climber.speed)}`, CANVAS_WIDTH / 2, 26);

    // Right: High score
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
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === 'chip' || p.type === 'splinter') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.type === 'leaf') {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
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
    ctx.fillText('LADYBUG CLIMB', CANVAS_WIDTH / 2, 220);

    ctx.fillStyle = '#E09F3E';
    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('TREE RUNNER ADVENTURE', CANVAS_WIDTH / 2, 265);

    ctx.fillStyle = '#2B2118';
    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillText('Steer: Left / Right Arrow or A / D keys', CANVAS_WIDTH / 2, 320);
    ctx.fillText('Throttle / Brake: Up / Down Arrow, W / S, or Space', CANVAS_WIDTH / 2, 350);
    ctx.fillText('Dodge oncoming branches to climb higher!', CANVAS_WIDTH / 2, 380);

    ctx.fillStyle = '#4A6D56';
    ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PRESS ANY KEY OR TAP TO CLIMB', CANVAS_WIDTH / 2, 480);
  }

  private renderPausedOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(250, 246, 238, 0.9)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#E09F3E';
    ctx.font = 'bold 40px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('CLIMB PAUSED', CANVAS_WIDTH / 2, 270);

    ctx.fillStyle = '#2B2118';
    ctx.font = '18px "Comfortaa", cursive, sans-serif';
    ctx.fillText('Press ESC or Tap to Resume', CANVAS_WIDTH / 2, 330);
  }

  private renderGameOverOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(250, 246, 238, 0.95)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#C85A32';
    ctx.font = 'bold 44px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('CRASHED!', CANVAS_WIDTH / 2, 200);

    ctx.fillStyle = '#2B2118';
    ctx.font = 'bold 28px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`FINAL SCORE: ${Math.floor(this.gameState.score)}`, CANVAS_WIDTH / 2, 270);

    ctx.fillStyle = '#6A5D4D';
    ctx.font = '18px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`ALTITUDE: ${Math.floor(this.gameState.altitude)} M`, CANVAS_WIDTH / 2, 320);
    ctx.fillText(`BRANCHES DODGED: ${this.gameState.branchesDodged}`, CANVAS_WIDTH / 2, 355);

    if (this.gameState.score >= this.gameState.highScore && this.gameState.score > 0) {
      ctx.fillStyle = '#E09F3E';
      ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('★ NEW HIGH SCORE! ★', CANVAS_WIDTH / 2, 400);
    }

    ctx.fillStyle = '#4A6D56';
    ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PRESS SPACE OR TAP TO RETRY', CANVAS_WIDTH / 2, 480);
  }

  public restart(): void {
    this.gameState.startGame();
    this.climber.reset(0);
    this.trunk.reset();
    this.particles.reset();
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
      window.removeEventListener('keyup', this.onKeyUpBound);
      this.canvas.removeEventListener('pointerdown', this.onPointerDownBound);
    }
  }
}
