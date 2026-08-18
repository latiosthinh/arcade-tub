import { LaneRunnerEngine } from './LaneRunnerEngine.js';
import { TrackObstacle, TrackItem } from './TrainTrackGenerator.js';

export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 720;

export class SubwayRenderer {
  private horizonY = 240;
  private trackBaseY = 660;
  private trackTopWidth = 140;
  private trackBottomWidth = 420;

  renderTrack(ctx: CanvasRenderingContext2D, scrollZ: number): void {
    // 1. Subway Tunnel / Wall Papercraft Background
    const wallGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    wallGrad.addColorStop(0, '#3A312A');
    wallGrad.addColorStop(0.35, '#56483C');
    wallGrad.addColorStop(1, '#D8C7B0');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Tunnel Arch / Kraft Paper Overlays
    ctx.strokeStyle = '#2B2118';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, this.horizonY - 20, 160, Math.PI, 0);
    ctx.stroke();

    // Graffiti Craft Brick Texture
    ctx.fillStyle = '#6E5D4F';
    for (let row = 0; row < 5; row++) {
      const y = 50 + row * 34;
      ctx.fillRect(20, y, 90, 22);
      ctx.fillRect(CANVAS_WIDTH - 110, y, 90, 22);
      ctx.strokeRect(20, y, 90, 22);
      ctx.strokeRect(CANVAS_WIDTH - 110, y, 90, 22);
    }

    // Graffiti Tag on Left Tunnel Wall
    ctx.save();
    ctx.translate(65, 120);
    ctx.rotate(-0.1);
    ctx.font = 'bold 20px "Patrick Hand", cursive, sans-serif';
    ctx.fillStyle = '#E11D48';
    ctx.fillText('SUBWAY', -30, 0);
    ctx.fillStyle = '#F59E0B';
    ctx.fillText('SURF', -20, 18);
    ctx.restore();

    // 2. Track Ground Trapezoid
    ctx.fillStyle = '#C2B099';
    ctx.beginPath();
    ctx.moveTo((CANVAS_WIDTH - this.trackTopWidth) / 2, this.horizonY);
    ctx.lineTo((CANVAS_WIDTH + this.trackTopWidth) / 2, this.horizonY);
    ctx.lineTo((CANVAS_WIDTH + this.trackBottomWidth) / 2, this.trackBaseY);
    ctx.lineTo((CANVAS_WIDTH - this.trackBottomWidth) / 2, this.trackBaseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Wooden Railroad Ties (Sleepers)
    const tieCount = 14;
    for (let i = 0; i < tieCount; i++) {
      const t = ((i / tieCount) + (scrollZ % 100) / 100) % 1;
      const tieY = this.horizonY + Math.pow(t, 1.6) * (this.trackBaseY - this.horizonY);
      const tieWidth = this.trackTopWidth + t * (this.trackBottomWidth - this.trackTopWidth);
      const tieX = (CANVAS_WIDTH - tieWidth) / 2;

      ctx.fillStyle = '#6B4E38';
      ctx.fillRect(tieX, tieY - 2, tieWidth, 4 + t * 6);
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(tieX, tieY - 2, tieWidth, 4 + t * 6);
    }

    // 4. Metal Rails (3-lane divider rails)
    ctx.strokeStyle = '#5E6D77';
    ctx.lineWidth = 4;
    for (let lane = 0; lane <= 3; lane++) {
      const topX = (CANVAS_WIDTH - this.trackTopWidth) / 2 + (lane / 3) * this.trackTopWidth;
      const botX = (CANVAS_WIDTH - this.trackBottomWidth) / 2 + (lane / 3) * this.trackBottomWidth;

      ctx.beginPath();
      ctx.moveTo(topX, this.horizonY);
      ctx.lineTo(botX, this.trackBaseY);
      ctx.stroke();
    }
  }

