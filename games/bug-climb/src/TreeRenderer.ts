import { TreeTrunk, BranchSide } from './TreeTrunk';
import { BugClimber, ClimberSide } from './BugClimber';
import { UrgentTimer } from './UrgentTimer';
import { GameState } from './GameState';
import { ParticleSystem } from './Particles';

export class TreeRenderer {
  public static readonly WIDTH = 480;
  public static readonly HEIGHT = 720;
  public static readonly TRUNK_X = 240;
  public static readonly TRUNK_WIDTH = 130;
  public static readonly CLIMBER_BASE_Y = 560;
  public static readonly CLIMBER_LEFT_X = 135;
  public static readonly CLIMBER_RIGHT_X = 345;

  private trunkWoodPattern: CanvasPattern | null = null;

  public render(
    ctx: CanvasRenderingContext2D,
    trunk: TreeTrunk,
    climber: BugClimber,
    timer: UrgentTimer,
    gameState: GameState,
    particles: ParticleSystem
  ): void {
    // 1. Forest background with gradient and silhouette trees
    this.renderBackground(ctx);

    // 2. Central tree trunk column
    this.renderTrunk(ctx, trunk);

    // 3. Branches with leaves
    this.renderBranches(ctx, trunk);

    // 4. Wood chips & sparkles
    this.renderParticles(ctx, particles);

    // 5. Climbing Cyber Bug
    this.renderBug(ctx, climber);

    // 6. HUD and gauges
    this.renderHUD(ctx, timer, gameState);

    // 7. Overlays for Ready / Pause / GameOver
    this.renderOverlays(ctx, gameState);
  }

