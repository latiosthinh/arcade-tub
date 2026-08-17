import { Box, BoxGrid } from './BoxGrid.js';

export interface GridDimensions {
  startX: number;
  startY: number;
  boxSize: number;
  gap: number;
}

export interface BoxBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class BoxRenderer {
  public getGridDimensions(canvasWidth: number, canvasHeight: number, gridSize: number = 3): GridDimensions {
    const boxSize = Math.min(120, Math.floor((canvasHeight - 160) / gridSize));
    const gap = 16;
    const totalGridWidth = gridSize * boxSize + (gridSize - 1) * gap;
    const totalGridHeight = gridSize * boxSize + (gridSize - 1) * gap;

    const startX = Math.floor((canvasWidth - totalGridWidth) / 2);
    const startY = Math.floor((canvasHeight - totalGridHeight) / 2) + 20;

    return { startX, startY, boxSize, gap };
  }

  public getBoxBounds(box: Box, dims: GridDimensions): BoxBounds {
    const x = dims.startX + box.col * (dims.boxSize + dims.gap);
    const y = dims.startY + box.row * (dims.boxSize + dims.gap);
    return { x, y, w: dims.boxSize, h: dims.boxSize };
  }

  public render(
    ctx: CanvasRenderingContext2D,
    grid: BoxGrid,
    dims: GridDimensions,
    hoveredBoxId: number | null = null
  ): void {
    for (const box of grid.boxes) {
      const bounds = this.getBoxBounds(box, dims);
      const isHovered = hoveredBoxId === box.id;
      this.renderBox(ctx, box, bounds, isHovered);
    }
  }

  public renderBox(
    ctx: CanvasRenderingContext2D,
    box: Box,
    bounds: BoxBounds,
    isHovered = false
  ): void {
    const { x, y, w, h } = bounds;
    const radius = 12;
    const intensity = box.activeIntensity; // 0 to 1

    ctx.save();

    // Box base path
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);

    // Dynamic glow effects based on active state
    if (intensity > 0.05) {
      ctx.shadowColor = box.color;
      ctx.shadowBlur = 15 + intensity * 25;
      ctx.fillStyle = box.color;
      ctx.globalAlpha = 0.3 + intensity * 0.7;
      ctx.fill();

      // Bright inner core highlight
      const grad = ctx.createRadialGradient(
        x + w / 2,
        y + h / 2,
        w * 0.1,
        x + w / 2,
        y + h / 2,
        w * 0.7
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, box.color);
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.8)');

      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.5 + intensity * 0.5;
      ctx.fill();

      // Border outline
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3 + intensity * 2;
      ctx.globalAlpha = 0.9;
      ctx.stroke();
    } else {
      // Idle cyber box state
      ctx.shadowColor = isHovered ? box.color : 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = isHovered ? 12 : 6;
      ctx.fillStyle = isHovered ? '#1e293b' : '#0f172a';
      ctx.globalAlpha = 0.95;
      ctx.fill();

      // Neon outline
      ctx.strokeStyle = box.color;
      ctx.lineWidth = isHovered ? 2.5 : 1.5;
      ctx.globalAlpha = isHovered ? 0.9 : 0.45;
      ctx.stroke();
    }

    // Inner subtle icon/indicator glyph
    ctx.globalAlpha = intensity > 0.1 ? 0.9 : 0.35;
    ctx.fillStyle = intensity > 0.1 ? '#ffffff' : box.color;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, 6 + intensity * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
