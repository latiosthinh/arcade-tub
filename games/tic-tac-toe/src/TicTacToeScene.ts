import { TicTacToeEngine, BoardState, Player } from './TicTacToeEngine';
import { XiaomiMimoClient } from './XiaomiMimoClient';

export type GameMode = 'ai' | '2p';

export interface ChalkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
}

export class TicTacToeScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private engine: TicTacToeEngine;
  private mimoClient: XiaomiMimoClient;
  private mode: GameMode = 'ai';
  private particles: ChalkParticle[] = [];
  private audioCtx: AudioContext | null = null;
  private isAiThinking: boolean = false;
  private lastTime: number = 0;

  // Board layout metrics
  private boardSize: number = 360;
  private startX: number = 120;
  private startY: number = 160;
  private cellSize: number = 120;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.engine = new TicTacToeEngine();
    this.mimoClient = new XiaomiMimoClient();
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

  private playDrawSound(isX: boolean): void {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(isX ? 440 : 330, this.audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(isX ? 520 : 260, this.audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.12);
    } catch {
      // Ignore audio error
    }
  }

  private setupEvents(): void {
    this.canvas.addEventListener('pointerdown', async (e) => {
      this.initAudio();
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      // Mode switch button check (top right)
      if (clickX >= this.canvas.width - 150 && clickX <= this.canvas.width - 20 && clickY >= 20 && clickY <= 60) {
        this.mode = this.mode === 'ai' ? '2p' : 'ai';
        this.engine.reset();
        return;
      }

      // Restart button on game over
      if (this.engine.isGameOver()) {
        this.engine.reset();
        return;
      }

      if (this.isAiThinking) return;

      // Check cell click
      const col = Math.floor((clickX - this.startX) / this.cellSize);
      const row = Math.floor((clickY - this.startY) / this.cellSize);

      if (row >= 0 && row < 3 && col >= 0 && col < 3) {
        const currentPlayer = this.engine.getCurrentPlayer();
        if (this.engine.makeMove(row, col)) {
          this.playDrawSound(currentPlayer === 'X');
          this.spawnChalkDust(
            this.startX + col * this.cellSize + this.cellSize / 2,
            this.startY + row * this.cellSize + this.cellSize / 2,
            currentPlayer === 'X' ? '#e74c3c' : '#3498db'
          );

          if (!this.engine.isGameOver() && this.mode === 'ai' && this.engine.getCurrentPlayer() === 'O') {
            await this.triggerAiMove();
          }
        }
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyR') {
        this.engine.reset();
      } else if (e.code === 'KeyM') {
        this.mode = this.mode === 'ai' ? '2p' : 'ai';
        this.engine.reset();
      }
    });
  }

  private async triggerAiMove(): Promise<void> {
    this.isAiThinking = true;
    try {
      const move = await this.mimoClient.getAiMove(this.engine.getBoard(), 'O');
      if (this.engine.makeMove(move.row, move.col)) {
        this.playDrawSound(false);
        this.spawnChalkDust(
          this.startX + move.col * this.cellSize + this.cellSize / 2,
          this.startY + move.row * this.cellSize + this.cellSize / 2,
          '#3498db'
        );
      }
    } finally {
      this.isAiThinking = false;
    }
  }

  private spawnChalkDust(x: number, y: number, color: string): void {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 60 + 20;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1.0,
        life: 0.4
      });
    }
  }

  public start(): void {
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  private loop(currentTime: number): void {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

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
      p.alpha = Math.max(0, p.life / 0.4);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private render(): void {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Blackboard / Paper theme background
    ctx.fillStyle = '#f8f5eb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Notebook paper horizontal blue lines
    ctx.strokeStyle = '#d5e1df';
    ctx.lineWidth = 1;
    for (let y = 30; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Red margin line
    ctx.strokeStyle = '#f5b7b1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 0);
    ctx.lineTo(60, canvas.height);
    ctx.stroke();

    // Draw Board grid
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    // 2 Vertical lines
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(this.startX + i * this.cellSize, this.startY);
      ctx.lineTo(this.startX + i * this.cellSize, this.startY + this.boardSize);
      ctx.stroke();
    }

    // 2 Horizontal lines
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(this.startX, this.startY + i * this.cellSize);
      ctx.lineTo(this.startX + this.boardSize, this.startY + i * this.cellSize);
      ctx.stroke();
    }

    // Draw board marks (X and O)
    const board = this.engine.getBoard();
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const mark = board[r][c];
        const cx = this.startX + c * this.cellSize + this.cellSize / 2;
        const cy = this.startY + r * this.cellSize + this.cellSize / 2;

        if (mark === 'X') {
          this.renderX(cx, cy);
        } else if (mark === 'O') {
          this.renderO(cx, cy);
        }
      }
    }

    // Render chalk dust particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Header & HUD
    this.renderHeader();
  }

  private renderX(cx: number, cy: number): void {
    const { ctx } = this;
    const size = 35;
    ctx.save();
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(cx - size, cy - size);
    ctx.lineTo(cx + size, cy + size);
    ctx.moveTo(cx + size, cy - size);
    ctx.lineTo(cx - size, cy + size);
    ctx.stroke();

    ctx.restore();
  }

  private renderO(cx: number, cy: number): void {
    const { ctx } = this;
    const radius = 35;
    ctx.save();
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  private renderHeader(): void {
    const { ctx, canvas } = this;
    ctx.save();

    // Title
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 24px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Paper Tic-Tac-Toe', 80, 45);

    // Mode button
    ctx.fillStyle = '#34495e';
    ctx.fillRect(canvas.width - 160, 20, 140, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.mode === 'ai' ? 'Mode: vs AI' : 'Mode: 2 Player', canvas.width - 90, 45);

    // Subtitle / Turn info
    ctx.textAlign = 'center';
    ctx.font = '18px "Segoe UI", sans-serif';
    if (this.engine.isGameOver()) {
      const winner = this.engine.getWinner();
      ctx.fillStyle = winner ? (winner === 'X' ? '#e74c3c' : '#3498db') : '#7f8c8d';
      ctx.font = 'bold 22px "Segoe UI", sans-serif';
      ctx.fillText(
        winner ? `Player ${winner} Wins! Tap to restart.` : 'Draw Game! Tap to restart.',
        canvas.width / 2,
        120
      );
    } else {
      ctx.fillStyle = '#2c3e50';
      const turnStr = this.isAiThinking
        ? 'Xiaomi Mimo AI is thinking...'
        : `Current Turn: Player ${this.engine.getCurrentPlayer()}`;
      ctx.fillText(turnStr, canvas.width / 2, 120);
    }

    ctx.restore();
  }
}
