import { Player } from './Player.js';

export type PlatformType = 'standard' | 'fragile' | 'moving' | 'spring';

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: PlatformType;
  vx: number;
  broken: boolean;
  hasRocket: boolean;
}

export interface PlatformCollisionResult {
  hit: boolean;
  platform?: Platform;
  isSuperBounce: boolean;
  gotRocket: boolean;
}

export class PlatformManager {
  platforms: Platform[] = [];
  highestY: number = 560;
  platformWidth: number = 74;
  platformHeight: number = 16;
  screenWidth: number = 800;
  private idCounter: number = 0;

  reset(): void {
    this.platforms = [];
    this.highestY = 560;
    this.idCounter = 0;

    // Base ground platform
    this.platforms.push({
      id: `p_${++this.idCounter}`,
      x: 350,
      y: 560,
      width: 100,
      height: this.platformHeight,
      type: 'standard',
      vx: 0,
      broken: false,
      hasRocket: false,
    });

    // Generate initial 15 platforms upward
    for (let i = 0; i < 15; i++) {
      const gap = 65 + Math.random() * 40;
      this.highestY -= gap;
      const x = 30 + Math.random() * (this.screenWidth - this.platformWidth - 60);
      this.platforms.push({
        id: `p_${++this.idCounter}`,
        x,
        y: this.highestY,
        width: this.platformWidth,
        height: this.platformHeight,
        type: 'standard',
        vx: 0,
        broken: false,
        hasRocket: false,
      });
    }
  }

  generateAhead(cameraTopY: number, targetAltitudeY: number = -50000): void {
    while (this.highestY > cameraTopY - 700 && this.highestY > targetAltitudeY) {
      const gap = 65 + Math.random() * 40;
      this.highestY -= gap;

      // Calculate altitude in meters based on distance climbed from base (y=560)
      const altitude = Math.floor((560 - this.highestY) / 10);

      // Determine platform type based on altitude
      let type: PlatformType = 'standard';
      const rand = Math.random();
      if (altitude < 1000) {
        if (rand < 0.75) {
          type = 'standard';
        } else if (rand < 0.9) {
          type = 'moving';
        } else {
          type = 'spring';
        }
      } else if (altitude < 3000) {
        if (rand < 0.45) {
          type = 'standard';
        } else if (rand < 0.7) {
          type = 'fragile';
        } else if (rand < 0.9) {
          type = 'moving';
        } else {
          type = 'spring';
        }
      } else {
        if (rand < 0.3) {
          type = 'standard';
        } else if (rand < 0.65) {
          type = 'fragile';
        } else if (rand < 0.9) {
          type = 'moving';
        } else {
          type = 'spring';
        }
      }

      const hasRocket = type === 'standard' && Math.random() < 0.05;
      const x = 30 + Math.random() * (this.screenWidth - this.platformWidth - 60);
      const vx = type === 'moving' ? (Math.random() > 0.5 ? 120 : -120) : 0;

      this.platforms.push({
        id: `p_${++this.idCounter}`,
        x,
        y: this.highestY,
        width: this.platformWidth,
        height: this.platformHeight,
        type,
        vx,
        broken: false,
        hasRocket,
      });
    }
  }

  update(dt: number): void {
    for (const p of this.platforms) {
      if (p.type === 'moving' && !p.broken) {
        p.x += p.vx * dt;
        if (p.x <= 20) {
          p.x = 20;
          p.vx = Math.abs(p.vx);
        } else if (p.x + p.width >= this.screenWidth - 20) {
          p.x = this.screenWidth - 20 - p.width;
          p.vx = -Math.abs(p.vx);
        }
      }
    }
  }

  cullBelow(cameraBottomY: number): void {
    this.platforms = this.platforms.filter((p) => p.y <= cameraBottomY + 150);
  }

  checkLanding(player: Player, dt: number): PlatformCollisionResult {
    if (player.vy <= 0) {
      return { hit: false, isSuperBounce: false, gotRocket: false };
    }

    const prevBottom = player.y + player.height - player.vy * dt;
    const currBottom = player.y + player.height;

    for (const p of this.platforms) {
      if (p.broken) {
        continue;
      }

      // Check horizontal overlap
      const overlapX = player.x + player.width >= p.x && player.x <= p.x + p.width;
      // Check vertical crossing: previously above or at platform top, now at or below platform top
      const verticalCrossing = prevBottom <= p.y + 10 && currBottom >= p.y;

      if (overlapX && verticalCrossing) {
        player.y = p.y - player.height;

        if (p.hasRocket) {
          p.hasRocket = false;
          player.activateRocket(3.0);
          return { hit: true, platform: p, isSuperBounce: false, gotRocket: true };
        }

        if (p.type === 'fragile') {
          p.broken = true;
          player.bounce(false);
          return { hit: true, platform: p, isSuperBounce: false, gotRocket: false };
        }

        if (p.type === 'spring') {
          player.bounce(true);
          return { hit: true, platform: p, isSuperBounce: true, gotRocket: false };
        }

        player.bounce(false);
        return { hit: true, platform: p, isSuperBounce: false, gotRocket: false };
      }
    }

    return { hit: false, isSuperBounce: false, gotRocket: false };
  }
}
