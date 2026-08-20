export type FruitType = 'watermelon' | 'orange' | 'banana' | 'strawberry' | 'kiwi' | 'pineapple' | 'apple' | 'dragon_frenzy';

export interface FruitDef {
  type: FruitType;
  name: string;
  radius: number;
  color: string;
  innerColor: string;
  points: number;
}

export const FRUIT_DEFS: Record<FruitType, FruitDef> = {
  watermelon: { type: 'watermelon', name: 'Watermelon', radius: 42, color: '#388E3C', innerColor: '#E53935', points: 10 },
  orange: { type: 'orange', name: 'Orange', radius: 32, color: '#F57C00', innerColor: '#FFA726', points: 15 },
  banana: { type: 'banana', name: 'Banana', radius: 28, color: '#FBC02D', innerColor: '#FFF59D', points: 20 },
  strawberry: { type: 'strawberry', name: 'Strawberry', radius: 24, color: '#D32F2F', innerColor: '#FFCDD2', points: 25 },
  kiwi: { type: 'kiwi', name: 'Kiwi', radius: 26, color: '#689F38', innerColor: '#AED581', points: 25 },
  pineapple: { type: 'pineapple', name: 'Pineapple', radius: 38, color: '#FBC02D', innerColor: '#FFEE58', points: 30 },
  apple: { type: 'apple', name: 'Apple', radius: 30, color: '#C62828', innerColor: '#FFEBEE', points: 15 },
  dragon_frenzy: { type: 'dragon_frenzy', name: 'Golden Dragon Star', radius: 46, color: '#FFD700', innerColor: '#FF1493', points: 100 }
};

export interface FruitItem {
  id: number;
  type: FruitType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  vRot: number;
  sliced: boolean;
  color: string;
  innerColor: string;
  points: number;
}

export interface FruitHalf {
  id: number;
  type: FruitType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  vRot: number;
  sliceAngle: number;
  side: 1 | -1; // 1: right/top half, -1: left/bottom half
  color: string;
  innerColor: string;
  alpha: number;
}

export interface JuiceParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
}

export class FruitPhysics {
  public fruits: FruitItem[] = [];
  public fruitHalves: FruitHalf[] = [];
  public particles: JuiceParticle[] = [];

  public width: number;
  public height: number;
  public gravity: number = 750; // px/s^2

  private nextId: number = 1;
  private maxFruits: number = 25;
  private maxParticles: number = 250;

  constructor(width: number = 800, height: number = 600) {
    this.width = width;
    this.height = height;
  }

  public spawnFruit(
    type?: FruitType,
    x?: number,
    y?: number,
    vx?: number,
    vy?: number
  ): FruitItem {
    if (this.fruits.length >= this.maxFruits) {
      this.fruits.shift();
    }

    const types: FruitType[] = ['watermelon', 'orange', 'banana', 'strawberry', 'kiwi', 'pineapple', 'apple'];
    // 8% chance to spawn special dragon_frenzy star fruit
    const chosenType = type || (Math.random() < 0.08 ? 'dragon_frenzy' : types[Math.floor(Math.random() * types.length)]);
    const def = FRUIT_DEFS[chosenType];

    const posX = x !== undefined ? x : 100 + Math.random() * (this.width - 200);
    const posY = y !== undefined ? y : this.height + 40;
    const velX = vx !== undefined ? vx : (this.width / 2 - posX) * (0.8 + Math.random() * 0.6) + (Math.random() - 0.5) * 80;
    const velY = vy !== undefined ? vy : - (650 + Math.random() * 250);

    const fruit: FruitItem = {
      id: this.nextId++,
      type: chosenType,
      x: posX,
      y: posY,
      vx: velX,
      vy: velY,
      radius: def.radius,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 4,
      sliced: false,
      color: def.color,
      innerColor: def.innerColor,
      points: def.points
    };

    this.fruits.push(fruit);
    return fruit;
  }

  public sliceFruit(fruit: FruitItem, sliceAngle: number): FruitHalf[] {
    if (fruit.sliced) return [];
    fruit.sliced = true;

    // Remove from active fruits list
    this.fruits = this.fruits.filter(f => f.id !== fruit.id);

    // Normal vector perpendicular to slice angle
    const normX = Math.cos(sliceAngle + Math.PI / 2);
    const normY = Math.sin(sliceAngle + Math.PI / 2);
    const separationSpeed = 160 + Math.random() * 80;

    const half1: FruitHalf = {
      id: this.nextId++,
      type: fruit.type,
      x: fruit.x + normX * 8,
      y: fruit.y + normY * 8,
      vx: fruit.vx + normX * separationSpeed,
      vy: fruit.vy + normY * separationSpeed - 50,
      radius: fruit.radius,
      rotation: fruit.rotation,
      vRot: fruit.vRot - 3.5,
      sliceAngle: sliceAngle,
      side: 1,
      color: fruit.color,
      innerColor: fruit.innerColor,
      alpha: 1.0
    };

    const half2: FruitHalf = {
      id: this.nextId++,
      type: fruit.type,
      x: fruit.x - normX * 8,
      y: fruit.y - normY * 8,
      vx: fruit.vx - normX * separationSpeed,
      vy: fruit.vy - normY * separationSpeed - 50,
      radius: fruit.radius,
      rotation: fruit.rotation,
      vRot: fruit.vRot + 3.5,
      sliceAngle: sliceAngle,
      side: -1,
      color: fruit.color,
      innerColor: fruit.innerColor,
      alpha: 1.0
    };

    this.fruitHalves.push(half1, half2);

    // Spawn juice particles
    const particleCount = 14 + Math.floor(Math.random() * 10);
    for (let i = 0; i < particleCount; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }
      const pAngle = sliceAngle + (Math.random() - 0.5) * Math.PI;
      const speed = 80 + Math.random() * 220;
      this.particles.push({
        x: fruit.x + (Math.random() - 0.5) * fruit.radius,
        y: fruit.y + (Math.random() - 0.5) * fruit.radius,
        vx: Math.cos(pAngle) * speed + fruit.vx * 0.2,
        vy: Math.sin(pAngle) * speed + fruit.vy * 0.2,
        radius: 2 + Math.random() * 4,
        color: Math.random() > 0.4 ? fruit.innerColor : fruit.color,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8
      });
    }

    return [half1, half2];
  }

  public update(dt: number): void {
    // Update active fruits
    for (let i = this.fruits.length - 1; i >= 0; i--) {
      const f = this.fruits[i];
      f.vy += this.gravity * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.rotation += f.vRot * dt;

      // Cull if fallen far below screen
      if (f.y > this.height + 120 && f.vy > 0) {
        this.fruits.splice(i, 1);
      }
    }

    // Update halves
    for (let i = this.fruitHalves.length - 1; i >= 0; i--) {
      const h = this.fruitHalves[i];
      h.vy += this.gravity * dt;
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      h.rotation += h.vRot * dt;
      if (h.y > this.height + 150) {
        this.fruitHalves.splice(i, 1);
      }
    }

    // Update juice particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vy += this.gravity * 0.6 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public reset(): void {
    this.fruits = [];
    this.fruitHalves = [];
    this.particles = [];
  }
}
