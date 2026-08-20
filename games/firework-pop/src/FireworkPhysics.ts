export type FireworkType = 'ring' | 'willow' | 'heart' | 'crackle' | 'double-ring';

export interface Rocket {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  type: FireworkType;
  hue: number;
  trailTimer: number;
}

export interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
  size: number;
  life: number;
  maxLife: number;
  drag: number;
  gravity: number;
  shape: 'dot' | 'sparkle' | 'streamer';
  crackle?: boolean;
}

export class FireworkPhysics {
  private width: number;
  private height: number;
  private rockets: Rocket[] = [];
  private sparks: Spark[] = [];
  private nextId: number = 1;
  private readonly maxSparks: number = 350; // Cap particle buffer size (T-42-01)

  constructor(width: number = 800, height: number = 600) {
    this.width = width;
    this.height = height;
  }

  public launchRocket(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    type: FireworkType = 'ring',
    hue?: number
  ): void {
    const chosenHue = hue !== undefined ? hue : Math.floor(Math.random() * 360);
    const dy = targetY - startY;
    const dx = targetX - startX;
    const distance = Math.hypot(dx, dy);
    
    // Constant speed flight towards target
    const speed = 450;
    const duration = Math.max(0.1, distance / speed);
    const vx = dx / duration;
    const vy = dy / duration;

    this.rockets.push({
      id: this.nextId++,
      x: startX,
      y: startY,
      vx,
      vy,
      targetY,
      type,
      hue: chosenHue,
      trailTimer: 0
    });
  }

  public explode(x: number, y: number, type: FireworkType = 'ring', hue: number = 60): void {
    let count = 45;
    let baseSpeed = 160;

    if (type === 'ring') {
      count = 50;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const speed = baseSpeed + (Math.random() * 20 - 10);
        this.addSpark({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          hue: (hue + Math.random() * 20) % 360,
          size: 3.5,
          life: 1.0,
          maxLife: 1.0 + Math.random() * 0.3,
          drag: 0.94,
          gravity: 40,
          shape: 'sparkle'
        });
      }
    } else if (type === 'double-ring') {
      count = 60;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const isOuter = i % 2 === 0;
        const speed = isOuter ? baseSpeed * 1.2 : baseSpeed * 0.7;
        this.addSpark({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          hue: isOuter ? hue : (hue + 180) % 360,
          size: isOuter ? 4 : 2.5,
          life: 1.0,
          maxLife: 1.1,
          drag: 0.93,
          gravity: 35,
          shape: 'sparkle'
        });
      }
    } else if (type === 'willow') {
      count = 55;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 0.8 + 0.2) * baseSpeed * 1.3;
        this.addSpark({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          hue: 45 + Math.random() * 15, // Golden willow
          size: 2.5,
          life: 1.0,
          maxLife: 1.6 + Math.random() * 0.4,
          drag: 0.92,
          gravity: 80,
          shape: 'streamer'
        });
      }
    } else if (type === 'heart') {
      count = 48;
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        // Heart curve parametric formula
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const speedScale = 7.5;
        this.addSpark({
          x,
          y,
          vx: hx * speedScale,
          vy: hy * speedScale,
          hue: (330 + Math.random() * 30) % 360, // Pink/Red
          size: 3.5,
          life: 1.0,
          maxLife: 1.2,
          drag: 0.94,
          gravity: 30,
          shape: 'sparkle'
        });
      }
    } else if (type === 'crackle') {
      count = 45;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 0.9 + 0.3) * baseSpeed;
        this.addSpark({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          hue: Math.random() * 360,
          size: 3,
          life: 1.0,
          maxLife: 0.8 + Math.random() * 0.4,
          drag: 0.90,
          gravity: 45,
          shape: 'dot',
          crackle: true
        });
      }
    }
  }

  private addSpark(spark: Spark): void {
    if (this.sparks.length >= this.maxSparks) {
      // Evict oldest spark to maintain hard memory ceiling (T-42-01)
      this.sparks.shift();
    }
    this.sparks.push(spark);
  }

  public update(dt: number): void {
    // 1. Update active rockets
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.x += r.vx * dt;
      r.y += r.vy * dt;

      // Rocket ascent trail
      r.trailTimer += dt;
      if (r.trailTimer >= 0.03) {
        r.trailTimer = 0;
        this.addSpark({
          x: r.x + (Math.random() * 4 - 2),
          y: r.y + (Math.random() * 4 - 2),
          vx: Math.random() * 20 - 10,
          vy: Math.random() * 20 + 10,
          hue: 40,
          size: 2,
          life: 1.0,
          maxLife: 0.25,
          drag: 0.9,
          gravity: 20,
          shape: 'dot'
        });
      }

      // Check if rocket reached or passed target apex
      if ((r.vy < 0 && r.y <= r.targetY) || (r.vy > 0 && r.y >= r.targetY)) {
        this.explode(r.x, r.targetY, r.type, r.hue);
        this.rockets.splice(i, 1);
      }
    }

    // 2. Update burst sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.life -= dt / s.maxLife;

      if (s.life <= 0 || s.y > this.height + 50 || s.x < -50 || s.x > this.width + 50) {
        this.sparks.splice(i, 1);
        continue;
      }

      s.vx *= Math.pow(s.drag, dt * 60);
      s.vy *= Math.pow(s.drag, dt * 60);
      s.vy += s.gravity * dt;

      s.x += s.vx * dt;
      s.y += s.vy * dt;
    }
  }

  public getRockets(): Rocket[] {
    return this.rockets;
  }

  public getSparks(): Spark[] {
    return this.sparks;
  }

  public clearAll(): void {
    this.rockets = [];
    this.sparks = [];
  }
}
