import { GameScene } from '@arcade-carnival/game-engine';
import { FireworkPhysics, FireworkType } from './FireworkPhysics.js';
import { FireworkAudio } from './FireworkAudio.js';

const FIREWORK_TYPES: FireworkType[] = ['ring', 'double-ring', 'willow', 'heart', 'crackle'];

export class FireworkScene implements GameScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private physics: FireworkPhysics;
  private audio: FireworkAudio;

  private idleTimer: number = 0;
  private totalLaunched: number = 0;
  private activeTypeIndex: number = 0;

  // Papercraft mountains / city skyline silhouette
  private stars: { x: number; y: number; size: number; alpha: number }[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    this.width = canvas.width;
    this.height = canvas.height;

    this.physics = new FireworkPhysics(this.width, this.height);
    this.audio = new FireworkAudio();

    this.initStars();
    this.setupEvents();
  }

  public init(): void {
    this.physics.clearAll();
    this.totalLaunched = 0;
    this.idleTimer = 0;
  }

  private initStars(): void {
    this.stars = [];
    for (let i = 0; i < 70; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.7),
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.8 + 0.2
      });
    }
  }

  private setupEvents(): void {
    const handleTap = (clientX: number, clientY: number) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;
      const targetX = (clientX - rect.left) * scaleX;
      const targetY = (clientY - rect.top) * scaleY;

      // Coordinate bounds validation (Threat Boundary)
      if (targetX < 0 || targetX > this.width || targetY < 0 || targetY > this.height) {
        return;
      }

      // Check toolbar button click
      if (targetY < 55) {
        if (targetX >= this.width - 110 && targetX <= this.width - 20) {
          this.audio.toggleMute();
          return;
        }
        if (targetX >= 20 && targetX <= 140) {
          this.activeTypeIndex = (this.activeTypeIndex + 1) % (FIREWORK_TYPES.length + 1);
          return;
        }
      }

      this.launchUserFirework(targetX, targetY);
    };

    this.canvas.addEventListener('mousedown', (e) => {
      handleTap(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        handleTap(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });
  }

  private launchUserFirework(targetX: number, targetY: number): void {
    this.idleTimer = 0;
    this.totalLaunched++;

    // Pick firework type
    let chosenType: FireworkType;
    if (this.activeTypeIndex === 0) {
      chosenType = FIREWORK_TYPES[Math.floor(Math.random() * FIREWORK_TYPES.length)];
    } else {
      chosenType = FIREWORK_TYPES[this.activeTypeIndex - 1];
    }

    const startX = targetX + (Math.random() * 80 - 40);
    const startY = this.height;

    this.physics.launchRocket(startX, startY, targetX, targetY, chosenType);
    this.audio.playLaunch();
    
    // Play explosion sound effect with slight delay matching travel time
    const dist = Math.hypot(targetX - startX, targetY - startY);
    const travelTime = dist / 450;
    setTimeout(() => {
      this.audio.playExplosion(chosenType);
    }, travelTime * 1000);
  }

  public update(dt: number): void {
    this.physics.update(dt);

    // Auto/idle mode: auto-launches random fireworks if inactive > 2.5s
    this.idleTimer += dt;
    if (this.idleTimer >= 2.5) {
      this.idleTimer = 1.0; // Reset with cadence
      const tx = Math.random() * (this.width - 200) + 100;
      const ty = Math.random() * (this.height * 0.45) + 80;
      this.launchUserFirework(tx, ty);
    }
  }

  public render(): void {
    const ctx = this.ctx;

    // Dark paper night sky with trailing persistence
    ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Stars
    for (const star of this.stars) {
      ctx.fillStyle = `rgba(248, 250, 252, ${star.alpha})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }

    // Render Rockets
    const rockets = this.physics.getRockets();
    for (const r of rockets) {
      ctx.save();
      ctx.translate(r.x, r.y);
      const angle = Math.atan2(r.vy, r.vx) + Math.PI / 2;
      ctx.rotate(angle);

      // Rocket cardboard body
      ctx.fillStyle = `hsl(${r.hue}, 90%, 65%)`;
      ctx.fillRect(-3, -12, 6, 16);
      
      // Nose cone
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(-4, -12);
      ctx.lineTo(0, -18);
      ctx.lineTo(4, -12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Render Sparks & Confetti
    const sparks = this.physics.getSparks();
    for (const s of sparks) {
      ctx.save();
      ctx.fillStyle = `hsla(${s.hue}, 100%, 70%, ${s.life})`;
      ctx.strokeStyle = `hsla(${s.hue}, 100%, 85%, ${s.life})`;

      if (s.shape === 'streamer') {
        ctx.lineWidth = s.size;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 0.04, s.y - s.vy * 0.04);
        ctx.stroke();
      } else if (s.shape === 'sparkle') {
        const sz = s.size * (0.5 + s.life * 0.5);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - sz);
        ctx.lineTo(s.x + sz, s.y);
        ctx.lineTo(s.x, s.y + sz);
        ctx.lineTo(s.x - sz, s.y);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Papercraft City Skyline in Foreground
    this.renderSkyline(ctx);

    // UI Header
    this.renderHeader(ctx);
  }

  private renderSkyline(ctx: CanvasRenderingContext2D): void {
    // Cardboard silhouettes along bottom
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    
    // Castle & City buildings
    ctx.lineTo(0, this.height - 40);
    ctx.lineTo(60, this.height - 40);
    ctx.lineTo(60, this.height - 75);
    ctx.lineTo(110, this.height - 75);
    ctx.lineTo(110, this.height - 50);
    ctx.lineTo(180, this.height - 50);
    ctx.lineTo(210, this.height - 110);
    ctx.lineTo(240, this.height - 50);
    ctx.lineTo(340, this.height - 50);
    ctx.lineTo(340, this.height - 90);
    ctx.lineTo(410, this.height - 90);
    ctx.lineTo(430, this.height - 130);
    ctx.lineTo(450, this.height - 90);
    ctx.lineTo(520, this.height - 90);
    ctx.lineTo(520, this.height - 60);
    ctx.lineTo(620, this.height - 60);
    ctx.lineTo(670, this.height - 100);
    ctx.lineTo(720, this.height - 60);
    ctx.lineTo(800, this.height - 60);
    ctx.lineTo(800, this.height);
    ctx.closePath();
    ctx.fill();

    // Subtle paper outline
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  private renderHeader(ctx: CanvasRenderingContext2D): void {
    const currentModeName = this.activeTypeIndex === 0 ? 'RANDOM' : FIREWORK_TYPES[this.activeTypeIndex - 1].toUpperCase();

    // Mode button
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(16, 12, 130, 34, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`MODE: ${currentModeName}`, 81, 29);

    // Score / Launched counter
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`FIREWORKS: ${this.totalLaunched}`, this.width / 2, 29);

    // Audio button
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(this.width - 105, 12, 90, 34, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('AUDIO', this.width - 60, 29);
  }

  public destroy(): void {
    // Teardown
  }
}
