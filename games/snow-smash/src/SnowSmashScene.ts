import { GameScene } from '@arcade-carnival/game-engine';
import { reportScore, saveData, loadData } from '@arcade-carnival/playables-adapter';
import { SnowballPhysics, Snowball } from './SnowballPhysics.js';
import { TargetStructure, StructureBlock } from './TargetStructure.js';
import { SnowSmashAudio } from './SnowSmashAudio.js';

export class SnowSmashScene extends GameScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private physics: SnowballPhysics;
  private structure: TargetStructure;
  private audio: SnowSmashAudio;

  private score: number = 0;
  private highScore: number = 0;
  private currentLevel: number = 1;
  private maxLevels: number = 4;
  private snowballsRemaining: number = 5;

  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private currentDragX: number = 0;
  private currentDragY: number = 0;
  private slingshotAnchorX: number = 140;
  private slingshotAnchorY: number = 420;

  private isPaused: boolean = false;
  private levelState: 'playing' | 'cleared' | 'failed' = 'playing';
  private transitionTimer: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.physics = new SnowballPhysics(canvas.width, canvas.height);
    this.structure = new TargetStructure(canvas.width, canvas.height);
    this.audio = new SnowSmashAudio();

    this.loadLevel(1);
    this.loadSavedData();
    this.setupInputs();
  }

  private async loadSavedData(): Promise<void> {
    try {
      const data = await loadData();
      if (data && typeof data.highScore === 'number') {
        this.highScore = data.highScore;
      }
    } catch {
      // ignore
    }
  }

  private loadLevel(lvl: number): void {
    this.currentLevel = lvl;
    this.levelState = 'playing';
    this.snowballsRemaining = 5;
    this.physics.reset();

    if (lvl % 2 === 1) {
      this.structure.buildPyramid(560, this.canvas.height - 100);
    } else {
      this.structure.buildCastle(560, this.canvas.height - 100);
    }
  }

  private setupInputs(): void {
    const getPos = (e: MouseEvent | Touch): { x: number; y: number } => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    this.canvas.addEventListener('mousedown', (e) => {
      if (this.levelState !== 'playing' || this.snowballsRemaining <= 0) return;
      const { x, y } = getPos(e);
      // Click near slingshot
      if (Math.hypot(x - this.slingshotAnchorX, y - this.slingshotAnchorY) < 90) {
        this.isDragging = true;
        this.dragStartX = x;
        this.dragStartY = y;
        this.currentDragX = x;
        this.currentDragY = y;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const { x, y } = getPos(e);
      this.currentDragX = x;
      this.currentDragY = y;
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.releaseSlingshot();
      }
    });

    this.canvas.addEventListener('touchstart', (e) => {
      if (this.levelState !== 'playing' || this.snowballsRemaining <= 0) return;
      if (e.touches.length > 0) {
        const { x, y } = getPos(e.touches[0]);
        if (Math.hypot(x - this.slingshotAnchorX, y - this.slingshotAnchorY) < 90) {
          this.isDragging = true;
          this.dragStartX = x;
          this.dragStartY = y;
          this.currentDragX = x;
          this.currentDragY = y;
        }
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length === 0) return;
      const { x, y } = getPos(e.touches[0]);
      this.currentDragX = x;
      this.currentDragY = y;
    }, { passive: false });

    window.addEventListener('touchend', () => {
      if (this.isDragging) {
        this.releaseSlingshot();
      }
    });
  }

  private releaseSlingshot(): void {
    this.isDragging = false;
    const pullDist = Math.hypot(this.slingshotAnchorX - this.currentDragX, this.slingshotAnchorY - this.currentDragY);
    if (pullDist < 12) return; // Too small pull

    this.physics.launchFromSlingshot(
      this.slingshotAnchorX,
      this.slingshotAnchorY,
      this.currentDragX,
      this.currentDragY,
      9.0
    );

    this.snowballsRemaining--;
    this.audio.playSlingshotRelease();
  }

  public update(dt: number): void {
    if (this.isPaused) return;

    this.physics.update(dt);
    this.structure.updatePhysics(dt);

    // Collision detection: snowball vs blocks
    for (const ball of this.physics.snowballs) {
      if (!ball.alive) continue;

      for (const block of this.structure.blocks) {
        if (block.broken) continue;

        if (this.structure.checkCircleBlockCollision(ball.x, ball.y, ball.radius, block)) {
          ball.alive = false;
          this.physics.spawnSplash(ball.x, ball.y);
          this.audio.playSnowHit();

          const broken = this.structure.damageBlock(block, 35);
          this.score += 25;

          if (broken) {
            this.score += 75;
            this.audio.playCardboardCollapse();
          }

          if (this.score > this.highScore) {
            this.highScore = this.score;
            saveData({ highScore: this.highScore });
            reportScore(this.highScore);
          }
          break;
        }
      }
    }

    // Check level victory or failure
    if (this.levelState === 'playing') {
      if (this.structure.isAllDestroyed()) {
        this.levelState = 'cleared';
        this.transitionTimer = 2.0;
        this.score += 250 * this.snowballsRemaining; // bonus remaining balls
        this.audio.playVictoryFanfare();
      } else if (this.snowballsRemaining === 0 && this.physics.snowballs.length === 0) {
        this.levelState = 'failed';
        this.transitionTimer = 2.5;
      }
    } else {
      this.transitionTimer -= dt;
      if (this.transitionTimer <= 0) {
        if (this.levelState === 'cleared') {
          this.loadLevel((this.currentLevel % this.maxLevels) + 1);
        } else {
          this.loadLevel(this.currentLevel);
        }
      }
    }
  }

  public render(): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background kraft paper wash
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(0, 0, w, h);

    // Ground platform
    ctx.fillStyle = '#E0D8C8';
    ctx.fillRect(0, this.structure.groundY, w, h - this.structure.groundY);
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, this.structure.groundY);
    ctx.lineTo(w, this.structure.groundY);
    ctx.stroke();

    // Render cardboard structure blocks
    for (const block of this.structure.blocks) {
      if (block.broken) continue;
      this.renderBlock(ctx, block);
    }

    // Render paper debris particles
    for (const d of this.structure.debris) {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rotation);
      ctx.fillStyle = d.color;
      ctx.fillRect(-d.width / 2, -d.height / 2, d.width, d.height);
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 1;
      ctx.strokeRect(-d.width / 2, -d.height / 2, d.width, d.height);
      ctx.restore();
    }

    // Render snow splashes
    for (const s of this.physics.splashes) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius * (s.life / s.maxLife), 0, Math.PI * 2);
      ctx.fill();
    }

    // Render active snowballs
    for (const ball of this.physics.snowballs) {
      if (!ball.alive) continue;
      this.renderSnowball(ctx, ball.x, ball.y, ball.radius);
    }

    // Render Slingshot base and band
    this.renderSlingshot(ctx);

    // Render UI overlay
    this.renderUI(ctx, w, h);
  }

  private renderBlock(ctx: CanvasRenderingContext2D, b: StructureBlock): void {
    ctx.save();
    // Drop shadow
    ctx.fillStyle = 'rgba(43, 33, 24, 0.15)';
    ctx.fillRect(b.x + 3, b.y + 3, b.width, b.height);

    // Block fill
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);

    // Outline
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(b.x, b.y, b.width, b.height);

    // Cracks indicator if damaged
    if (b.health < b.maxHealth) {
      ctx.strokeStyle = '#4E342E';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(b.x + 5, b.y + 5);
      ctx.lineTo(b.x + b.width / 2, b.y + b.height / 2);
      ctx.lineTo(b.x + b.width - 5, b.y + b.height / 2 + 5);
      ctx.stroke();
    }

    // Kraft paper dashed fold line
    ctx.strokeStyle = 'rgba(43, 33, 24, 0.3)';
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(b.x + 4, b.y + 4, b.width - 8, b.height - 8);
    ctx.setLineDash([]);

    ctx.restore();
  }

  private renderSnowball(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Paper crinkle texture on snowball
    ctx.strokeStyle = '#B0BEC5';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.arc(x, y, r * 0.6, 0, Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  private renderSlingshot(ctx: CanvasRenderingContext2D): void {
    const ax = this.slingshotAnchorX;
    const ay = this.slingshotAnchorY;
    const ground = this.structure.groundY;

    // Wood post
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ax, ground);
    ctx.lineTo(ax, ay + 15);
    ctx.lineTo(ax - 18, ay - 20);
    ctx.moveTo(ax, ay + 15);
    ctx.lineTo(ax + 18, ay - 20);
    ctx.stroke();

    // Elastic band + snowball in pouch if dragging
    if (this.isDragging) {
      const pullX = this.currentDragX;
      const pullY = this.currentDragY;

      // Left & right rubber band
      ctx.strokeStyle = '#D84315';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(ax - 18, ay - 20);
      ctx.lineTo(pullX, pullY);
      ctx.lineTo(ax + 18, ay - 20);
      ctx.stroke();

      // Ball inside pouch
      this.renderSnowball(ctx, pullX, pullY, 16);

      // Trajectory dots preview
      const vx = (ax - pullX) * 9.0;
      const vy = (ay - pullY) * 9.0;
      const trajectory = this.physics.predictTrajectory(ax, ay, vx, vy, 12, 0.05);

      ctx.fillStyle = 'rgba(216, 67, 21, 0.6)';
      for (const pt of trajectory) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.snowballsRemaining > 0 && this.levelState === 'playing') {
      // Idle ball sitting in slingshot fork
      this.renderSnowball(ctx, ax, ay - 10, 16);
    }
  }

  private renderUI(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.fillStyle = '#2B2118';
    ctx.font = "bold 24px 'Cabin Sketch', cursive, sans-serif";
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${this.score}`, 25, 45);
    ctx.fillText(`BALLS: ${this.snowballsRemaining}`, 25, 75);

    ctx.textAlign = 'right';
    ctx.fillText(`BEST: ${this.highScore}`, w - 25, 45);
    ctx.fillText(`LEVEL ${this.currentLevel}/${this.maxLevels}`, w - 25, 75);

    ctx.textAlign = 'center';
    ctx.font = "bold 20px 'Patrick Hand', cursive, sans-serif";
    ctx.fillStyle = '#5D4037';
    ctx.fillText("PULL & RELEASE SLINGSHOT TO SMASH", w / 2, 40);

    // Overlays for level cleared or failed
    if (this.levelState === 'cleared') {
      ctx.fillStyle = 'rgba(43, 33, 24, 0.6)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = "bold 46px 'Cabin Sketch', cursive, sans-serif";
      ctx.fillStyle = '#4CAF50';
      ctx.fillText("STRUCTURE SMASHED!", w / 2, h / 2 - 20);
      ctx.font = "bold 24px 'Patrick Hand', cursive, sans-serif";
      ctx.fillStyle = '#FAF6EE';
      ctx.fillText("Loading next level...", w / 2, h / 2 + 30);
    } else if (this.levelState === 'failed') {
      ctx.fillStyle = 'rgba(43, 33, 24, 0.6)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = "bold 46px 'Cabin Sketch', cursive, sans-serif";
      ctx.fillStyle = '#E53935';
      ctx.fillText("OUT OF SNOWBALLS!", w / 2, h / 2 - 20);
      ctx.font = "bold 24px 'Patrick Hand', cursive, sans-serif";
      ctx.fillStyle = '#FAF6EE';
      ctx.fillText("Retrying level...", w / 2, h / 2 + 30);
    }
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }
}
