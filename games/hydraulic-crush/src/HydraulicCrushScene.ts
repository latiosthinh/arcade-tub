import { PistonPhysics } from './PistonPhysics';
import { CrushItemManager, CrushItemDef, CRUSH_ITEMS } from './CrushItems';
import { CrushSplatterSystem } from './CrushSplatter';
import { crushAudio } from './CrushAudio';

export class HydraulicCrushScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;

  private piston: PistonPhysics;
  private itemManager: CrushItemManager;
  private splatter: CrushSplatterSystem;

  private currentItem: CrushItemDef;
  private isHolding: boolean = false;
  private hasCrushedCurrent: boolean = false;
  private lastTime: number = 0;
  private animationFrameId: number = 0;

  // Visual shake effect on high pressure / collapse
  private screenShake: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('2D context not supported');
    this.ctx = context;

    this.piston = new PistonPhysics(280, 1000);
    this.itemManager = new CrushItemManager();
    this.splatter = new CrushSplatterSystem(canvas.width, canvas.height);
    this.currentItem = this.itemManager.getItem('duck');

    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    this.attachInputs();
  }

  private handleResize = (): void => {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || window.innerWidth;
    this.height = rect.height || window.innerHeight;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);

    this.splatter.setBounds(this.width, this.height);
  };

  private attachInputs(): void {
    const onStart = (e: Event) => {
      e.preventDefault();
      if (!this.isHolding) {
        this.isHolding = true;
        crushAudio.startPistonHiss(this.piston.getPressure() / this.piston.getMaxPressure());
      }
    };

    const onEnd = (e: Event) => {
      e.preventDefault();
      if (this.isHolding) {
        this.isHolding = false;
        crushAudio.stopPistonAudio();
      }
    };

    // Canvas touch/mouse
    this.canvas.addEventListener('mousedown', onStart);
    window.addEventListener('mouseup', onEnd);

    this.canvas.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchend', onEnd, { passive: false });
    window.addEventListener('touchcancel', onEnd, { passive: false });

    // Keyboard Spacebar
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !this.isHolding) {
        onStart(e);
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' && this.isHolding) {
        onEnd(e);
      }
    });
  }

  public selectItem(id: string): void {
    crushAudio.playClick();
    this.currentItem = this.itemManager.getItem(id);
    this.resetItem();
  }

  public resetItem(): void {
    crushAudio.playClick();
    this.piston.reset();
    this.hasCrushedCurrent = false;
    this.splatter.clear();
  }

  public start(): void {
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min(0.1, (time - this.lastTime) / 1000);
      this.lastTime = time;

      this.update(dt);
      this.render();

      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stop(): void {
    cancelAnimationFrame(this.animationFrameId);
    crushAudio.stopPistonAudio();
  }

  private update(dt: number): void {
    this.piston.applyPressure(this.isHolding, this.currentItem.stiffness, dt);
    const pressureRatio = this.piston.getPressure() / this.piston.getMaxPressure();

    if (this.isHolding) {
      crushAudio.updatePistonAudio(pressureRatio, true);
    }

    const disp = this.piston.getDisplacement();
    const deformation = this.itemManager.getDeformation(this.currentItem, disp);

    // Screen shake from intense pressure
    if (pressureRatio > 0.6) {
      this.screenShake = (pressureRatio - 0.6) * 6;
    } else {
      this.screenShake = Math.max(0, this.screenShake - dt * 10);
    }

    // Check catastrophic collapse
    if (!this.hasCrushedCurrent && deformation.isCrushed) {
      this.hasCrushedCurrent = true;
      this.screenShake = 12;

      // Spawn explosive particles
      const centerX = this.width / 2;
      const anvilY = this.height * 0.72;
      this.splatter.spawnSplatter(
        centerX,
        anvilY - 20,
        this.currentItem.splatterColor,
        this.currentItem.particleCount,
        this.currentItem.explosionForce,
        this.currentItem.isJuicy
      );

      crushAudio.playCrushBurst(this.currentItem.soundProfile);
    }

    this.splatter.update(dt);
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.save();

    // Screen shake
    if (this.screenShake > 0) {
      const ox = (Math.random() - 0.5) * this.screenShake;
      const oy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(ox, oy);
    }

    // Background - Industrial Workshop Chamber
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(0, 0, this.width, this.height);

    // Hazard Stripes on Chamber Sides
    this.renderHazardBorders();

    // Splatter stains on walls/floor
    this.splatter.render(ctx);

    const centerX = this.width / 2;
    const anvilY = this.height * 0.72;
    const pistonHeadRestY = this.height * 0.28;
    const pistonY = pistonHeadRestY + this.piston.getY();

    // Anvil (Bottom steel pedestal)
    this.renderAnvil(centerX, anvilY);

    // Target Item (compressed between piston head and anvil)
    this.renderItem(centerX, anvilY);

    // Hydraulic Piston (Cylinder, Rod & Heavy Crusher Head)
    this.renderPiston(centerX, pistonY);

    // HUD: Pressure Dial & Redline
    this.renderPressureDial(this.width * 0.85, this.height * 0.18);

    // UI Instructions / Status
    this.renderUIState();

    ctx.restore();
  }

  private renderHazardBorders(): void {
    const ctx = this.ctx;
    const stripeW = 20;
    const sideW = 40;

    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(0, 0, sideW, this.height);
    ctx.fillRect(this.width - sideW, 0, sideW, this.height);

    // Diagonal hazard stripes
    ctx.fillStyle = '#2c3e50';
    for (let y = -stripeW; y < this.height; y += stripeW * 2) {
      // Left side
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(sideW, y + stripeW);
      ctx.lineTo(sideW, y + stripeW * 2);
      ctx.lineTo(0, y + stripeW);
      ctx.fill();

      // Right side
      ctx.beginPath();
      ctx.moveTo(this.width - sideW, y);
      ctx.lineTo(this.width, y + stripeW);
      ctx.lineTo(this.width, y + stripeW * 2);
      ctx.lineTo(this.width - sideW, y + stripeW);
      ctx.fill();
    }
  }

  private renderAnvil(centerX: number, anvilY: number): void {
    const ctx = this.ctx;
    const anvilWidth = 240;
    const anvilHeight = 60;

    // Steel base
    const grad = ctx.createLinearGradient(centerX - anvilWidth / 2, anvilY, centerX + anvilWidth / 2, anvilY);
    grad.addColorStop(0, '#57606f');
    grad.addColorStop(0.5, '#747d8c');
    grad.addColorStop(1, '#2f3542');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(centerX - anvilWidth / 2, anvilY, anvilWidth, anvilHeight, [4, 4, 12, 12]);
    ctx.fill();

    // Metallic top highlight
    ctx.fillStyle = '#a4b0be';
    ctx.fillRect(centerX - anvilWidth / 2 + 10, anvilY, anvilWidth - 20, 4);

    // Support pillars
    ctx.fillStyle = '#2f3542';
    ctx.fillRect(centerX - anvilWidth / 2 + 20, anvilY + anvilHeight, anvilWidth - 40, this.height - (anvilY + anvilHeight));
  }

  private renderPiston(centerX: number, pistonHeadY: number): void {
    const ctx = this.ctx;
    const rodWidth = 50;
    const headWidth = 200;
    const headHeight = 45;

    // 1. Hydraulic Chrome Rod
    const rodGrad = ctx.createLinearGradient(centerX - rodWidth / 2, 0, centerX + rodWidth / 2, 0);
    rodGrad.addColorStop(0, '#747d8c');
    rodGrad.addColorStop(0.3, '#ffffff');
    rodGrad.addColorStop(0.7, '#a4b0be');
    rodGrad.addColorStop(1, '#2f3542');

    ctx.fillStyle = rodGrad;
    ctx.fillRect(centerX - rodWidth / 2, 0, rodWidth, pistonHeadY);

    // 2. Heavy Steel Crusher Head
    const headGrad = ctx.createLinearGradient(centerX - headWidth / 2, pistonHeadY, centerX + headWidth / 2, pistonHeadY);
    headGrad.addColorStop(0, '#2f3542');
    headGrad.addColorStop(0.5, '#747d8c');
    headGrad.addColorStop(1, '#1e272e');

    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.roundRect(centerX - headWidth / 2, pistonHeadY, headWidth, headHeight, [6, 6, 4, 4]);
    ctx.fill();

    // Bolts on press head
    ctx.fillStyle = '#f1c40f';
    [-70, -25, 25, 70].forEach((ox) => {
      ctx.beginPath();
      ctx.arc(centerX + ox, pistonHeadY + headHeight / 2, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Bottom crushing plate hardened steel
    ctx.fillStyle = '#dcdde1';
    ctx.fillRect(centerX - headWidth / 2 + 6, pistonHeadY + headHeight - 6, headWidth - 12, 6);
  }

  private renderItem(centerX: number, anvilY: number): void {
    const ctx = this.ctx;
    const disp = this.piston.getDisplacement();
    const def = this.itemManager.getDeformation(this.currentItem, disp);

    ctx.save();
    ctx.translate(centerX, anvilY);
    ctx.scale(def.scaleX, def.scaleY);

    const baseSize = 80;

    if (this.currentItem.id === 'duck') {
      // Rubber Duck
      ctx.fillStyle = this.currentItem.baseColor;
      ctx.beginPath();
      ctx.arc(0, -baseSize * 0.4, baseSize * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Duck Head
      ctx.beginPath();
      ctx.arc(baseSize * 0.25, -baseSize * 0.75, baseSize * 0.28, 0, Math.PI * 2);
      ctx.fill();

      // Duck Beak
      ctx.fillStyle = this.currentItem.accentColor;
      ctx.beginPath();
      ctx.ellipse(baseSize * 0.52, -baseSize * 0.72, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eye with comical popping expression when compressed
      ctx.fillStyle = '#ffffff';
      const eyePop = 1 + disp * 1.5;
      ctx.beginPath();
      ctx.arc(baseSize * 0.32, -baseSize * 0.82, 5 * eyePop, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(baseSize * 0.34, -baseSize * 0.82, 2.5 * eyePop, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.currentItem.id === 'can') {
      // Soda Can with metallic ridges
      ctx.fillStyle = this.currentItem.baseColor;
      ctx.beginPath();
      ctx.roundRect(-baseSize * 0.4, -baseSize * 0.9, baseSize * 0.8, baseSize * 0.9, 8);
      ctx.fill();

      // Aluminum rim
      ctx.fillStyle = this.currentItem.accentColor;
      ctx.fillRect(-baseSize * 0.4, -baseSize * 0.9, baseSize * 0.8, 8);
      ctx.fillRect(-baseSize * 0.4, -8, baseSize * 0.8, 8);

      // Logo band
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('COLA', 0, -baseSize * 0.45);
    } else if (this.currentItem.id === 'watermelon') {
      // Watermelon rind & flesh
      ctx.fillStyle = this.currentItem.baseColor;
      ctx.beginPath();
      ctx.ellipse(0, -baseSize * 0.5, baseSize * 0.55, baseSize * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner red core
      ctx.fillStyle = this.currentItem.accentColor;
      ctx.beginPath();
      ctx.ellipse(0, -baseSize * 0.5, baseSize * 0.46, baseSize * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Seeds
      ctx.fillStyle = '#2d3436';
      [-15, 0, 15].forEach((sx) => {
        ctx.beginPath();
        ctx.arc(sx, -baseSize * 0.5, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (this.currentItem.id === 'diamond') {
      // Brilliant faceted diamond
      ctx.fillStyle = this.currentItem.baseColor;
      ctx.beginPath();
      ctx.moveTo(0, -baseSize * 0.9);
      ctx.lineTo(baseSize * 0.5, -baseSize * 0.55);
      ctx.lineTo(baseSize * 0.35, 0);
      ctx.lineTo(-baseSize * 0.35, 0);
      ctx.lineTo(-baseSize * 0.5, -baseSize * 0.55);
      ctx.closePath();
      ctx.fill();

      // Inner facets
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (this.currentItem.id === 'slime') {
      // Slime goo blob
      ctx.fillStyle = this.currentItem.baseColor;
      ctx.beginPath();
      ctx.ellipse(0, -baseSize * 0.45, baseSize * 0.5, baseSize * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cute face
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-14, -baseSize * 0.48, 6, 0, Math.PI * 2);
      ctx.arc(14, -baseSize * 0.48, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.arc(-14, -baseSize * 0.48, 3, 0, Math.PI * 2);
      ctx.arc(14, -baseSize * 0.48, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Alarm Clock
      ctx.fillStyle = this.currentItem.baseColor;
      ctx.beginPath();
      ctx.arc(0, -baseSize * 0.5, baseSize * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Clock face
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -baseSize * 0.5, baseSize * 0.36, 0, Math.PI * 2);
      ctx.fill();

      // Hands
      ctx.strokeStyle = '#2f3542';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -baseSize * 0.5);
      ctx.lineTo(0, -baseSize * 0.7);
      ctx.moveTo(0, -baseSize * 0.5);
      ctx.lineTo(15, -baseSize * 0.5);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderPressureDial(dialX: number, dialY: number): void {
    const ctx = this.ctx;
    const radius = 45;
    const pressure = this.piston.getPressure();
    const maxPressure = this.piston.getMaxPressure();
    const ratio = pressure / maxPressure;

    // Gauge Outer Bezel
    ctx.fillStyle = '#2f3542';
    ctx.beginPath();
    ctx.arc(dialX, dialY, radius + 4, 0, Math.PI * 2);
    ctx.fill();

    // Dial face
    ctx.fillStyle = '#f5f6fa';
    ctx.beginPath();
    ctx.arc(dialX, dialY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Redline sector (top-right zone)
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(dialX, dialY, radius - 6, Math.PI * 0.05, Math.PI * 0.4);
    ctx.stroke();

    // Dial Needle
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const needleAngle = startAngle + ratio * (endAngle - startAngle);

    ctx.strokeStyle = ratio > 0.8 ? '#e74c3c' : '#2f3542';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(dialX, dialY);
    ctx.lineTo(dialX + Math.cos(needleAngle) * (radius - 10), dialY + Math.sin(needleAngle) * (radius - 10));
    ctx.stroke();

    // Needle center pin
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(dialX, dialY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pressure Text
    ctx.fillStyle = '#2f3542';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(pressure)} BAR`, dialX, dialY + radius + 15);
  }

  private renderUIState(): void {
    const ctx = this.ctx;
    const centerX = this.width / 2;

    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';

    if (this.piston.getIsStalled()) {
      ctx.fillStyle = '#e74c3c';
      ctx.fillText('HYDRAULIC PRESSURE STALL!', centerX, 50);
    } else if (this.hasCrushedCurrent) {
      ctx.fillText('CRUSHED! RELEASE TO RETRACT', centerX, 50);
    } else if (this.isHolding) {
      ctx.fillText('CRUSHING...', centerX, 50);
    } else {
      ctx.fillText('PRESS & HOLD TO CRUSH', centerX, 50);
    }
  }
}
