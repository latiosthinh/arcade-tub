import { Player } from './Player.js';

export type ObstacleType = 'drone' | 'spire' | 'balloon';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  alive: boolean;
}

export interface ObstacleInteractionResult {
  playerDead: boolean;
  stomped: boolean;
  balloonBounce: boolean;
  pointsAwarded: number;
  hitObstacle?: Obstacle;
}

export class ObstacleManager {
  obstacles: Obstacle[] = [];
  highestY: number = 500;
  screenWidth: number = 800;
  private idCounter: number = 0;

  reset(): void {
    this.obstacles = [];
    this.highestY = 500;
    this.idCounter = 0;
  }

  generateAhead(cameraTopY: number, targetAltitudeY: number = -50000): void {
    // Generate obstacles starting above base (y < 200)
    while (this.highestY > cameraTopY - 700 && this.highestY > targetAltitudeY) {
      this.highestY -= 280 + Math.random() * 180;

      const rand = Math.random();
      let type: ObstacleType = 'drone';
      if (rand < 0.45) {
        type = 'drone';
      } else if (rand < 0.75) {
        type = 'spire';
      } else {
        type = 'balloon';
      }

      const width = type === 'drone' ? 36 : type === 'spire' ? 30 : 32;
      const height = type === 'drone' ? 24 : type === 'spire' ? 30 : 40;
      const x = 40 + Math.random() * (this.screenWidth - width - 80);
      const vx = type === 'drone' ? (Math.random() > 0.5 ? 110 : -110) : 0;

      this.obstacles.push({
        id: `obs_${++this.idCounter}`,
        type,
        x,
        y: this.highestY,
        width,
        height,
        vx,
        vy: 0,
        alive: true,
      });
    }
  }

  update(dt: number): void {
    for (const obs of this.obstacles) {
      if (!obs.alive) {
        continue;
      }
      if (obs.type === 'drone') {
        obs.x += obs.vx * dt;
        if (obs.x <= 20) {
          obs.x = 20;
          obs.vx = Math.abs(obs.vx);
        } else if (obs.x + obs.width >= this.screenWidth - 20) {
          obs.x = this.screenWidth - 20 - obs.width;
          obs.vx = -Math.abs(obs.vx);
        }
      }
    }
  }

  cullBelow(cameraBottomY: number): void {
    this.obstacles = this.obstacles.filter((obs) => obs.y <= cameraBottomY + 150);
  }

  checkProjectileCollisions(player: Player): number {
    let totalPoints = 0;

    for (const p of player.projectiles) {
      if (!p.alive) {
        continue;
      }

      for (const obs of this.obstacles) {
        if (!obs.alive) {
          continue;
        }

        const overlap =
          p.x + p.radius >= obs.x &&
          p.x - p.radius <= obs.x + obs.width &&
          p.y + p.radius >= obs.y &&
          p.y - p.radius <= obs.y + obs.height;

        if (overlap) {
          p.alive = false;
          obs.alive = false;
          const points = obs.type === 'drone' ? 100 : obs.type === 'spire' ? 150 : 50;
          totalPoints += points;
          break;
        }
      }
    }

    return totalPoints;
  }

  checkPlayerInteractions(player: Player): ObstacleInteractionResult {
    for (const obs of this.obstacles) {
      if (!obs.alive) {
        continue;
      }

      const overlapX = player.x + player.width > obs.x && player.x < obs.x + obs.width;
      const overlapY = player.y + player.height > obs.y && player.y < obs.y + obs.height;

      if (overlapX && overlapY) {
        if (player.isRocketing) {
          obs.alive = false;
          const points = obs.type === 'spire' ? 150 : obs.type === 'drone' ? 100 : 50;
          return {
            playerDead: false,
            stomped: false,
            balloonBounce: false,
            pointsAwarded: points,
            hitObstacle: obs,
          };
        }

        if (obs.type === 'balloon') {
          player.vy = -700;
          player.vx = (player.x + player.width / 2 - (obs.x + obs.width / 2)) * 10;
          return {
            playerDead: false,
            stomped: false,
            balloonBounce: true,
            pointsAwarded: 25,
            hitObstacle: obs,
          };
        }

        if (obs.type === 'drone') {
          const isFalling = player.vy > 0;
          const isStompZone = player.y + player.height <= obs.y + obs.height * 0.6;

          if (isFalling && isStompZone) {
            obs.alive = false;
            player.bounce(false);
            return {
              playerDead: false,
              stomped: true,
              balloonBounce: false,
              pointsAwarded: 100,
              hitObstacle: obs,
            };
          } else {
            return {
              playerDead: true,
              stomped: false,
              balloonBounce: false,
              pointsAwarded: 0,
              hitObstacle: obs,
            };
          }
        }

        if (obs.type === 'spire') {
          return {
            playerDead: true,
            stomped: false,
            balloonBounce: false,
            pointsAwarded: 0,
            hitObstacle: obs,
          };
        }
      }
    }

    return {
      playerDead: false,
      stomped: false,
      balloonBounce: false,
      pointsAwarded: 0,
    };
  }
}
