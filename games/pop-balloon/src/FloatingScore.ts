export interface FloatingScoreItem {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  lifetime: number;
  duration: number;
}

export class FloatingScoreManager {
  private items: FloatingScoreItem[] = [];
  private maxItems: number;

  constructor(maxItems = 25) {
    this.maxItems = maxItems;
  }

  getCount(): number {
    return this.items.length;
  }

  getItems(): FloatingScoreItem[] {
    return this.items;
  }

  spawn(x: number, y: number, text: string, color = '#ffffff', scale = 1.0, duration = 0.8): void {
    if (this.items.length >= this.maxItems) {
      this.items.shift();
    }

    this.items.push({
      x,
      y,
      text,
      color,
      alpha: 1.0,
      scale,
      lifetime: 0,
      duration,
    });
  }

  update(dt: number): void {
    const alive: FloatingScoreItem[] = [];

    for (const item of this.items) {
      item.lifetime += dt;
      if (item.lifetime >= item.duration) continue;

      const progress = item.lifetime / item.duration;
      item.y -= 50 * dt; // float upwards
      item.alpha = 1.0 - progress * progress; // ease fade out

      alive.push(item);
    }

    this.items = alive;
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const item of this.items) {
      ctx.globalAlpha = item.alpha;
      const fontSize = Math.round(18 * item.scale);
      ctx.font = `900 ${fontSize}px 'Segoe UI', system-ui, sans-serif`;

      // Text glow outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(item.text, item.x, item.y);

      ctx.fillStyle = item.color;
      ctx.fillText(item.text, item.x, item.y);
    }
    ctx.restore();
  }

  clear(): void {
    this.items = [];
  }
}
