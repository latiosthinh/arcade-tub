import { PotionMergeEngine } from './PotionMergeEngine.js';
import { POTION_TIERS } from './GameState.js';
import { PotionBody } from './FlaskPhysics.js';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
}

export class PotionRenderer {
  public particles: Particle[] = [];

  public spawnMergeSparkles(x: number, y: number, color: string): void {
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        color,
        alpha: 1,
        maxLife: 0.5 + Math.random() * 0.3,
        life: 0,
      });
    }
  }

  public updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 80 * dt; // light gravity for sparkles
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
    }
  }

  public render(ctx: CanvasRenderingContext2D, engine: PotionMergeEngine): void {
    ctx.save();

    // 1. Parchment Lab Background
    this.renderBackground(ctx);

    // 2. Glass Alchemy Flask Cardstock Boundary
    this.renderFlask(ctx, engine);

    // 3. Danger Overflow Line
    this.renderCeiling(ctx, engine);

    // 4. Potions inside Flask
    for (const potion of engine.physics.potions) {
      this.renderPotion(ctx, potion);
    }

    // 5. Dropper / Next Potion Preview Guide
    if (engine.state.status === 'playing') {
      this.renderDropperGuide(ctx, engine);
    }

    // 6. Sparkle particles
    this.renderParticles(ctx);

    // 7. Alchemy HUD (Score, High Score, Combo, Next)
    this.renderHUD(ctx, engine);

    // 8. Overlays
    this.renderOverlays(ctx, engine);

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D): void {
    // Alchemical Parchment
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(0, 0, 800, 600);

    // Faint grid & rune lines
    ctx.strokeStyle = 'rgba(43, 33, 24, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 20; x < 800; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
    for (let y = 20; y < 600; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }

    // Kraft paper border
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 6]);
    ctx.strokeRect(10, 10, 780, 580);
    ctx.setLineDash([]);
  }

  private renderFlask(ctx: CanvasRenderingContext2D, engine: PotionMergeEngine): void {
    const left = engine.physics.flaskLeft;
    const right = engine.physics.flaskRight;
    const bottom = engine.physics.flaskBottom;
    const top = engine.physics.dangerCeilingY - 30;

    ctx.save();
    // Flask cutout container shadow
    ctx.fillStyle = 'rgba(43, 33, 24, 0.08)';
    ctx.fillRect(left + 6, top + 6, right - left, bottom - top);

    // Flask container base paper
    ctx.fillStyle = '#F4EAD4';
    ctx.fillRect(left, top, right - left, bottom - top);

    // Cardstock thick border
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.lineTo(right, top);
    ctx.stroke();

    // Measurement ruler ticks on right edge
    ctx.strokeStyle = 'rgba(43, 33, 24, 0.35)';
    ctx.lineWidth = 2;
    for (let y = bottom - 30; y > top + 20; y -= 30) {
      ctx.beginPath();
      ctx.moveTo(right - 14, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderCeiling(ctx: CanvasRenderingContext2D, engine: PotionMergeEngine): void {
    const left = engine.physics.flaskLeft;
    const right = engine.physics.flaskRight;
    const y = engine.physics.dangerCeilingY;

    ctx.save();
    if (engine.state.isOverflowing) {
      // Flashing danger warning
      const flash = (Math.sin(Date.now() / 100) + 1) / 2;
      ctx.strokeStyle = `rgba(225, 29, 72, ${0.4 + flash * 0.6})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Warning text
      ctx.fillStyle = '#E11D48';
      ctx.font = 'bold 13px "Patrick Hand", cursive';
      ctx.textAlign = 'center';
      ctx.fillText(`OVERFLOW WARNING! (${(3 - engine.state.overflowTimer).toFixed(1)}s)`, (left + right) / 2, y - 8);
    } else {
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  private renderPotion(ctx: CanvasRenderingContext2D, potion: PotionBody): void {
    const tierDef = POTION_TIERS[potion.tier - 1] || POTION_TIERS[POTION_TIERS.length - 1];
    const r = potion.radius * potion.spawnAnimation;

    ctx.save();
    ctx.translate(potion.x, potion.y);

    // Layer 1: Drop shadow
    ctx.beginPath();
    ctx.arc(3, 3, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(43, 33, 24, 0.2)';
    ctx.fill();

    // Layer 2: Main colored paper cutout circle
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = tierDef.color;
    ctx.fill();
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Layer 3: Inner fluid bubble arc
    ctx.beginPath();
    ctx.arc(0, r * 0.15, r * 0.75, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.fillStyle = tierDef.secondaryColor;
    ctx.fill();

    // Layer 4: Alchemical symbol / emoji badge
    if (r >= 14) {
      ctx.fillStyle = '#2B2118';
      ctx.font = `bold ${Math.max(10, Math.floor(r * 0.7))}px "Comfortaa", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tierDef.symbol, 0, 0);
    }

    // Layer 5: Paper highlight gleam
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.35, r * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fill();

    ctx.restore();
  }

  private renderDropperGuide(ctx: CanvasRenderingContext2D, engine: PotionMergeEngine): void {
    const x = engine.dropperX;
    const y = engine.physics.dangerCeilingY - 25;
    const currentTier = engine.state.currentTier;
    const tierDef = POTION_TIERS[currentTier - 1] || POTION_TIERS[0];

    ctx.save();

    // Dropper vertical guideline
    ctx.strokeStyle = 'rgba(43, 33, 24, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, engine.physics.flaskBottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glass dropper pipette nozzle
    ctx.fillStyle = '#D8C3A5';
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 35);
    ctx.lineTo(x + 10, y - 35);
    ctx.lineTo(x + 5, y - 10);
    ctx.lineTo(x - 5, y - 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Floating potion preview
    const previewPotion: PotionBody = {
      id: 0,
      tier: currentTier,
      x,
      y,
      vx: 0,
      vy: 0,
      radius: tierDef.radius,
      settled: false,
      markedForRemoval: false,
      spawnAnimation: engine.canDrop ? 1 : 0.4,
    };
    this.renderPotion(ctx, previewPotion);

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    }
    ctx.restore();
  }

  private renderHUD(ctx: CanvasRenderingContext2D, engine: PotionMergeEngine): void {
    ctx.save();

    // Left Sidebar Note: Score & Merges
    this.drawPaperCard(ctx, 24, 40, 160, 160, '#FFFDF8');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#2B2118';
    ctx.font = 'bold 20px "Patrick Hand", cursive';
    ctx.fillText('ALCHEMY LAB', 36, 70);

    ctx.font = '14px "Comfortaa", sans-serif';
    ctx.fillStyle = '#C85A32';
    ctx.fillText(`SCORE: ${engine.state.score}`, 36, 102);

    ctx.fillStyle = 'rgba(43, 33, 24, 0.7)';
    ctx.fillText(`HIGH: ${engine.state.highScore}`, 36, 130);
    ctx.fillText(`MERGES: ${engine.state.mergesCount}`, 36, 158);
    if (engine.state.multiplier > 1) {
      ctx.fillStyle = '#E11D48';
      ctx.font = 'bold 15px "Patrick Hand", cursive';
      ctx.fillText(`COMBO x${engine.state.multiplier}!`, 36, 186);
    }

    // Right Sidebar Note: Next Potion & Legend
    this.drawPaperCard(ctx, 616, 40, 160, 200, '#FFFDF8');
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2B2118';
    ctx.font = 'bold 18px "Patrick Hand", cursive';
    ctx.fillText('NEXT POTION', 696, 70);

    const nextDef = POTION_TIERS[engine.state.nextTier - 1] || POTION_TIERS[0];
    const previewNext: PotionBody = {
      id: -1,
      tier: engine.state.nextTier,
      x: 696,
      y: 125,
      vx: 0,
      vy: 0,
      radius: nextDef.radius * 0.85,
      settled: false,
      markedForRemoval: false,
      spawnAnimation: 1,
    };
    this.renderPotion(ctx, previewNext);

    ctx.fillStyle = '#2B2118';
    ctx.font = '12px "Comfortaa", sans-serif';
    ctx.fillText(nextDef.name, 696, 185);
    ctx.fillText(`Tier ${nextDef.tier} (${nextDef.points} pts)`, 696, 205);

    // Bottom help Ribbon
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2B2118';
    ctx.font = '13px "Comfortaa", sans-serif';
    ctx.fillText('MOUSE/TOUCH/ARROWS: Aim Dropper  •  CLICK/SPACE: Drop Potion  •  ESC: Pause', 400, 580);

    ctx.restore();
  }

  private drawPaperCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, bg: string): void {
    ctx.save();
    ctx.fillStyle = 'rgba(43, 33, 24, 0.15)';
    ctx.fillRect(x + 3, y + 3, w, h);

    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Decorative tape top strip
    ctx.fillStyle = 'rgba(255, 248, 220, 0.85)';
    ctx.strokeStyle = 'rgba(43, 33, 24, 0.2)';
    ctx.lineWidth = 1;
    ctx.fillRect(x + w / 2 - 20, y - 6, 40, 12);
    ctx.strokeRect(x + w / 2 - 20, y - 6, 40, 12);
    ctx.restore();
  }

  private renderOverlays(ctx: CanvasRenderingContext2D, engine: PotionMergeEngine): void {
    if (engine.state.status === 'ready') {
      ctx.save();
      ctx.fillStyle = 'rgba(250, 246, 238, 0.9)';
      ctx.fillRect(0, 0, 800, 600);

      this.drawPaperCard(ctx, 180, 120, 440, 360, '#FFFDF8');
      ctx.textAlign = 'center';
      ctx.fillStyle = '#C85A32';
      ctx.font = 'bold 36px "Patrick Hand", cursive';
      ctx.fillText('POTION MERGE', 400, 180);

      ctx.fillStyle = '#2B2118';
      ctx.font = '15px "Comfortaa", sans-serif';
      ctx.fillText('Drop alchemical papercraft potions into flask.', 400, 220);
      ctx.fillText('Touch matching tiers to brew grander elixirs!', 400, 250);
      ctx.fillText('Watch out for danger ceiling overflow.', 400, 280);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 22px "Patrick Hand", cursive';
      ctx.fillText('Click or Press SPACE to Start', 400, 360);
      ctx.restore();
    } else if (engine.state.status === 'paused') {
      ctx.save();
      ctx.fillStyle = 'rgba(250, 246, 238, 0.9)';
      ctx.fillRect(0, 0, 800, 600);

      this.drawPaperCard(ctx, 240, 210, 320, 180, '#FFFDF8');
      ctx.textAlign = 'center';
      ctx.fillStyle = '#2B2118';
      ctx.font = 'bold 32px "Patrick Hand", cursive';
      ctx.fillText('LAB PAUSED', 400, 280);
      ctx.font = '15px "Comfortaa", sans-serif';
      ctx.fillText('Press ESC to Resume', 400, 330);
      ctx.restore();
    } else if (engine.state.status === 'gameover') {
      ctx.save();
      ctx.fillStyle = 'rgba(250, 246, 238, 0.92)';
      ctx.fillRect(0, 0, 800, 600);

      this.drawPaperCard(ctx, 180, 120, 440, 360, '#FFFDF8');
      ctx.textAlign = 'center';
      ctx.fillStyle = '#E11D48';
      ctx.font = 'bold 36px "Patrick Hand", cursive';
      ctx.fillText('FLASK OVERFLOWED!', 400, 180);

      ctx.fillStyle = '#2B2118';
      ctx.font = 'bold 24px "Patrick Hand", cursive';
      ctx.fillText(`FINAL SCORE: ${engine.state.score}`, 400, 230);
      ctx.font = '16px "Comfortaa", sans-serif';
      ctx.fillText(`Total Merges: ${engine.state.mergesCount}`, 400, 270);
      ctx.fillText(`Best Record: ${engine.state.highScore}`, 400, 300);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 22px "Patrick Hand", cursive';
      ctx.fillText('Click to Brew Again', 400, 380);
      ctx.restore();
    }
  }
}
