import { PartyMatchState, MINI_GAMES } from './GameState.js';
import { BattleState } from './GameModes.js';

export class BattleRenderer {
  public renderStage(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Theater background (aged paperboard)
    ctx.fillStyle = '#F5EBE0';
    ctx.fillRect(0, 0, width, height);

    // Grid dots craft pattern
    ctx.fillStyle = 'rgba(43, 33, 24, 0.04)';
    for (let x = 20; x < width; x += 24) {
      for (let y = 20; y < height; y += 24) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Puppet theater top garland / bunting
    this.renderBunting(ctx, width);

    // Floor cardboard strip
    ctx.fillStyle = '#E3D5CA';
    ctx.fillRect(40, height - 70, width - 80, 50);
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, height - 70, width - 80, 50);

    // Decorative edge stitches
    this.renderStitches(ctx, 40, height - 70, width - 80, 50);
  }

  private renderBunting(ctx: CanvasRenderingContext2D, width: number): void {
    ctx.save();
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 20);
    ctx.quadraticCurveTo(width / 2, 45, width - 30, 20);
    ctx.stroke();

    const pennantCount = 14;
    const colors = ['#E74C3C', '#3498DB', '#F1C40F', '#2ECC71', '#9B59B6', '#E67E22'];
    for (let i = 0; i < pennantCount; i++) {
      const t = (i + 0.5) / pennantCount;
      const px = 30 + t * (width - 60);
      const py = 20 + Math.sin(t * Math.PI) * 20;

      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(px - 14, py);
      ctx.lineTo(px + 14, py);
      ctx.lineTo(px, py + 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderStitches(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.save();
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
    ctx.restore();
  }

  public renderHUD(ctx: CanvasRenderingContext2D, match: PartyMatchState, width: number): void {
    // P1 Card (Left - Red)
    this.renderScoreCard(ctx, 60, 50, 'P1', match.p1Score, match.targetWins, '#E74C3C');

    // P2 Card (Right - Blue)
    const p2Label = match.vsCPU ? `CPU (${match.cpuDifficulty.toUpperCase()})` : 'P2';
    this.renderScoreCard(ctx, width - 200, 50, p2Label, match.p2Score, match.targetWins, '#3498DB');

    // Middle Minigame Header
    const currentMode = MINI_GAMES[match.selectedModeIndex];
    ctx.save();
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 130, 45, 260, 40, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2B2118';
    ctx.font = 'bold 18px "Cabin Sketch", "Patrick Hand", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentMode.name, width / 2, 65);
    ctx.restore();
  }

  private renderScoreCard(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label: string,
    score: number,
    target: number,
    color: string
  ): void {
    ctx.save();
    ctx.fillStyle = '#FAF0CA';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(43, 33, 24, 0.2)';
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.beginPath();
    ctx.roundRect(x, y, 140, 50, 6);
    ctx.fill();
    ctx.stroke();
    ctx.shadowColor = 'transparent';

    ctx.fillStyle = color;
    ctx.font = 'bold 15px "Comfortaa", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, x + 10, y + 22);

    // Stars / Victory tokens
    for (let i = 0; i < target; i++) {
      ctx.fillStyle = i < score ? '#F1C40F' : '#E0D6C8';
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 1.5;
      this.drawStar(ctx, x + 18 + i * 22, y + 36, 7, 3.5, 5);
    }
    ctx.restore();
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    outerR: number,
    innerR: number,
    points: number
  ): void {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  public renderBattle(ctx: CanvasRenderingContext2D, battle: BattleState, width: number, height: number): void {
    switch (battle.id) {
      case 'paper-duel':
        this.renderPaperDuel(ctx, battle, width, height);
        break;
      case 'tug-of-war':
        this.renderTugOfWar(ctx, battle, width, height);
        break;
      case 'table-soccer':
        this.renderTableSoccer(ctx, battle, width, height);
        break;
      case 'lava-hop':
        this.renderLavaHop(ctx, battle, width, height);
        break;
      case 'balloon-pop':
        this.renderBalloonPop(ctx, battle, width, height);
        break;
      case 'tank-clash':
        this.renderTankClash(ctx, battle, width, height);
        break;
      case 'sumotori':
        this.renderSumotori(ctx, battle, width, height);
        break;
      case 'laser-dodge':
        this.renderLaserDodge(ctx, battle, width, height);
        break;
      case 'coin-snatch':
        this.renderCoinSnatch(ctx, battle, width, height);
        break;
      case 'knife-flip':
        this.renderKnifeFlip(ctx, battle, width, height);
        break;
      case 'helicopter-drop':
        this.renderHelicopterDrop(ctx, battle, width, height);
        break;
      case 'hammer-smash':
        this.renderHammerSmash(ctx, battle, width, height);
        break;
    }
  }

  private drawGladiator(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    faceRight: boolean = true,
    scale: number = 1
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * (faceRight ? 1 : -1), scale);

    // Shadow
    ctx.fillStyle = 'rgba(43, 33, 24, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 45, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body Cardboard
    ctx.fillStyle = color;
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-20, -10, 40, 45, 6);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.fillStyle = '#FFE0BD';
    ctx.beginPath();
    ctx.arc(0, -28, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eye & Eyebrow
    ctx.fillStyle = '#2B2118';
    ctx.beginPath();
    ctx.arc(6, -30, 3, 0, Math.PI * 2);
    ctx.fill();

    // Headband / Helm
    ctx.fillStyle = color;
    ctx.fillRect(-18, -42, 36, 8);
    ctx.strokeRect(-18, -42, 36, 8);

    ctx.restore();
  }

  private renderPaperDuel(ctx: CanvasRenderingContext2D, battle: any, width: number, height: number): void {
    const y = 380;
    this.drawGladiator(ctx, 220, y, '#E74C3C', true, 1.2);
    this.drawGladiator(ctx, 580, y, '#3498DB', false, 1.2);

    // Cue Banner
    ctx.save();
    ctx.font = 'bold 36px "Cabin Sketch", cursive, sans-serif';
    ctx.textAlign = 'center';
    if (battle.cueGiven) {
      ctx.fillStyle = '#E74C3C';
      ctx.fillText('⚡ FIRE! ⚡', width / 2, 240);
    } else {
      ctx.fillStyle = '#8D6E63';
      ctx.fillText('READY...', width / 2, 240);
    }
    ctx.restore();
  }

  private renderTugOfWar(ctx: CanvasRenderingContext2D, battle: any, width: number, height: number): void {
    const cy = 380;
    const ropeShift = battle.ropePosition * 1.5;

    // Center Mark Line
    ctx.strokeStyle = '#E74C3C';
    ctx.lineWidth = 4;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 280);
    ctx.lineTo(width / 2, 480);
    ctx.stroke();
    ctx.setLineDash([]);

    // Rope
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(180 + ropeShift, cy);
    ctx.lineTo(620 + ropeShift, cy);
    ctx.stroke();

    // Red Ribbon in Middle
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(width / 2 + ropeShift - 8, cy - 14, 16, 28);

    this.drawGladiator(ctx, 160 + ropeShift, cy, '#E74C3C', false, 1.1);
    this.drawGladiator(ctx, 640 + ropeShift, cy, '#3498DB', true, 1.1);
  }

  private renderTableSoccer(ctx: CanvasRenderingContext2D, battle: any, width: number, height: number): void {
    // Pitch Box
    ctx.fillStyle = '#A3CB38';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.fillRect(100, 140, 600, 320);
    ctx.strokeRect(100, 140, 600, 320);

    // Goal Areas
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(100, 240, 30, 120);
    ctx.strokeRect(100, 240, 30, 120);
    ctx.fillRect(670, 240, 30, 120);
    ctx.strokeRect(670, 240, 30, 120);

    // P1 Kicker
    ctx.save();
    ctx.translate(260, 300);
    ctx.rotate(battle.p1Angle);
    this.drawGladiator(ctx, 0, 0, '#E74C3C', true, 0.9);
    ctx.fillStyle = '#2B2118';
    ctx.fillRect(0, -6, 50, 12);
    ctx.restore();

    // P2 Kicker
    ctx.save();
    ctx.translate(540, 300);
    ctx.rotate(battle.p2Angle);
    this.drawGladiator(ctx, 0, 0, '#3498DB', false, 0.9);
    ctx.fillStyle = '#2B2118';
    ctx.fillRect(0, -6, -50, 12);
    ctx.restore();

    // Ball
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(battle.ballX, battle.ballY, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private renderLavaHop(ctx: CanvasRenderingContext2D, battle: any, width: number, height: number): void {
    // Stepping stones
    for (let i = 0; i < battle.targetSteps; i++) {
      const stepY = 480 - i * 30;
      ctx.fillStyle = '#D7CCC8';
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 2;
      ctx.fillRect(200, stepY, 80, 16);
      ctx.strokeRect(200, stepY, 80, 16);

      ctx.fillRect(520, stepY, 80, 16);
      ctx.strokeRect(520, stepY, 80, 16);
    }

    // Gladiators
    this.drawGladiator(ctx, 240, battle.p1Y, '#E74C3C', true, 0.9);
    this.drawGladiator(ctx, 560, battle.p2Y, '#3498DB', false, 0.9);

    // Rising Lava
    ctx.fillStyle = '#E67E22';
    ctx.strokeStyle = '#D35400';
    ctx.lineWidth = 3;
    ctx.fillRect(80, battle.lavaY, width - 160, height - battle.lavaY);
    ctx.strokeRect(80, battle.lavaY, width - 160, height - battle.lavaY);
  }

  private renderBalloonPop(ctx: CanvasRenderingContext2D, battle: any, width: number, height: number): void {
    const p1Radius = 20 + (battle.p1PumpCount / battle.maxPumps) * 60;
    const p2Radius = 20 + (battle.p2PumpCount / battle.maxPumps) * 60;

    // P1 Balloon
    ctx.fillStyle = '#E74C3C';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(260, 280, p1Radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    this.drawGladiator(ctx, 260, 420, '#E74C3C', true, 1.0);

    // P2 Balloon
    ctx.fillStyle = '#3498DB';
    ctx.beginPath();
    ctx.arc(540, 280, p2Radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    this.drawGladiator(ctx, 540, 420, '#3498DB', false, 1.0);
  }

  private renderTankClash(ctx: CanvasRenderingContext2D, battle: any, width: number, height: number): void {
    // Battle arena border
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.strokeRect(100, 140, 600, 320);

    // P1 Tank
    ctx.save();
    ctx.translate(180, 300);
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(-25, -20, 50, 40);
    ctx.strokeRect(-25, -20, 50, 40);
    ctx.rotate(battle.p1Angle);
    ctx.fillStyle = '#2B2118';
    ctx.fillRect(0, -5, 35, 10);
    ctx.restore();

    // P2 Tank
    ctx.save();
    ctx.translate(620, 300);
    ctx.fillStyle = '#3498DB';
    ctx.fillRect(-25, -20, 50, 40);
    ctx.strokeRect(-25, -20, 50, 40);
    ctx.rotate(battle.p2Angle);
    ctx.fillStyle = '#2B2118';
    ctx.fillRect(0, -5, 35, 10);
    ctx.restore();

    // Bullets
    for (const p of battle.projectiles) {
      ctx.fillStyle = p.owner === 'p1' ? '#E74C3C' : '#3498DB';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  private renderSumotori(ctx: CanvasRenderingContext2D, battle: any, width: number, height: number): void {
    // Sumo Ring
    ctx.fillStyle = '#FFEAA7';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(400, 300, battle.ringRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    this.drawGladiator(ctx, battle.p1X, battle.p1Y, '#E74C3C', true, 1.2);
    this.drawGladiator(ctx, battle.p2X, battle.p2Y, '#3498DB', false, 1.2);
  }

  private renderLaserDodge(ctx: CanvasRenderingContext2D, battle: any, width: number, height: number): void {
    // Center Turret
    ctx.fillStyle = '#7F8C8D';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(400, 440, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Laser Beam
    ctx.save();
    ctx.translate(400, 440);
    ctx.rotate(battle.laserAngle);
    ctx.strokeStyle = '#E74C3C';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(260, 0);
    ctx.stroke();
    ctx.restore();

    this.drawGladiator(ctx, 180, battle.p1Y, '#E74C3C', true, 1.0);
    this.drawGladiator(ctx, 620, battle.p2Y, '#3498DB', false, 1.0);
  }

  private renderCoinSnatch(ctx: CanvasRenderingContext2D, battle: any, width: number, height: number): void {
    // Center Giant Coin
    ctx.fillStyle = '#F1C40F';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(battle.coinX, 380, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    this.drawGladiator(ctx, battle.p1X, 380, '#E74C3C', true, 1.0);
    this.drawGladiator(ctx, battle.p2X, 380, '#3498DB', false, 1.0);
  }

  private renderKnifeFlip(ctx: CanvasRenderingContext2D, battle: any, width: number, height: number): void {
    // Rotating Target at top center
    ctx.save();
    ctx.translate(400, 200);
    ctx.rotate(battle.targetAngle);
    ctx.fillStyle = '#E74C3C';
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Darts
    if (battle.p1DartInFlight) {
      ctx.fillStyle = '#E74C3C';
      ctx.fillRect(280, battle.p1DartY, 8, 24);
    }
    if (battle.p2DartInFlight) {
      ctx.fillStyle = '#3498DB';
      ctx.fillRect(520, battle.p2DartY, 8, 24);
    }

    this.drawGladiator(ctx, 280, 480, '#E74C3C', true, 1.0);
    this.drawGladiator(ctx, 520, 480, '#3498DB', false, 1.0);
  }

  private renderHelicopterDrop(ctx: CanvasRenderingContext2D, battle: any, width: number, height: number): void {
    // Landing pads
    ctx.fillStyle = '#2ECC71';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.fillRect(200, battle.padY, 80, 16);
    ctx.strokeRect(200, battle.padY, 80, 16);
    ctx.fillRect(520, battle.padY, 80, 16);
    ctx.strokeRect(520, battle.padY, 80, 16);

    this.drawGladiator(ctx, 240, battle.p1Y, '#E74C3C', true, 1.0);
    this.drawGladiator(ctx, 560, battle.p2Y, '#3498DB', false, 1.0);
  }

  private renderHammerSmash(ctx: CanvasRenderingContext2D, battle: any, width: number, height: number): void {
    const xPos = battle.gopherSide === 'left' ? 260 : battle.gopherSide === 'right' ? 540 : 400;

    // Gopher Holes
    for (const holeX of [260, 400, 540]) {
      ctx.fillStyle = '#3E2723';
      ctx.beginPath();
      ctx.ellipse(holeX, 400, 36, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Active Gopher
    if (battle.gopherActive) {
      ctx.fillStyle = '#8D6E63';
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(xPos, 365, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    this.drawGladiator(ctx, 180, 440, '#E74C3C', true, 1.0);
    this.drawGladiator(ctx, 620, 440, '#3498DB', false, 1.0);
  }
}