  private renderBackground(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(0, 0, TreeRenderer.WIDTH, TreeRenderer.HEIGHT);

    // Warm storybook tree silhouettes in soft sage
    ctx.fillStyle = 'rgba(74, 109, 86, 0.12)';
    ctx.fillRect(40, 0, 30, TreeRenderer.HEIGHT);
    ctx.fillRect(410, 0, 40, TreeRenderer.HEIGHT);
    ctx.fillRect(80, 0, 15, TreeRenderer.HEIGHT);
    ctx.fillRect(380, 0, 20, TreeRenderer.HEIGHT);

    // Subtle paper grain dots
    ctx.fillStyle = 'rgba(43, 33, 24, 0.05)';
    for (let x = 12; x < TreeRenderer.WIDTH; x += 24) {
      for (let y = 12; y < TreeRenderer.HEIGHT; y += 24) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private renderTrunk(ctx: CanvasRenderingContext2D, trunk: TreeTrunk): void {
    const leftX = TreeRenderer.TRUNK_X - TreeRenderer.TRUNK_WIDTH / 2;
    const width = TreeRenderer.TRUNK_WIDTH;

    // Vintage warm wood trunk
    ctx.fillStyle = '#A67C52';
    ctx.fillRect(leftX, 0, width, TreeRenderer.HEIGHT);

    // Bark grooves and rings
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;

    for (let i = 0; i < trunk.segments.length; i++) {
      const seg = trunk.segments[i];
      if (!seg) continue;
      const segY = TreeRenderer.CLIMBER_BASE_Y - i * TreeTrunk.SEGMENT_HEIGHT;
      ctx.beginPath();
      ctx.moveTo(leftX, segY);
      ctx.lineTo(leftX + width, segY);
      ctx.stroke();

      // Bark vertical grain lines
      ctx.beginPath();
      ctx.moveTo(leftX + 25 + (seg.woodVariation * 8), segY);
      ctx.lineTo(leftX + 25 + (seg.woodVariation * 8), segY - TreeTrunk.SEGMENT_HEIGHT);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(leftX + 80 + (seg.woodVariation * 5), segY);
      ctx.lineTo(leftX + 80 + (seg.woodVariation * 5), segY - TreeTrunk.SEGMENT_HEIGHT);
      ctx.stroke();
    }

    // Inked tree borders
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftX, 0);
    ctx.lineTo(leftX, TreeRenderer.HEIGHT);
    ctx.moveTo(leftX + width, 0);
    ctx.lineTo(leftX + width, TreeRenderer.HEIGHT);
    ctx.stroke();
  }

  private renderBranches(ctx: CanvasRenderingContext2D, trunk: TreeTrunk): void {
    const leftTrunkX = TreeRenderer.TRUNK_X - TreeRenderer.TRUNK_WIDTH / 2;
    const rightTrunkX = TreeRenderer.TRUNK_X + TreeRenderer.TRUNK_WIDTH / 2;

    for (let i = 0; i < trunk.segments.length; i++) {
      const seg = trunk.segments[i];
      if (!seg) continue;
      const y = TreeRenderer.CLIMBER_BASE_Y - i * TreeTrunk.SEGMENT_HEIGHT - 35;

      if (seg.branch === BranchSide.LEFT) {
        this.renderSingleBranch(ctx, leftTrunkX, y, 'LEFT');
      } else if (seg.branch === BranchSide.RIGHT) {
        this.renderSingleBranch(ctx, rightTrunkX, y, 'RIGHT');
      }
    }
  }

  private renderSingleBranch(ctx: CanvasRenderingContext2D, rootX: number, y: number, side: 'LEFT' | 'RIGHT'): void {
    const branchLength = 110;
    const branchHeight = 24;
    const endX = side === 'LEFT' ? rootX - branchLength : rootX + branchLength;

    ctx.save();

    // Branch limb
    ctx.fillStyle = '#8D5B34';
    ctx.beginPath();
    ctx.roundRect(
      side === 'LEFT' ? endX : rootX,
      y - branchHeight / 2,
      branchLength,
      branchHeight,
      [6, 6, 6, 6]
    );
    ctx.fill();

    // Inked branch outline
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Storybook foliage leaf tufts
    const foliageColor = '#4A6D56';
    ctx.fillStyle = foliageColor;

    const leafX = side === 'LEFT' ? endX - 10 : endX - 15;
    ctx.beginPath();
    ctx.arc(leafX + (side === 'LEFT' ? 10 : 20), y - 10, 22, 0, Math.PI * 2);
    ctx.arc(leafX + (side === 'LEFT' ? 30 : 5), y + 6, 18, 0, Math.PI * 2);
    ctx.arc(leafX + (side === 'LEFT' ? -5 : 35), y + 4, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  private renderBug(ctx: CanvasRenderingContext2D, climber: BugClimber): void {
    const targetX = climber.side === ClimberSide.LEFT ? TreeRenderer.CLIMBER_LEFT_X : TreeRenderer.CLIMBER_RIGHT_X;
    const y = TreeRenderer.CLIMBER_BASE_Y - 35;
    const isScurrying = climber.scurryTimer > 0;
    const legOffset = isScurrying ? Math.sin(Date.now() * 0.04) * 5 : 0;

    ctx.save();
    ctx.translate(targetX, y);

    // Flip horizontally when on right side to face inwards toward trunk
    const facingRight = climber.side === ClimberSide.LEFT;
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    if (!climber.alive) {
      ctx.rotate(0.6);
      ctx.globalAlpha = 0.8;
    }

    // Legs
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    for (let i = -1; i <= 1; i++) {
      const legY = i * 12;
      const legAnim = (i % 2 === 0 ? 1 : -1) * legOffset;

      // Left leg
      ctx.beginPath();
      ctx.moveTo(-10, legY);
      ctx.lineTo(-24, legY - 6 + legAnim);
      ctx.lineTo(-30, legY + 8 + legAnim);
      ctx.stroke();

      // Right leg
      ctx.beginPath();
      ctx.moveTo(10, legY);
      ctx.lineTo(24, legY - 6 - legAnim);
      ctx.lineTo(30, legY + 8 - legAnim);
      ctx.stroke();
    }

    // Antennae
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.quadraticCurveTo(8, -34, 14, -38);
    ctx.moveTo(0, -22);
    ctx.quadraticCurveTo(-8, -34, -14, -38);
    ctx.stroke();

    // Ladybug Red Shell
    ctx.fillStyle = '#C85A32';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shell border
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Spots on Ladybug
    ctx.fillStyle = '#2B2118';
    ctx.beginPath();
    ctx.arc(-6, -6, 3, 0, Math.PI * 2);
    ctx.arc(6, -6, 3, 0, Math.PI * 2);
    ctx.arc(-7, 8, 3.5, 0, Math.PI * 2);
    ctx.arc(7, 8, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Center divider
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(0, 20);
    ctx.stroke();

    // Head
    ctx.fillStyle = '#2B2118';
    ctx.beginPath();
    ctx.ellipse(0, -20, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFFDF9';
    ctx.beginPath();
    ctx.arc(-4, -22, 3, 0, Math.PI * 2);
    ctx.arc(4, -22, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2B2118';
    ctx.beginPath();
    ctx.arc(-4, -22, 1.5, 0, Math.PI * 2);
    ctx.arc(4, -22, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D, particles: ParticleSystem): void {
    for (const p of particles.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === 'chip' || p.type === 'splinter') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.type === 'leaf') {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Sparkle circle
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderHUD(ctx: CanvasRenderingContext2D, timer: UrgentTimer, gameState: GameState): void {
    // 1. Altitude Counter
    ctx.save();
    ctx.fillStyle = '#2B2118';
    ctx.font = 'bold 36px "Patrick Hand", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${gameState.altitude}m`, TreeRenderer.WIDTH / 2, 70);
    ctx.restore();

    // 2. Score & High Score
    ctx.save();
    ctx.font = '700 15px "Comfortaa", cursive, sans-serif';

    // Left score
    ctx.fillStyle = '#6A5D4D';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${gameState.score}`, 20, 32);

    // Right high score
    ctx.fillStyle = '#C85A32';
    ctx.textAlign = 'right';
    ctx.fillText(`BEST: ${gameState.highScore}`, TreeRenderer.WIDTH - 20, 32);

    // Combo streak badge
    if (gameState.multiplier > 1) {
      ctx.fillStyle = '#E09F3E';
      ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`★ COMBO x${gameState.multiplier}!`, TreeRenderer.WIDTH / 2, 100);
    }
    ctx.restore();

    // 3. Urgent Countdown Timer Bar
    const barWidth = 320;
    const barHeight = 14;
    const barX = (TreeRenderer.WIDTH - barWidth) / 2;
    const barY = 114;
    const frac = timer.getTimeFraction();

    ctx.save();
    ctx.fillStyle = '#FFFDF9';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 7);
    ctx.fill();

    let fillColor = '#4A6D56';
    if (timer.isUrgent) {
      const pulse = Math.sin(Date.now() * 0.02) > 0;
      fillColor = pulse ? '#C85A32' : '#8D3A20';
    } else if (frac < 0.5) {
      fillColor = '#E09F3E';
    }

    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.roundRect(barX + 2, barY + 2, Math.max(0, (barWidth - 4) * frac), barHeight - 4, 5);
    ctx.fill();

    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.stroke();
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
    ctx.fillRect(0, 0, TreeRenderer.WIDTH, TreeRenderer.HEIGHT);

    ctx.textAlign = 'center';

    // Title
    ctx.fillStyle = '#C85A32';
    ctx.font = 'bold 42px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('LADYBUG CLIMB', TreeRenderer.WIDTH / 2, 280);

    // Subtitle
    ctx.fillStyle = '#2B2118';
    ctx.font = '600 16px "Comfortaa", cursive, sans-serif';
    ctx.fillText('Switch sides & climb the big tree!', TreeRenderer.WIDTH / 2, 320);

    // Controls card
    ctx.fillStyle = '#FFFDF9';
    ctx.beginPath();
    ctx.roundRect(60, 360, 360, 140, 12);
    ctx.fill();
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#C85A32';
    ctx.font = 'bold 16px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('CONTROLS', TreeRenderer.WIDTH / 2, 390);

    ctx.fillStyle = '#2B2118';
    ctx.font = '14px "Comfortaa", cursive, sans-serif';
    ctx.fillText('A / Left Arrow / Tap Left: Climb Left', TreeRenderer.WIDTH / 2, 425);
    ctx.fillText('D / Right Arrow / Tap Right: Climb Right', TreeRenderer.WIDTH / 2, 455);
    ctx.fillText('Hold SPACE to speed boost up the trunk', TreeRenderer.WIDTH / 2, 485);

    // Start prompt
    ctx.fillStyle = '#4A6D56';
    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('TAP OR PRESS ANY KEY TO START', TreeRenderer.WIDTH / 2, 560);

    ctx.restore();
  }

  private renderPauseOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(250, 246, 238, 0.9)';
    ctx.fillRect(0, 0, TreeRenderer.WIDTH, TreeRenderer.HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#E09F3E';
    ctx.font = 'bold 40px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('PAUSED', TreeRenderer.WIDTH / 2, TreeRenderer.HEIGHT / 2);

    ctx.fillStyle = '#2B2118';
    ctx.font = '16px "Comfortaa", cursive, sans-serif';
    ctx.fillText('Press P or Tap to Resume', TreeRenderer.WIDTH / 2, TreeRenderer.HEIGHT / 2 + 40);
    ctx.restore();
  }

  private renderGameOverOverlay(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    ctx.save();
    ctx.fillStyle = 'rgba(250, 246, 238, 0.95)';
    ctx.fillRect(0, 0, TreeRenderer.WIDTH, TreeRenderer.HEIGHT);

    ctx.textAlign = 'center';

    // Reason title
    ctx.fillStyle = '#C85A32';
    ctx.font = 'bold 42px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(
      gameState.gameOverReason === 'timeout' ? 'TIME UP!' : 'CRASHED!',
      TreeRenderer.WIDTH / 2,
      270
    );

    // Score details card
    ctx.fillStyle = '#FFFDF9';
    ctx.beginPath();
    ctx.roundRect(80, 320, 320, 160, 12);
    ctx.fill();
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#2B2118';
    ctx.font = 'bold 26px "Patrick Hand", cursive, sans-serif';
    ctx.fillText(`SCORE: ${gameState.score}`, TreeRenderer.WIDTH / 2, 365);

    ctx.font = '15px "Comfortaa", cursive, sans-serif';
    ctx.fillStyle = '#4A6D56';
    ctx.fillText(`Altitude: ${gameState.altitude}m (${gameState.stepsClimbed} steps)`, TreeRenderer.WIDTH / 2, 405);

    ctx.fillStyle = '#E09F3E';
    ctx.fillText(`Best High Score: ${gameState.highScore}`, TreeRenderer.WIDTH / 2, 445);

    // Retry CTA
    ctx.fillStyle = '#4A6D56';
    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    ctx.fillText('TAP OR PRESS SPACE TO RETRY', TreeRenderer.WIDTH / 2, 540);

    ctx.restore();
  }
}
