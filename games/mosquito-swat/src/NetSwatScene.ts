import { MosquitoSwarm, Mosquito } from './MosquitoSwarm';

export interface SplatParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
}

export class NetSwatScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private swarm: MosquitoSwarm;
  private isSwiping: boolean = false;
  private netX: number = 400;
  private netY: number = 300;
  private netRadius: number = 42;
  private particles: SplatParticle[] = [];
  private audioCtx: AudioContext | null = null;
  private lastTime: number = 0;
  private isGameOver: boolean = false;
  private timeLeft: number = 45;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.swarm = new MosquitoSwarm(canvas.width, canvas.height);
    this.setupEvents();
  }

  private initAudio(): void {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private playSwatSound(hit: boolean): void {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = hit ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(hit ? 320 : 180, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(hit ? 80 : 80, this.audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.1);
    } catch {
      // Ignore audio error
    }
  }

  private setupEvents(): void {
    const handleMove = (clientX: number, clientY: number) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.netX = (clientX - rect.left) * scaleX;
      this.netY = (clientY - rect.top) * scaleY;
    };

    const handleAction = (clientX: number, clientY: number) => {
      this.initAudio();
      handleMove(clientX, clientY);
      this.performSwat();
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      this.isSwiping = true;
      handleAction(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('pointermove', (e) => {
      handleMove(e.clientX, e.clientY);
      if (this.isSwiping) {
        this.performSwat();
      }
    });

    window.addEventListener('pointerup', () => {
      this.isSwiping = false;
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyS') {
        this.swarm.activatePowerup('spray');
      } else if (e.code === 'KeyE') {
        this.swarm.activatePowerup('electric');
      } else if (e.code === 'KeyR' && this.isGameOver) {
        this.restart();
      }
    });
  }

  private performSwat(): void {
    if (this.isGameOver) return;
    const hits = this.swarm.swatAt(this.netX, this.netY, this.netRadius);
    this.playSwatSound(hits.length > 0);

    for (const m of hits) {
      this.createSplat(m.x, m.y, m.type === 'giant' ? '#e74c3c' : '#7f8c8d');
    }
  }

  private createSplat(x: number, y: number, color: string): void {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 80 + 30;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 4 + 2,
        color,
        alpha: 1.0,
        life: 0.5
      });
    }
  }

  public start(): void {
    for (let i = 0; i < 6; i++) {
      this.swarm.spawnMosquito(i % 3 === 0 ? 'giant' : i % 2 === 0 ? 'speedy' : 'standard');
    }
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  public restart(): void {
    this.swarm.reset();
    this.particles = [];
    this.timeLeft = 45;
    this.isGameOver = false;
    for (let i = 0; i < 6; i++) {
      this.swarm.spawnMosquito(i % 3 === 0 ? 'giant' : i % 2 === 0 ? 'speedy' : 'standard');
    }
  }

  private loop(currentTime: number): void {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (!this.isGameOver) {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.isGameOver = true;
      }
      this.swarm.update(dt);
    }

    this.updateParticles(dt);
    this.render();

    requestAnimationFrame(this.loop.bind(this));
  }

  private updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / 0.5);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private render(): void {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Origami / Paper texture background
    ctx.fillStyle = '#fbf7ee';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid lines
    ctx.strokeStyle = '#ebdccb';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Render splats
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Render mosquitoes
    for (const m of this.swarm.mosquitoes) {
      this.renderMosquito(m);
    }

    // Render net cursor
    this.renderNet();

    // Render HUD
    this.renderHud();
  }

  private renderMosquito(m: Mosquito): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(m.angle);

    // Origami mosquito body
    ctx.fillStyle = m.type === 'giant' ? '#c0392b' : m.type === 'speedy' ? '#e67e22' : '#34495e';
    ctx.beginPath();
    ctx.moveTo(m.radius, 0);
    ctx.lineTo(-m.radius, -m.radius * 0.6);
    ctx.lineTo(-m.radius * 0.5, 0);
    ctx.lineTo(-m.radius, m.radius * 0.6);
    ctx.closePath();
    ctx.fill();

    // Wings
    const wingSpan = Math.sin(m.wingFlap) * m.radius * 1.2;
    ctx.fillStyle = 'rgba(189, 195, 199, 0.7)';
    ctx.beginPath();
    ctx.ellipse(0, -m.radius * 0.5, Math.abs(wingSpan), m.radius * 0.4, -0.3, 0, Math.PI * 2);
    ctx.ellipse(0, m.radius * 0.5, Math.abs(wingSpan), m.radius * 0.4, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Stun indicator
    if (m.stunned) {
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, m.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderNet(): void {
    const { ctx } = this;
    ctx.save();
    ctx.translate(this.netX, this.netY);

    const isElectric = this.swarm.powerupState.electricTimer > 0;
    ctx.strokeStyle = isElectric ? '#3498db' : '#27ae60';
    ctx.lineWidth = 3;
    ctx.fillStyle = isElectric ? 'rgba(52, 152, 219, 0.15)' : 'rgba(39, 174, 96, 0.1)';

    ctx.beginPath();
    ctx.arc(0, 0, this.netRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cross-mesh pattern
    ctx.lineWidth = 1;
    for (let offset = -this.netRadius + 10; offset < this.netRadius; offset += 14) {
      const chord = Math.sqrt(Math.max(0, this.netRadius * this.netRadius - offset * offset));
      ctx.beginPath();
      ctx.moveTo(offset, -chord);
      ctx.lineTo(offset, chord);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-chord, offset);
      ctx.lineTo(chord, offset);
      ctx.stroke();
    }

    // Handle
    ctx.strokeStyle = '#8e44ad';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(this.netRadius * 0.7, this.netRadius * 0.7);
    ctx.lineTo(this.netRadius * 1.5, this.netRadius * 1.5);
    ctx.stroke();

    ctx.restore();
  }

  private renderHud(): void {
    const { ctx, canvas } = this;
    ctx.save();
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillStyle = '#2c3e50';

    ctx.fillText(`Score: ${this.swarm.score}`, 20, 35);
    ctx.fillText(`Time: ${Math.ceil(this.timeLeft)}s`, canvas.width - 120, 35);

    if (this.swarm.combo > 1) {
      ctx.fillStyle = '#e67e22';
      ctx.font = 'bold 22px "Segoe UI", sans-serif';
      ctx.fillText(`${this.swarm.combo}x COMBO!`, 20, 65);
    }

    // Powerup buttons hint
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#7f8c8d';
    ctx.fillText('[S] Bug Spray  |  [E] Electric Net', 20, canvas.height - 20);

    if (this.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TIME UP!', canvas.width / 2, canvas.height / 2 - 20);

      ctx.font = '22px "Segoe UI", sans-serif';
      ctx.fillText(`Final Score: ${this.swarm.score}`, canvas.width / 2, canvas.height / 2 + 25);
      ctx.font = '16px "Segoe UI", sans-serif';
      ctx.fillText('Press R or Tap to Play Again', canvas.width / 2, canvas.height / 2 + 65);
    }

    ctx.restore();
  }
}
