import { PopItBoard, PopItShape, DimpleCell, BOARD_SHAPES } from './PopItBoard';
import { PopItAudio } from './PopItAudio';

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
}

export class PopItScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private board: PopItBoard;
  private audio: PopItAudio;

  // Pointer interaction state
  private isPointerDown: boolean = false;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;

  // 3D Flip animation state
  private isFlipping: boolean = false;
  private flipProgress: number = 0; // 0 to 1
  private flipDuration: number = 0.45; // seconds
  private flipDir: number = 1; // 1: flip rightwards, -1: flip leftwards

  // Celebration state
  private isCelebrating: boolean = false;
  private celebrationTimer: number = 0;

  // Particles & visual effects
  private particles: Particle[] = [];
  private readonly MAX_PARTICLES = 200;

  // Animation frame
  private animationId: number | null = null;
  private lastTime: number = 0;

  // UI bounding boxes
  private btnFlipRect = { x: 0, y: 0, w: 0, h: 0 };
  private btnResetRect = { x: 0, y: 0, w: 0, h: 0 };
  private btnMuteRect = { x: 0, y: 0, w: 0, h: 0 };
  private btnBackRect = { x: 0, y: 0, w: 0, h: 0 };
  private shapeButtons: Array<{ shape: PopItShape; rect: { x: number; y: number; w: number; h: number } }> = [];

  constructor(canvas: HTMLCanvasElement, audioInstance?: PopItAudio) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('2D context not supported');
    this.ctx = context;

    this.audio = audioInstance || new PopItAudio();
    this.board = new PopItBoard('square');

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

    // Compute board bounds in center
    const topHudHeight = 120;
    const bottomHudHeight = 80;
    const availableWidth = width * 0.92;
    const availableHeight = height - topHudHeight - bottomHudHeight;

    const boardSize = Math.min(480, Math.min(availableWidth, availableHeight));
    const originX = (width - boardSize) / 2;
    const originY = topHudHeight + (availableHeight - boardSize) / 2;

    this.board.setBoardBounds(originX, originY, boardSize, boardSize);
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

    const onStart = (x: number, y: number) => {
      // Check shape pills
      for (const btn of this.shapeButtons) {
        if (this.hitTestButton(x, y, btn.rect)) {
          if (!this.isFlipping) {
            this.board.setShape(btn.shape);
            this.resize();
          }
          return;
        }
      }

      // Check header buttons
      if (this.hitTestButton(x, y, this.btnFlipRect)) {
        this.triggerFlip();
        return;
      }
      if (this.hitTestButton(x, y, this.btnResetRect)) {
        if (!this.isFlipping) {
          this.board.resetBoard();
        }
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

      // Mitigation T-43-03: Ignore pointer interactions while flipping
      if (this.isFlipping) return;

      this.isPointerDown = true;
      this.lastPointerX = x;
      this.lastPointerY = y;
      this.handlePopInteraction(x, y, x, y);
    };

    const onMove = (x: number, y: number) => {
      // Mitigation T-43-03: Ignore pointer interactions while flipping
      if (this.isFlipping || !this.isPointerDown) return;
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

  public triggerFlip(): void {
    if (this.isFlipping) return;
    this.isFlipping = true;
    this.flipProgress = 0;
    this.audio.playFlipWhoosh();
  }

  private handlePopInteraction(x1: number, y1: number, x2: number, y2: number): void {
    const sweepRadius = 15;
    const poppedList = this.board.sweepLine(x1, y1, x2, y2, sweepRadius);

    if (poppedList.length > 0) {
      poppedList.forEach((dimple) => {
        const pitchVar = 0.95 + (dimple.row % 6) * 0.04;
        this.audio.playPop(this.board.isFlipped, pitchVar);
        this.spawnDimpleBurst(dimple);
      });

      if (this.board.isAllPopped() && !this.isCelebrating) {
        this.triggerCelebration();
      }
    }
  }

  private triggerCelebration(): void {
    this.isCelebrating = true;
    this.celebrationTimer = 0;
    this.audio.playClearChime();
    this.spawnBoardCelebration();

    // Auto-flip board after small pause
    setTimeout(() => {
      if (!this.isFlipping) {
        this.triggerFlip();
      }
      this.isCelebrating = false;
    }, 850);
  }

  private spawnDimpleBurst(dimple: DimpleCell): void {
    const count = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.MAX_PARTICLES) this.particles.shift();

      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        x: dimple.x,
        y: dimple.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.5 + Math.random() * 2,
        color: dimple.color,
        alpha: 1.0,
        life: 0,
        maxLife: 0.3 + Math.random() * 0.2,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 10
      });
    }
  }

  private spawnBoardCelebration(): void {
    const dimples = this.board.getDimples();
    for (const d of dimples) {
      this.spawnDimpleBurst(d);
    }
  }

  private update(dt: number): void {
    // 3D Flip animation
    if (this.isFlipping) {
      const prevProgress = this.flipProgress;
      this.flipProgress += dt / this.flipDuration;

      // Halfway point: swap board internal flip coordinates
      if (prevProgress < 0.5 && this.flipProgress >= 0.5) {
        this.board.flipBoard();
      }

      if (this.flipProgress >= 1.0) {
        this.isFlipping = false;
        this.flipProgress = 0;
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
      p.vy += 60 * dt; // Gravity
      p.rotation += p.vRot * dt;
      p.alpha = Math.max(0, 1.0 - p.life / p.maxLife);
    }
  }

  private render(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Craft Table Background
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(0, 0, width, height);

    this.renderSiliconeBoard();
    this.renderParticles();
    this.renderUI(width, height);
  }

  private renderSiliconeBoard(): void {
    const cx = this.board.originX + this.board.width / 2;
    const cy = this.board.originY + this.board.height / 2;
    const bw = this.board.width;
    const bh = this.board.height;

    this.ctx.save();
    this.ctx.translate(cx, cy);

    // 3D Flip perspective scaling
    let scaleX = 1.0;
    if (this.isFlipping) {
      // Cosine horizontal squash: 1 -> 0 -> 1
      scaleX = Math.cos(this.flipProgress * Math.PI);
    }
    this.ctx.scale(scaleX, 1.0);

    // Silicone Toy Outer Mold Silhouette
    const shape = this.board.currentShape;
    const halfW = bw / 2;
    const halfH = bh / 2;

    // Drop Shadow
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
    this.ctx.beginPath();
    this.drawBoardPath(shape, halfW + 10, halfH + 10, 0, 8);
    this.ctx.fill();

    // Outer Silicone Body Shell (Beveled rim)
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.beginPath();
    this.drawBoardPath(shape, halfW + 12, halfH + 12, 0, 0);
    this.ctx.fill();

    // Base Silicone Plate Background
    this.ctx.fillStyle = '#f1f5f9';
    this.ctx.beginPath();
    this.drawBoardPath(shape, halfW + 6, halfH + 6, 0, 0);
    this.ctx.fill();

    // Render Dimple Bubbles
    const dimples = this.board.getDimples();
    for (const dimple of dimples) {
      // Local coordinate relative to board center
      const localX = dimple.x - cx;
      const localY = dimple.y - cy;
      this.renderDimple(dimple, localX, localY);
    }

    this.ctx.restore();
  }

  private drawBoardPath(shape: PopItShape, hw: number, hh: number, offX: number, offY: number): void {
    const x = offX;
    const y = offY;

    if (shape === 'square') {
      this.ctx.roundRect(x - hw, y - hh, hw * 2, hh * 2, 28);
    } else if (shape === 'hexagon') {
      this.ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 - Math.PI / 6;
        const px = x + Math.cos(ang) * hw;
        const py = y + Math.sin(ang) * hh;
        if (i === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.closePath();
    } else if (shape === 'heart') {
      this.ctx.beginPath();
      const topCurveHeight = hh * 0.6;
      this.ctx.moveTo(x, y + hh * 0.75);
      this.ctx.bezierCurveTo(x - hw * 1.2, y - hh * 0.3, x - hw * 0.7, y - hh * 1.1, x, y - topCurveHeight);
      this.ctx.bezierCurveTo(x + hw * 0.7, y - hh * 1.1, x + hw * 1.2, y - hh * 0.3, x, y + hh * 0.75);
      this.ctx.closePath();
    } else if (shape === 'star') {
      this.ctx.beginPath();
      const points = 5;
      const outerR = hw;
      const innerR = hw * 0.52;
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const ang = (i * Math.PI) / points - Math.PI / 2;
        const px = x + Math.cos(ang) * r;
        const py = y + Math.sin(ang) * r;
        if (i === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.closePath();
    }
  }

  private renderDimple(dimple: DimpleCell, lx: number, ly: number): void {
    const r = dimple.radius;
    const isPoppedOnFront = dimple.isPopped;

    this.ctx.save();
    this.ctx.translate(lx, ly);

    // Silicone Rim / Socket Ring
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    this.ctx.beginPath();
    this.ctx.arc(0, 2, r * 1.12, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner Dimple Hole
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r * 0.98, 0, Math.PI * 2);
    this.ctx.fill();

    // Bubble Dome Render
    // If not flipped: unpopped = convex dome up; popped = concave dome down
    // If flipped: front popped = convex dome up (unpopped on back); front unpopped = concave dome down
    const isDomeConvex = !this.board.isFlipped ? !isPoppedOnFront : isPoppedOnFront;

    if (isDomeConvex) {
      // PROTRUDING DOME (Unpressed)
      const domeGrad = this.ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r * 0.9);
      domeGrad.addColorStop(0, '#ffffff');
      domeGrad.addColorStop(0.35, dimple.color);
      domeGrad.addColorStop(1.0, this.shadeColor(dimple.color, -25));

      this.ctx.fillStyle = domeGrad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
      this.ctx.fill();

      // Top specular highlight
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      this.ctx.beginPath();
      this.ctx.ellipse(-r * 0.28, -r * 0.28, r * 0.3, r * 0.16, -Math.PI / 4, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // INVERTED CONCAVE DOME (Pressed inward)
      const indGrad = this.ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 0.85);
      indGrad.addColorStop(0, this.shadeColor(dimple.color, -40));
      indGrad.addColorStop(0.7, dimple.color);
      indGrad.addColorStop(1.0, this.shadeColor(dimple.color, -10));

      this.ctx.fillStyle = indGrad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, r * 0.84, 0, Math.PI * 2);
      this.ctx.fill();

      // Inverted inner crevice shadow
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, r * 0.78, Math.PI * 0.8, Math.PI * 1.8);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private shadeColor(color: string, percent: number): string {
    let num = parseInt(color.replace('#', ''), 16);
    let amt = Math.round(2.55 * percent);
    let R = (num >> 16) + amt;
    let G = (num >> 8 & 0x00FF) + amt;
    let B = (num & 0x0000FF) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  }

  private renderParticles(): void {
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;

      this.ctx.beginPath();
      this.ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }
  }

  private renderUI(width: number, height: number): void {
    const poppedCount = this.board.getPoppedCount();
    const totalDimples = this.board.getDimples().length;

    // Header Title
    this.ctx.fillStyle = '#1e293b';
    this.ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('🌈 POP-IT FIDGET TOY', 18, 32);

    this.ctx.font = '14px system-ui, -apple-system, sans-serif';
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillText(
      `Side: ${this.board.isFlipped ? 'Reverse 🔄' : 'Front 🏷️'} | Popped: ${poppedCount} / ${totalDimples}`,
      18,
      58
    );

    // Top Right Action Buttons
    const btnW = 95;
    const btnH = 36;
    const pad = 10;

    // Flip Button
    const flipX = width - btnW - 16;
    const flipY = 22;
    this.btnFlipRect = { x: flipX, y: flipY, w: btnW, h: btnH };
    this.renderButton(this.btnFlipRect, '🔄 Flip 180°', '#6366f1', '#ffffff');

    // Reset Button
    const resetW = 75;
    const resetX = flipX - resetW - pad;
    const resetY = 22;
    this.btnResetRect = { x: resetX, y: resetY, w: resetW, h: btnH };
    this.renderButton(this.btnResetRect, 'Reset', '#f1f5f9', '#334155');

    // Mute Button
    const muteW = 42;
    const muteX = resetX - muteW - pad;
    const muteY = 22;
    this.btnMuteRect = { x: muteX, y: muteY, w: muteW, h: btnH };
    const isMuted = this.audio.getIsMuted();
    this.renderButton(this.btnMuteRect, isMuted ? '🔇' : '🔊', '#f1f5f9', '#334155');

    // Back to Hub Button
    const backW = 70;
    const backX = muteX - backW - pad;
    const backY = 22;
    this.btnBackRect = { x: backX, y: backY, w: backW, h: btnH };
    this.renderButton(this.btnBackRect, '← Hub', '#f1f5f9', '#334155');

    // Shape Selector Pill Bar
    const shapes: PopItShape[] = ['square', 'heart', 'hexagon', 'star'];
    const shapeNames = ['Square', 'Heart', 'Hexagon', 'Star'];
    const pillW = 82;
    const pillH = 32;
    const totalPillsW = shapes.length * pillW + (shapes.length - 1) * 8;
    let pillStartX = (width - totalPillsW) / 2;
    const pillY = 82;

    this.shapeButtons = [];
    shapes.forEach((s, idx) => {
      const rect = { x: pillStartX + idx * (pillW + 8), y: pillY, w: pillW, h: pillH };
      this.shapeButtons.push({ shape: s, rect });
      const isSelected = this.board.currentShape === s;
      this.renderButton(
        rect,
        shapeNames[idx]!,
        isSelected ? '#3b82f6' : '#ffffff',
        isSelected ? '#ffffff' : '#475569',
        true
      );
    });

    // Bottom Instructions
    this.ctx.font = '13px system-ui, -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillText(
      'Press dimples to pop • Flip board to pop from back • Select shapes above',
      width / 2,
      height - 24
    );
  }

  private renderButton(
    rect: { x: number; y: number; w: number; h: number },
    text: string,
    bg: string,
    color: string,
    isPill: boolean = false
  ): void {
    const radius = isPill ? 16 : 8;

    // Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.beginPath();
    this.ctx.roundRect(rect.x + 1, rect.y + 2, rect.w, rect.h, radius);
    this.ctx.fill();

    // Box
    this.ctx.fillStyle = bg;
    this.ctx.beginPath();
    this.ctx.roundRect(rect.x, rect.y, rect.w, rect.h, radius);
    this.ctx.fill();

    // Border for light pills
    if (bg === '#ffffff' || bg === '#f1f5f9') {
      this.ctx.strokeStyle = '#e2e8f0';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.roundRect(rect.x, rect.y, rect.w, rect.h, radius);
      this.ctx.stroke();
    }

    // Text
    this.ctx.fillStyle = color;
    this.ctx.font = 'bold 12.5px system-ui, -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, rect.x + rect.w / 2, rect.y + rect.h / 2);
  }
}
