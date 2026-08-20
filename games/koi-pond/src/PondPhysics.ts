export type FishColorType = 'coral' | 'gold' | 'white' | 'black' | 'blue';

export interface FishColorDef {
  type: FishColorType;
  name: string;
  body: string;
  fin: string;
  foodColor: string;
}

export const KOI_COLORS: FishColorDef[] = [
  { type: 'coral', name: 'Coral Koi', body: '#FF7675', fin: '#FAB1A0', foodColor: '#FF7675' },
  { type: 'gold', name: 'Golden Koi', body: '#FFA502', fin: '#FFEAA7', foodColor: '#FFA502' },
  { type: 'white', name: 'Tancho Koi', body: '#FFFFFF', fin: '#E17055', foodColor: '#F8FAFC' },
  { type: 'black', name: 'Ink Koi', body: '#2D3436', fin: '#636E72', foodColor: '#2D3436' },
  { type: 'blue', name: 'Dragon Koi', body: '#0984E3', fin: '#74B9FF', foodColor: '#0984E3' }
];

export interface Fish {
  id: number;
  colorType: FishColorType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  angle: number;
  targetAngle: number;
  length: number;
  color: string;
  finColor: string;
  tailWag: number;
  scaredTimer: number;
}

export interface FoodPellet {
  id: number;
  x: number;
  y: number;
  colorType: FishColorType;
  color: string;
  radius: number;
  alpha: number;
  eaten: boolean;
}

export interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export class PondPhysics {
  public width: number;
  public height: number;
  public fishes: Fish[] = [];
  public foods: FoodPellet[] = [];
  public ripples: Ripple[] = [];
  private nextId: number = 1;

  constructor(width: number = 800, height: number = 600) {
    this.width = width;
    this.height = height;

    for (let i = 0; i < 8; i++) {
      const c = KOI_COLORS[i % KOI_COLORS.length];
      this.fishes.push({
        id: this.nextId++,
        colorType: c.type,
        x: Math.random() * (width - 160) + 80,
        y: Math.random() * (height - 160) + 80,
        vx: (Math.random() - 0.5) * 60,
        vy: (Math.random() - 0.5) * 60,
        speed: 55 + Math.random() * 25,
        angle: Math.random() * Math.PI * 2,
        targetAngle: Math.random() * Math.PI * 2,
        length: 32 + Math.random() * 14,
        color: c.body,
        finColor: c.fin,
        tailWag: Math.random() * Math.PI * 2,
        scaredTimer: 0
      });
    }
  }

  public addRipple(x: number, y: number, isFood: boolean = false, rippleColor?: string): void {
    this.ripples.push({
      x,
      y,
      radius: 4,
      maxRadius: isFood ? 40 : 75,
      alpha: 0.85,
      color: rippleColor ?? (isFood ? '#F39C12' : '#74B9FF')
    });
  }

  public dropFood(x: number, y: number, specificColor?: FishColorType): FoodPellet {
    const randomDef = KOI_COLORS[Math.floor(Math.random() * KOI_COLORS.length)];
    const chosenDef = specificColor
      ? (KOI_COLORS.find(c => c.type === specificColor) || randomDef)
      : randomDef;

    const food: FoodPellet = {
      id: this.nextId++,
      x,
      y,
      colorType: chosenDef.type,
      color: chosenDef.foodColor,
      radius: 5,
      alpha: 1.0,
      eaten: false
    };
    this.foods.push(food);
    this.addRipple(x, y, true, chosenDef.foodColor);
    return food;
  }

  public tapWater(x: number, y: number): void {
    this.addRipple(x, y, false);
    // Scare fishes away from tap point
    for (const f of this.fishes) {
      const dx = f.x - x;
      const dy = f.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist < 180) {
        f.scaredTimer = 2.0;
        f.targetAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.4;
        f.speed = 180; // Burst dash
      }
    }
  }

  public update(dt: number): void {
    // 1. Update ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += dt * 45;
      r.alpha = Math.max(0, 1 - r.radius / r.maxRadius);
      if (r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
      }
    }

    // 2. Update food items
    this.foods = this.foods.filter(f => !f.eaten);

    // 3. Update fish movements and AI
    for (const f of this.fishes) {
      f.tailWag += dt * (f.speed * 0.12);

      if (f.scaredTimer > 0) {
        f.scaredTimer -= dt;
        if (f.scaredTimer <= 0) {
          f.speed = 55 + Math.random() * 25;
        }
      } else if (this.foods.length > 0) {
        // Koi only seeks food matching its own color type!
        let matchingFood: FoodPellet | null = null;
        let minDist = Infinity;
        for (const food of this.foods) {
          if (food.colorType !== f.colorType) continue;
          const d = Math.hypot(food.x - f.x, food.y - f.y);
          if (d < minDist) {
            minDist = d;
            matchingFood = food;
          }
        }

        if (matchingFood && minDist < 450) {
          f.targetAngle = Math.atan2(matchingFood.y - f.y, matchingFood.x - f.x);
          f.speed = 120;

          // Eat matching food pellet if reached
          if (minDist < f.length * 0.5 + matchingFood.radius + 6) {
            matchingFood.eaten = true;
            this.addRipple(matchingFood.x, matchingFood.y, true, f.color);
            f.speed = 45; // Relaxes after eating
          }
        }
      } else {
        // Gentle wander
        if (Math.random() < 0.02) {
          f.targetAngle += (Math.random() - 0.5) * 1.5;
        }
      }

      // Smooth angle interpolation
      let angleDiff = f.targetAngle - f.angle;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      f.angle += angleDiff * Math.min(1, 4.5 * dt);

      // Advance fish position
      f.vx = Math.cos(f.angle) * f.speed;
      f.vy = Math.sin(f.angle) * f.speed;
      f.x += f.vx * dt;
      f.y += f.vy * dt;

      // Soft bounce within pond boundaries
      const pad = f.length + 10;
      if (f.x < pad) {
        f.x = pad;
        f.targetAngle = Math.PI - f.targetAngle;
      } else if (f.x > this.width - pad) {
        f.x = this.width - pad;
        f.targetAngle = Math.PI - f.targetAngle;
      }
      if (f.y < pad) {
        f.y = pad;
        f.targetAngle = -f.targetAngle;
      } else if (f.y > this.height - pad) {
        f.y = this.height - pad;
        f.targetAngle = -f.targetAngle;
      }
    }
  }
}
