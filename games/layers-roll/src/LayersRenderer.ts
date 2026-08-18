import { GameState } from './GameState.js';
import { LayersParticles } from './LayersParticles.js';
import { TrackObstacle, TrackPickup, FinishRibbon } from './TrackGenerator.js';

export class LayersRenderer {
  // Perspective camera settings
  private cameraY: number = 320;
  private cameraZOffset: number = 180;
  private horizonY: number = 140;

  public render(
    ctx: CanvasRenderingContext2D,
    state: GameState,
    particles: LayersParticles,
    width: number,
    height: number
  ): void {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Papercraft Background
    this.drawBackground(ctx, width, height);

    // 2. Setup Perspective Transformation for Track
    this.drawTrack(ctx, state, width, height);

    // 3. Draw Pickups on Track
    this.drawPickups(ctx, state, width, height);

    // 4. Draw Obstacles (Saws, Trimmers, Teeth)
    this.drawObstacles(ctx, state, width, height);

    // 5. Draw Finish Ribbons
    this.drawRibbons(ctx, state, width, height);

    // 6. Draw Player Cylinder Roll with Concentric Paper Layers
    this.drawPlayerRoll(ctx, state, width, height);

    // 7. Draw Particles (Paper shreds, confetti)
    particles.render(ctx);

    // 8. Draw HUD (Layer Count, Gauge, Distance, Score)
    this.drawHUD(ctx, state, width, height);
  }

  private drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Warm kraft paper background with subtle cut patterns
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(0, 0, width, height);

    // Horizon subtle hills / layered cutouts
    ctx.fillStyle = '#EDE2D0';
    ctx.beginPath();
    ctx.moveTo(0, this.horizonY);
    ctx.quadraticCurveTo(width * 0.25, this.horizonY - 40, width * 0.5, this.horizonY - 10);
    ctx.quadraticCurveTo(width * 0.75, this.horizonY + 20, width, this.horizonY - 25);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();

