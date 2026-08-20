export interface StructureBlock {
  id: number;
  x: number; // Top-left X
  y: number; // Top-left Y
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  broken: boolean;
  color: string;
  layer: number;
  vy?: number;
  vx?: number;
}

export interface PaperDebris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  rotation: number;
  vRot: number;
  color: string;
  life: number;
  maxLife: number;
}

export class TargetStructure {
  public blocks: StructureBlock[] = [];
  public debris: PaperDebris[] = [];
  public width: number;
  public height: number;
  public groundY: number = 500;

  private nextBlockId: number = 1;
  private maxDebris: number = 200;

  constructor(width: number = 800, height: number = 600) {
    this.width = width;
    this.height = height;
    this.groundY = height - 100;
  }

  public buildPyramid(baseCenterX: number = 560, baseY: number = 500): void {
    this.blocks = [];
    this.debris = [];
    const blockW = 50;
    const blockH = 45;
    const colors = ['#D7CCC8', '#BCAAA4', '#A1887F', '#8D6E63'];

    // 4-layer pyramid
    const layers = [4, 3, 2, 1];
    let curY = baseY - blockH;

    layers.forEach((count, layerIdx) => {
      const layerStartX = baseCenterX - (count * blockW) / 2;
      for (let i = 0; i < count; i++) {
        this.blocks.push({
          id: this.nextBlockId++,
          x: layerStartX + i * blockW,
          y: curY,
          width: blockW - 2,
          height: blockH - 2,
          health: 40 + layerIdx * 10,
          maxHealth: 40 + layerIdx * 10,
          broken: false,
          color: colors[layerIdx % colors.length],
          layer: layerIdx
        });
      }
      curY -= blockH;
    });
  }

  public buildCastle(baseCenterX: number = 560, baseY: number = 500): void {
    this.blocks = [];
    this.debris = [];
    const blockW = 45;
    const blockH = 40;

    // Left tower, right tower, central arch
    // Towers: 4 blocks high
    for (let h = 0; h < 4; h++) {
      // Left tower
      this.blocks.push({
        id: this.nextBlockId++,
        x: baseCenterX - 110,
        y: baseY - (h + 1) * blockH,
        width: blockW - 2,
        height: blockH - 2,
        health: 35,
        maxHealth: 35,
        broken: false,
        color: '#BCAAA4',
        layer: h
      });
      // Right tower
      this.blocks.push({
        id: this.nextBlockId++,
        x: baseCenterX + 65,
        y: baseY - (h + 1) * blockH,
        width: blockW - 2,
        height: blockH - 2,
        health: 35,
        maxHealth: 35,
        broken: false,
        color: '#BCAAA4',
        layer: h
      });
    }

    // Bridge / arch center
    this.blocks.push({
      id: this.nextBlockId++,
      x: baseCenterX - 65,
      y: baseY - blockH,
      width: blockW - 2,
      height: blockH - 2,
      health: 30,
      maxHealth: 30,
      broken: false,
      color: '#D7CCC8',
      layer: 0
    });
    this.blocks.push({
      id: this.nextBlockId++,
      x: baseCenterX + 20,
      y: baseY - blockH,
      width: blockW - 2,
      height: blockH - 2,
      health: 30,
      maxHealth: 30,
      broken: false,
      color: '#D7CCC8',
      layer: 0
    });
    // Crossbeam top
    this.blocks.push({
      id: this.nextBlockId++,
      x: baseCenterX - 65,
      y: baseY - 2 * blockH,
      width: blockW * 2.8,
      height: blockH * 0.8,
      health: 45,
      maxHealth: 45,
      broken: false,
      color: '#8D6E63',
      layer: 1
    });
  }

  public checkCircleBlockCollision(
    cx: number,
    cy: number,
    radius: number,
    block: StructureBlock
  ): boolean {
    if (block.broken) return false;

    // Find closest point on AABB to circle
    const closestX = Math.max(block.x, Math.min(cx, block.x + block.width));
    const closestY = Math.max(block.y, Math.min(cy, block.y + block.height));

    const distX = cx - closestX;
    const distY = cy - closestY;
    const distSq = distX * distX + distY * distY;

    return distSq <= radius * radius;
  }

  public damageBlock(block: StructureBlock, damage: number): boolean {
    if (block.broken) return false;
    block.health = Math.max(0, block.health - damage);

    if (block.health <= 0) {
      block.broken = true;
      this.spawnDebris(block);
      return true; // Completely broken
    }
    return false;
  }

  public spawnDebris(block: StructureBlock): void {
    const count = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      if (this.debris.length >= this.maxDebris) {
        this.debris.shift();
      }
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 180;
      this.debris.push({
        x: block.x + block.width / 2,
        y: block.y + block.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        width: 6 + Math.random() * 12,
        height: 6 + Math.random() * 12,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 10,
        color: block.color,
        life: 0.6 + Math.random() * 0.5,
        maxLife: 1.1
      });
    }
  }

  public updatePhysics(dt: number): void {
    const gravity = 650;

    // Gravity and collapse for unsupported blocks
    for (let i = 0; i < this.blocks.length; i++) {
      const b = this.blocks[i];
      if (b.broken) continue;

      const isGrounded = (b.y + b.height) >= (this.groundY - 1);
      let hasSupport = isGrounded;

      if (!hasSupport) {
        // Check if any unbroken block directly supports below
        for (let j = 0; j < this.blocks.length; j++) {
          if (i === j) continue;
          const below = this.blocks[j];
          if (below.broken) continue;

          const xOverlap = Math.max(0, Math.min(b.x + b.width, below.x + below.width) - Math.max(b.x, below.x));
          if (xOverlap > 10 && Math.abs(below.y - (b.y + b.height)) < 6) {
            hasSupport = true;
            break;
          }
        }
      }

      if (!hasSupport) {
        b.vy = (b.vy || 0) + gravity * dt;
        b.y += b.vy * dt;
        if (b.y + b.height >= this.groundY) {
          b.y = this.groundY - b.height;
          b.vy = 0;
        }
      } else {
        b.vy = 0;
      }
    }

    // Update debris
    for (let i = this.debris.length - 1; i >= 0; i--) {
      const d = this.debris[i];
      d.vy += gravity * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.rotation += d.vRot * dt;
      d.life -= dt;
      if (d.life <= 0 || d.y > this.height + 50) {
        this.debris.splice(i, 1);
      }
    }
  }

  public getRemainingHealthRatio(): number {
    let total = 0;
    let current = 0;
    for (const b of this.blocks) {
      total += b.maxHealth;
      current += b.health;
    }
    return total === 0 ? 0 : current / total;
  }

  public isAllDestroyed(): boolean {
    return this.blocks.every(b => b.broken);
  }
}
