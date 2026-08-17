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

    // 1. Swaying String trailing underneath knot
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, r * 1.2);
    // Quadratic bezier curve swaying with wobble phase
    const stringSway = Math.sin(balloon.wobblePhase) * 12;
    ctx.quadraticCurveTo(stringSway, r * 1.8, stringSway * 0.5, r * 2.6);
    ctx.stroke();
    ctx.restore();

    // 2. Balloon Knot
    ctx.fillStyle = balloon.color;
    ctx.beginPath();
    ctx.moveTo(-4, r * 1.15);
    ctx.lineTo(4, r * 1.15);
    ctx.lineTo(0, r * 1.25);
    ctx.closePath();
    ctx.fill();

    // 3. Oval Balloon Body
    ctx.save();
    ctx.beginPath();
    // Slightly taller oval
    ctx.ellipse(0, 0, r, r * 1.18, 0, 0, Math.PI * 2);

    if (balloon.type === 'rainbow') {
      // Shifting rainbow gradient
      const grad = ctx.createLinearGradient(-r, -r, r, r);
      const hue = (time * 120) % 360;
      grad.addColorStop(0, `hsl(${hue}, 100%, 65%)`);
      grad.addColorStop(0.33, `hsl(${(hue + 90) % 360}, 100%, 65%)`);
      grad.addColorStop(0.66, `hsl(${(hue + 180) % 360}, 100%, 65%)`);
      grad.addColorStop(1, `hsl(${(hue + 270) % 360}, 100%, 65%)`);
      ctx.fillStyle = grad;
    } else {
      // Radial glow gradient for glossy 3D look
      const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r * 1.2);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.25, balloon.color);
      grad.addColorStop(1.0, this.darkenHex(balloon.color, 0.4));
      ctx.fillStyle = grad;
    }

    ctx.shadowColor = balloon.color;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.restore();

    // 4. Glossy Specular Highlight Crescent
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.35, -r * 0.4, r * 0.25, r * 0.45, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private renderSpikeBomb(ctx: CanvasRenderingContext2D, balloon: Balloon, time: number): void {
    const r = balloon.radius;

    // 1. Spikes around sphere
    const spikeCount = 8;
    const spikeLength = 8;
    const rot = time * 2; // slow continuous rotation

    ctx.save();
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;

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
    }
    ctx.restore();

    // 2. Dark Metallic Shell
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r);
    grad.addColorStop(0, '#475569');
    grad.addColorStop(0.6, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // 3. Pulsing Center Hazard Core
    const pulse = 0.7 + Math.sin(time * 8) * 0.3;
    ctx.save();
    ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 12 * pulse;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Warning Skull / Hazard Exclamation mark
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
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
