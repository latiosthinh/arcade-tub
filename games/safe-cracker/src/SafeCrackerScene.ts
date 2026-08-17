import type { GameScene } from '@arcade-carnival/game-engine';
import { InputManager } from '@arcade-carnival/game-engine';
import { Dial } from './Dial.js';
import { GameState } from './GameState.js';
import { ParticleSystem } from './Particles.js';

export class SafeCrackerScene implements GameScene {
  public dial: Dial;
  public gameState: GameState;
  public particles: ParticleSystem;
  public input: InputManager;

  private canvas: HTMLCanvasElement;
  private isRightMouseDown: boolean = false;
  private shakeTimer: number = 0;

  // Dial layout
  private readonly centerX: number = 400;
  private readonly centerY: number = 310;
  private readonly dialRadius: number = 170;

  // Restart button coordinates (Game Over)
  private readonly restartBtn = {
    x: 300,
    y: 390,
    w: 200,
    h: 50,
  };

  private boundOnMouseDown: (e: MouseEvent) => void;
  private boundOnMouseUp: (e: MouseEvent) => void;
  private boundOnContextMenu: (e: MouseEvent) => void;
  private boundOnTouchStart: (e: TouchEvent) => void;

  constructor(canvas: HTMLCanvasElement, input?: InputManager) {
    this.canvas = canvas;
    this.input = input || new InputManager();
    this.dial = new Dial();
    this.gameState = new GameState();
    this.particles = new ParticleSystem();

    this.boundOnMouseDown = this.onMouseDown.bind(this);
    this.boundOnMouseUp = this.onMouseUp.bind(this);
    this.boundOnContextMenu = (e: MouseEvent) => e.preventDefault();
    this.boundOnTouchStart = this.onTouchStart.bind(this);

    this.canvas.addEventListener('mousedown', this.boundOnMouseDown);
    window.addEventListener('mouseup', this.boundOnMouseUp);
    this.canvas.addEventListener('contextmenu', this.boundOnContextMenu);
    this.canvas.addEventListener('touchstart', this.boundOnTouchStart, { passive: false });
  }

  public destroy(): void {
    this.canvas.removeEventListener('mousedown', this.boundOnMouseDown);
    window.removeEventListener('mouseup', this.boundOnMouseUp);
    this.canvas.removeEventListener('contextmenu', this.boundOnContextMenu);
    this.canvas.removeEventListener('touchstart', this.boundOnTouchStart);
    this.input.destroy();
  }

  public pause(): void {
    this.gameState.pause();
  }

  public resume(): void {
    this.gameState.resume();
  }

  private triggerPick(): void {
    if (this.gameState.status === 'ready' || this.gameState.status === 'gameover') {
      this.gameState.start();
      this.dial.resetZones(0);
      this.particles.clear();
      return;
    }

    if (this.gameState.status !== 'playing') {
      return;
    }

    const hitResult = this.dial.checkHit();
    const pickResult = this.gameState.recordPick(hitResult);

    const tipX = this.centerX + Math.cos(this.dial.pointerAngle) * (this.dialRadius - 10);
    const tipY = this.centerY + Math.sin(this.dial.pointerAngle) * (this.dialRadius - 10);

    if (pickResult.outcome === 'yellow') {
      this.particles.emit(tipX, tipY, 25, '#ffd32a', 180, 3.5, 0.6);
      this.dial.resetZones(this.gameState.difficultyLevel);
    } else if (pickResult.outcome === 'blue') {
      this.particles.emit(tipX, tipY, 20, '#00d2d3', 160, 3, 0.6);
      this.dial.resetZones(this.gameState.difficultyLevel);
    } else if (pickResult.outcome === 'miss') {
      this.particles.emit(tipX, tipY, 12, '#ff3838', 120, 2.5, 0.4);
      this.shakeTimer = 0.2;
    }
  }

