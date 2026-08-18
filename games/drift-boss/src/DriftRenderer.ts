import { TrackTile, Coin } from './TrackGenerator.js';
import { CarState } from './CarPhysics.js';
import { GameState } from './GameState.js';

export interface IsometricPoint {
  screenX: number;
  screenY: number;
}

export class DriftRenderer {
  // Isometric projection constants
  // Standard 2:1 ratio: dx = (x - y) * tileW, dy = (x + y) * tileH
  private tileW = 44;
  private tileH = 22;

  public toScreen(x: number, y: number, z = 0): IsometricPoint {
    return {
      screenX: (x - y) * this.tileW,
      screenY: (x + y) * this.tileH - z * 35
    };
  }

  public renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Craft storybook paper backdrop
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#fbf5e8');
    grad.addColorStop(1, '#eadecc');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle paper grid / texture lines
    ctx.save();
    ctx.strokeStyle = 'rgba(180, 160, 140, 0.15)';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  public renderTrack(ctx: CanvasRenderingContext2D, tiles: TrackTile[], cameraX: number, cameraY: number): void {
    // Draw tiles in back-to-front order (sorted by x + y)
    const sorted = [...tiles].sort((a, b) => (a.x + a.y) - (b.x + b.y));

    for (const tile of sorted) {
      if (tile.isGap) continue;

      const halfW = tile.width / 2;
      const len = tile.length;

      // 4 tile corners in world coordinates (X, Y)
      let p1: { x: number; y: number };
      let p2: { x: number; y: number };
      let p3: { x: number; y: number };
      let p4: { x: number; y: number };

      if (tile.axis === 'X') {
        p1 = { x: tile.x, y: tile.y - halfW };
        p2 = { x: tile.x + len, y: tile.y - halfW };
        p3 = { x: tile.x + len, y: tile.y + halfW };
        p4 = { x: tile.x, y: tile.y + halfW };
      } else {
        p1 = { x: tile.x - halfW, y: tile.y };
        p2 = { x: tile.x + halfW, y: tile.y };
        p3 = { x: tile.x + halfW, y: tile.y + len };
        p4 = { x: tile.x - halfW, y: tile.y + len };
      }

      const sp1 = this.toScreen(p1.x, p1.y);
      const sp2 = this.toScreen(p2.x, p2.y);
      const sp3 = this.toScreen(p3.x, p3.y);
      const sp4 = this.toScreen(p4.x, p4.y);

      const thickness = 14; // Cardboard 3D edge depth

      ctx.save();
      ctx.translate(-cameraX, -cameraY);

      // 1. Drop shadow beneath cardboard slab
      ctx.fillStyle = 'rgba(60, 40, 20, 0.18)';
      ctx.beginPath();
      ctx.moveTo(sp1.screenX, sp1.screenY + thickness + 6);
      ctx.lineTo(sp2.screenX, sp2.screenY + thickness + 6);
      ctx.lineTo(sp3.screenX, sp3.screenY + thickness + 6);
      ctx.lineTo(sp4.screenX, sp4.screenY + thickness + 6);
      ctx.closePath();
      ctx.fill();

      // 2. Corrugated cardboard bottom/side edges (isometric depth)
      // Side 1 (p3 to p4)
      ctx.fillStyle = '#8d5d36';
      ctx.beginPath();
      ctx.moveTo(sp4.screenX, sp4.screenY);
      ctx.lineTo(sp3.screenX, sp3.screenY);
      ctx.lineTo(sp3.screenX, sp3.screenY + thickness);
      ctx.lineTo(sp4.screenX, sp4.screenY + thickness);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#5a3b22';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Side 2 (p2 to p3)
      ctx.fillStyle = '#a77244';
      ctx.beginPath();
      ctx.moveTo(sp3.screenX, sp3.screenY);
      ctx.lineTo(sp2.screenX, sp2.screenY);
      ctx.lineTo(sp2.screenX, sp2.screenY + thickness);
      ctx.lineTo(sp3.screenX, sp3.screenY + thickness);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 3. Cardboard Top Surface
      ctx.fillStyle = tile.isRamp ? '#f39c12' : tile.isNarrow ? '#d35400' : '#d2a679';
      ctx.beginPath();
      ctx.moveTo(sp1.screenX, sp1.screenY);
      ctx.lineTo(sp2.screenX, sp2.screenY);
      ctx.lineTo(sp3.screenX, sp3.screenY);
      ctx.lineTo(sp4.screenX, sp4.screenY);
      ctx.closePath();
      ctx.fill();

      // Top paper border crease
      ctx.strokeStyle = '#ba8b5f';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Dashed lane marks down the middle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      if (tile.axis === 'X') {
        const m1 = this.toScreen(tile.x, tile.y);
        const m2 = this.toScreen(tile.x + len, tile.y);
        ctx.moveTo(m1.screenX, m1.screenY);
        ctx.lineTo(m2.screenX, m2.screenY);
      } else {
        const m1 = this.toScreen(tile.x, tile.y);
        const m2 = this.toScreen(tile.x, tile.y + len);
        ctx.moveTo(m1.screenX, m1.screenY);
        ctx.lineTo(m2.screenX, m2.screenY);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }
  }

  public renderCoins(ctx: CanvasRenderingContext2D, coins: Coin[], cameraX: number, cameraY: number, time: number): void {
    for (const coin of coins) {
      if (coin.collected) continue;
      const sp = this.toScreen(coin.x, coin.y);
      const bobY = Math.sin(time * 6 + coin.x * 2) * 4;

      ctx.save();
      ctx.translate(sp.screenX - cameraX, sp.screenY - cameraY + bobY - 14);

      // Gold coin scale oscillation (pseudo 3D spin)
      const spinScale = Math.cos(time * 4 + coin.x);
      ctx.scale(Math.abs(spinScale) < 0.1 ? 0.1 : spinScale, 1.0);

      // Paper gold coin
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d68910';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner star / foil punch
      ctx.fillStyle = '#fff8dc';
      ctx.fillRect(-2, -5, 4, 10);
      ctx.fillRect(-5, -2, 10, 4);

      ctx.restore();
    }
  }

  public renderCar(ctx: CanvasRenderingContext2D, car: CarState, cameraX: number, cameraY: number): void {
    const sp = this.toScreen(car.x, car.y, car.z);

    ctx.save();
    ctx.translate(sp.screenX - cameraX, sp.screenY - cameraY);

    // Car Shadow (stays on road level z=0)
    const shadowSp = this.toScreen(car.x, car.y, 0);
    ctx.save();
    ctx.translate(shadowSp.screenX - sp.screenX, shadowSp.screenY - sp.screenY + 4);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Rotate car based on current direction angle
    // In isometric view: Direction X = -30 deg visual, Direction Y = +30 deg visual
    // rotationAngle is 0 (X) to PI/2 (Y)
    const visualAngle = -Math.PI / 6 + (car.rotationAngle / (Math.PI / 2)) * (Math.PI / 3);
    ctx.rotate(visualAngle);

    // 2D Papercraft Car Body
    // Lower chassis (Dark cardstock)
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(-14, -8, 28, 16);

    // Main cardboard body (Bright red craft paper)
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(-12, -7, 24, 14);
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-12, -7, 24, 14);

    // Cabin roof (Cream paper)
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(-5, -5, 10, 10);
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 1;
    ctx.strokeRect(-5, -5, 10, 10);

    // Yellow cardboard headlights
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(10, -5, 2, 3);
    ctx.fillRect(10, 2, 2, 3);

    // Fold crease line
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(12, 0);
    ctx.stroke();

    ctx.restore();
  }

