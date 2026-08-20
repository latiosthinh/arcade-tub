import { SoapBlock, SOAP_PALETTES } from './SoapBlock';
import { PeelParticleSystem } from './PeelParticles';
import { FigurineDiscovery, FIGURINES, OrigamiFigurine } from './FigurineDiscovery';
import { carveAudio } from './CarveAudio';

export class SoapCarveScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private soapBlock: SoapBlock;
  private particleSys: PeelParticleSystem;
  private figurineDiscovery: FigurineDiscovery;

  private isDragging = false;
  private lastX = 0;
  private lastY = 0;
  private lastTime = 0;
  private currentPaletteIndex = 0;
  private currentFigurineIndex = 0;

  private bladeAngle = 0;
  private bladePos = { x: 0, y: 0 };
  private bladeVisible = false;

  // Layout metrics
  private blockPixelWidth = 560;
  private blockPixelHeight = 420;
  private blockOffsetX = 0;
  private blockOffsetY = 0;

  // Animation frame
  private animationId = 0;
  private lastFrameTime = 0;

  // UI state
  private celebrationTimer = 0;
  private showVictoryModal = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context not available');
    this.ctx = context;

    this.soapBlock = new SoapBlock(40, 30, 6, this.currentPaletteIndex);
    this.particleSys = new PeelParticleSystem(150);
    this.figurineDiscovery = new FigurineDiscovery(FIGURINES[this.currentFigurineIndex]);

    this.setupEventListeners();
    this.resize();
  }

  public start(): void {
    this.lastFrameTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min((time - this.lastFrameTime) / 1000, 0.1);
      this.lastFrameTime = time;

      this.update(dt);
      this.render();

      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  public destroy(): void {
    cancelAnimationFrame(this.animationId);
    carveAudio.stopScrape();
  }

  public resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);

    // Compute soap block centered dimensions
    const availWidth = rect.width * 0.85;
    const availHeight = rect.height * 0.65;
    const aspect = 40 / 30;

    let width = availWidth;
    let height = width / aspect;
    if (height > availHeight) {
      height = availHeight;
      width = height * aspect;
    }

    this.blockPixelWidth = width;
    this.blockPixelHeight = height;
    this.blockOffsetX = (rect.width - width) / 2;
    this.blockOffsetY = (rect.height - height) / 2 + 10;
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', () => this.resize());

    const getPos = (e: MouseEvent | Touch): { x: number; y: number } => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handlePointerDown = (x: number, y: number) => {
      this.isDragging = true;
      this.lastX = x;
      this.lastY = y;
      this.lastTime = performance.now();
      this.bladePos = { x, y };
      this.bladeVisible = true;
    };

    const handlePointerMove = (x: number, y: number) => {
      this.bladePos = { x, y };
      if (!this.isDragging) return;

      const now = performance.now();
      const dt = Math.max((now - this.lastTime) / 1000, 0.001);
      const dist = Math.hypot(x - this.lastX, y - this.lastY);
      const speed = Math.min(dist / (dt * 500), 3.0);

      this.bladeAngle = Math.atan2(y - this.lastY, x - this.lastX);

      // Convert canvas pixels to grid coordinates
      const gx1 = (this.lastX - this.blockOffsetX) / (this.blockPixelWidth / this.soapBlock.cols);
      const gy1 = (this.lastY - this.blockOffsetY) / (this.blockPixelHeight / this.soapBlock.rows);
      const gx2 = (x - this.blockOffsetX) / (this.blockPixelWidth / this.soapBlock.cols);
      const gy2 = (y - this.blockOffsetY) / (this.blockPixelHeight / this.soapBlock.rows);

      if (dist > 3) {
        const carveRes = this.soapBlock.carveSlice(gx1, gy1, gx2, gy2, 2.2, 1);

        if (carveRes.carvedCount > 0) {
          carveAudio.startScrape(speed, 1);

          // Spawn ribbon peeling particles along the cutting blade edge
          for (let i = 0; i < Math.min(carveRes.carvedCount, 3); i++) {
            const peelColor = carveRes.shavedColors[i % carveRes.shavedColors.length] || '#FFF';
            const normX = -(y - this.lastY) / dist;
            const normY = (x - this.lastX) / dist;
            const side = Math.random() > 0.5 ? 1 : -1;

            this.particleSys.spawnPeel(
              x + (Math.random() - 0.5) * 15,
              y + (Math.random() - 0.5) * 15,
              normX * side * (40 + speed * 30),
              normY * side * (40 + speed * 30) - 30,
              peelColor,
              18 + Math.random() * 10
            );
          }

          if (Math.random() < 0.2) {
            carveAudio.playCurlSnap();
          }

          // Check discovery progress
          const justRevealed = this.figurineDiscovery.checkReveal(this.soapBlock);
          if (justRevealed && !this.figurineDiscovery.isUnlocked(this.figurineDiscovery.currentFigurine.id)) {
            this.figurineDiscovery.unlockFigurine(this.figurineDiscovery.currentFigurine.id);
            this.celebrationTimer = 3.0;
            this.showVictoryModal = true;
            carveAudio.playDiscoveryChime();
          }
        } else {
          carveAudio.updateScrape(0.1, 0);
        }

        this.lastX = x;
        this.lastY = y;
        this.lastTime = now;
      }
    };

    const handlePointerUp = () => {
      this.isDragging = false;
      carveAudio.stopScrape();
    };

    this.canvas.addEventListener('mousedown', (e) => {
      const pos = getPos(e);
      handlePointerDown(pos.x, pos.y);
    });

    window.addEventListener('mousemove', (e) => {
      const pos = getPos(e);
      handlePointerMove(pos.x, pos.y);
    });

    window.addEventListener('mouseup', handlePointerUp);

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const pos = getPos(e.touches[0]);
        handlePointerDown(pos.x, pos.y);
      }
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const pos = getPos(e.touches[0]);
        handlePointerMove(pos.x, pos.y);
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', handlePointerUp);
  }

  public nextPalette(): void {
    this.currentPaletteIndex = (this.currentPaletteIndex + 1) % SOAP_PALETTES.length;
    this.resetSoapBar();
  }

  public nextFigurine(): void {
    this.currentFigurineIndex = (this.currentFigurineIndex + 1) % FIGURINES.length;
    this.figurineDiscovery.setFigurine(FIGURINES[this.currentFigurineIndex]);
    this.resetSoapBar();
  }

  public resetSoapBar(): void {
    this.soapBlock.reset(this.currentPaletteIndex);
    this.particleSys.clear();
    this.figurineDiscovery.checkReveal(this.soapBlock);
    this.showVictoryModal = false;
    this.celebrationTimer = 0;
  }

  public getFigurineProgress(): number {
    return this.figurineDiscovery.revealPercentage;
  }

  public getCurrentFigurine(): OrigamiFigurine {
    return this.figurineDiscovery.currentFigurine;
  }

  public closeVictoryModal(): void {
    this.showVictoryModal = false;
  }

  public isShowingVictory(): boolean {
    return this.showVictoryModal;
  }

  private update(dt: number): void {
    this.particleSys.update(dt);
    if (this.celebrationTimer > 0) {
      this.celebrationTimer -= dt;
    }
  }

  private render(): void {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    this.ctx.clearRect(0, 0, w, h);

    // Warm pastel ceramic workshop background
    const bgGrad = this.ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#FAF6F0');
    bgGrad.addColorStop(1, '#EDE5D8');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, w, h);

    // Render Soap Dish / Cutting Mat Shadow
    this.renderCuttingMat(w, h);

    // Render Soap Block (with beveled depth layers and embedded figurine)
    this.renderSoapBlock();

    // Render Curling Ribbons / Peel Particles
    this.particleSys.render(this.ctx);

    // Render Blade Tool
    if (this.bladeVisible) {
      this.renderCutterBlade();
    }

    // Render Celebration Confetti / Radiance if just unlocked
    if (this.celebrationTimer > 0) {
      this.renderCelebration(w, h);
    }
  }

  private renderCuttingMat(w: number, h: number): void {
    const matX = this.blockOffsetX - 25;
    const matY = this.blockOffsetY - 25;
    const matW = this.blockPixelWidth + 50;
    const matH = this.blockPixelHeight + 50;

    // Mat drop shadow
    this.ctx.save();
    this.ctx.shadowColor = 'rgba(70, 50, 40, 0.12)';
    this.ctx.shadowBlur = 24;
    this.ctx.shadowOffsetY = 12;

    this.ctx.fillStyle = '#FFFFFF';
    this.roundRect(this.ctx, matX, matY, matW, matH, 16);
    this.ctx.fill();
    this.ctx.restore();

    // Grid lines on cutting mat
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(210, 195, 180, 0.4)';
    this.ctx.lineWidth = 1;
    for (let x = matX + 20; x < matX + matW; x += 20) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, matY);
      this.ctx.lineTo(x, matY + matH);
      this.ctx.stroke();
    }
    for (let y = matY + 20; y < matY + matH; y += 20) {
      this.ctx.beginPath();
      this.ctx.moveTo(matX, y);
      this.ctx.lineTo(matX + matW, y);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  private renderSoapBlock(): void {
    const cw = this.blockPixelWidth / this.soapBlock.cols;
    const ch = this.blockPixelHeight / this.soapBlock.rows;
    const fig = this.figurineDiscovery.currentFigurine;

    this.ctx.save();

    // 1. Draw Soap 3D bevel bottom / side edge
    const sideDepth = 12;
    this.ctx.fillStyle = this.soapBlock.palette.baseColor;
    this.roundRect(
      this.ctx,
      this.blockOffsetX,
      this.blockOffsetY + sideDepth,
      this.blockPixelWidth,
      this.blockPixelHeight,
      12
    );
    this.ctx.fill();

    // 2. Draw cell voxels
    for (let r = 0; r < this.soapBlock.rows; r++) {
      for (let c = 0; c < this.soapBlock.cols; c++) {
        const depth = this.soapBlock.getDepth(c, r);
        const px = this.blockOffsetX + c * cw;
        const py = this.blockOffsetY + r * ch;

        // Check if figurine mask is underneath this voxel
        const figCol = c - fig.startCol;
        const figRow = r - fig.startRow;
        const isFigurineCell =
          figCol >= 0 &&
          figCol < fig.widthCols &&
          figRow >= 0 &&
          figRow < fig.heightRows &&
          fig.mask[figRow]?.[figCol] === 1;

        if (depth >= this.figurineDiscovery.targetDepth && isFigurineCell) {
          // Render uncovered papercraft origami figurine surface
          const foldShade = (figCol + figRow) % 2 === 0 ? fig.color : fig.secondaryColor;
          this.ctx.fillStyle = foldShade;
          this.ctx.fillRect(px, py, cw + 0.5, ch + 0.5);

          // Papercraft origami facet fold line
          if ((figCol * 3 + figRow * 2) % 5 === 0) {
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(px, py);
            this.ctx.lineTo(px + cw, py + ch);
            this.ctx.stroke();
          }
        } else {
          // Render soap layer color
          this.ctx.fillStyle = this.soapBlock.getColorAtDepth(depth);
          this.ctx.fillRect(px, py, cw + 0.5, ch + 0.5);

          // Carved bevel indent shadow along cut boundaries
          if (depth > 0) {
            const depthRatio = depth / this.soapBlock.maxDepth;
            this.ctx.fillStyle = `rgba(0, 0, 0, ${depthRatio * 0.18})`;
            this.ctx.fillRect(px, py, cw + 0.5, ch + 0.5);
          }
        }
      }
    }

    // Soap block glossy bevel outline
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 2;
    this.roundRect(
      this.ctx,
      this.blockOffsetX,
      this.blockOffsetY,
      this.blockPixelWidth,
      this.blockPixelHeight,
      12
    );
    this.ctx.stroke();

    this.ctx.restore();
  }

  private renderCutterBlade(): void {
    this.ctx.save();
    this.ctx.translate(this.bladePos.x, this.bladePos.y);
    this.ctx.rotate(this.bladeAngle);

    // Blade shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetY = 4;

    // Steel blade trapezoid
    this.ctx.fillStyle = '#E0E5EC';
    this.ctx.beginPath();
    this.ctx.moveTo(-15, -4);
    this.ctx.lineTo(15, -4);
    this.ctx.lineTo(25, -28);
    this.ctx.lineTo(-5, -28);
    this.ctx.closePath();
    this.ctx.fill();

    // Sharp cutting edge highlight
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(-15, -4);
    this.ctx.lineTo(15, -4);
    this.ctx.stroke();

    // Wooden craft handle
    this.ctx.fillStyle = '#C89666';
    this.ctx.beginPath();
    this.ctx.roundRect(-8, -60, 16, 34, 4);
    this.ctx.fill();
    this.ctx.strokeStyle = '#8D5B2F';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    this.ctx.restore();
  }

  private renderCelebration(w: number, h: number): void {
    this.ctx.save();
    const alpha = Math.min(1.0, this.celebrationTimer / 0.5);
    this.ctx.globalAlpha = alpha;

    // Golden halo around revealed figurine
    const cx = this.blockOffsetX + this.blockPixelWidth * 0.5;
    const cy = this.blockOffsetY + this.blockPixelHeight * 0.5;

    const radGrad = this.ctx.createRadialGradient(cx, cy, 20, cx, cy, 200);
    radGrad.addColorStop(0, 'rgba(255, 235, 150, 0.4)');
    radGrad.addColorStop(1, 'rgba(255, 235, 150, 0)');
    this.ctx.fillStyle = radGrad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 200, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
