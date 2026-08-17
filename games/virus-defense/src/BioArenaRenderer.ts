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
    const bgGrad = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      50,
      this.width / 2,
      this.height / 2,
      500
    );
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.6, '#0b0d1b');
    bgGrad.addColorStop(1, '#05060a');

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle drifting background cellular organelles
    ctx.save();
    for (let i = 0; i < 18; i++) {
      const angle = (i * Math.PI * 2) / 18 + this.animTime * 0.05;
      const dist = 120 + ((i * 47) % 240);
      const x = this.width / 2 + Math.cos(angle) * dist;
      const y = this.height / 2 + Math.sin(angle) * dist;
      const r = 3 + (i % 4) * 2;

      ctx.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.06)' : 'rgba(168, 85, 247, 0.05)';
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

    // Concentric rings
    const rings = [100, 180, 260, 340, 420];
    for (let i = 0; i < rings.length; i++) {
      const r = rings[i] + Math.sin(this.animTime * 1.5 + i) * 3;
      ctx.strokeStyle = `rgba(34, 211, 238, ${0.08 - i * 0.012})`;
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

    // Outer membrane ripple
    const hpRatio = nucleus.hp / nucleus.maxHp;
    const coreColor = hpRatio > 0.5 ? '#06b6d4' : hpRatio > 0.25 ? '#f59e0b' : '#ef4444';

    ctx.fillStyle = `${coreColor}18`;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 14 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Cell wall membrane
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = coreColor;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(cx, cy, r + pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Inner cytoplasmic nucleus
    const innerGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, r);
    innerGrad.addColorStop(0, '#ffffff');
    innerGrad.addColorStop(0.4, coreColor);
    innerGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderAntibodies(ctx: CanvasRenderingContext2D, antibodies: Antibody[]): void {
    ctx.save();
    for (let i = 0; i < antibodies.length; i++) {
      const a = antibodies[i];
      if (!a.active) continue;

      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;

      // Outer glow circle
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, a.radius + 4, 0, Math.PI * 2);
      ctx.fill();

      // Cross / Plus nano-antibody shape
      ctx.fillStyle = '#38bdf8';
      const w = 4;
      const l = 10;
      ctx.fillRect(-w / 2, -l / 2, w, l);
      ctx.fillRect(-l / 2, -w / 2, l, w);

      // Core white sparkle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    ctx.restore();
  }

  private renderPathogens(ctx: CanvasRenderingContext2D, pathogens: Pathogen[]): void {
    ctx.save();
    for (let i = 0; i < pathogens.length; i++) {
      const p = pathogens[i];
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

    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;

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
      ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Central viral capsid core
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fee2e2';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawSpeedster(ctx: CanvasRenderingContext2D, p: Pathogen): void {
    const r = p.radius;
    ctx.fillStyle = '#f97316';
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#fb923c';
    ctx.shadowBlur = 10;

    // Aerodynamic capsule
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.3, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trailing flagella tails
    const wiggle = Math.sin(this.animTime * 14 + p.id) * 6;
    ctx.beginPath();
    ctx.moveTo(-r * 1.2, -3);
    ctx.quadraticCurveTo(-r * 2.2, wiggle, -r * 3.0, wiggle * 1.2);
    ctx.moveTo(-r * 1.2, 3);
    ctx.quadraticCurveTo(-r * 2.2, -wigiggle, -r * 3.0, -wiggle * 1.2);
    ctx.stroke();
  }

  private drawSplitter(ctx: CanvasRenderingContext2D, p: Pathogen): void {
    const r = p.radius;
    const blobWobble = Math.sin(this.animTime * 5 + p.id) * 3;

    ctx.fillStyle = '#10b981';
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 10;

    // Blob body
    ctx.beginPath();
    ctx.arc(0, 0, r + blobWobble, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Twin internal division nuclei
    ctx.fillStyle = '#a7f3d0';
    ctx.beginPath();
    ctx.arc(-r * 0.35, 0, r * 0.25, 0, Math.PI * 2);
    ctx.arc(r * 0.35, 0, r * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawShieldCarrier(ctx: CanvasRenderingContext2D, p: Pathogen): void {
    const r = p.radius;
    ctx.fillStyle = '#8b5cf6';
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#a78bfa';
    ctx.shadowBlur = 12;

    // Heavy virus core
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Frontal energy shield arc
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, r + 7, -Math.PI / 2.2, Math.PI / 2.2);
    ctx.stroke();

    // Shield HP indicators
    ctx.fillStyle = '#e9d5ff';
    for (let i = 0; i < p.hp; i++) {
      ctx.beginPath();
      ctx.arc(r + 12, (i - 1) * 6, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderTurret(ctx: CanvasRenderingContext2D, turret: Turret): void {
    ctx.save();
    ctx.translate(turret.x, turret.y);

    // Laser targeting sight guide beam
    ctx.save();
    ctx.rotate(turret.angle);
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(turret.barrelLength, 0);
    ctx.lineTo(600, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Cannon Barrel
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(8, -4, turret.barrelLength - 8, 8);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(16, -2, turret.barrelLength - 14, 4);

    // Muzzle tip
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(turret.barrelLength - 4, -5, 4, 10);
    ctx.restore();

    // Turret central base pivot
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner glowing core
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D, turret: Turret): void {
    ctx.save();
    for (let i = 0; i < turret.projectiles.length; i++) {
      const p = turret.projectiles[i];
      if (!p.active) continue;

      ctx.save();
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;

      // Projectile bullet
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Motion trail
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
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
    ctx.font = 'bold 16px monospace';

    // Top-Left: Wave & Multiplier Badge
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`WAVE `, 24, 34);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`${gameState.wave}`, 72, 34);

    if (gameState.multiplier > 1) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`${gameState.multiplier}x COMBO`, 24, 58);
    }

    // Top-Center: Score & High Score
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${gameState.score.toLocaleString()}`, this.width / 2, 34);

    ctx.font = '12px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`HI: ${gameState.highScore.toLocaleString()}`, this.width / 2, 54);

    // Top-Right: Nucleus HP Bar
    const barWidth = 140;
    const barHeight = 14;
    const barX = this.width - 24 - barWidth;
    const barY = 22;

    ctx.textAlign = 'right';
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`NUCLEUS`, barX - 10, barY + 11);

    // Bar background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Fill bar
    const hpRatio = Math.max(0, Math.min(1, nucleus.hp / nucleus.maxHp));
    const hpColor = hpRatio > 0.5 ? '#10b981' : hpRatio > 0.25 ? '#f59e0b' : '#ef4444';
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
    ctx.fillStyle = 'rgba(5, 6, 10, 0.75)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px monospace';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 15;
    ctx.fillText('VIRUS DEFENSE', this.width / 2, 220);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.shadowBlur = 0;
    ctx.fillText('Defend the central cellular nucleus from mutating swarms', this.width / 2, 260);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('🎯 Aim: Mouse / Touch Pointer', this.width / 2, 310);
    ctx.fillText('⚡ Fire: Hold Click / Tap Screen', this.width / 2, 340);
    ctx.fillText('💊 Antibodies: Floating capsules repair cell health', this.width / 2, 370);

    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#34d399';
    const blink = Math.sin(this.animTime * 5) > 0;
    if (blink) {
      ctx.fillText('CLICK / TAP OR PRESS SPACE TO START', this.width / 2, 440);
    }

    ctx.restore();
  }

  private renderPauseOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(5, 6, 10, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('PAUSED', this.width / 2, 280);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Press ESC or P to Resume', this.width / 2, 320);

    ctx.restore();
  }

  private renderGameOverOverlay(
    ctx: CanvasRenderingContext2D,
    gameState: GameState
  ): void {
    ctx.save();
    ctx.fillStyle = 'rgba(5, 6, 10, 0.88)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 36px monospace';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 15;
    ctx.fillText('CELL BREACHED', this.width / 2, 190);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`FINAL SCORE: ${gameState.score.toLocaleString()}`, this.width / 2, 240);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '16px monospace';
    ctx.fillText(`HIGH SCORE: ${gameState.highScore.toLocaleString()}`, this.width / 2, 275);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px monospace';
    ctx.fillText(`Waves Reached: ${gameState.wave}`, this.width / 2, 315);
    ctx.fillText(`Viruses Destroyed: ${gameState.virusesDestroyed}`, this.width / 2, 340);
    ctx.fillText(`Firing Accuracy: ${gameState.accuracyPercentage}%`, this.width / 2, 365);

    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#34d399';
    const blink = Math.sin(this.animTime * 5) > 0;
    if (blink) {
      ctx.fillText('CLICK / TAP OR PRESS SPACE TO RESTART', this.width / 2, 430);
    }

    ctx.restore();
  }
}