  private getCanvasPos(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / (rect.width || this.canvas.width);
    const scaleY = this.canvas.height / (rect.height || this.canvas.height);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  private onMouseDown(e: MouseEvent): void {
    if (e.button === 2) {
      // Right click -> Speed boost
      this.isRightMouseDown = true;
      return;
    }

    if (e.button === 0) {
      // Left click
      if (this.gameState.status === 'gameover') {
        const { x, y } = this.getCanvasPos(e.clientX, e.clientY);
        if (
          x >= this.restartBtn.x &&
          x <= this.restartBtn.x + this.restartBtn.w &&
          y >= this.restartBtn.y &&
          y <= this.restartBtn.y + this.restartBtn.h
        ) {
          this.gameState.start();
          this.dial.resetZones(0);
          this.particles.clear();
          return;
        }
      }
      this.triggerPick();
    }
  }

  private onMouseUp(e: MouseEvent): void {
    if (e.button === 2) {
      this.isRightMouseDown = false;
    }
  }

  private onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      if (this.gameState.status === 'gameover') {
        const { x, y } = this.getCanvasPos(touch.clientX, touch.clientY);
        if (
          x >= this.restartBtn.x &&
          x <= this.restartBtn.x + this.restartBtn.w &&
          y >= this.restartBtn.y &&
          y <= this.restartBtn.y + this.restartBtn.h
        ) {
          this.gameState.start();
          this.dial.resetZones(0);
          this.particles.clear();
          return;
        }
      }
      this.triggerPick();
    }
  }

  public update(dt: number): void {
    if (this.input.justPressed('Escape')) {
      if (this.gameState.status === 'playing') {
        this.gameState.pause();
      } else if (this.gameState.status === 'paused') {
        this.gameState.resume();
      }
    }

    if (this.input.justPressed('Space')) {
      this.triggerPick();
    }

    const isShiftDown = this.input.isDown('ShiftLeft') || this.input.isDown('ShiftRight');
    const isBoosted = this.isRightMouseDown || isShiftDown;

    this.gameState.update(dt);

    if (this.gameState.status === 'playing') {
      this.dial.update(dt, this.gameState.speedMultiplier, isBoosted);
    }

    this.particles.update(dt);

    if (this.shakeTimer > 0) {
      this.shakeTimer = Math.max(0, this.shakeTimer - dt);
    }

    this.input.update();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Screen shake on miss
    if (this.shakeTimer > 0) {
      const shakeIntensity = 6 * (this.shakeTimer / 0.2);
      const offsetX = (Math.random() * 2 - 1) * shakeIntensity;
      const offsetY = (Math.random() * 2 - 1) * shakeIntensity;
      ctx.translate(offsetX, offsetY);
    }

    // 1. Vault Background
    this.renderBackground(ctx);

    // 2. Safe Dial
    this.renderDial(ctx);

    // 3. Particles
    this.particles.render(ctx);

    // 4. HUD
    this.renderHUD(ctx);

    // 5. Overlays (Ready / Paused / Game Over)
    this.renderOverlays(ctx);

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D): void {
    const bgGrad = ctx.createRadialGradient(
      this.centerX,
      this.centerY,
      50,
      this.centerX,
      this.centerY,
      500,
    );
    bgGrad.addColorStop(0, '#1e272e');
    bgGrad.addColorStop(1, '#0a0e12');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Metallic rivet border
    ctx.strokeStyle = '#2f3542';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, this.canvas.width - 20, this.canvas.height - 20);

    ctx.fillStyle = '#747d8c';
    const rivetSpacing = 60;
    for (let x = 25; x < this.canvas.width - 15; x += rivetSpacing) {
      this.drawRivet(ctx, x, 18);
      this.drawRivet(ctx, x, this.canvas.height - 18);
    }
    for (let y = 35; y < this.canvas.height - 25; y += rivetSpacing) {
      this.drawRivet(ctx, 18, y);
      this.drawRivet(ctx, this.canvas.width - 18, y);
    }
  }

  private drawRivet(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderDial(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.centerX, this.centerY);

    // Outer Bezel Shadow & Ring
    ctx.beginPath();
    ctx.arc(0, 0, this.dialRadius + 20, 0, Math.PI * 2);
    ctx.fillStyle = '#111418';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, this.dialRadius + 14, 0, Math.PI * 2);
    ctx.fillStyle = '#2f3542';
    ctx.fill();

    // Dial face
    const faceGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, this.dialRadius);
    faceGrad.addColorStop(0, '#353b48');
    faceGrad.addColorStop(0.85, '#1e272e');
    faceGrad.addColorStop(1, '#14181c');
    ctx.beginPath();
    ctx.arc(0, 0, this.dialRadius, 0, Math.PI * 2);
    ctx.fillStyle = faceGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#57606f';
    ctx.stroke();

    // Tick marks every 30 degrees (12 hours) + minor ticks
    for (let i = 0; i < 36; i++) {
      const angle = (i * Math.PI) / 18;
      const isMajor = i % 3 === 0;
      const innerR = isMajor ? this.dialRadius - 16 : this.dialRadius - 8;
      const outerR = this.dialRadius - 2;

      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
      ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
      ctx.strokeStyle = isMajor ? '#a4b0be' : '#47535e';
      ctx.lineWidth = isMajor ? 2.5 : 1;
      ctx.stroke();
    }

    // Target Zones (Glowing Arcs)
    for (const zone of this.dial.zones) {
      const isScore = zone.type === 'score';
      const color = isScore ? '#ffd32a' : '#00d2d3';
      const shadowColor = isScore ? 'rgba(255, 211, 42, 0.8)' : 'rgba(0, 210, 211, 0.8)';
      const trackRadius = this.dialRadius - 28;

      ctx.save();
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = color;
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, trackRadius, zone.startAngle, zone.endAngle);
      ctx.stroke();

      // Core bright line inside arc
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, trackRadius, zone.startAngle, zone.endAngle);
      ctx.stroke();
      ctx.restore();
    }

    // Rotating Pointer Needle
    ctx.save();
    ctx.rotate(this.dial.pointerAngle);
    ctx.shadowColor = 'rgba(255, 159, 26, 0.75)';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#ff9f1a';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.dialRadius - 12, 0);
    ctx.stroke();

    // Needle indicator tip arrowhead
    ctx.fillStyle = '#fffa65';
    ctx.beginPath();
    ctx.moveTo(this.dialRadius - 10, 0);
    ctx.lineTo(this.dialRadius - 24, -6);
    ctx.lineTo(this.dialRadius - 24, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Center Hub Cap
    const hubGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 24);
    hubGrad.addColorStop(0, '#f1f2f6');
    hubGrad.addColorStop(0.7, '#747d8c');
    hubGrad.addColorStop(1, '#2f3542');
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1e272e';
    ctx.stroke();

    // Lockout indicator over center
    if (this.gameState.isLockedOut) {
      ctx.fillStyle = 'rgba(255, 56, 56, 0.85)';
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LOCKED', 0, -6);
      ctx.fillText(`${this.gameState.pickCooldown.toFixed(1)}s`, 0, 8);
    }

    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.font = 'bold 20px "Courier New", Courier, monospace';

    // Top-Left: Score & High Score
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd32a';
    ctx.fillText(`SCORE: ${this.gameState.score}`, 30, 45);

    ctx.fillStyle = '#a4b0be';
    ctx.font = '16px "Courier New", Courier, monospace';
    ctx.fillText(`HIGH:  ${this.gameState.highScore}`, 30, 72);

    // Top-Center: Timer
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px "Courier New", Courier, monospace';
    const timerVal = this.gameState.timeRemaining.toFixed(1);
    if (this.gameState.timeRemaining < 5.0) {
      ctx.fillStyle = '#ff3838';
      ctx.shadowColor = 'rgba(255, 56, 56, 0.8)';
      ctx.shadowBlur = 8;
    } else {
      ctx.fillStyle = '#00d2d3';
      ctx.shadowBlur = 0;
    }
    ctx.fillText(`TIME: ${timerVal}s`, this.centerX, 45);
    ctx.shadowBlur = 0;

    // Top-Right: Streak & Speed Multiplier
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ff9f1a';
    ctx.font = 'bold 18px "Courier New", Courier, monospace';
    ctx.fillText(`STREAK: ${this.gameState.streak}`, this.canvas.width - 30, 45);

    ctx.fillStyle = '#a4b0be';
    ctx.font = '16px "Courier New", Courier, monospace';
    ctx.fillText(`SPEED:  ${this.gameState.speedMultiplier.toFixed(2)}x`, this.canvas.width - 30, 72);

    // Bottom Help Text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#747d8c';
    ctx.font = '14px sans-serif';
    ctx.fillText(
      'CLICK / SPACE: Pick Lock  •  RIGHT-CLICK / SHIFT: Boost Speed  •  ESC: Pause',
      this.centerX,
      570,
    );

    ctx.restore();
  }

  private renderOverlays(ctx: CanvasRenderingContext2D): void {
    if (this.gameState.status === 'ready') {
      ctx.save();
      ctx.fillStyle = 'rgba(10, 14, 18, 0.75)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd32a';
      ctx.font = 'bold 38px "Courier New", Courier, monospace';
      ctx.fillText('SAFE CRACKER', this.centerX, 230);

      ctx.fillStyle = '#ffffff';
      ctx.font = '20px sans-serif';
      ctx.fillText('Align needle with glowing target zones', this.centerX, 280);

      ctx.fillStyle = '#ffd32a';
      ctx.font = '16px monospace';
      ctx.fillText('■ Yellow Zone = +1000 Pts', this.centerX, 320);
      ctx.fillStyle = '#00d2d3';
      ctx.fillText('■ Cyan Zone   = +1.5s Time', this.centerX, 345);
      ctx.fillStyle = '#ff3838';
      ctx.fillText('■ Miss        = 0.4s Lockout + Reset Streak', this.centerX, 370);

      ctx.fillStyle = '#fffa65';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('Click or Press SPACE to Begin', this.centerX, 430);
      ctx.restore();
      return;
    }

    if (this.gameState.status === 'paused') {
      ctx.save();
      ctx.fillStyle = 'rgba(10, 14, 18, 0.8)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Courier New", Courier, monospace';
      ctx.fillText('GAME PAUSED', this.centerX, 270);

      ctx.fillStyle = '#a4b0be';
      ctx.font = '18px sans-serif';
      ctx.fillText('Press ESC to Resume', this.centerX, 330);
      ctx.restore();
      return;
    }

    if (this.gameState.status === 'gameover') {
      ctx.save();
      ctx.fillStyle = 'rgba(10, 14, 18, 0.85)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff3838';
      ctx.font = 'bold 36px "Courier New", Courier, monospace';
      ctx.fillText('VAULT LOCKED', this.centerX, 210);

      ctx.fillStyle = '#ffd32a';
      ctx.font = 'bold 26px "Courier New", Courier, monospace';
      ctx.fillText(`FINAL SCORE: ${this.gameState.score}`, this.centerX, 270);

      ctx.fillStyle = '#a4b0be';
      ctx.font = '20px "Courier New", Courier, monospace';
      ctx.fillText(`HIGH SCORE: ${this.gameState.highScore}`, this.centerX, 310);

      // Restart Button
      ctx.fillStyle = '#2f3542';
      ctx.strokeStyle = '#ffd32a';
      ctx.lineWidth = 2;
      ctx.fillRect(
        this.restartBtn.x,
        this.restartBtn.y,
        this.restartBtn.w,
        this.restartBtn.h,
      );
      ctx.strokeRect(
        this.restartBtn.x,
        this.restartBtn.y,
        this.restartBtn.w,
        this.restartBtn.h,
      );

      ctx.fillStyle = '#ffd32a';
      ctx.font = 'bold 20px sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText('PLAY AGAIN', this.centerX, this.restartBtn.y + this.restartBtn.h / 2);

      ctx.fillStyle = '#747d8c';
      ctx.font = '14px sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('or Press SPACE', this.centerX, 470);

      ctx.restore();
    }
  }
}
