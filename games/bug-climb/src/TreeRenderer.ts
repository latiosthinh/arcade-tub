import { CANVAS_WIDTH, CANVAS_HEIGHT, TRUNK_LEFT, TRUNK_WIDTH } from './TrunkLanes';
import { BugClimber, BUG_WIDTH, BUG_HEIGHT } from './BugClimber';
import { TreeTrunk, TreeObstacle, BranchSide } from './TreeTrunk';

export class TreeRenderer {
  public static readonly WIDTH = CANVAS_WIDTH;
  public static readonly HEIGHT = CANVAS_HEIGHT;
  public static readonly TRUNK_LEFT = TRUNK_LEFT;
  public static readonly TRUNK_WIDTH = TRUNK_WIDTH;

  renderTrunk(ctx: CanvasRenderingContext2D, trunk: TreeTrunk): void {
    // 1. Background forest ambience
    ctx.fillStyle = '#FAF6EE';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Warm sage silhouettes
    ctx.fillStyle = 'rgba(74, 109, 86, 0.12)';
    ctx.fillRect(30, 0, 35, CANVAS_HEIGHT);
    ctx.fillRect(415, 0, 35, CANVAS_HEIGHT);
    ctx.fillRect(80, 0, 15, CANVAS_HEIGHT);
    ctx.fillRect(380, 0, 18, CANVAS_HEIGHT);

    // 2. Trunk surface
    ctx.fillStyle = '#A67C52';
    ctx.fillRect(TRUNK_LEFT, 0, TRUNK_WIDTH, CANVAS_HEIGHT);

    // Inked trunk borders
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.strokeRect(TRUNK_LEFT, 0, TRUNK_WIDTH, CANVAS_HEIGHT);

    // Scrolling bark textures & grain lines
    ctx.strokeStyle = '#8D5B34';
    ctx.lineWidth = 2;
    for (let y = -64 + trunk.scrollOffset; y < CANVAS_HEIGHT + 64; y += 64) {
      ctx.beginPath();
      ctx.moveTo(TRUNK_LEFT, y);
      ctx.lineTo(TRUNK_LEFT + TRUNK_WIDTH, y);
      ctx.stroke();

      // Vertical bark grooves
      ctx.beginPath();
      ctx.moveTo(TRUNK_LEFT + 35, y);
      ctx.lineTo(TRUNK_LEFT + 35, y + 45);
      ctx.moveTo(TRUNK_LEFT + 105, y + 15);
      ctx.lineTo(TRUNK_LEFT + 105, y + 60);
      ctx.stroke();
    }

    // Center divider dash line
    ctx.strokeStyle = 'rgba(43, 33, 24, 0.25)';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 12]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  renderBranches(ctx: CanvasRenderingContext2D, obstacles: TreeObstacle[]): void {
    for (const obs of obstacles) {
      ctx.save();

      const isLeft = obs.side === BranchSide.LEFT;
      const rootX = isLeft ? TRUNK_LEFT : TRUNK_LEFT + TRUNK_WIDTH;
      const endX = isLeft ? rootX - obs.width : rootX + obs.width;

      // Wooden branch limb
      ctx.fillStyle = '#8D5B34';
      ctx.beginPath();
      ctx.roundRect(
        isLeft ? endX : rootX,
        obs.y - obs.height / 2,
        obs.width,
        obs.height,
        [6, 6, 6, 6]
      );
      ctx.fill();

      // Inked border
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Leaf clusters
      ctx.fillStyle = '#4A6D56';
      const leafX = isLeft ? endX - 8 : endX + 8;
      ctx.beginPath();
      ctx.arc(leafX + (isLeft ? 10 : -10), obs.y - 8, 20, 0, Math.PI * 2);
      ctx.arc(leafX + (isLeft ? 26 : -26), obs.y + 6, 16, 0, Math.PI * 2);
      ctx.arc(leafX + (isLeft ? -4 : 4), obs.y + 4, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    }
  }

  renderBug(ctx: CanvasRenderingContext2D, bug: BugClimber): void {
    ctx.save();
    ctx.translate(bug.x, bug.y);
    ctx.rotate(bug.tiltAngle);

    const facingRight = bug.currentLane === 0;
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    if (!bug.alive) {
      ctx.rotate(0.6);
      ctx.globalAlpha = 0.8;
    }

    const legAnim = Math.sin(bug.scurryTimer * 16) * 5;

    // Legs
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    for (let i = -1; i <= 1; i++) {
      const legY = i * 12;
      const anim = (i % 2 === 0 ? 1 : -1) * legAnim;

      // Left leg
      ctx.beginPath();
      ctx.moveTo(-10, legY);
      ctx.lineTo(-24, legY - 6 + anim);
      ctx.lineTo(-30, legY + 8 + anim);
      ctx.stroke();

      // Right leg
      ctx.beginPath();
      ctx.moveTo(10, legY);
      ctx.lineTo(24, legY - 6 - anim);
      ctx.lineTo(30, legY + 8 - anim);
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
}
