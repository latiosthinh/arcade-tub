import { WaterSortEngine, Tube, MoveRecord } from './WaterSortEngine';
import { LevelGenerator, LevelConfig } from './LevelGenerator';
import { liquidAudio } from './LiquidAudio';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface PourAnimation {
  fromIndex: number;
  toIndex: number;
  color: string;
  count: number;
  progress: number; // 0 to 1
  duration: number; // in seconds
  startX: number;
  startY: number;
  destX: number;
  destY: number;
  glugPlayed: number;
}

export class LiquidSortScene {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  public engine: WaterSortEngine;
  public generator: LevelGenerator;
  public currentLevel: number = 1;
  public currentConfig: LevelConfig;

  public selectedTubeIndex: number | null = null;
  private currentPour: PourAnimation | null = null;
  private particles: Particle[] = [];

  // Visual layout geometry
  private tubeWidth: number = 44;
  private tubeHeight: number = 140;
  private tubeCornerRadius: number = 22;
  private tubePositions: { x: number; y: number; originalX: number; originalY: number; lift: number }[] = [];

  // Victory celebration state
  public isWon: boolean = false;
  private confetti: Particle[] = [];

  // Callbacks for UI sync
  public onStateChange?: () => void;
  public onLevelComplete?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('2D context not supported');
    this.ctx = context;

    this.engine = new WaterSortEngine(4);
    this.generator = new LevelGenerator(4);
    this.currentConfig = this.generator.generateLevel(this.currentLevel);
    this.loadLevel(this.currentLevel);

