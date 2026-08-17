import type { Card, CyberGlyph } from './CardGrid.js';

export interface GridDimensions {
  startX: number;
  startY: number;
  cardWidth: number;
  cardHeight: number;
  gap: number;
}

export class CardRenderer {
  public static readonly CARD_WIDTH = 110;
  public static readonly CARD_HEIGHT = 120;
  public static readonly CARD_GAP = 14;
  public static readonly CORNER_RADIUS = 10;

  public static getGridDimensions(canvasWidth: number, canvasHeight: number): GridDimensions {
    const totalW = 4 * CardRenderer.CARD_WIDTH + 3 * CardRenderer.CARD_GAP;
    const totalH = 4 * CardRenderer.CARD_HEIGHT + 3 * CardRenderer.CARD_GAP;
    const startX = (canvasWidth - totalW) / 2;
    const startY = 70 + (canvasHeight - 90 - totalH) / 2;
    return {
      startX,
      startY,
      cardWidth: CardRenderer.CARD_WIDTH,
      cardHeight: CardRenderer.CARD_HEIGHT,
      gap: CardRenderer.CARD_GAP,
    };
  }

  public static getCardBounds(
    card: Card,
    dims: GridDimensions,
  ): { x: number; y: number; w: number; h: number } {
    return {
      x: dims.startX + card.col * (dims.cardWidth + dims.gap),
      y: dims.startY + card.row * (dims.cardHeight + dims.gap),
      w: dims.cardWidth,
      h: dims.cardHeight,
    };
  }

  public renderCard(ctx: CanvasRenderingContext2D, card: Card, dims: GridDimensions): void {
    const bounds = CardRenderer.getCardBounds(card, dims);
    const centerX = bounds.x + bounds.w / 2;
    const centerY = bounds.y + bounds.h / 2;

    const flipProgress = card.flipProgress;
    // 3D perspective scale calculation along horizontal axis
    const scaleX = Math.abs(Math.cos(flipProgress * Math.PI));
    const showFront = flipProgress >= 0.5;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(Math.max(0.02, scaleX), 1);

    if (showFront) {
      this.renderCardFront(ctx, bounds.w, bounds.h, card);
    } else {
      this.renderCardBack(ctx, bounds.w, bounds.h);
    }

    ctx.restore();
  }

