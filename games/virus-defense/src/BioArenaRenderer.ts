import { Turret } from './Turret';
import { PathogenSwarm, Pathogen } from './PathogenSwarm';
import { NucleusState, Antibody } from './NucleusState';
import { GameState } from './GameState';
import { ParticleSystem } from './Particles';

export class BioArenaRenderer {
  private width: number;
  private height: number;
  private animTime: number;

  constructor(width = 800, height = 600) {
    this.width = width;
    this.height = height;
    this.animTime = 0;
  }

  public update(dt: number): void {
    this.animTime += dt;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    turret: Turret,
    swarm: PathogenSwarm,
    nucleus: NucleusState,
    particles: ParticleSystem,
    screenShake: number
  ): void {
    ctx.save();

    // Screen shake offset
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake * 12;
      const shakeY = (Math.random() - 0.5) * screenShake * 12;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Background Bio-Cytoplasm
    this.renderBackground(ctx);

    // 2. Radial Bio-Membranes & Grid
    this.renderMembraneGrid(ctx, nucleus);

    // 3. Central Cell Nucleus
    this.renderNucleus(ctx, nucleus);

    // 4. Antibodies
    this.renderAntibodies(ctx, nucleus.antibodies);

    // 5. Pathogens
    this.renderPathogens(ctx, swarm.activePathogens);

    // 6. Turret & Laser Targeting Beam
    this.renderTurret(ctx, turret);

    // 7. Projectiles
    this.renderProjectiles(ctx, turret);

    // 8. Particles
    particles.render(ctx);

    // 9. HUD Overlay
    this.renderHUD(ctx, gameState, nucleus);

    // 10. Status Overlays (Ready / Pause / Game Over)
    this.renderOverlays(ctx, gameState);

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D): void {
    // Warm kraft parchment bio-arena desktop
    const bgGrad = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      50,
      this.width / 2,
      this.height / 2,
      500
    );
    bgGrad.addColorStop(0, '#F4EAD4');
    bgGrad.addColorStop(0.7, '#E8DEC8');
    bgGrad.addColorStop(1, '#D8C3A5');

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle drifting stamped cellular paper organelles
    ctx.save();
    for (let i = 0; i < 18; i++) {
      const angle = (i * Math.PI * 2) / 18 + this.animTime * 0.05;
      const dist = 120 + ((i * 47) % 240);
      const x = this.width / 2 + Math.cos(angle) * dist;
      const y = this.height / 2 + Math.sin(angle) * dist;
      const r = 3 + (i % 4) * 2;

      ctx.fillStyle = i % 2 === 0 ? 'rgba(74, 109, 86, 0.12)' : 'rgba(62, 39, 35, 0.08)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private renderMembraneGrid(ctx: CanvasRenderingContext2D, nucleus: NucleusState): void {
    ctx.save();
    const cx = nucleus.centerX;
    const cy = nucleus.centerY;

    // Concentric dashed ink guideline rings
    const rings = [100, 180, 260, 340, 420];
    for (let i = 0; i < rings.length; i++) {
      const ringRadius = rings[i];
      if (ringRadius === undefined) continue;
      const r = ringRadius + Math.sin(this.animTime * 1.5 + i) * 3;
      ctx.strokeStyle = `rgba(62, 39, 35, ${0.15 - i * 0.02})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  private renderNucleus(ctx: CanvasRenderingContext2D, nucleus: NucleusState): void {
    ctx.save();
    const cx = nucleus.centerX;
    const cy = nucleus.centerY;
    const r = nucleus.radius;
    const pulse = Math.sin(this.animTime * 4) * 3;

    // Outer paper shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.beginPath();
    ctx.arc(cx + 4, cy + 4, r + 4, 0, Math.PI * 2);
    ctx.fill();

    // HP ratio color
    const hpRatio = nucleus.hp / nucleus.maxHp;
    const coreColor = hpRatio > 0.5 ? '#10B981' : hpRatio > 0.25 ? '#F59E0B' : '#E11D48';

    // Cell wall membrane with ink outline
    ctx.fillStyle = coreColor;
    ctx.beginPath();
    ctx.arc(cx, cy, r + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner paper fold details
    ctx.fillStyle = '#FFFDF8';
    ctx.beginPath();
    ctx.arc(cx - 8, cy - 8, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderAntibodies(ctx: CanvasRenderingContext2D, antibodies: Antibody[]): void {
    ctx.save();
    for (const a of antibodies) {
      if (!a.active) continue;

      ctx.save();
      ctx.translate(a.x, a.y);

      // Drop shadow
      ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
      ctx.beginPath();
      ctx.arc(2, 2, a.radius + 2, 0, Math.PI * 2);
      ctx.fill();

      // Papercut medical cross badge in craft blue
      ctx.fillStyle = '#3B82F6';
      const w = 4;
      const l = 12;
      ctx.fillRect(-w / 2, -l / 2, w, l);
      ctx.fillRect(-l / 2, -w / 2, l, w);

      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-w / 2, -l / 2, w, l);
      ctx.strokeRect(-l / 2, -w / 2, l, w);

      // Core white paper sparkle
      ctx.fillStyle = '#FFFDF8';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

  private renderPathogens(ctx: CanvasRenderingContext2D, pathogens: Pathogen[]): void {
    ctx.save();
    for (const p of pathogens) {
      if (!p.active) continue;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);

      switch (p.type) {
        case 'spiker':
          this.drawSpiker(ctx, p);
          break;
        case 'speedster':
          this.drawSpeedster(ctx, p);
          break;
        case 'splitter':
          this.drawSplitter(ctx, p);
          break;
        case 'shield-carrier':
          this.drawShieldCarrier(ctx, p);
          break;
      }

      ctx.restore();
    }
    ctx.restore();
  }

  private drawSpiker(ctx: CanvasRenderingContext2D, p: Pathogen): void {
    const spikeCount = 8;
    const r = p.radius;
    const pulse = Math.sin(this.animTime * 8 + p.id) * 2;

    ctx.strokeStyle = '#3E2723';
    ctx.fillStyle = '#E11D48';
    ctx.lineWidth = 2;

    // Spikes radiating outwards
    for (let i = 0; i < spikeCount; i++) {
      const angle = (i * Math.PI * 2) / spikeCount;
      const spikeLen = r + 6 + pulse;
      const sx = Math.cos(angle) * spikeLen;
      const sy = Math.sin(angle) * spikeLen;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(sx, sy);
      ctx.stroke();

      // Spike tip bulb
      ctx.beginPath();
      ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Central papercut capsid core
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFDF8';
    ctx.beginPath();
    ctx.arc(-2, -2, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawSpeedster(ctx: CanvasRenderingContext2D, p: Pathogen): void {
    const r = p.radius;
    ctx.fillStyle = '#F97316';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;

    // Paper capsule body
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.3, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Trailing paper flagella ribbons
    const wiggle = Math.sin(this.animTime * 14 + p.id) * 6;
    ctx.beginPath();
    ctx.moveTo(-r * 1.2, -3);
    ctx.quadraticCurveTo(-r * 2.2, wiggle, -r * 3.0, wiggle * 1.2);
    ctx.moveTo(-r * 1.2, 3);
    ctx.quadraticCurveTo(-r * 2.2, -wiggle, -r * 3.0, -wiggle * 1.2);
    ctx.stroke();
  }

  private drawSplitter(ctx: CanvasRenderingContext2D, p: Pathogen): void {
    const r = p.radius;
    const blobWobble = Math.sin(this.animTime * 5 + p.id) * 3;

    ctx.fillStyle = '#10B981';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;

    // Dividing paper amoeba blob
    ctx.beginPath();
    ctx.arc(0, 0, r + blobWobble, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Twin internal papercut nuclei
    ctx.fillStyle = '#FFFDF8';
    ctx.beginPath();
    ctx.arc(-r * 0.35, 0, r * 0.25, 0, Math.PI * 2);
    ctx.arc(r * 0.35, 0, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawShieldCarrier(ctx: CanvasRenderingContext2D, p: Pathogen): void {
    const r = p.radius;
    ctx.fillStyle = '#8B5CF6';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;

    // Paper virus core
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cardboard crescent shield arc
    ctx.strokeStyle = '#C5A880';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, r + 7, -Math.PI / 2.2, Math.PI / 2.2);
    ctx.stroke();

    // Shield HP pins
    ctx.fillStyle = '#F59E0B';
    for (let i = 0; i < p.hp; i++) {
      ctx.beginPath();
      ctx.arc(r + 12, (i - 1) * 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderTurret(ctx: CanvasRenderingContext2D, turret: Turret): void {
    ctx.save();
    ctx.translate(turret.x, turret.y);

    // Dashed ink laser targeting sight line
    ctx.save();
    ctx.rotate(turret.angle);
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(turret.barrelLength, 0);
    ctx.lineTo(600, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Cardboard Cannon Barrel
    ctx.fillStyle = '#C5A880';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    ctx.fillRect(8, -4, turret.barrelLength - 8, 8);
    ctx.strokeRect(8, -4, turret.barrelLength - 8, 8);

    // Muzzle tip
    ctx.fillStyle = '#8D5B34';
    ctx.fillRect(turret.barrelLength - 4, -5, 4, 10);
    ctx.strokeRect(turret.barrelLength - 4, -5, 4, 10);
    ctx.restore();

    // Turret central brass fastener pivot hub
    ctx.fillStyle = '#C5A880';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Brass hub
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D, turret: Turret): void {
    ctx.save();
    for (const p of turret.projectiles) {
      if (!p.active) continue;

      ctx.save();
      ctx.fillStyle = '#3B82F6';
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.5;

      // Projectile paper pellet
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Motion trail
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - (p.vx / 600) * 16, p.y - (p.vy / 600) * 16);
      ctx.stroke();

      ctx.restore();
    }
    ctx.restore();
  }

  private renderHUD(
    ctx: CanvasRenderingContext2D,
    gameState: GameState,
    nucleus: NucleusState
  ): void {
    ctx.save();
    ctx.font = 'bold 15px "Comfortaa", cursive, sans-serif';

    // Top-Left: Wave & Multiplier Badge
    ctx.fillStyle = '#6A5D4D';
    ctx.fillText(`WAVE `, 24, 34);
    ctx.fillStyle = '#3B82F6';
    ctx.font = 'bold 22px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`${gameState.wave}`, 74, 34);

    if (gameState.multiplier > 1) {
      ctx.fillStyle = '#E09F3E';
      ctx.font = 'bold 16px "Patrick Hand", cursive, sans-serif';
      ctx.fillText(`${gameState.multiplier}x COMBO`, 24, 58);
    }

    // Top-Center: Score & High Score
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px "Patrick Hand", cursive, sans-serif';
    ctx.fillStyle = '#2B2118';
    ctx.fillText(`${gameState.score.toLocaleString()}`, this.width / 2, 34);

    ctx.font = '12px "Comfortaa", cursive, sans-serif';
    ctx.fillStyle = '#6A5D4D';
    ctx.fillText(`HI: ${gameState.highScore.toLocaleString()}`, this.width / 2, 54);

    // Top-Right: Nucleus HP Bar
    const barWidth = 140;
    const barHeight = 14;
    const barX = this.width - 24 - barWidth;
    const barY = 22;

    ctx.textAlign = 'right';
    ctx.font = 'bold 13px "Comfortaa", cursive, sans-serif';
    ctx.fillStyle = '#6A5D4D';
    ctx.fillText(`NUCLEUS`, barX - 10, barY + 11);

    // Bar background
    ctx.fillStyle = '#FFFDF8';
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Fill bar
    const hpRatio = Math.max(0, Math.min(1, nucleus.hp / nucleus.maxHp));
    const hpColor = hpRatio > 0.5 ? '#10B981' : hpRatio > 0.25 ? '#F59E0B' : '#E11D48';
    ctx.fillStyle = hpColor;
    ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * hpRatio, barHeight - 4);

    ctx.restore();
  }

  private renderOverlays(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    if (gameState.status === 'ready') {
      this.renderReadyOverlay(ctx);
    } else if (gameState.status === 'paused') {
      this.renderPauseOverlay(ctx);
    } else if (gameState.status === 'gameover') {
      this.renderGameOverOverlay(ctx, gameState);
    }
  }

  private renderReadyOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(250, 246, 238, 0.92)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 44px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('VIRUS DEFENSE', this.width / 2, 220);

    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillStyle = '#2B2118';
    ctx.fillText('Defend the central cellular nucleus from mutating paper swarms', this.width / 2, 260);

    ctx.fillStyle = '#6A5D4D';
    ctx.fillText('🎯 Aim: Mouse / Touch Pointer', this.width / 2, 310);
    ctx.fillText('⚡ Fire: Hold Click / Tap Screen', this.width / 2, 340);
    ctx.fillText('💊 Antibodies: Floating capsules repair cell health', this.width / 2, 370);

    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    ctx.fillStyle = '#10B981';
    ctx.fillText('CLICK / TAP OR PRESS SPACE TO START', this.width / 2, 440);

    ctx.restore();
  }

  private renderPauseOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(250, 246, 238, 0.9)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#E09F3E';
    ctx.font = 'bold 38px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PAUSED', this.width / 2, 280);

    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillStyle = '#2B2118';
    ctx.fillText('Press ESC or P to Resume', this.width / 2, 320);

    ctx.restore();
  }

  private renderGameOverOverlay(
    ctx: CanvasRenderingContext2D,
    gameState: GameState
  ): void {
    ctx.save();
    ctx.fillStyle = 'rgba(250, 246, 238, 0.95)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#E11D48';
    ctx.font = 'bold 42px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('CELL BREACHED', this.width / 2, 190);

    ctx.fillStyle = '#2B2118';
    ctx.font = 'bold 26px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`FINAL SCORE: ${gameState.score.toLocaleString()}`, this.width / 2, 240);

    ctx.fillStyle = '#E09F3E';
    ctx.font = 'bold 16px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`HIGH SCORE: ${gameState.highScore.toLocaleString()}`, this.width / 2, 275);

    ctx.fillStyle = '#6A5D4D';
    ctx.font = '15px "Comfortaa", cursive, sans-serif';
    ctx.fillText(`Waves Reached: ${gameState.wave}`, this.width / 2, 315);
    ctx.fillText(`Viruses Destroyed: ${gameState.virusesDestroyed}`, this.width / 2, 340);
    ctx.fillText(`Firing Accuracy: ${gameState.accuracyPercentage}%`, this.width / 2, 365);

    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    ctx.fillStyle = '#10B981';
    ctx.fillText('CLICK / TAP OR PRESS SPACE TO RESTART', this.width / 2, 430);

    ctx.restore();
  }
}
