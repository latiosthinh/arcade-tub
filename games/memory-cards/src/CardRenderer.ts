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

    // Card drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
    this.drawRoundedRect(ctx, -halfW + 3, -halfH + 3, w, h, CardRenderer.CORNER_RADIUS);
    ctx.fill();

    // Card background body (craft card stock)
    ctx.fillStyle = '#FFFDF8';
    this.drawRoundedRect(ctx, -halfW, -halfH, w, h, CardRenderer.CORNER_RADIUS);
    ctx.fill();

    // Inked outer border
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2;
    this.drawRoundedRect(ctx, -halfW, -halfH, w, h, CardRenderer.CORNER_RADIUS);
    ctx.stroke();

    // Cardboard tan inner frame pattern
    ctx.strokeStyle = '#C5A880';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    this.drawRoundedRect(ctx, -halfW + 6, -halfH + 6, w - 12, h - 12, CardRenderer.CORNER_RADIUS - 3);
    ctx.stroke();
    ctx.setLineDash([]);

    // Decorative diamond back pattern
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(22, 0);
    ctx.lineTo(0, 22);
    ctx.lineTo(-22, 0);
    ctx.closePath();
    ctx.fillStyle = '#F4EAD4';
    ctx.fill();
    ctx.stroke();

    // Inner paper star / acorn seal
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1.2;
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

    // Drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.2)';
    this.drawRoundedRect(ctx, -halfW + 3, -halfH + 3, w, h, CardRenderer.CORNER_RADIUS);
    ctx.fill();

    // Face background
    ctx.fillStyle = isMatched ? '#E8DEC8' : '#FFFDF8';
    this.drawRoundedRect(ctx, -halfW, -halfH, w, h, CardRenderer.CORNER_RADIUS);
    ctx.fill();

    // Inner craft dashed border
    ctx.strokeStyle = isMatched ? '#10B981' : 'rgba(62, 39, 35, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    this.drawRoundedRect(ctx, -halfW + 5, -halfH + 5, w - 10, h - 10, CardRenderer.CORNER_RADIUS - 3);
    ctx.stroke();
    ctx.setLineDash([]);

    // Render paper cutout glyph
    this.renderGlyph(ctx, card.glyph as CyberGlyph, isMatched);

    // Outer border
    ctx.strokeStyle = isMatched ? '#10B981' : '#3E2723';
    ctx.lineWidth = isMatched ? 2.5 : 2;
    this.drawRoundedRect(ctx, -halfW, -halfH, w, h, CardRenderer.CORNER_RADIUS);
    ctx.stroke();
  }

  private renderGlyph(ctx: CanvasRenderingContext2D, glyph: CyberGlyph, matched: boolean): void {
    ctx.save();
    const border = '#3E2723';

    switch (glyph) {
      case 'CYBER_CHIP': {
        // Red papercut puzzle tile
        const fill = matched ? '#10B981' : '#E11D48';
        ctx.fillStyle = fill;
        ctx.strokeStyle = border;
        ctx.lineWidth = 2;
        ctx.beginPath();
        this.drawRoundedRect(ctx, -16, -16, 32, 32, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFDF8';
        ctx.fillRect(-6, -6, 12, 12);
        ctx.strokeRect(-6, -6, 12, 12);
        break;
      }

      case 'NEON_SKULL': {
        // Blue paper acorn / leaf
        const fill = matched ? '#10B981' : '#3B82F6';
        ctx.fillStyle = fill;
        ctx.strokeStyle = border;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 4, 14, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#D8C3A5';
        ctx.beginPath();
        ctx.arc(0, -8, 14, Math.PI, 0);
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'QUANTUM_NODE': {
        // Yellow paper sunburst
        const fill = matched ? '#10B981' : '#F59E0B';
        ctx.fillStyle = fill;
        ctx.strokeStyle = border;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * 14, Math.sin(angle) * 14);
          ctx.lineTo(Math.cos(angle) * 22, Math.sin(angle) * 22);
          ctx.stroke();
        }
        break;
      }

      case 'MATRIX_KEY': {
        // Purple paper key
        const fill = matched ? '#10B981' : '#8B5CF6';
        ctx.strokeStyle = border;
        ctx.lineWidth = 2;
        ctx.fillStyle = fill;

        ctx.beginPath();
        ctx.arc(0, -14, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFDF8';
        ctx.beginPath();
        ctx.arc(0, -14, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

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
        // Pink paper flower blossom
        const fill = matched ? '#10B981' : '#EC4899';
        ctx.fillStyle = fill;
        ctx.strokeStyle = border;
        ctx.lineWidth = 1.5;

        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5;
          ctx.beginPath();
          ctx.arc(Math.cos(angle) * 12, Math.sin(angle) * 12, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'DATA_ORB': {
        // Orange paper apple
        const fill = matched ? '#10B981' : '#F97316';
        ctx.fillStyle = fill;
        ctx.strokeStyle = border;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 4, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.ellipse(3, -12, 6, 3, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'WARP_GATE': {
        // Yellow-Orange 5-point paper star
        const fill = matched ? '#10B981' : '#F59E0B';
        ctx.fillStyle = fill;
        ctx.strokeStyle = border;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a1 = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const a2 = a1 + Math.PI / 5;
          const r1 = 20;
          const r2 = 9;
          if (i === 0) ctx.moveTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
          else ctx.lineTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
          ctx.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'BIO_HAZARD': {
        // Green 3-leaf clover
        const fill = matched ? '#3B82F6' : '#10B981';
        const r = 9;
        const dist = 8;
        ctx.fillStyle = fill;
        ctx.strokeStyle = border;
        ctx.lineWidth = 1.5;

        for (let i = 0; i < 3; i++) {
          const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
          const cx = Math.cos(angle) * dist;
          const cy = Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.lineTo(0, 20);
        ctx.stroke();
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