  private renderCardBack(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
  ): void {
    const halfW = w / 2;
    const halfH = h / 2;

    // Card background body
    ctx.fillStyle = '#0f172a';
    this.drawRoundedRect(ctx, -halfW, -halfH, w, h, CardRenderer.CORNER_RADIUS);
    ctx.fill();

    // Subtle dark gradient
    const grad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
    grad.addColorStop(0, 'rgba(30, 41, 59, 0.9)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
    ctx.fillStyle = grad;
    this.drawRoundedRect(ctx, -halfW, -halfH, w, h, CardRenderer.CORNER_RADIUS);
    ctx.fill();

    // Cyber circuit grid lines on back
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-halfW + 15, -halfH + 15);
    ctx.lineTo(halfW - 15, halfH - 15);
    ctx.moveTo(halfW - 15, -halfH + 15);
    ctx.lineTo(-halfW + 15, halfH - 15);
    ctx.stroke();

    // Glowing center diamond
    ctx.strokeStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(18, 0);
    ctx.lineTo(0, 18);
    ctx.lineTo(-18, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Holographic corner brackets
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    const bracketSize = 10;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(-halfW + 8, -halfH + 8 + bracketSize);
    ctx.lineTo(-halfW + 8, -halfH + 8);
    ctx.lineTo(-halfW + 8 + bracketSize, -halfH + 8);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(halfW - 8 - bracketSize, -halfH + 8);
    ctx.lineTo(halfW - 8, -halfH + 8);
    ctx.lineTo(halfW - 8, -halfH + 8 + bracketSize);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(-halfW + 8, halfH - 8 - bracketSize);
    ctx.lineTo(-halfW + 8, halfH - 8);
    ctx.lineTo(-halfW + 8 + bracketSize, halfH - 8);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(halfW - 8 - bracketSize, halfH - 8);
    ctx.lineTo(halfW - 8, halfH - 8);
    ctx.lineTo(halfW - 8, halfH - 8 - bracketSize);
    ctx.stroke();

    // Outer border
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    this.drawRoundedRect(ctx, -halfW, -halfH, w, h, CardRenderer.CORNER_RADIUS);
    ctx.stroke();
  }

  private renderCardFront(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    card: Card,
  ): void {
    const halfW = w / 2;
    const halfH = h / 2;
    const isMatched = card.state === 'matched';

    // Face background
    const bgGrad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
    if (isMatched) {
      bgGrad.addColorStop(0, '#1e1b4b');
      bgGrad.addColorStop(1, '#090a16');
    } else {
      bgGrad.addColorStop(0, '#1e293b');
      bgGrad.addColorStop(1, '#0f172a');
    }
    ctx.fillStyle = bgGrad;
    this.drawRoundedRect(ctx, -halfW, -halfH, w, h, CardRenderer.CORNER_RADIUS);
    ctx.fill();

    // Render cyber glyph
    this.renderGlyph(ctx, card.glyph as CyberGlyph, isMatched);

    // Border glow
    if (isMatched) {
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
    } else {
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
    }

    this.drawRoundedRect(ctx, -halfW, -halfH, w, h, CardRenderer.CORNER_RADIUS);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  private renderGlyph(ctx: CanvasRenderingContext2D, glyph: CyberGlyph, matched: boolean): void {
    ctx.save();
    const primaryColor = matched ? '#fbbf24' : '#00f0ff';
    const secondaryColor = matched ? '#fef08a' : '#ec4899';

    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = primaryColor;
    ctx.fillStyle = primaryColor;
    ctx.lineWidth = 2.5;

    switch (glyph) {
      case 'CYBER_CHIP': {
        // Central chip square
        ctx.strokeRect(-16, -16, 32, 32);
        ctx.fillStyle = secondaryColor;
        ctx.fillRect(-8, -8, 16, 16);
        // Microchip trace pins
        ctx.beginPath();
        // Top pins
        ctx.moveTo(-10, -16); ctx.lineTo(-10, -26);
        ctx.moveTo(0, -16); ctx.lineTo(0, -26);
        ctx.moveTo(10, -16); ctx.lineTo(10, -26);
        // Bottom pins
        ctx.moveTo(-10, 16); ctx.lineTo(-10, 26);
        ctx.moveTo(0, 16); ctx.lineTo(0, 26);
        ctx.moveTo(10, 16); ctx.lineTo(10, 26);
        // Left pins
        ctx.moveTo(-16, -10); ctx.lineTo(-26, -10);
        ctx.moveTo(-16, 0); ctx.lineTo(-26, 0);
        ctx.moveTo(-16, 10); ctx.lineTo(-26, 10);
        // Right pins
        ctx.moveTo(16, -10); ctx.lineTo(26, -10);
        ctx.moveTo(16, 0); ctx.lineTo(26, 0);
        ctx.moveTo(16, 10); ctx.lineTo(26, 10);
        ctx.stroke();
        break;
      }

      case 'NEON_SKULL': {
        // Cranium
        ctx.beginPath();
        ctx.arc(0, -6, 20, Math.PI, 0, false);
        ctx.lineTo(12, 14);
        ctx.lineTo(-12, 14);
        ctx.closePath();
        ctx.stroke();
        // Eye sockets
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.arc(-7, -4, 4.5, 0, Math.PI * 2);
        ctx.arc(7, -4, 4.5, 0, Math.PI * 2);
        ctx.fill();
        // Teeth slits
        ctx.beginPath();
        ctx.moveTo(-6, 8); ctx.lineTo(-6, 14);
        ctx.moveTo(0, 8); ctx.lineTo(0, 14);
        ctx.moveTo(6, 8); ctx.lineTo(6, 14);
        ctx.stroke();
        break;
      }

      case 'QUANTUM_NODE': {
        // Central nucleus
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        // Orbital ellipse 1
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 9, Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();
        // Orbital ellipse 2
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 9, -Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'MATRIX_KEY': {
        // Key bow
        ctx.beginPath();
        ctx.arc(0, -14, 12, 0, Math.PI * 2);
        ctx.stroke();
        // Inner key cutout
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.arc(0, -14, 4, 0, Math.PI * 2);
        ctx.fill();
        // Key shaft & bit
        ctx.beginPath();
        ctx.moveTo(0, -2);
        ctx.lineTo(0, 24);
        ctx.moveTo(0, 14);
        ctx.lineTo(10, 14);
        ctx.moveTo(0, 20);
        ctx.lineTo(8, 20);
        ctx.stroke();
        break;
      }

      case 'CIRCUIT_CORE': {
        // Hexagonal power core
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const hx = Math.cos(angle) * 22;
          const hy = Math.sin(angle) * 22;
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();

        // Radiating spokes
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          ctx.moveTo(Math.cos(angle) * 7, Math.sin(angle) * 7);
          ctx.lineTo(Math.cos(angle) * 20, Math.sin(angle) * 20);
        }
        ctx.stroke();
        break;
      }

      case 'DATA_ORB': {
        // Concentric energetic ring orb
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = secondaryColor;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'WARP_GATE': {
        // Dual spiral hyper-jump ring
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 12, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = secondaryColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 24, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'BIO_HAZARD': {
        // Bio hazard 3-ring emblem
        const r = 12;
        const dist = 10;
        for (let i = 0; i < 3; i++) {
          const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
          const cx = Math.cos(angle) * dist;
          const cy = Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = secondaryColor;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }

    ctx.restore();
  }

  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
