import { BubbleGrid, BubbleCell } from './BubbleGrid';
import { BubbleAudio } from './BubbleAudio';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  vRot: number;
  isGlitter?: boolean;
}

export class BubbleScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private grid: BubbleGrid;
  private audio: BubbleAudio;

  // Pointer interaction state
  private isPointerDown: boolean = false;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;

  // Particles & visual effects
  private particles: Particle[] = [];
  private readonly MAX_PARTICLES = 200; // Mitigation for T-43-02
  private streakCombo: number = 0;
  private lastPopTime: number = 0;

  // Animation frame
  private animationId: number | null = null;
  private lastTime: number = 0;

  // UI bounding boxes
  private btnResetRect = { x: 0, y: 0, w: 0, h: 0 };
  private btnMuteRect = { x: 0, y: 0, w: 0, h: 0 };
  private btnBackRect = { x: 0, y: 0, w: 0, h: 0 };

  constructor(canvas: HTMLCanvasElement, audioInstance?: BubbleAudio) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('2D context not supported');
    this.ctx = context;

    this.audio = audioInstance || new BubbleAudio();
    this.grid = new BubbleGrid(8, 10, 0.06); // 8 cols, 10 rows, 6% golden chance

    this.initEvents();
    this.resize();
  }

  public start(): void {
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;
      this.update(dt);
      this.render();
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  public destroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);

    // Compute grid dimensions based on viewport
    const hudTopHeight = 90;
    const hudBottomHeight = 70;
    const availableWidth = width * 0.94;
    const availableHeight = height - hudTopHeight - hudBottomHeight;

    // Responsive column/row sizing
    let cols = 8;
    if (width < 450) cols = 6;
    else if (width > 800) cols = 12;

    const cellWidth = Math.min(65, Math.floor(availableWidth / cols));
    const cellHeight = cellWidth; // Circular bubble aspect
    const rows = Math.max(4, Math.floor(availableHeight / cellHeight));

    if (this.grid.cols !== cols || this.grid.rows !== rows) {
      this.grid.reload(cols, rows);
    }

    const gridTotalWidth = cols * cellWidth;
    const gridTotalHeight = rows * cellHeight;
    const originX = (width - gridTotalWidth) / 2;
    const originY = hudTopHeight + (availableHeight - gridTotalHeight) / 2;

    this.grid.setLayout(originX, originY, cellWidth, cellHeight);
  }

  private initEvents(): void {
    window.addEventListener('resize', () => this.resize());

    const getCanvasPos = (e: MouseEvent | Touch): { x: number; y: number } => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    // Pointer events
    const onStart = (x: number, y: number) => {
      // Check UI buttons first
      if (this.hitTestButton(x, y, this.btnResetRect)) {
        this.resetSheet();
        return;
      }
      if (this.hitTestButton(x, y, this.btnMuteRect)) {
        this.audio.toggleMute();
        return;
      }
      if (this.hitTestButton(x, y, this.btnBackRect)) {
        window.location.href = '../../index.html';
        return;
      }

      this.isPointerDown = true;
      this.lastPointerX = x;
      this.lastPointerY = y;
      this.handlePopInteraction(x, y, x, y);
    };

    const onMove = (x: number, y: number) => {
      if (!this.isPointerDown) return;
      this.handlePopInteraction(this.lastPointerX, this.lastPointerY, x, y);
      this.lastPointerX = x;
      this.lastPointerY = y;
    };

    const onEnd = () => {
      this.isPointerDown = false;
    };

    // Mouse
    this.canvas.addEventListener('mousedown', (e) => {
      const pos = getCanvasPos(e);
      onStart(pos.x, pos.y);
    });

    window.addEventListener('mousemove', (e) => {
      const pos = getCanvasPos(e);
      onMove(pos.x, pos.y);
    });

    window.addEventListener('mouseup', () => onEnd());

    // Touch
    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      if (touch) {
        const pos = getCanvasPos(touch);
        onStart(pos.x, pos.y);
      }
      e.preventDefault();
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      if (touch) {
        const pos = getCanvasPos(touch);
        onMove(pos.x, pos.y);
      }
      e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchend', () => onEnd());
    window.addEventListener('touchcancel', () => onEnd());
  }

  private hitTestButton(x: number, y: number, rect: { x: number; y: number; w: number; h: number }): boolean {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  }

  private handlePopInteraction(x1: number, y1: number, x2: number, y2: number): void {
    const sweepRadius = Math.min(this.grid.cellWidth, this.grid.cellHeight) * 0.35;
    const poppedList = this.grid.sweepLine(x1, y1, x2, y2, sweepRadius);

    if (poppedList.length > 0) {
      const now = performance.now();
      if (now - this.lastPopTime < 300) {
        this.streakCombo++;
      } else {
        this.streakCombo = 1;
      }
      this.lastPopTime = now;

      poppedList.forEach((cell, idx) => {
        // Audio trigger
        const pitchVar = 0.95 + (cell.col % 5) * 0.05 + Math.random() * 0.1;
        this.audio.playPop(pitchVar, cell.isGolden);

        if (cell.isGolden) {
          this.audio.playRainbowCascade(this.streakCombo);
          this.spawnGlitterBurst(cell);
        } else {
          this.spawnCellBurst(cell);
        }
      });
    }
  }

  public resetSheet(): void {
    this.grid.reload();
    this.audio.playFreshSheet();
    this.streakCombo = 0;
  }

  private spawnCellBurst(cell: BubbleCell): void {
    const center = this.grid.getCellCenter(cell.col, cell.row);
    const count = 4 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.MAX_PARTICLES) this.particles.shift();

      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      this.particles.push({
        x: center.x,
        y: center.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 2.5,
        color: 'rgba(255, 255, 255, 0.9)',
        alpha: 1.0,
        life: 0,
        maxLife: 0.25 + Math.random() * 0.15,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 8
      });
    }
  }

  private spawnGlitterBurst(cell: BubbleCell): void {
    const center = this.grid.getCellCenter(cell.col, cell.row);
    const count = 12 + Math.floor(Math.random() * 6);
    const colors = ['#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#fbbf24'];

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.MAX_PARTICLES) this.particles.shift();

      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 150;
      const color = colors[Math.floor(Math.random() * colors.length)] ?? '#f59e0b';

      this.particles.push({
        x: center.x,
        y: center.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 3,
        color,
        alpha: 1.0,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.25,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 12,
        isGlitter: true
      });
    }
  }

  private update(dt: number): void {
    // Update cell pop animations
    for (let r = 0; r < this.grid.rows; r++) {
      for (let c = 0; c < this.grid.cols; c++) {
        const cell = this.grid.getCell(c, r);
        if (cell && cell.popped && cell.popProgress < 1.0) {
          cell.popProgress = Math.min(1.0, cell.popProgress + dt * 6);
        }
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p) continue;
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 80 * dt; // Slight gravity
      p.rotation += p.vRot * dt;
      p.alpha = Math.max(0, 1.0 - p.life / p.maxLife);
    }
  }

  private render(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Background papercraft texture / mat
    this.ctx.fillStyle = '#f3f4f6'; // Clean soft cardboard / craft table
    this.ctx.fillRect(0, 0, width, height);

    this.renderBubbleSheet();
    this.renderParticles();
    this.renderUI(width, height);
  }

  private renderBubbleSheet(): void {
    const cols = this.grid.cols;
    const rows = this.grid.rows;
    const cellW = this.grid.cellWidth;
    const cellH = this.grid.cellHeight;
    const ox = this.grid.originX;
    const oy = this.grid.originY;

    const sheetPadding = 16;
    const sheetW = cols * cellW + sheetPadding * 2;
    const sheetH = rows * cellH + sheetPadding * 2;
    const sheetX = ox - sheetPadding;
    const sheetY = oy - sheetPadding;

    // Sheet shadow (Papercraft depth)
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    this.ctx.beginPath();
    this.ctx.roundRect(sheetX + 6, sheetY + 8, sheetW, sheetH, 16);
    this.ctx.fill();

    // Sheet background (Translucent soft textured plastic foil)
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.beginPath();
    this.ctx.roundRect(sheetX, sheetY, sheetW, sheetH, 16);
    this.ctx.fill();

    // Sheet inner surface
    const sheetGrad = this.ctx.createLinearGradient(sheetX, sheetY, sheetX, sheetY + sheetH);
    sheetGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    sheetGrad.addColorStop(1, 'rgba(235, 240, 248, 0.7)');
    this.ctx.fillStyle = sheetGrad;
    this.ctx.beginPath();
    this.ctx.roundRect(sheetX + 2, sheetY + 2, sheetW - 4, sheetH - 4, 14);
    this.ctx.fill();

    // Crimped border pattern
    this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([4, 4]);
    this.ctx.strokeRect(sheetX + 6, sheetY + 6, sheetW - 12, sheetH - 12);
    this.ctx.setLineDash([]);

    // Render individual bubbles
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = this.grid.getCell(c, r);
        if (!cell) continue;
        this.renderBubbleCell(cell);
      }
    }
  }

  private renderBubbleCell(cell: BubbleCell): void {
    const center = this.grid.getCellCenter(cell.col, cell.row);
    const radius = Math.min(this.grid.cellWidth, this.grid.cellHeight) * 0.42;

    this.ctx.save();
    this.ctx.translate(center.x, center.y);

    if (!cell.popped) {
      // UNPOPPED BUBBLE - Plump 3D bubble wrap dome

      // Base bottom shadow
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
      this.ctx.beginPath();
      this.ctx.arc(0, 3, radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Outer ring seal
      this.ctx.strokeStyle = cell.isGolden ? 'rgba(245, 158, 11, 0.6)' : 'rgba(148, 163, 184, 0.5)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
      this.ctx.stroke();

      // Bubble body gradient
      const bodyGrad = this.ctx.createRadialGradient(
        -radius * 0.3,
        -radius * 0.3,
        radius * 0.1,
        0,
        0,
        radius
      );

      if (cell.isGolden) {
        bodyGrad.addColorStop(0, '#fef08a');
        bodyGrad.addColorStop(0.5, '#f59e0b');
        bodyGrad.addColorStop(1, '#d97706');
      } else {
        bodyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        bodyGrad.addColorStop(0.6, 'rgba(219, 234, 254, 0.7)');
        bodyGrad.addColorStop(1, 'rgba(191, 219, 254, 0.4)');
      }

      this.ctx.fillStyle = bodyGrad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, radius * 0.95, 0, Math.PI * 2);
      this.ctx.fill();

      // Top-left glossy sheen reflection
      this.ctx.fillStyle = cell.isGolden ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.9)';
      this.ctx.beginPath();
      this.ctx.ellipse(-radius * 0.32, -radius * 0.32, radius * 0.28, radius * 0.16, -Math.PI / 4, 0, Math.PI * 2);
      this.ctx.fill();

      // Golden sparkle star if golden
      if (cell.isGolden) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(radius * 0.25, radius * 0.2, radius * 0.1, 0, Math.PI * 2);
        this.ctx.fill();
      }
    } else {
      // POPPED BUBBLE - Flattened, deflated plastic ring with crinkles
      const popAnim = cell.popProgress; // 0 to 1

      // Flattened indentation
      this.ctx.fillStyle = 'rgba(203, 213, 225, 0.5)';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, radius * 0.85, 0, Math.PI * 2);
      this.ctx.fill();

      // Inner collapsed shadow
      this.ctx.fillStyle = 'rgba(100, 116, 139, 0.2)';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
      this.ctx.fill();

      // Crinkle lines
      this.ctx.strokeStyle = cell.isGolden ? 'rgba(217, 119, 6, 0.4)' : 'rgba(148, 163, 184, 0.6)';
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();

      const crinkles = 4;
      for (let i = 0; i < crinkles; i++) {
        const ang = (i / crinkles) * Math.PI * 2 + (cell.col * 0.7);
        const innerR = radius * 0.25;
        const outerR = radius * 0.75;
        this.ctx.moveTo(Math.cos(ang) * innerR, Math.sin(ang) * innerR);
        this.ctx.lineTo(Math.cos(ang + 0.2) * outerR, Math.sin(ang + 0.2) * outerR);
      }
      this.ctx.stroke();

      // Outer deflated contour
      this.ctx.strokeStyle = cell.isGolden ? 'rgba(245, 158, 11, 0.3)' : 'rgba(148, 163, 184, 0.35)';
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, radius * 0.88, 0, Math.PI * 2);
      this.ctx.stroke();

      // Pop shockwave expanding ring during burst
      if (popAnim < 0.6) {
        const waveScale = 0.8 + popAnim * 0.8;
        const waveAlpha = (1 - popAnim / 0.6) * 0.7;
        this.ctx.strokeStyle = cell.isGolden ? `rgba(245, 158, 11, ${waveAlpha})` : `rgba(147, 197, 253, ${waveAlpha})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius * waveScale, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }

  private renderParticles(): void {
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;

      if (p.isGlitter) {
        // Diamond star glitter
        const r = p.radius;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -r * 1.5);
        this.ctx.lineTo(r * 0.6, 0);
        this.ctx.lineTo(0, r * 1.5);
        this.ctx.lineTo(-r * 0.6, 0);
        this.ctx.closePath();
        this.ctx.fill();
      } else {
        // Circle fleck
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }
  }

  private renderUI(width: number, height: number): void {
    const stats = this.grid.getStats();

    // Top Header Banner
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';

    // Title / stats
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillText('🫧 BUBBLE WRAP POP', 18, 35);

    this.ctx.font = '14px system-ui, -apple-system, sans-serif';
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillText(`Popped: ${stats.popped} / ${stats.total} (${stats.percent}%)`, 18, 62);

    // Golden indicator
    if (stats.goldenCount > 0) {
      this.ctx.fillStyle = '#d97706';
      this.ctx.fillText(`✨ Rare Golden: ${stats.goldenCount}`, 190, 62);
    }

    // Top Right Controls (Back, Mute, New Sheet)
    const btnW = 110;
    const btnH = 38;
    const pad = 12;

    // Reset button ("New Sheet")
    const resetX = width - btnW - 16;
    const resetY = 24;
    this.btnResetRect = { x: resetX, y: resetY, w: btnW, h: btnH };
    this.renderButton(this.btnResetRect, '🔄 New Sheet', '#3b82f6', '#ffffff');

    // Mute button
    const muteW = 44;
    const muteX = resetX - muteW - pad;
    const muteY = 24;
    this.btnMuteRect = { x: muteX, y: muteY, w: muteW, h: btnH };
    const isMuted = this.audio.getIsMuted();
    this.renderButton(this.btnMuteRect, isMuted ? '🔇' : '🔊', '#f1f5f9', '#334155');

    // Back to hub button
    const backW = 75;
    const backX = muteX - backW - pad;
    const backY = 24;
    this.btnBackRect = { x: backX, y: backY, w: backW, h: btnH };
    this.renderButton(this.btnBackRect, '← Hub', '#f1f5f9', '#334155');

    // Bottom subtle hint
    this.ctx.font = '13px system-ui, -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillText('Tap or drag pointer across bubbles to pop them all!', width / 2, height - 25);
  }

  private renderButton(rect: { x: number; y: number; w: number; h: number }, text: string, bg: string, color: string): void {
    // Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
    this.ctx.beginPath();
    this.ctx.roundRect(rect.x + 1, rect.y + 2, rect.w, rect.h, 8);
    this.ctx.fill();

    // Box
    this.ctx.fillStyle = bg;
    this.ctx.beginPath();
    this.ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 8);
    this.ctx.fill();

    // Text
    this.ctx.fillStyle = color;
    this.ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, rect.x + rect.w / 2, rect.y + rect.h / 2);
  }
}
