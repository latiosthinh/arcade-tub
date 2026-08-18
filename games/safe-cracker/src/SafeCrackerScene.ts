import type { GameScene } from '@arcade-carnival/game-engine';
import { InputManager, audio } from '@arcade-carnival/game-engine';
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
      audio.playClick();
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
      audio.playScore();
      this.particles.emit(tipX, tipY, 25, '#ffd32a', 180, 3.5, 0.6);
      this.dial.resetZones(this.gameState.difficultyLevel);
    } else if (pickResult.outcome === 'blue') {
      audio.playPowerup();
      this.particles.emit(tipX, tipY, 20, '#00d2d3', 160, 3, 0.6);
      this.dial.resetZones(this.gameState.difficultyLevel);
    } else if (pickResult.outcome === 'miss') {
      audio.playError();
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

    const prevStatus = this.gameState.status;
    this.gameState.update(dt);
    if (prevStatus === 'playing' && this.gameState.status === 'gameover') {
      audio.playExplosion();
    }

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
    // 1. Warm kraft paper background
    ctx.fillStyle = '#F4EAD4';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Subtle paper grid pattern
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.05)';
    ctx.lineWidth = 1;
    const gridStep = 24;
    for (let x = gridStep; x < this.canvas.width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    for (let y = gridStep; y < this.canvas.height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }

    // Stitched / dashed border
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(14, 14, this.canvas.width - 28, this.canvas.height - 28);
    ctx.setLineDash([]);

    // Paper tape corner reinforcements
    this.drawTape(ctx, 16, 16, -Math.PI / 4);
    this.drawTape(ctx, this.canvas.width - 16, 16, Math.PI / 4);
    this.drawTape(ctx, 16, this.canvas.height - 16, Math.PI / 4);
    this.drawTape(ctx, this.canvas.width - 16, this.canvas.height - 16, -Math.PI / 4);
  }

  private drawTape(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(255, 248, 220, 0.85)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.lineWidth = 1;
    ctx.fillRect(-22, -8, 44, 16);
    ctx.strokeRect(-22, -8, 44, 16);
    ctx.restore();
  }

  private renderDial(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.centerX, this.centerY);

    // Outer Cardboard Bezel Shadow
    ctx.beginPath();
    ctx.arc(4, 4, this.dialRadius + 18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.fill();

    // Outer Cardboard Bezel Ring
    ctx.beginPath();
    ctx.arc(0, 0, this.dialRadius + 18, 0, Math.PI * 2);
    ctx.fillStyle = '#C5A880';
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner Stitched Line on Bezel
    ctx.beginPath();
    ctx.arc(0, 0, this.dialRadius + 10, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dial face (kraft paper stock)
    ctx.beginPath();
    ctx.arc(0, 0, this.dialRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#D8C3A5';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#3E2723';
    ctx.stroke();

    // Inner subtle concentric ring
    ctx.beginPath();
    ctx.arc(0, 0, this.dialRadius - 38, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.2)';
    ctx.lineWidth = 1.5;
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
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = isMajor ? 2.5 : 1.2;
      ctx.stroke();
    }

    // Target Zones (Construction Paper Arcs)
    for (const zone of this.dial.zones) {
      const isScore = zone.type === 'score';
      const color = isScore ? '#F59E0B' : '#3B82F6';
      const trackRadius = this.dialRadius - 28;

      ctx.save();
      // Drop shadow for arc
      ctx.strokeStyle = 'rgba(62, 39, 35, 0.25)';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(2, 2, trackRadius, zone.startAngle, zone.endAngle);
      ctx.stroke();

      // Main paper arc
      ctx.strokeStyle = color;
      ctx.lineWidth = 13;
      ctx.beginPath();
      ctx.arc(0, 0, trackRadius, zone.startAngle, zone.endAngle);
      ctx.stroke();

      // Inked boundary along arc
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, trackRadius, zone.startAngle, zone.endAngle);
      ctx.stroke();
      ctx.restore();
    }

    // Rotating Pointer Needle (Papercut Arrow)
    ctx.save();
    ctx.rotate(this.dial.pointerAngle);

    // Needle drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.beginPath();
    ctx.moveTo(3, 3);
    ctx.lineTo(this.dialRadius - 24, -5 + 3);
    ctx.lineTo(this.dialRadius - 10, 3);
    ctx.lineTo(this.dialRadius - 24, 5 + 3);
    ctx.closePath();
    ctx.fill();

    // Needle main craft body (Rose / Red construction paper needle)
    ctx.fillStyle = '#E11D48';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.dialRadius - 24, -6);
    ctx.lineTo(this.dialRadius - 8, 0);
    ctx.lineTo(this.dialRadius - 24, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Needle spine highlight
    ctx.strokeStyle = '#FFFDF8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(this.dialRadius - 16, 0);
    ctx.stroke();

    ctx.restore();

    // Center Brass Paper Fastener / Brad Hub Cap
    ctx.beginPath();
    ctx.arc(3, 3, 22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#F59E0B';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#3E2723';
    ctx.stroke();

    // Fastener center slit
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Lockout indicator over center (Paper stamp)
    if (this.gameState.isLockedOut) {
      ctx.fillStyle = '#E11D48';
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#FFFDF8';
      ctx.font = 'bold 13px "Patrick Hand", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LOCKED', 0, -8);
      ctx.font = 'bold 12px "Comfortaa", cursive, sans-serif';
      ctx.fillText(`${this.gameState.pickCooldown.toFixed(1)}s`, 0, 10);
    }

    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Top-Left Sticky Note: Score & High Score
    this.drawStickyNote(ctx, 25, 20, 150, 64, '#FFFDF8');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#E11D48';
    ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`SCORE: ${this.gameState.score}`, 35, 45);

    ctx.fillStyle = 'rgba(62, 39, 35, 0.7)';
    ctx.font = '14px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`HIGH:  ${this.gameState.highScore}`, 35, 68);

    // Top-Center Sticky Note: Timer
    const timerVal = this.gameState.timeRemaining.toFixed(1);
    const timerColor = this.gameState.timeRemaining < 5.0 ? '#E11D48' : '#3B82F6';
    this.drawStickyNote(ctx, this.centerX - 75, 20, 150, 64, '#FFFDF8');
    ctx.textAlign = 'center';
    ctx.font = 'bold 26px "Patrick Hand", cursive, sans-serif';
    ctx.fillStyle = timerColor;
    ctx.fillText(`TIME: ${timerVal}s`, this.centerX, 58);

    // Top-Right Sticky Note: Streak & Speed
    this.drawStickyNote(ctx, this.canvas.width - 175, 20, 150, 64, '#FFFDF8');
    ctx.textAlign = 'right';
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`STREAK: ${this.gameState.streak}`, this.canvas.width - 35, 45);

    ctx.fillStyle = 'rgba(62, 39, 35, 0.7)';
    ctx.font = '13px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`SPEED:  ${this.gameState.speedMultiplier.toFixed(2)}x`, this.canvas.width - 35, 68);

    // Bottom Help Text Paper Ribbon
    ctx.textAlign = 'center';
    ctx.fillStyle = '#3E2723';
    ctx.font = '14px "Comfortaa", cursive, sans-serif';
    ctx.fillText(
      'CLICK / SPACE: Pick Lock  •  RIGHT-CLICK / SHIFT: Boost Speed  •  ESC: Pause',
      this.centerX,
      572,
    );

    ctx.restore();
  }

  private drawStickyNote(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    bg: string,
  ): void {
    ctx.save();
    // Drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
    ctx.fillRect(x + 3, y + 3, w, h);

    // Note card
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    // Tape top strip
    ctx.fillStyle = 'rgba(255, 248, 220, 0.85)';
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.2)';
    ctx.lineWidth = 1;
    ctx.fillRect(x + w / 2 - 20, y - 6, 40, 12);
    ctx.strokeRect(x + w / 2 - 20, y - 6, 40, 12);
    ctx.restore();
  }

  private renderOverlays(ctx: CanvasRenderingContext2D): void {
    if (this.gameState.status === 'ready') {
      ctx.save();
      ctx.fillStyle = 'rgba(244, 234, 212, 0.88)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      const panelW = 460;
      const panelH = 340;
      const panelX = this.centerX - panelW / 2;
      const panelY = this.centerY - panelH / 2 + 10;
      this.drawStickyNote(ctx, panelX, panelY, panelW, panelH, '#FFFDF8');

      ctx.textAlign = 'center';
      ctx.fillStyle = '#E11D48';
      ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('SAFE CRACKER', this.centerX, panelY + 50);

      ctx.fillStyle = '#3E2723';
      ctx.font = '16px "Comfortaa", cursive, sans-serif';
      ctx.fillText('Align needle with paper target zones', this.centerX, panelY + 90);

      ctx.fillStyle = '#F59E0B';
      ctx.font = '15px "Comfortaa", cursive, sans-serif';
      ctx.fillText('■ Yellow Zone = +1000 Pts', this.centerX, panelY + 130);
      ctx.fillStyle = '#3B82F6';
      ctx.fillText('■ Blue Zone   = +1.5s Time Bonus', this.centerX, panelY + 158);
      ctx.fillStyle = '#E11D48';
      ctx.fillText('■ Miss        = 0.4s Lockout & Reset Streak', this.centerX, panelY + 186);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('Click or Press SPACE to Begin', this.centerX, panelY + 250);
      ctx.restore();
      return;
    }

    if (this.gameState.status === 'paused') {
      ctx.save();
      ctx.fillStyle = 'rgba(244, 234, 212, 0.88)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      const panelW = 320;
      const panelH = 180;
      const panelX = this.centerX - panelW / 2;
      const panelY = this.centerY - panelH / 2;
      this.drawStickyNote(ctx, panelX, panelY, panelW, panelH, '#FFFDF8');

      ctx.textAlign = 'center';
      ctx.fillStyle = '#3E2723';
      ctx.font = 'bold 34px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('GAME PAUSED', this.centerX, panelY + 65);

      ctx.fillStyle = 'rgba(62, 39, 35, 0.7)';
      ctx.font = '16px "Comfortaa", cursive, sans-serif';
      ctx.fillText('Press ESC to Resume', this.centerX, panelY + 115);
      ctx.restore();
      return;
    }

    if (this.gameState.status === 'gameover') {
      ctx.save();
      ctx.fillStyle = 'rgba(244, 234, 212, 0.92)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      const panelW = 440;
      const panelH = 340;
      const panelX = this.centerX - panelW / 2;
      const panelY = this.centerY - panelH / 2 + 10;
      this.drawStickyNote(ctx, panelX, panelY, panelW, panelH, '#FFFDF8');

      ctx.textAlign = 'center';
      ctx.fillStyle = '#E11D48';
      ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('VAULT LOCKED', this.centerX, panelY + 50);

      ctx.fillStyle = '#3E2723';
      ctx.font = 'bold 24px "Patrick Hand", cursive, sans-serif';
      ctx.fillText(`FINAL SCORE: ${this.gameState.score}`, this.centerX, panelY + 100);

      ctx.fillStyle = 'rgba(62, 39, 35, 0.7)';
      ctx.font = '16px "Comfortaa", cursive, sans-serif';
      ctx.fillText(`HIGH SCORE: ${this.gameState.highScore}`, this.centerX, panelY + 135);

      // Paper restart button
      ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
      ctx.fillRect(this.restartBtn.x + 3, this.restartBtn.y + 3, this.restartBtn.w, this.restartBtn.h);

      ctx.fillStyle = '#10B981';
      ctx.fillRect(
        this.restartBtn.x,
        this.restartBtn.y,
        this.restartBtn.w,
        this.restartBtn.h,
      );
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        this.restartBtn.x,
        this.restartBtn.y,
        this.restartBtn.w,
        this.restartBtn.h,
      );

      ctx.fillStyle = '#FFFDF8';
      ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText('PLAY AGAIN', this.centerX, this.restartBtn.y + this.restartBtn.h / 2);

      ctx.fillStyle = '#3E2723';
      ctx.font = '14px "Comfortaa", cursive, sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('or Press SPACE', this.centerX, panelY + 280);

      ctx.restore();
    }
  }
}
