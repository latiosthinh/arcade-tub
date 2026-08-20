import { SpinnerPhysics, BEARING_UPGRADES } from './SpinnerPhysics';
import { TrailRenderer } from './TrailRenderer';
import { spinnerAudio } from './SpinnerAudio';

export interface SpinnerSkin {
  id: string;
  name: string;
  blades: number;
  bladeColor: string;
  accentColor: string;
  glowColor: string;
  radius: number;
  cost: number;
}

export const SPINNER_SKINS: SpinnerSkin[] = [
  { id: 'tri-classic', name: 'Tri-Blade Classic', blades: 3, bladeColor: '#3b82f6', accentColor: '#1d4ed8', glowColor: '#60a5fa', radius: 120, cost: 0 },
  { id: 'dual-shuriken', name: 'Ninja Shuriken', blades: 2, bladeColor: '#10b981', accentColor: '#047857', glowColor: '#34d399', radius: 130, cost: 80 },
  { id: 'quad-neon', name: 'Quad Neon Star', blades: 4, bladeColor: '#ec4899', accentColor: '#be185d', glowColor: '#f472b6', radius: 115, cost: 200 },
  { id: 'rainbow-prism', name: 'Prism Titanium', blades: 5, bladeColor: '#8b5cf6', accentColor: '#6d28d9', glowColor: '#a78bfa', radius: 125, cost: 500 },
];