    this.setupResize();
    this.setupInputs();
  }

  public loadLevel(levelNum: number): void {
    this.currentLevel = levelNum;
    this.currentConfig = this.generator.generateLevel(levelNum);
    this.engine.setTubes(this.currentConfig.tubes);
    this.selectedTubeIndex = null;
    this.currentPour = null;
    this.isWon = false;
    this.particles = [];
    this.confetti = [];
    this.calculateTubeLayout();
    this.onStateChange?.();
  }

  public restart(): void {
    if (this.currentPour) return;
    this.engine.restart();
    this.selectedTubeIndex = null;
    this.isWon = false;
    this.particles = [];
    this.confetti = [];
    this.calculateTubeLayout();
    this.onStateChange?.();
  }

  public undo(): void {
    if (this.currentPour || !this.engine.canUndo()) return;
    this.engine.undo();
    this.selectedTubeIndex = null;
    this.isWon = false;
    liquidAudio.playTubeSelect();
    this.calculateTubeLayout();
    this.onStateChange?.();
  }

  private setupResize(): void {
    const resize = () => {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.floor(rect.width * dpr);
      this.canvas.height = Math.floor(rect.height * dpr);
      this.ctx.scale(dpr, dpr);
      this.calculateTubeLayout();
    };

    window.addEventListener('resize', resize);
    resize();
  }

  private calculateTubeLayout(): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const tubes = this.engine.getTubes();
    const count = tubes.length;
    if (count === 0) return;

    // Tube proportions
    this.tubeWidth = Math.min(52, Math.max(34, Math.floor(width / (Math.ceil(count / (count > 6 ? 2 : 1)) + 1.8))));
    this.tubeHeight = Math.floor(this.tubeWidth * 3.2);
    this.tubeCornerRadius = Math.floor(this.tubeWidth * 0.48);

    // Multi-row layout if > 5 tubes
    const rows = count > 5 ? 2 : 1;
    const tubesPerRow = Math.ceil(count / rows);

    this.tubePositions = [];
    const rowHeight = this.tubeHeight + 70;
    const startY = (height - (rows * rowHeight)) / 2 + 30;

    for (let i = 0; i < count; i++) {
      const rowIndex = Math.floor(i / tubesPerRow);
      const colIndex = i % tubesPerRow;
      const countInThisRow = Math.min(tubesPerRow, count - rowIndex * tubesPerRow);

      const spacingX = Math.min(this.tubeWidth * 1.5, (width - 40) / countInThisRow);
      const rowWidth = (countInThisRow - 1) * spacingX;
      const rowStartX = (width - rowWidth) / 2;

      const x = rowStartX + colIndex * spacingX;
      const y = startY + rowIndex * rowHeight;

      this.tubePositions.push({
        x,
        y,
        originalX: x,
        originalY: y,
        lift: 0
      });
    }
  }

  private setupInputs(): void {
    const handleTap = (clientX: number, clientY: number) => {
      if (this.currentPour || this.isWon) return;

      const rect = this.canvas.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const clickY = clientY - rect.top;

      // Find clicked tube
      let clickedIndex: number | null = null;
      for (let i = 0; i < this.tubePositions.length; i++) {
        const pos = this.tubePositions[i];
        if (!pos) continue;
        const halfW = this.tubeWidth * 0.7;
        if (
          clickX >= pos.originalX - halfW &&
          clickX <= pos.originalX + halfW &&
          clickY >= pos.originalY - 40 &&
          clickY <= pos.originalY + this.tubeHeight + 20
        ) {
          clickedIndex = i;
          break;
        }
      }

      if (clickedIndex === null) return;

      this.handleTubeClick(clickedIndex);
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      handleTap(e.clientX, e.clientY);
    });
  }

  public handleTubeClick(index: number): void {
    if (this.currentPour || this.isWon) return;

    if (this.selectedTubeIndex === null) {
      // Select source tube if it has liquid
      const tube = this.engine.getTube(index);
      if (tube && tube.length > 0) {
        this.selectedTubeIndex = index;
        liquidAudio.playTubeSelect();
      }
    } else if (this.selectedTubeIndex === index) {
      // Deselect if clicking source again
      this.selectedTubeIndex = null;
      liquidAudio.playTubeSelect();
    } else {
      // Target tube clicked
      const sourceIdx = this.selectedTubeIndex;
      if (this.engine.canPour(sourceIdx, index)) {
        this.startPourAnimation(sourceIdx, index);
      } else {
        // Switch selection to new tube if it has liquid
        const targetTube = this.engine.getTube(index);
        if (targetTube && targetTube.length > 0) {
          this.selectedTubeIndex = index;
          liquidAudio.playTubeSelect();
        } else {
          this.selectedTubeIndex = null;
        }
      }
    }
    this.onStateChange?.();
  }

  private startPourAnimation(fromIdx: number, toIdx: number): void {
    const count = this.engine.getTransferCount(fromIdx, toIdx);
    const color = this.engine.getTopColor(fromIdx);
    if (!color || count <= 0) return;

    const fromPos = this.tubePositions[fromIdx];
    const toPos = this.tubePositions[toIdx];
    if (!fromPos || !toPos) return;

    // Determine pouring tilt offset above destination
    const isLeftOfTarget = fromPos.originalX < toPos.originalX;
    const destX = toPos.originalX + (isLeftOfTarget ? -this.tubeWidth * 0.75 : this.tubeWidth * 0.75);
    const destY = toPos.originalY - this.tubeHeight * 0.45;

    this.currentPour = {
      fromIndex: fromIdx,
      toIndex: toIdx,
      color,
      count,
      progress: 0,
      duration: 0.55 + count * 0.15,
      startX: fromPos.x,
      startY: fromPos.y,
      destX,
      destY,
      glugPlayed: 0
    };

    liquidAudio.playPourStream();
  }

  private update(dt: number): void {
    // Lift animation for selected tubes
    for (let i = 0; i < this.tubePositions.length; i++) {
      const pos = this.tubePositions[i];
      if (!pos) continue;
      const targetLift = this.selectedTubeIndex === i ? 24 : 0;
      pos.lift += (targetLift - pos.lift) * 12 * dt;
      if (!this.currentPour || this.currentPour.fromIndex !== i) {
        pos.x += (pos.originalX - pos.x) * 10 * dt;
        pos.y += (pos.originalY - pos.lift - pos.y) * 10 * dt;
      }
    }

    // Pour animation handling
    if (this.currentPour) {
      const pour = this.currentPour;
      pour.progress += dt / pour.duration;

      const fromPos = this.tubePositions[pour.fromIndex];
      const toPos = this.tubePositions[pour.toIndex];

      if (fromPos && toPos) {
        if (pour.progress < 0.3) {
          // Phase 1: Glide & elevate above target
          const t = pour.progress / 0.3;
          const smoothT = Math.sin((t * Math.PI) / 2);
          fromPos.x = pour.startX + (pour.destX - pour.startX) * smoothT;
          fromPos.y = (pour.startY - 24) + (pour.destY - (pour.startY - 24)) * smoothT;
        } else if (pour.progress < 0.85) {
          // Phase 2: Pouring stream and bubbles
          fromPos.x = pour.destX;
          fromPos.y = pour.destY;

          // Spawn stream splash particles
          const streamProgress = (pour.progress - 0.3) / 0.55;
          const targetTube = this.engine.getTube(pour.toIndex);
          const currentUnitsInTarget = targetTube ? targetTube.length : 0;
          const targetFillY = toPos.originalY + this.tubeHeight - (currentUnitsInTarget + streamProgress * pour.count) * (this.tubeHeight * 0.22);

          // Emit particles
          if (Math.random() < 0.7) {
            this.particles.push({
              x: toPos.originalX + (Math.random() * 12 - 6),
              y: Math.max(toPos.originalY + 10, targetFillY),
              vx: (Math.random() - 0.5) * 40,
              vy: -Math.random() * 40 - 20,
              color: pour.color,
              size: Math.random() * 3 + 2,
              alpha: 0.9,
              life: 0,
              maxLife: 0.35
            });
          }

          // Trigger glug audio rhythmically
          const expectedGlugs = Math.floor(streamProgress * pour.count);
          if (expectedGlugs > pour.glugPlayed) {
            pour.glugPlayed = expectedGlugs;
            const targetUnits = currentUnitsInTarget + expectedGlugs;
            liquidAudio.playGlug(targetUnits, 4);
          }
        } else {
          // Phase 3: Return to rack
          const t = (pour.progress - 0.85) / 0.15;
          const smoothT = Math.sin((t * Math.PI) / 2);
          fromPos.x = pour.destX + (fromPos.originalX - pour.destX) * smoothT;
          fromPos.y = pour.destY + (fromPos.originalY - pour.destY) * smoothT;
        }

        if (pour.progress >= 1.0) {
          // Commit move in engine
          this.engine.pour(pour.fromIndex, pour.toIndex);
          fromPos.x = fromPos.originalX;
          fromPos.y = fromPos.originalY;
          fromPos.lift = 0;
          this.selectedTubeIndex = null;
          this.currentPour = null;

          // Check victory
          if (this.engine.isSolved()) {
            this.isWon = true;
            liquidAudio.playWinChimes();
            this.spawnConfetti();
            this.onLevelComplete?.();
          }

          this.onStateChange?.();
        }
      }
    }

    // Update splash particles
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
      p.vy += 120 * dt; // Gravity
      p.alpha = 1 - (p.life / p.maxLife);
    }

    // Update celebratory confetti
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      if (!c) continue;
      c.life += dt;
      if (c.life >= c.maxLife) {
        this.confetti.splice(i, 1);
        continue;
      }
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vy += 80 * dt;
      c.alpha = 1 - (c.life / c.maxLife);
    }
  }

  private spawnConfetti(): void {
    const rect = this.canvas.getBoundingClientRect();
    const colors = ['#FF3B30', '#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FFCC00', '#00C7BE'];
    for (let i = 0; i < 90; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)] || '#FFCC00';
      this.confetti.push({
        x: rect.width / 2 + (Math.random() - 0.5) * 80,
        y: rect.height / 2 - 40,
        vx: (Math.random() - 0.5) * 360,
        vy: -Math.random() * 320 - 100,
        color,
        size: Math.random() * 6 + 4,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 1.5 + 1.2
      });
    }
  }

  private render(): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Soft dark gradient laboratory backdrop
    const grad = this.ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.75);
    grad.addColorStop(0, '#1c1b1f');
    grad.addColorStop(1, '#0e0d10');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, width, height);

    // Draw laboratory wooden racks under each row of tubes
    this.renderWoodenRacks();

    // Render tubes (render non-pouring tubes first, pouring tube on top)
    const tubes = this.engine.getTubes();
    const pouringIdx = this.currentPour ? this.currentPour.fromIndex : -1;

    for (let i = 0; i < tubes.length; i++) {
      if (i !== pouringIdx) {
        const tube = tubes[i];
        if (tube) {
          this.renderTube(i, tube);
        }
      }
    }

    // Render liquid pouring stream if active
    if (this.currentPour) {
      this.renderPourStream(this.currentPour);
      const pouringTube = tubes[pouringIdx];
      if (pouringTube) {
        this.renderTube(pouringIdx, pouringTube, true);
      }
    }

    // Render particles
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Render confetti
    for (const c of this.confetti) {
      this.ctx.save();
      this.ctx.fillStyle = c.color;
      this.ctx.globalAlpha = c.alpha;
      this.ctx.fillRect(c.x - c.size / 2, c.y - c.size / 2, c.size, c.size);
      this.ctx.restore();
    }
  }

  private renderWoodenRacks(): void {
    const tubes = this.engine.getTubes();
    if (tubes.length === 0 || this.tubePositions.length === 0) return;

    const rows = tubes.length > 5 ? 2 : 1;
    const tubesPerRow = Math.ceil(tubes.length / rows);

    for (let r = 0; r < rows; r++) {
      const firstIdx = r * tubesPerRow;
      const lastIdx = Math.min(tubes.length - 1, (r + 1) * tubesPerRow - 1);
      const firstPos = this.tubePositions[firstIdx];
      const lastPos = this.tubePositions[lastIdx];

      if (!firstPos || !lastPos) continue;

      const rackY = firstPos.originalY + this.tubeHeight + 6;
      const rackStartX = firstPos.originalX - this.tubeWidth * 0.8;
      const rackEndX = lastPos.originalX + this.tubeWidth * 0.8;
      const rackWidth = rackEndX - rackStartX;

      // Wooden rail shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.beginPath();
      this.ctx.roundRect(rackStartX + 2, rackY + 6, rackWidth, 12, 6);
      this.ctx.fill();

      // Wooden rail
      const rackGrad = this.ctx.createLinearGradient(rackStartX, rackY, rackStartX, rackY + 12);
      rackGrad.addColorStop(0, '#382f28');
      rackGrad.addColorStop(0.5, '#4a3f36');
      rackGrad.addColorStop(1, '#2c251f');
      this.ctx.fillStyle = rackGrad;
      this.ctx.beginPath();
      this.ctx.roundRect(rackStartX, rackY, rackWidth, 12, 6);
      this.ctx.fill();

      // Tube base indentation rings
      for (let i = firstIdx; i <= lastIdx; i++) {
        const pos = this.tubePositions[i];
        if (!pos) continue;
        this.ctx.fillStyle = 'rgba(15, 12, 10, 0.6)';
        this.ctx.beginPath();
        this.ctx.ellipse(pos.originalX, rackY + 5, this.tubeWidth * 0.38, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  private renderTube(index: number, tube: Tube, isPouring: boolean = false): void {
    const pos = this.tubePositions[index];
    if (!pos) return;

    const w = this.tubeWidth;
    const h = this.tubeHeight;
    const r = this.tubeCornerRadius;

    this.ctx.save();
    this.ctx.translate(pos.x, pos.y);

    let tiltAngle = 0;
    if (isPouring && this.currentPour) {
      const pour = this.currentPour;
      const toPos = this.tubePositions[pour.toIndex];
      const isLeft = toPos ? pour.startX < toPos.originalX : true;
      // Progressive tilt up to 75 degrees during pouring phase
      if (pour.progress < 0.3) {
        tiltAngle = (pour.progress / 0.3) * (isLeft ? 0.9 : -0.9);
      } else if (pour.progress < 0.85) {
        tiltAngle = (isLeft ? 1.25 : -1.25);
      } else {
        tiltAngle = ((1.0 - pour.progress) / 0.15) * (isLeft ? 1.25 : -1.25);
      }
    }

    if (tiltAngle !== 0) {
      this.ctx.rotate(tiltAngle);
    }

    const halfW = w / 2;

    // Tube selection halo glow
    if (this.selectedTubeIndex === index && !isPouring) {
      this.ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      this.ctx.shadowBlur = 16;
    }

    // 1. Clip path for liquid fill inside glass tube
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(-halfW + 2, 0);
    this.ctx.lineTo(halfW - 2, 0);
    this.ctx.lineTo(halfW - 2, h - r);
    this.ctx.arc(0, h - r, halfW - 2, 0, Math.PI, false);
    this.ctx.lineTo(-halfW + 2, 0);
    this.ctx.closePath();
    this.ctx.clip();

    // Render liquid layers from bottom to top
    const unitHeight = (h - 10) / this.engine.tubeCapacity;

    // Adjust apparent units during pour animation
    let renderTube = [...tube];
    if (isPouring && this.currentPour && this.currentPour.progress >= 0.3 && this.currentPour.progress < 0.85) {
      const streamT = (this.currentPour.progress - 0.3) / 0.55;
      const unitsRemoved = Math.min(this.currentPour.count, Math.floor(streamT * this.currentPour.count));
      renderTube = tube.slice(0, Math.max(0, tube.length - unitsRemoved));
    } else if (this.currentPour && this.currentPour.toIndex === index && this.currentPour.progress >= 0.3 && this.currentPour.progress < 0.85) {
      const streamT = (this.currentPour.progress - 0.3) / 0.55;
      const unitsAdded = Math.min(this.currentPour.count, Math.floor(streamT * this.currentPour.count));
      renderTube = [...tube, ...Array(unitsAdded).fill(this.currentPour.color)];
    }

    for (let i = 0; i < renderTube.length; i++) {
      const layerColor = renderTube[i];
      if (!layerColor) continue;
      const bottomY = h - i * unitHeight;
      const topY = bottomY - unitHeight;

      // Vibrant liquid layer with subtle gradient shading
      const liquidGrad = this.ctx.createLinearGradient(-halfW, topY, halfW, topY);
      liquidGrad.addColorStop(0, layerColor);
      liquidGrad.addColorStop(0.3, this.adjustBrightness(layerColor, 20));
      liquidGrad.addColorStop(0.8, layerColor);
      liquidGrad.addColorStop(1, this.adjustBrightness(layerColor, -25));

      this.ctx.fillStyle = liquidGrad;
      this.ctx.fillRect(-halfW, topY, w, unitHeight + 1);

      // Liquid meniscus curve on the top layer
      if (i === renderTube.length - 1) {
        this.ctx.fillStyle = this.adjustBrightness(layerColor, 35);
        this.ctx.beginPath();
        this.ctx.ellipse(0, topY, halfW - 2, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    this.ctx.restore(); // Exit liquid clip

    // 2. Glass Tube Outer Shell & Graduations
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;

    // Glass rim top lip
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, halfW + 1.5, 3.5, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    // Glass body outline
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(-halfW, 0);
    this.ctx.lineTo(-halfW, h - r);
    this.ctx.arc(0, h - r, halfW, Math.PI, 0, true);
    this.ctx.lineTo(halfW, 0);
    this.ctx.stroke();

    // Laboratory graduation tick marks
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    for (let u = 1; u <= 3; u++) {
      const tickY = h - u * unitHeight;
      this.ctx.beginPath();
      this.ctx.moveTo(halfW - 8, tickY);
      this.ctx.lineTo(halfW - 2, tickY);
      this.ctx.stroke();
    }

    // Glass reflection specular streak (left side)
    const specGrad = this.ctx.createLinearGradient(-halfW + 4, 0, -halfW + 9, 0);
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
    this.ctx.fillStyle = specGrad;
    this.ctx.beginPath();
    this.ctx.roundRect(-halfW + 3, 6, 4, h - r - 6, 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  private renderPourStream(pour: PourAnimation): void {
    if (pour.progress < 0.3 || pour.progress >= 0.85) return;

    const fromPos = this.tubePositions[pour.fromIndex];
    const toPos = this.tubePositions[pour.toIndex];
    if (!fromPos || !toPos) return;

    const isLeft = pour.startX < toPos.originalX;
    const startStreamX = fromPos.x + (isLeft ? this.tubeWidth * 0.4 : -this.tubeWidth * 0.4);
    const startStreamY = fromPos.y;

    const targetTube = this.engine.getTube(pour.toIndex);
    const targetUnits = targetTube ? targetTube.length : 0;
    const streamProgress = (pour.progress - 0.3) / 0.55;
    const destStreamY = toPos.originalY + this.tubeHeight - (targetUnits + streamProgress * pour.count) * (this.tubeHeight * 0.22);
    const destStreamX = toPos.originalX;

    // Curved bezier liquid stream
    this.ctx.save();
    this.ctx.strokeStyle = pour.color;
    this.ctx.lineWidth = 6 + Math.sin(pour.progress * 20) * 1.5;
    this.ctx.lineCap = 'round';
    this.ctx.shadowColor = pour.color;
    this.ctx.shadowBlur = 8;

    this.ctx.beginPath();
    this.ctx.moveTo(startStreamX, startStreamY);
    const ctrlX = (startStreamX + destStreamX) / 2;
    const ctrlY = startStreamY + (destStreamY - startStreamY) * 0.4;
    this.ctx.quadraticCurveTo(ctrlX, ctrlY, destStreamX, destStreamY);
    this.ctx.stroke();

    this.ctx.restore();
  }

  private adjustBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return `#${(
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1)}`;
  }

  public start(): void {
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;

      this.update(dt);
      this.render();

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