  // 3D perspective projection helpers
  private project(laneOffset: number, z: number, yOffset: number = 0): { x: number; y: number; scale: number } {
    // z = 0 is close (near bottom of screen), z = 1200 is far horizon
    const depth = Math.max(0.01, 1 - (z / 1200));
    const scale = Math.pow(depth, 1.4);

    const groundY = this.horizonY + scale * (this.trackBaseY - this.horizonY);
    const trackWidthAtZ = this.trackTopWidth + scale * (this.trackBottomWidth - this.trackTopWidth);
    const laneWidthAtZ = trackWidthAtZ / 3;

    const x = CANVAS_WIDTH / 2 + laneOffset * laneWidthAtZ;
    const y = groundY - yOffset * scale;

    return { x, y, scale };
  }

  renderObstacles(ctx: CanvasRenderingContext2D, obstacles: TrackObstacle[]): void {
    // Sort from farthest to closest for painter's algorithm
    const sorted = [...obstacles].sort((a, b) => b.z - a.z);

    for (const obs of sorted) {
      if (obs.z < -40 || obs.z > 1200) continue;

      const laneOffset = obs.lane - 1;
      const { x, y, scale } = this.project(laneOffset, obs.z, 0);

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      if (obs.type === 'barrier_low') {
        // Red & White Striped Wooden Barrier (Jumpable)
        const w = 90;
        const h = 40;
        ctx.fillStyle = '#D97706';
        ctx.fillRect(-w / 2, -h, w, h);
        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 3;
        ctx.strokeRect(-w / 2, -h, w, h);

        // Warning stripes
        ctx.fillStyle = '#FAF6EE';
        for (let i = -w / 2 + 10; i < w / 2; i += 24) {
          ctx.beginPath();
          ctx.moveTo(i, -h);
          ctx.lineTo(i + 12, -h);
          ctx.lineTo(i, 0);
          ctx.lineTo(i - 12, 0);
          ctx.closePath();
          ctx.fill();
        }

        // Barrier Legs
        ctx.fillStyle = '#6B4E38';
        ctx.fillRect(-w / 2 + 6, 0, 8, 8);
        ctx.fillRect(w / 2 - 14, 0, 8, 8);
      } else if (obs.type === 'barrier_high') {
        // High Signal Board (Slide Underneath)
        const w = 96;
        const h = 75;
        const clearance = 30;

        // Support Poles
        ctx.fillStyle = '#4A5568';
        ctx.fillRect(-w / 2 + 4, -h, 8, h);
        ctx.fillRect(w / 2 - 12, -h, 8, h);
        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 2;
        ctx.strokeRect(-w / 2 + 4, -h, 8, h);
        ctx.strokeRect(w / 2 - 12, -h, 8, h);

        // Overhead Sign Board
        ctx.fillStyle = '#E11D48';
        ctx.fillRect(-w / 2, -h, w, h - clearance);
        ctx.strokeRect(-w / 2, -h, w, h - clearance);

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 16px "Patrick Hand", cursive, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▼ SLIDE ▼', 0, -h + 24);
      } else if (obs.type === 'train') {
        // Cardboard Commuter Subway Train
        const w = 104;
        const h = 130;

        // Train Body (Cardboard fold style)
        ctx.fillStyle = '#4A6D56';
        ctx.fillRect(-w / 2, -h, w, h);
        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 3;
        ctx.strokeRect(-w / 2, -h, w, h);

        // Yellow Front Stripe
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(-w / 2, -h + 40, w, 22);
        ctx.strokeRect(-w / 2, -h + 40, w, 22);

        // Windshield Windows
        ctx.fillStyle = '#E8DEC8';
        ctx.fillRect(-w / 2 + 10, -h + 12, w / 2 - 14, 24);
        ctx.fillRect(4, -h + 12, w / 2 - 14, 24);
        ctx.strokeRect(-w / 2 + 10, -h + 12, w / 2 - 14, 24);
        ctx.strokeRect(4, -h + 12, w / 2 - 14, 24);

        // Dual Headlights
        ctx.fillStyle = '#FFFDF0';
        ctx.beginPath();
        ctx.arc(-w / 2 + 20, -h + 80, 10, 0, Math.PI * 2);
        ctx.arc(w / 2 - 20, -h + 80, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Train Cowcatcher Grill
        ctx.fillStyle = '#332922';
        ctx.fillRect(-w / 2 + 6, -16, w - 12, 16);
      }

      ctx.restore();
    }
  }

  renderItems(ctx: CanvasRenderingContext2D, items: TrackItem[]): void {
    const sorted = [...items].sort((a, b) => b.z - a.z);

    for (const item of sorted) {
      if (item.collected || item.z < -20 || item.z > 1200) continue;

      const laneOffset = item.lane - 1;
      const { x, y, scale } = this.project(laneOffset, item.z, item.yOffset + 20);

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      if (item.type === 'coin') {
        // Construction Paper Spinning Gold Coin
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Star / Inner Emboss
        ctx.fillStyle = '#FAF6EE';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'powerup_magnet') {
        // Red Horseshoe Magnet
        ctx.fillStyle = '#E11D48';
        ctx.beginPath();
        ctx.arc(0, -2, 16, Math.PI, 0, false);
        ctx.lineTo(16, 12);
        ctx.lineTo(8, 12);
        ctx.lineTo(8, 0);
        ctx.arc(0, 0, 8, 0, Math.PI, true);
        ctx.lineTo(-8, 12);
        ctx.lineTo(-16, 12);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (item.type === 'powerup_hoverboard') {
        // Origami Cyber Skateboard
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(-22, -6, 44, 12);
        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 2;
        ctx.strokeRect(-22, -6, 44, 12);

        // Wheels
        ctx.fillStyle = '#10B981';
        ctx.fillRect(-18, 6, 8, 4);
        ctx.fillRect(10, 6, 8, 4);
      } else if (item.type === 'powerup_2x') {
        // 2X Multiplier Badge
        ctx.fillStyle = '#8B5CF6';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#FAF6EE';
        ctx.font = 'bold 15px "Patrick Hand", cursive, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('2X', 0, 0);
      }

      ctx.restore();
    }
  }

  renderPlayer(ctx: CanvasRenderingContext2D, runner: LaneRunnerEngine): void {
    const { x, y, scale } = this.project(runner.laneOffset, 0, runner.yOffset);

    ctx.save();
    ctx.translate(x, y);

    // Hoverboard Underneath
    if (runner.hasHoverboard) {
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(-32, -4, 64, 12);
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 2;
      ctx.strokeRect(-32, -4, 64, 12);

      // Jet flame
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(-16, 8);
      ctx.lineTo(0, 20);
      ctx.lineTo(16, 8);
      ctx.closePath();
      ctx.fill();
    }

    if (runner.actionState === 'sliding') {
      // Slid / Ducking Folded Paper Figure
      ctx.fillStyle = '#E11D48';
      ctx.fillRect(-28, -24, 56, 24);
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 3;
      ctx.strokeRect(-28, -24, 56, 24);

      // Head / Cap
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(14, -28, 16, 12);
      ctx.strokeRect(14, -28, 16, 12);
    } else {
      // Standing / Running / Jumping Folded Paper Surfer
      // Body (Hoodie)
      ctx.fillStyle = '#E11D48';
      ctx.fillRect(-18, -60, 36, 36);
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 3;
      ctx.strokeRect(-18, -60, 36, 36);

      // Jeans / Legs
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(-16, -24, 12, 24);
      ctx.fillRect(4, -24, 12, 24);
      ctx.strokeRect(-16, -24, 12, 24);
      ctx.strokeRect(4, -24, 12, 24);

      // Head / Beanie
      ctx.fillStyle = '#FAF6EE';
      ctx.fillRect(-12, -84, 24, 24);
      ctx.strokeRect(-12, -84, 24, 24);

      // Red Cap / Visor
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-14, -90, 28, 10);
      ctx.fillRect(4, -84, 16, 6);
      ctx.strokeRect(-14, -90, 28, 10);
      ctx.strokeRect(4, -84, 16, 6);

      // Backpack
      ctx.fillStyle = '#4A6D56';
      ctx.fillRect(-24, -56, 8, 22);
      ctx.strokeRect(-24, -56, 8, 22);
    }

    // Active Shield Aura if Hoverboard
    if (runner.hasHoverboard) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -45, 52, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