export class FidgetSpinScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public physics: SpinnerPhysics;
  public trailRenderer: TrailRenderer;
  private currentSkinIndex: number = 0;
  private unlockedSkins: Set<string> = new Set(['tri-classic']);

  // Pointer state
  private isPointerDown: boolean = false;
  private lastPointerPos: { x: number; y: number } | null = null;
  private lastPointerTime: number = 0;
  private pointerPositions: Array<{ x: number; y: number; time: number }> = [];

  // UI state
  private showUpgradeMenu: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = performance.now();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot get 2D context');
    this.ctx = context;

    this.physics = new SpinnerPhysics();
    this.trailRenderer = new TrailRenderer();

    this.setupResize();
    this.setupInputs();
  }

  public get currentSkin(): SpinnerSkin {
    return SPINNER_SKINS[this.currentSkinIndex];
  }

  private setupResize(): void {
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      const w = rect.width || window.innerWidth;
      const h = rect.height || window.innerHeight;

      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform before scale
      this.ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resize);
    resize();
  }

  private setupInputs(): void {
    const getPos = (e: MouseEvent | Touch): { x: number; y: number } => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleStart = (x: number, y: number) => {
      // Check UI button clicks first
      if (this.handleUIClick(x, y)) return;

      this.isPointerDown = true;
      const now = performance.now() / 1000;
      this.lastPointerPos = { x, y };
      this.lastPointerTime = now;
      this.pointerPositions = [{ x, y, time: now }];

      // Central cap tap impulse
      const center = this.getSpinnerCenter();
      const distFromCenter = Math.hypot(x - center.x, y - center.y);
      if (distFromCenter < 42) {
        this.physics.applyTorque(18);
        spinnerAudio.playTapImpulse();
      }
    };

    const handleMove = (x: number, y: number) => {
      if (!this.isPointerDown) return;
      const now = performance.now() / 1000;
      this.pointerPositions.push({ x, y, time: now });

      // Keep recent samples for velocity calculation
      while (this.pointerPositions.length > 5) {
        this.pointerPositions.shift();
      }

      this.lastPointerPos = { x, y };
      this.lastPointerTime = now;
    };

    const handleEnd = () => {
      if (!this.isPointerDown) return;
      this.isPointerDown = false;

      if (this.pointerPositions.length >= 2) {
        const pFirst = this.pointerPositions[0];
        const pLast = this.pointerPositions[this.pointerPositions.length - 1];
        const dt = Math.max(0.016, pLast.time - pFirst.time);

        const center = this.getSpinnerCenter();
        const initialRPM = this.physics.getRPM();
        this.physics.applySwipe(pFirst, pLast, dt, center);
        const addedRPM = Math.max(0, this.physics.getRPM() - initialRPM);

        if (addedRPM > 30) {
          spinnerAudio.playSwipeWhoosh(addedRPM / 200);
        }
      }

      this.pointerPositions = [];
    };

    this.canvas.addEventListener('mousedown', (e) => handleStart(e.clientX - this.canvas.getBoundingClientRect().left, e.clientY - this.canvas.getBoundingClientRect().top));
    window.addEventListener('mousemove', (e) => handleMove(e.clientX - this.canvas.getBoundingClientRect().left, e.clientY - this.canvas.getBoundingClientRect().top));
    window.addEventListener('mouseup', handleEnd);

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const p = getPos(e.touches[0]);
        handleStart(p.x, p.y);
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const p = getPos(e.touches[0]);
        handleMove(p.x, p.y);
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleEnd();
    }, { passive: false });
  }

  private handleUIClick(x: number, y: number): boolean {
    const width = this.canvas.getBoundingClientRect().width || window.innerWidth;
    const height = this.canvas.getBoundingClientRect().height || window.innerHeight;

    // Toggle Upgrade / Skin Panel Button (Top Right)
    const btnSize = 44;
    const btnX = width - btnSize - 16;
    const btnY = 16;

    if (x >= btnX && x <= btnX + btnSize && y >= btnY && y <= btnY + btnSize) {
      this.showUpgradeMenu = !this.showUpgradeMenu;
      spinnerAudio.playTapImpulse();
      return true;
    }

    // If Upgrade Menu is open
    if (this.showUpgradeMenu) {
      const panelW = Math.min(360, width - 40);
      const panelH = 420;
      const panelX = (width - panelW) / 2;
      const panelY = (height - panelH) / 2;

      // Close button
      if (x >= panelX + panelW - 36 && x <= panelX + panelW - 8 && y >= panelY + 8 && y <= panelY + 36) {
        this.showUpgradeMenu = false;
        spinnerAudio.playTapImpulse();
        return true;
      }

      // Bearing Upgrade Button
      const bearingBtnY = panelY + 140;
      if (x >= panelX + 20 && x <= panelX + panelW - 20 && y >= bearingBtnY && y <= bearingBtnY + 48) {
        if (this.physics.upgradeBearing()) {
          spinnerAudio.playUpgradeSound();
        }
        return true;
      }

      // Skin Selector Buttons
      const skinGridY = panelY + 240;
      for (let i = 0; i < SPINNER_SKINS.length; i++) {
        const skin = SPINNER_SKINS[i];
        const btnCol = i % 2;
        const btnRow = Math.floor(i / 2);
        const itemW = (panelW - 50) / 2;
        const itemH = 50;
        const itemX = panelX + 20 + btnCol * (itemW + 10);
        const itemY = skinGridY + btnRow * (itemH + 10);

        if (x >= itemX && x <= itemX + itemW && y >= itemY && y <= itemY + itemH) {
          if (this.unlockedSkins.has(skin.id)) {
            this.currentSkinIndex = i;
            spinnerAudio.playTapImpulse();
          } else if (this.physics.coins >= skin.cost) {
            this.physics.coins -= skin.cost;
            this.unlockedSkins.add(skin.id);
            this.currentSkinIndex = i;
            spinnerAudio.playUpgradeSound();
          }
          return true;
        }
      }

      // Block touches inside modal
      if (x >= panelX && x <= panelX + panelW && y >= panelY && y <= panelY + panelH) {
        return true;
      }
    }

    return false;
  }

  private getSpinnerCenter(): { x: number; y: number } {
    const width = this.canvas.getBoundingClientRect().width || window.innerWidth;
    const height = this.canvas.getBoundingClientRect().height || window.innerHeight;
    return { x: width / 2, y: height / 2 + 10 };
  }

  public start(): void {
    if (this.animationFrameId !== null) return;
    this.lastTime = performance.now();
    this.loop();
  }

  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = (): void => {
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;

    this.update(dt);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  public update(dt: number): void {
    this.physics.update(dt);
    this.trailRenderer.update(dt);

    const rpm = this.physics.getRPM();
    const speedRatio = Math.min(1.0, rpm / 1200);

    // Record blade tip positions for neon light trail
    const center = this.getSpinnerCenter();
    const skin = this.currentSkin;
    const bladeAngleStep = (Math.PI * 2) / skin.blades;

    for (let i = 0; i < skin.blades; i++) {
      const tipAngle = this.physics.angle + i * bladeAngleStep;
      const tipX = center.x + Math.cos(tipAngle) * skin.radius;
      const tipY = center.y + Math.sin(tipAngle) * skin.radius;

      if (rpm > 15) {
        this.trailRenderer.addPoint(i, tipX, tipY, speedRatio);
      }

      if (rpm > 900 && Math.random() < 0.25) {
        this.trailRenderer.spawnSparks(tipX, tipY, 2);
      }
    }

    // Audio hum update
    spinnerAudio.updateHum(rpm);
  }

  public render(): void {
    const width = this.canvas.getBoundingClientRect().width || window.innerWidth;
    const height = this.canvas.getBoundingClientRect().height || window.innerHeight;

    // Clear background (Dark Zen Neon theme)
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, width, height);

    // Subtle papercraft ambient grid
    this.renderBackgroundGrid(width, height);

    // Draw Neon Light Trails behind spinner
    this.trailRenderer.render(this.ctx, this.currentSkin.glowColor);

    // Draw Spinner Body
    this.renderSpinner();

    // Draw Tachometer & Zen HUD
    this.renderHUD(width, height);

    // Draw Upgrade modal if active
    if (this.showUpgradeMenu) {
      this.renderUpgradeModal(width, height);
    }
  }

  private renderBackgroundGrid(w: number, h: number): void {
    this.ctx.save();
    this.ctx.strokeStyle = '#1e293b';
    this.ctx.lineWidth = 1;

    const step = 40;
    for (let x = 0; x < w; x += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
      this.ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  private renderSpinner(): void {
    const center = this.getSpinnerCenter();
    const skin = this.currentSkin;
    const blades = skin.blades;
    const radius = skin.radius;
    const angleStep = (Math.PI * 2) / blades;

    this.ctx.save();
    this.ctx.translate(center.x, center.y);
    this.ctx.rotate(this.physics.angle);

    // Papercraft drop shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    this.ctx.shadowBlur = 16;
    this.ctx.shadowOffsetX = 4;
    this.ctx.shadowOffsetY = 6;

    // Draw Blade Arms
    for (let i = 0; i < blades; i++) {
      this.ctx.save();
      this.ctx.rotate(i * angleStep);

      // Arm body
      this.ctx.beginPath();
      this.ctx.moveTo(0, -22);
      this.ctx.lineTo(radius * 0.7, -18);
      this.ctx.arc(radius, 0, 26, -Math.PI / 2, Math.PI / 2);
      this.ctx.lineTo(radius * 0.7, 18);
      this.ctx.lineTo(0, 22);
      this.ctx.closePath();

      this.ctx.fillStyle = skin.bladeColor;
      this.ctx.fill();

      // Outer edge stroke
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = skin.accentColor;
      this.ctx.stroke();

      // Metallic ring weight at tip
      this.ctx.beginPath();
      this.ctx.arc(radius, 0, 15, 0, Math.PI * 2);
      this.ctx.fillStyle = '#1e293b';
      this.ctx.fill();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = '#e2e8f0';
      this.ctx.stroke();

      // Inner neon slit
      this.ctx.beginPath();
      this.ctx.arc(radius, 0, 6, 0, Math.PI * 2);
      this.ctx.fillStyle = skin.glowColor;
      this.ctx.fill();

      this.ctx.restore();
    }

    // Reset shadow for central bearing
    this.ctx.shadowColor = 'transparent';

    // Center Bearing Ring
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 36, 0, Math.PI * 2);
    this.ctx.fillStyle = '#334155';
    this.ctx.fill();
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.stroke();

    // Central Cap
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 26, 0, Math.PI * 2);
    const grad = this.ctx.createRadialGradient(-5, -5, 2, 0, 0, 26);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(1, '#64748b');
    this.ctx.fillStyle = grad;
    this.ctx.fill();

    // Center Emblem
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
    this.ctx.fillStyle = skin.bladeColor;
    this.ctx.fill();

    this.ctx.restore();
  }

  private renderHUD(w: number, h: number): void {
    this.ctx.save();

    // Top Bar: Coins & Stats
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px -apple-system, system-ui, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`🪙 ${Math.floor(this.physics.coins)}`, 20, 36);

    this.ctx.font = '14px -apple-system, system-ui, sans-serif';
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillText(`Total Spins: ${Math.floor(this.physics.totalRevolutions)} rev`, 20, 60);

    // Upgrade Gear Icon Button
    const btnSize = 44;
    const btnX = w - btnSize - 16;
    const btnY = 16;

    this.ctx.fillStyle = '#1e293b';
    this.ctx.beginPath();
    this.ctx.roundRect(btnX, btnY, btnSize, btnSize, 12);
    this.ctx.fill();
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.font = '22px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('⚙️', btnX + btnSize / 2, btnY + btnSize / 2);

    // Tachometer Gauge at bottom
    const tachY = h - 90;
    const rpm = Math.round(this.physics.getRPM());
    const topRPM = Math.round(this.physics.topRPM);

    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'alphabetic';

    // RPM Number
    this.ctx.font = 'bold 36px monospace';
    this.ctx.fillStyle = rpm > 800 ? '#f43f5e' : rpm > 400 ? '#eab308' : '#38bdf8';
    this.ctx.fillText(`${rpm}`, w / 2, tachY);

    this.ctx.font = 'bold 12px -apple-system, system-ui, sans-serif';
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillText('INSTANT RPM', w / 2, tachY + 18);

    this.ctx.font = '13px -apple-system, system-ui, sans-serif';
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillText(`TOP RECORD: ${topRPM} RPM`, w / 2, tachY + 42);

    // RPM Bar Gauge
    const barW = Math.min(260, w - 80);
    const barH = 6;
    const barX = (w - barW) / 2;
    const barFill = Math.min(1.0, rpm / 1200) * barW;

    this.ctx.fillStyle = '#1e293b';
    this.ctx.beginPath();
    this.ctx.roundRect(barX, tachY + 54, barW, barH, 3);
    this.ctx.fill();

    if (barFill > 0) {
      this.ctx.fillStyle = this.currentSkin.glowColor;
      this.ctx.beginPath();
      this.ctx.roundRect(barX, tachY + 54, barFill, barH, 3);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  private renderUpgradeModal(w: number, h: number): void {
    this.ctx.save();

    // Dim background backdrop
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    this.ctx.fillRect(0, 0, w, h);

    const panelW = Math.min(360, w - 40);
    const panelH = 420;
    const panelX = (w - panelW) / 2;
    const panelY = (h - panelH) / 2;

    // Card background
    this.ctx.fillStyle = '#1e293b';
    this.ctx.beginPath();
    this.ctx.roundRect(panelX, panelY, panelW, panelH, 16);
    this.ctx.fill();
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Title
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.font = 'bold 20px -apple-system, system-ui, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Workshop & Upgrades', panelX + 20, panelY + 36);

    // Close button (X)
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = 'bold 18px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('✕', panelX + panelW - 22, panelY + 34);

    // --- Bearing Upgrade Section ---
    const nextLevel = this.physics.bearingLevel + 1;
    const isMaxBearing = nextLevel >= BEARING_UPGRADES.length;
    const currentBearing = BEARING_UPGRADES[this.physics.bearingLevel];
    const nextBearing = !isMaxBearing ? BEARING_UPGRADES[nextLevel] : null;

    this.ctx.textAlign = 'left';
    this.ctx.font = 'bold 14px -apple-system, system-ui, sans-serif';
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.fillText('BEARING PRECISION', panelX + 20, panelY + 80);

    this.ctx.font = '13px -apple-system, system-ui, sans-serif';
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.fillText(`Current: ${currentBearing.name}`, panelX + 20, panelY + 104);

    this.ctx.font = '12px -apple-system, system-ui, sans-serif';
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillText(currentBearing.description, panelX + 20, panelY + 122);

    // Bearing Upgrade Button
    const btnY = panelY + 140;
    const canAffordBearing = nextBearing && this.physics.coins >= nextBearing.cost;

    this.ctx.fillStyle = isMaxBearing ? '#334155' : canAffordBearing ? '#2563eb' : '#475569';
    this.ctx.beginPath();
    this.ctx.roundRect(panelX + 20, btnY, panelW - 40, 44, 10);
    this.ctx.fill();

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 14px -apple-system, system-ui, sans-serif';
    if (isMaxBearing) {
      this.ctx.fillText('MAX BEARING LEVEL UNLOCKED', panelX + panelW / 2, btnY + 27);
    } else if (nextBearing) {
      this.ctx.fillText(`Upgrade to ${nextBearing.name} (🪙 ${nextBearing.cost})`, panelX + panelW / 2, btnY + 27);
    }

    // --- Spinner Skins Section ---
    this.ctx.textAlign = 'left';
    this.ctx.font = 'bold 14px -apple-system, system-ui, sans-serif';
    this.ctx.fillStyle = '#ec4899';
    this.ctx.fillText('BLADE SKINS', panelX + 20, panelY + 220);

    const skinGridY = panelY + 240;
    for (let i = 0; i < SPINNER_SKINS.length; i++) {
      const skin = SPINNER_SKINS[i];
      const btnCol = i % 2;
      const btnRow = Math.floor(i / 2);
      const itemW = (panelW - 50) / 2;
      const itemH = 50;
      const itemX = panelX + 20 + btnCol * (itemW + 10);
      const itemY = skinGridY + btnRow * (itemH + 10);

      const isEquipped = this.currentSkinIndex === i;
      const isUnlocked = this.unlockedSkins.has(skin.id);
      const canAfford = this.physics.coins >= skin.cost;

      this.ctx.fillStyle = isEquipped ? '#1e3a8a' : isUnlocked ? '#334155' : canAfford ? '#374151' : '#1f2937';
      this.ctx.beginPath();
      this.ctx.roundRect(itemX, itemY, itemW, itemH, 8);
      this.ctx.fill();

      if (isEquipped) {
        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 12px -apple-system, system-ui, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(skin.name, itemX + itemW / 2, itemY + 22);

      this.ctx.font = '11px -apple-system, system-ui, sans-serif';
      this.ctx.fillStyle = isEquipped ? '#38bdf8' : isUnlocked ? '#a7f3d0' : canAfford ? '#fbbf24' : '#6b7280';
      const statusText = isEquipped ? 'EQUIPPED' : isUnlocked ? 'SELECT' : `🪙 ${skin.cost}`;
      this.ctx.fillText(statusText, itemX + itemW / 2, itemY + 38);
    }

    this.ctx.restore();
  }
}
