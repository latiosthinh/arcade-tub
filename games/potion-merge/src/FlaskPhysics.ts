import { POTION_TIERS } from './GameState.js';

export interface PotionBody {
  id: number;
  tier: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  settled: boolean;
  markedForRemoval: boolean;
  spawnAnimation: number; // 0..1 scale
}

export class FlaskPhysics {
  public potions: PotionBody[] = [];
  public gravity: number = 980; // px/s^2
  public restitution: number = 0.2; // slight paper bounciness
  public friction: number = 0.98; // linear air/ground drag
  private nextId: number = 1;

  // Flask vessel bounding box
  public readonly flaskLeft: number = 220;
  public readonly flaskRight: number = 580;
  public readonly flaskBottom: number = 550;
  public readonly dangerCeilingY: number = 140;

  public addPotion(x: number, y: number, tier: number, vx: number = 0, vy: number = 0): PotionBody {
    const tierDef = POTION_TIERS[tier - 1] || POTION_TIERS[POTION_TIERS.length - 1];
    const clampedX = Math.max(this.flaskLeft + tierDef.radius, Math.min(this.flaskRight - tierDef.radius, x));
    const potion: PotionBody = {
      id: this.nextId++,
      tier,
      x: clampedX,
      y,
      vx,
      vy,
      radius: tierDef.radius,
      settled: false,
      markedForRemoval: false,
      spawnAnimation: 0.2,
    };
    this.potions.push(potion);
    return potion;
  }

  public update(dt: number): { mergedTier: number; x: number; y: number }[] {
    const mergeEvents: { mergedTier: number; x: number; y: number }[] = [];

    // Sub-stepping for stable circle collisions
    const subSteps = 6;
    const subDt = dt / subSteps;

    for (let step = 0; step < subSteps; step++) {
      for (const p of this.potions) {
        if (p.markedForRemoval) continue;

        // Apply gravity
        p.vy += this.gravity * subDt;

        // Apply friction
        p.vx *= Math.pow(this.friction, subDt * 60);
        p.vy *= Math.pow(this.friction, subDt * 60);

        // Update positions
        p.x += p.vx * subDt;
        p.y += p.vy * subDt;

        // Boundary constraints
        if (p.x - p.radius < this.flaskLeft) {
          p.x = this.flaskLeft + p.radius;
          p.vx = -p.vx * this.restitution;
        } else if (p.x + p.radius > this.flaskRight) {
          p.x = this.flaskRight - p.radius;
          p.vx = -p.vx * this.restitution;
        }

        if (p.y + p.radius > this.flaskBottom) {
          p.y = this.flaskBottom - p.radius;
          p.vy = -p.vy * this.restitution;
          if (Math.abs(p.vy) < 15) {
            p.vy = 0;
            p.settled = true;
          }
        }
      }

      // Circle-Circle collisions & Merge resolution
      for (let i = 0; i < this.potions.length; i++) {
        const p1 = this.potions[i];
        if (p1.markedForRemoval) continue;

        for (let j = i + 1; j < this.potions.length; j++) {
          const p2 = this.potions[j];
          if (p2.markedForRemoval) continue;

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distSq = dx * dx + dy * dy;
          const minDist = p1.radius + p2.radius;

          if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq) || 0.001;

            // Check merge condition: same tier, not max tier
            if (p1.tier === p2.tier && p1.tier < POTION_TIERS.length) {
              p1.markedForRemoval = true;
              p2.markedForRemoval = true;

              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;
              const newTier = p1.tier + 1;

              mergeEvents.push({ mergedTier: newTier, x: midX, y: midY });
              break;
            }

            // Normal elastic collision response
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;

            // Separate bodies
            p1.x -= nx * overlap * 0.5;
            p1.y -= ny * overlap * 0.5;
            p2.x += nx * overlap * 0.5;
            p2.y += ny * overlap * 0.5;

            // Relative velocity
            const kx = p1.vx - p2.vx;
            const ky = p1.vy - p2.vy;
            const p = 2 * (nx * kx + ny * ky) / 2; // Assuming equal mass ratio

            p1.vx -= p * nx * (1 + this.restitution);
            p1.vy -= p * ny * (1 + this.restitution);
            p2.vx += p * nx * (1 + this.restitution);
            p2.vy += p * ny * (1 + this.restitution);
          }
        }
      }
    }

    // Process new merged potions
    for (const evt of mergeEvents) {
      this.addPotion(evt.x, evt.y, evt.mergedTier, (Math.random() - 0.5) * 50, -60);
    }

    // Remove deleted potions & update spawn animation
    this.potions = this.potions.filter(p => !p.markedForRemoval);
    for (const p of this.potions) {
      if (p.spawnAnimation < 1) {
        p.spawnAnimation = Math.min(1, p.spawnAnimation + dt * 4);
      }
    }

    return mergeEvents;
  }

  public checkOverflow(): boolean {
    // True if any settled or relatively stable potion rests above the danger line
    for (const p of this.potions) {
      if (p.y - p.radius < this.dangerCeilingY && Math.abs(p.vy) < 60) {
        return true;
      }
    }
    return false;
  }

  public clear(): void {
    this.potions = [];
  }
}