  public renderHUD(ctx: CanvasRenderingContext2D, width: number, height: number, state: GameState): void {
    ctx.save();

    // Top paper banner for score & coins
    ctx.fillStyle = 'rgba(255, 250, 240, 0.9)';
    ctx.strokeStyle = '#c49e75';
    ctx.lineWidth = 2;
    ctx.fillRect(width / 2 - 130, 16, 260, 52);
    ctx.strokeRect(width / 2 - 130, 16, 260, 52);

    // Score text
    ctx.fillStyle = '#4a2e18';
    ctx.font = 'bold 22px "Courier New", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`SCORE: ${state.score}`, width / 2, 40);

    ctx.font = 'bold 13px "Courier New", monospace, sans-serif';
    ctx.fillStyle = '#b7791f';
    ctx.fillText(`🪙 ${state.coins}  |  BEST: ${state.highScore}`, width / 2, 58);

    // Multiplier banner if combo active
    if (state.multiplier > 1.0) {
      ctx.fillStyle = '#e67e22';
      ctx.font = 'bold 16px "Courier New", monospace, sans-serif';
      ctx.fillText(`${state.multiplier.toFixed(1)}x DRIFT COMBO!`, width / 2, 90);
    }

    // Ready screen prompt
    if (state.status === 'ready') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.strokeStyle = '#8d5d36';
      ctx.lineWidth = 3;
      ctx.fillRect(width / 2 - 170, height / 2 - 60, 340, 120);
      ctx.strokeRect(width / 2 - 170, height / 2 - 60, 340, 120);

      ctx.fillStyle = '#4a2e18';
      ctx.font = 'bold 24px "Courier New", monospace, sans-serif';
      ctx.fillText('CARDBOARD DRIFT', width / 2, height / 2 - 20);

      ctx.font = '14px "Courier New", monospace, sans-serif';
      ctx.fillStyle = '#784d2b';
      ctx.fillText('HOLD [SPACE] / TOUCH TO TURN RIGHT', width / 2, height / 2 + 10);
      ctx.fillText('RELEASE TO TURN LEFT', width / 2, height / 2 + 30);
    }

    // Game Over Dialog
    if (state.status === 'gameover') {
      ctx.fillStyle = 'rgba(255, 250, 240, 0.95)';
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 3;
      ctx.fillRect(width / 2 - 160, height / 2 - 90, 320, 180);
      ctx.strokeRect(width / 2 - 160, height / 2 - 90, 320, 180);

      ctx.fillStyle = '#c0392b';
      ctx.font = 'bold 26px "Courier New", monospace, sans-serif';
      ctx.fillText('CRASHED!', width / 2, height / 2 - 50);

      ctx.fillStyle = '#4a2e18';
      ctx.font = 'bold 18px "Courier New", monospace, sans-serif';
      ctx.fillText(`FINAL SCORE: ${state.score}`, width / 2, height / 2 - 15);
      ctx.fillText(`BEST SCORE: ${state.highScore}`, width / 2, height / 2 + 15);

      ctx.font = '14px "Courier New", monospace, sans-serif';
      ctx.fillStyle = '#8d5d36';
      ctx.fillText('PRESS [SPACE] / TAP TO RETRY', width / 2, height / 2 + 55);
    }

    ctx.restore();
  }
}
