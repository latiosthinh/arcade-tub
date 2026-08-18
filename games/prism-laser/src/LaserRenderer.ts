import { BoardPiece, BeamSegment, BeamColor } from './OpticsEngine.js';

export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 600;

export class LaserRenderer {
  private boardPadding = 40;
  private headerHeight = 70;

  getGridGeometry(rows: number, cols: number): {
    startX: number;
    startY: number;
    cellSize: number;
    gridWidth: number;
    gridHeight: number;
  } {
    const availableWidth = CANVAS_WIDTH - this.boardPadding * 2;
    const availableHeight = CANVAS_HEIGHT - this.headerHeight - this.boardPadding * 2;
    const cellSize = Math.min(availableWidth / cols, availableHeight / rows);

    const gridWidth = cellSize * cols;
    const gridHeight = cellSize * rows;
    const startX = (CANVAS_WIDTH - gridWidth) / 2;
    const startY = this.headerHeight + (availableHeight - gridHeight) / 2;

    return { startX, startY, cellSize, gridWidth, gridHeight };
  }

  renderBoard(ctx: CanvasRenderingContext2D, rows: number, cols: number): void {
    // 1. Iridescent Parchment Board Background
    const bgGrad = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      50,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      380
    );
    bgGrad.addColorStop(0, '#2C2738');
    bgGrad.addColorStop(0.7, '#1B1724');
    bgGrad.addColorStop(1, '#0F0D15');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const { startX, startY, cellSize, gridWidth, gridHeight } = this.getGridGeometry(rows, cols);

    // Board Cardstock Mat
    ctx.fillStyle = '#221D2E';
    ctx.fillRect(startX - 12, startY - 12, gridWidth + 24, gridHeight + 24);
    ctx.strokeStyle = '#4A3E5E';
    ctx.lineWidth = 3;
    ctx.strokeRect(startX - 12, startY - 12, gridWidth + 24, gridHeight + 24);

    // Draw Grid Cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * cellSize;
        const y = startY + r * cellSize;

        ctx.fillStyle = (r + c) % 2 === 0 ? '#2E273E' : '#262033';
        ctx.fillRect(x, y, cellSize, cellSize);

        ctx.strokeStyle = '#3C3350';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, cellSize, cellSize);

        // Center peg hole
        ctx.fillStyle = '#1A1523';
        ctx.beginPath();
        ctx.arc(x + cellSize / 2, y + cellSize / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private getColorHex(color: BeamColor): string {
    switch (color) {
      case 'red': return '#FF3366';
      case 'green': return '#33FF77';
      case 'blue': return '#3399FF';
      case 'yellow': return '#FFCC00';
      case 'magenta': return '#FF33CC';
      case 'cyan': return '#00FFFF';
      case 'white':
      default:
        return '#FFFDF8';
    }
  }

  renderBeams(ctx: CanvasRenderingContext2D, segments: BeamSegment[], rows: number, cols: number): void {
    const { startX, startY, cellSize } = this.getGridGeometry(rows, cols);

    ctx.save();
    for (const seg of segments) {
      const x1 = startX + seg.startCol * cellSize + cellSize / 2;
      const y1 = startY + seg.startRow * cellSize + cellSize / 2;
      const x2 = startX + seg.endCol * cellSize + cellSize / 2;
      const y2 = startY + seg.endRow * cellSize + cellSize / 2;

      const hex = this.getColorHex(seg.color);

      // Outer Laser Glow
      ctx.strokeStyle = hex;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Sharp Laser Core Beam
      ctx.globalAlpha = 0.95;
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FFFDF8';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  renderPieces(ctx: CanvasRenderingContext2D, pieces: BoardPiece[], rows: number, cols: number): void {
    const { startX, startY, cellSize } = this.getGridGeometry(rows, cols);

    for (const p of pieces) {
      const cx = startX + p.col * cellSize + cellSize / 2;
      const cy = startY + p.row * cellSize + cellSize / 2;
      const r = cellSize * 0.38;

      ctx.save();
      ctx.translate(cx, cy);

      if (p.type === 'emitter') {
        // Origami Laser Emitter
        ctx.fillStyle = '#4A5568';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Laser Diode Lens
        ctx.fillStyle = this.getColorHex(p.color ?? 'white');
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Directional pointer nozzle
        const angle =
          p.direction === 'UP' ? -Math.PI / 2 : p.direction === 'DOWN' ? Math.PI / 2 : p.direction === 'LEFT' ? Math.PI : 0;
        ctx.rotate(angle);
        ctx.fillStyle = '#FAF6EE';
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(r - 8, -6);
        ctx.lineTo(r - 8, 6);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'mirror') {
        // Angled Cardstock Mirror Reflector
        const angleRad = ((p.angle ?? 0) * Math.PI) / 180;
        ctx.rotate(angleRad);

        // Mirror backing block
        ctx.fillStyle = '#8B5CF6';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Shiny reflective foil slash (45-degree angle line)
        ctx.strokeStyle = '#E0E7FF';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-r * 0.7, r * 0.7);
        ctx.lineTo(r * 0.7, -r * 0.7);
        ctx.stroke();

        // Rotation Hint Icon if Rotatable
        if (p.rotatable) {
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (p.type === 'target') {
        // Glowing Iridescent Target Crystal
        const targetColor = this.getColorHex(p.color ?? 'white');

        ctx.fillStyle = p.activated ? targetColor : '#374151';
        ctx.beginPath();
        // Diamond Crystal Shape
        ctx.moveTo(0, -r);
        ctx.lineTo(r, 0);
        ctx.lineTo(0, r);
        ctx.lineTo(-r, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        if (p.activated) {
          // Glow Flare
          ctx.fillStyle = '#FFFDF8';
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (p.type === 'prism') {
        // Triangular Glass Prism
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r * 0.9, r * 0.8);
        ctx.lineTo(-r * 0.9, r * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Iridescent rainbow foil core
        ctx.fillStyle = '#FF3366';
        ctx.fillRect(-6, 2, 4, 10);
        ctx.fillStyle = '#33FF77';
        ctx.fillRect(-2, 2, 4, 10);
        ctx.fillStyle = '#3399FF';
        ctx.fillRect(2, 2, 4, 10);
      } else if (p.type === 'filter') {
        // Color Filter Slide
        ctx.fillStyle = this.getColorHex(p.color ?? 'red');
        ctx.globalAlpha = 0.85;
        ctx.fillRect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6);
        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6);
      } else if (p.type === 'blocker') {
        // Cardboard obstacle
        ctx.fillStyle = '#78350F';
        ctx.fillRect(-r * 0.75, -r * 0.75, r * 1.5, r * 1.5);
        ctx.strokeStyle = '#2B2118';
        ctx.lineWidth = 2;
        ctx.strokeRect(-r * 0.75, -r * 0.75, r * 1.5, r * 1.5);
      }

      ctx.restore();
    }
  }
}