    // Dark paper cut outline
    ctx.strokeStyle = '#D5C7B2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.horizonY);
    ctx.quadraticCurveTo(width * 0.25, this.horizonY - 40, width * 0.5, this.horizonY - 10);
    ctx.quadraticCurveTo(width * 0.75, this.horizonY + 20, width, this.horizonY - 25);
    ctx.stroke();
  }

  // Projects world (X, Z) to Screen (SX, SY, Scale)
  public project(x: number, z: number, cameraZ: number, width: number, height: number): { sx: number; sy: number; scale: number } {
    const relZ = z - cameraZ + this.cameraZOffset;
    if (relZ <= 10) {
      return { sx: width / 2 + x, sy: height + 100, scale: 2.0 };
    }

    const fov = 450;
    const scale = fov / (fov + relZ);
    const sx = width / 2 + x * scale * 1.5;
    const sy = this.horizonY + (height - this.horizonY) * scale * 0.85 + (1 - scale) * 40;

    return { sx, sy, scale };
  }

  private drawTrack(ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number): void {
    const camZ = state.roll.z;
    const halfW = state.roll.trackWidth / 2;

    const nearPLeft = this.project(-halfW, camZ - 50, camZ, width, height);
    const nearPRight = this.project(halfW, camZ - 50, camZ, width, height);
    const farPLeft = this.project(-halfW, camZ + 1200, camZ, width, height);
    const farPRight = this.project(halfW, camZ + 1200, camZ, width, height);

    // Track cardboard drop shadow
    ctx.fillStyle = 'rgba(43, 33, 24, 0.12)';
    ctx.beginPath();
    ctx.moveTo(nearPLeft.sx + 8, nearPLeft.sy + 8);
    ctx.lineTo(nearPRight.sx + 8, nearPRight.sy + 8);
    ctx.lineTo(farPRight.sx + 8, farPRight.sy + 8);
    ctx.lineTo(farPLeft.sx + 8, farPLeft.sy + 8);
    ctx.closePath();
    ctx.fill();

    // Track surface - textured cardboard beige
    ctx.fillStyle = '#E8D8C3';
    ctx.beginPath();
    ctx.moveTo(nearPLeft.sx, nearPLeft.sy);
    ctx.lineTo(nearPRight.sx, nearPRight.sy);
    ctx.lineTo(farPRight.sx, farPRight.sy);
    ctx.lineTo(farPLeft.sx, farPLeft.sy);
    ctx.closePath();
    ctx.fill();

    // Track paper edge borders
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center guide stitched dashed line
    ctx.strokeStyle = '#C2B097';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 12]);
    const nearCenter = this.project(0, camZ - 50, camZ, width, height);
    const farCenter = this.project(0, camZ + 1200, camZ, width, height);
    ctx.beginPath();
    ctx.moveTo(nearCenter.sx, nearCenter.sy);
    ctx.lineTo(farCenter.sx, farCenter.sy);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private drawPickups(ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number): void {
    const camZ = state.roll.z;

    for (const p of state.track.pickups) {
      if (p.collected) continue;
      if (p.z < camZ - 60 || p.z > camZ + 1200) continue;

      const p1 = this.project(p.x - p.width / 2, p.z - p.length / 2, camZ, width, height);
      const p2 = this.project(p.x + p.width / 2, p.z - p.length / 2, camZ, width, height);
      const p3 = this.project(p.x + p.width / 2, p.z + p.length / 2, camZ, width, height);
      const p4 = this.project(p.x - p.width / 2, p.z + p.length / 2, camZ, width, height);

      // Sheet paper drop shadow
      ctx.fillStyle = 'rgba(43, 33, 24, 0.2)';
      ctx.beginPath();
      ctx.moveTo(p1.sx + 4, p1.sy + 4);
      ctx.lineTo(p2.sx + 4, p2.sy + 4);
      ctx.lineTo(p3.sx + 4, p3.sy + 4);
      ctx.lineTo(p4.sx + 4, p4.sy + 4);
      ctx.closePath();
      ctx.fill();

      // Flat paper sheet
      ctx.fillStyle = p.layer.color;
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.lineTo(p3.sx, p3.sy);
      ctx.lineTo(p4.sx, p4.sy);
      ctx.closePath();
      ctx.fill();

      // Border outline
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 2 * p1.scale;
      ctx.stroke();

      // Plus indicator on paper sheet
      const center = this.project(p.x, p.z, camZ, width, height);
      ctx.fillStyle = '#2B2118';
      ctx.font = `bold ${Math.round(14 * center.scale)}px "Comfortaa", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`+${p.layer.scoreValue}`, center.sx, center.sy);
    }
  }

  private drawObstacles(ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number): void {
    const camZ = state.roll.z;

    for (const obs of state.track.obstacles) {
      if (obs.z < camZ - 80 || obs.z > camZ + 1200) continue;

      const pCenter = this.project(obs.x, obs.z, camZ, width, height);
      const scale = pCenter.scale;
      const w = obs.width * scale;
      const h = obs.depth * scale * 1.6;

      ctx.save();
      ctx.translate(pCenter.sx, pCenter.sy);

      // Cardboard trimmer saw / teeth visual
      if (obs.type === 'saw') {
        const angle = (Date.now() / 150) % (Math.PI * 2);
        ctx.rotate(angle);

        // Blade base
        ctx.fillStyle = '#7F8C8D';
        ctx.beginPath();
        ctx.arc(0, 0, w * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        // Saw Teeth
        const teethCount = 8;
        for (let i = 0; i < teethCount; i++) {
          const tAngle = (i / teethCount) * Math.PI * 2;
          const rInner = w * 0.4;
          const rOuter = w * 0.58;
          ctx.beginPath();
          ctx.moveTo(Math.cos(tAngle) * rInner, Math.sin(tAngle) * rInner);
          ctx.lineTo(Math.cos(tAngle + 0.2) * rOuter, Math.sin(tAngle + 0.2) * rOuter);
          ctx.lineTo(Math.cos(tAngle + 0.4) * rInner, Math.sin(tAngle + 0.4) * rInner);
          ctx.fillStyle = '#E74C3C';
          ctx.fill();
        }
      } else {
        // Cardboard teeth gate
        ctx.fillStyle = '#D63031';
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 2.5 * scale;
        ctx.strokeRect(-w / 2, -h / 2, w, h);

        // Warning striped pattern
        ctx.fillStyle = '#FFEAA7';
        for (let x = -w / 2; x < w / 2; x += 14 * scale) {
          ctx.beginPath();
          ctx.moveTo(x, -h / 2);
          ctx.lineTo(x + 8 * scale, -h / 2);
          ctx.lineTo(x, h / 2);
          ctx.closePath();
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }

  private drawRibbons(ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number): void {
    const camZ = state.roll.z;
    const halfW = state.roll.trackWidth / 2;

    for (const ribbon of state.track.finishRibbons) {
      if (ribbon.z < camZ - 100 || ribbon.z > camZ + 1200) continue;

      const pLeft = this.project(-halfW, ribbon.z, camZ, width, height);
      const pRight = this.project(halfW, ribbon.z, camZ, width, height);
      const pMid = this.project(0, ribbon.z, camZ, width, height);

      if (!ribbon.cut) {
        // Intact ribbon banner across track
        ctx.strokeStyle = ribbon.color;
        ctx.lineWidth = 8 * pMid.scale;
        ctx.beginPath();
        ctx.moveTo(pLeft.sx, pLeft.sy);
        ctx.lineTo(pRight.sx, pRight.sy);
        ctx.stroke();

        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 1.5 * pMid.scale;
        ctx.stroke();

        // Multiplier Tag
        ctx.fillStyle = '#2B2118';
        ctx.font = `bold ${Math.round(18 * pMid.scale)}px "Comfortaa", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`x${ribbon.multiplier}`, pMid.sx, pMid.sy - 8 * pMid.scale);
      } else {
        // Severed ribbon ends dangling
        ctx.strokeStyle = ribbon.color;
        ctx.lineWidth = 6 * pMid.scale;
        ctx.beginPath();
        ctx.moveTo(pLeft.sx, pLeft.sy);
        ctx.lineTo(pLeft.sx + (pMid.sx - pLeft.sx) * 0.35, pLeft.sy + 15 * pMid.scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pRight.sx, pRight.sy);
        ctx.lineTo(pRight.sx - (pRight.sx - pMid.sx) * 0.35, pRight.sy + 15 * pMid.scale);
        ctx.stroke();
      }
    }
  }

  private drawPlayerRoll(ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number): void {
    const roll = state.roll;
    const pCenter = this.project(roll.x, roll.z, roll.z, width, height);
    const radius = roll.getRadius();
    const rollWidth = roll.width;

    ctx.save();
    ctx.translate(pCenter.sx, pCenter.sy);

    // Roll Cylinder Drop Shadow
    ctx.fillStyle = 'rgba(43, 33, 24, 0.28)';
    ctx.beginPath();
    ctx.ellipse(4, radius * 0.8 + 4, rollWidth * 0.7, radius * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Render Concentric Paper Layer Rings from inside out
    let accumRadius = roll.baseRadius;
    const layers = roll.layers;

    // Draw cylinder side wrap (the outer roll surface)
    const outermostLayer = layers[layers.length - 1] || { color: '#D2B48C' };
    ctx.fillStyle = outermostLayer.color;
    ctx.fillRect(-rollWidth / 2, -radius * 0.8, rollWidth, radius * 1.6);
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.strokeRect(-rollWidth / 2, -radius * 0.8, rollWidth, radius * 1.6);

    // Dynamic paper spiral rotation lines on cylinder body
    ctx.strokeStyle = 'rgba(43, 33, 24, 0.2)';
    ctx.lineWidth = 2;
    const offsetRot = (roll.rotationAngle % (Math.PI * 2)) / (Math.PI * 2);
    for (let i = -2; i <= 2; i++) {
      const lineY = -radius * 0.8 + ((offsetRot + i / 2 + 1) % 1) * (radius * 1.6);
      ctx.beginPath();
      ctx.moveTo(-rollWidth / 2, lineY);
      ctx.lineTo(rollWidth / 2, lineY);
      ctx.stroke();
    }

    // Draw Left Concentric Cap
    ctx.save();
    ctx.translate(-rollWidth / 2, 0);
    this.drawConcentricCap(ctx, layers, radius, roll.baseRadius);
    ctx.restore();

    // Draw Right Concentric Cap
    ctx.save();
    ctx.translate(rollWidth / 2, 0);
    this.drawConcentricCap(ctx, layers, radius, roll.baseRadius);
    ctx.restore();

    ctx.restore();
  }

  private drawConcentricCap(ctx: CanvasRenderingContext2D, layers: { color: string; thickness: number }[], maxR: number, baseR: number): void {
    // Draw rings from outside inward for proper layering
    let curR = maxR * 0.8;
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      ctx.fillStyle = l.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, curR * 0.35, curR, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      curR = Math.max(baseR * 0.4, curR - l.thickness * 1.5);
    }

    // Cardboard hollow center tube
    ctx.fillStyle = '#2B2118';
    ctx.beginPath();
    ctx.ellipse(0, 0, baseR * 0.15, baseR * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawHUD(ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number): void {
    ctx.save();

    // Score & Layer Count Badge (Top-Left)
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(20, 20, 200, 70);
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 200, 70);

    ctx.font = 'bold 22px "Cabin Sketch", "Comfortaa", sans-serif';
    ctx.fillStyle = '#2B2118';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${state.score}`, 32, 48);

    ctx.font = 'bold 15px "Comfortaa", sans-serif';
    ctx.fillStyle = '#0984E3';
    ctx.fillText(`LAYERS: ${state.roll.layers.length}`, 32, 74);

    // Multiplier Badge (Top-Right)
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(width - 170, 20, 150, 70);
    ctx.strokeRect(width - 170, 20, 150, 70);

    ctx.font = 'bold 22px "Cabin Sketch", "Comfortaa", sans-serif';
    ctx.fillStyle = '#D63031';
    ctx.textAlign = 'center';
    ctx.fillText(`x${state.highestMultiplier}`, width - 95, 48);

    ctx.font = 'bold 13px "Comfortaa", sans-serif';
    ctx.fillStyle = '#2B2118';
    ctx.fillText(`LEVEL ${state.currentLevel}`, width - 95, 74);

    // Distance progress bar at top center
    const barW = 260;
    const barH = 16;
    const barX = width / 2 - barW / 2;
    const barY = 25;

    ctx.fillStyle = 'rgba(250, 246, 238, 0.9)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(barX, barY, barW, barH);

    const progress = Math.min(1.0, Math.max(0, state.roll.z / state.track.trackLength));
    ctx.fillStyle = '#00B894';
    ctx.fillRect(barX + 2, barY + 2, (barW - 4) * progress, barH - 4);

    ctx.restore();
  }
}
