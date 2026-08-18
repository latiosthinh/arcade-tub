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
    // Render cardboard mounting frame/tray around grid
    const totalW = grid.size * dims.boxSize + (grid.size - 1) * dims.gap;
    const totalH = grid.size * dims.boxSize + (grid.size - 1) * dims.gap;
    const framePad = 18;

    ctx.save();
    // Cardboard tray shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.beginPath();
    ctx.roundRect(dims.startX - framePad + 4, dims.startY - framePad + 4, totalW + framePad * 2, totalH + framePad * 2, 16);
    ctx.fill();

    // Cardboard tray body
    ctx.fillStyle = '#C5A880';
    ctx.beginPath();
    ctx.roundRect(dims.startX - framePad, dims.startY - framePad, totalW + framePad * 2, totalH + framePad * 2, 16);
    ctx.fill();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner stitched contour
    ctx.strokeStyle = 'rgba(62, 39, 35, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.roundRect(dims.startX - framePad + 6, dims.startY - framePad + 6, totalW + (framePad - 6) * 2, totalH + (framePad - 6) * 2, 12);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

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
    const radius = 10;
    const intensity = box.activeIntensity; // 0 to 1

    ctx.save();

    // Active paper pop offset (-2px, -2px)
    const offsetX = intensity > 0.05 ? -2 * intensity : 0;
    const offsetY = intensity > 0.05 ? -2 * intensity : 0;
    const shadowDist = intensity > 0.05 ? 6 + intensity * 3 : (isHovered ? 4 : 3);

    // Box drop shadow
    ctx.fillStyle = 'rgba(62, 39, 35, 0.25)';
    ctx.beginPath();
    ctx.roundRect(x + shadowDist, y + shadowDist, w, h, radius);
    ctx.fill();

    // Box main construction paper body
    ctx.beginPath();
    ctx.roundRect(x + offsetX, y + offsetY, w, h, radius);
    ctx.fillStyle = box.color;
    ctx.fill();

    // Inner paper highlight / active illumination
    if (intensity > 0.05) {
      // White inner cutout glow
      ctx.fillStyle = `rgba(255, 253, 248, ${0.45 * intensity})`;
      ctx.beginPath();
      ctx.roundRect(x + offsetX + 6, y + offsetY + 6, w - 12, h - 12, radius - 2);
      ctx.fill();

      // Top-left shiny paper crease
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * intensity})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + offsetX + 12, y + offsetY + 6);
      ctx.lineTo(x + offsetX + w - 12, y + offsetY + 6);
      ctx.stroke();
    } else if (isHovered) {
      ctx.fillStyle = 'rgba(255, 253, 248, 0.2)';
      ctx.beginPath();
      ctx.roundRect(x + offsetX, y + offsetY, w, h, radius);
      ctx.fill();
    }

    // Inked border
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = intensity > 0.05 ? 3 : 2.5;
    ctx.beginPath();
    ctx.roundRect(x + offsetX, y + offsetY, w, h, radius);
    ctx.stroke();

    // Inner subtle paper stamp icon
    ctx.fillStyle = intensity > 0.1 ? '#FFFDF8' : 'rgba(62, 39, 35, 0.35)';
    ctx.beginPath();
    ctx.arc(x + offsetX + w / 2, y + offsetY + h / 2, 7 + intensity * 4, 0, Math.PI * 2);
    ctx.fill();
    if (intensity > 0.1) {
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }
}
