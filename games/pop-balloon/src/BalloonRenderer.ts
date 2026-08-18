import { Balloon } from './Balloon';

export class BalloonRenderer {
  renderBalloon(ctx: CanvasRenderingContext2D, balloon: Balloon, time: number): void {
    if (!balloon.isAlive) return;

    ctx.save();
    ctx.translate(balloon.x, balloon.y);

    if (balloon.type === 'bomb') {
      this.renderSpikeBomb(ctx, balloon, time);
    } else {
      this.renderNeonBalloon(ctx, balloon, time);
    }

    ctx.restore();
  }

  private renderNeonBalloon(ctx: CanvasRenderingContext2D, balloon: Balloon, time: number): void {
    const r = balloon.radius;

    // 1. Swaying String ribbon trailing underneath knot
    ctx.save();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, r * 1.2);
    // Quadratic bezier curve swaying with wobble phase
    const stringSway = Math.sin(balloon.wobblePhase) * 12;
    ctx.quadraticCurveTo(stringSway, r * 1.8, stringSway * 0.5, r * 2.6);
    ctx.stroke();
    ctx.restore();

    // 2. Balloon Knot Triangle
    ctx.fillStyle = balloon.color;
    ctx.beginPath();
    ctx.moveTo(-5, r * 1.15);
    ctx.lineTo(5, r * 1.15);
    ctx.lineTo(0, r * 1.28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Oval Balloon Paper Body & Drop Shadow
    ctx.save();
    // Drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
    ctx.beginPath();
    ctx.ellipse(3, 3, r, r * 1.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Construction Paper Main Body
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 1.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = balloon.color;
    ctx.fill();

    // Inked hand-drawn contour
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 4. Paper Cutout Curved Highlight
    ctx.fillStyle = 'rgba(255, 253, 248, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.4, r * 0.2, r * 0.42, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private renderSpikeBomb(ctx: CanvasRenderingContext2D, balloon: Balloon, time: number): void {
    const r = balloon.radius;

    // 1. Spikes around sphere
    const spikeCount = 8;
    const spikeLength = 8;
    const rot = time * 2;

    ctx.save();
    // Spikes drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    for (let i = 0; i < spikeCount; i++) {
      const angle = rot + (i * Math.PI * 2) / spikeCount;
      const x1 = Math.cos(angle - 0.2) * (r - 2) + 3;
      const y1 = Math.sin(angle - 0.2) * (r - 2) + 3;
      const x2 = Math.cos(angle + 0.2) * (r - 2) + 3;
      const y2 = Math.sin(angle + 0.2) * (r - 2) + 3;
      const tipX = Math.cos(angle) * (r + spikeLength) + 3;
      const tipY = Math.sin(angle) * (r + spikeLength) + 3;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.fill();
    }

    // Triangular paper spikes
    ctx.fillStyle = '#E11D48';
    for (let i = 0; i < spikeCount; i++) {
      const angle = rot + (i * Math.PI * 2) / spikeCount;
      const x1 = Math.cos(angle - 0.2) * (r - 2);
      const y1 = Math.sin(angle - 0.2) * (r - 2);
      const x2 = Math.cos(angle + 0.2) * (r - 2);
      const y2 = Math.sin(angle + 0.2) * (r - 2);
      const tipX = Math.cos(angle) * (r + spikeLength);
      const tipY = Math.sin(angle) * (r + spikeLength);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();

    // 2. Papercut Bomb Shell & Drop Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.beginPath();
    ctx.arc(3, 3, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#3E2723';
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 3. Center Paper Warning Dot
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#3E2723';
    ctx.font = 'bold 13px "Comfortaa", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', 0, 0);
    ctx.restore();
  }

  private darkenHex(hex: string, factor: number): string {
    if (hex.startsWith('#') && hex.length === 7) {
      const r = Math.round(parseInt(hex.slice(1, 3), 16) * factor);
      const g = Math.round(parseInt(hex.slice(3, 5), 16) * factor);
      const b = Math.round(parseInt(hex.slice(5, 7), 16) * factor);
      return `rgb(${r}, ${g}, ${b})`;
    }
    return hex;
  }
}
