import { PlatformTier, SectorType } from './TowerGenerator.js';
import { DropletPhysics } from './DropletPhysics.js';

export interface CollisionResult {
  hit: boolean;
  tierIndex: number;
  sectorType: SectorType;
  smashed: boolean;
}

export class CollisionDetector {
  // Tower rotation angle in radians (0 to 2*PI)
  // Droplet is fixed at the front position (e.g., angle = PI / 2 or 0)
  // Droplet position relative to tower rotation:
  // Droplet world angle = 0 (front-center of screen)
  // Effective angle on the tower = (dropletAngle - towerRotation) mod 2PI

  public static checkCollision(
    droplet: DropletPhysics,
    previousY: number,
    tiers: PlatformTier[],
    towerRotation: number,
    dropletWorldAngle: number = Math.PI * 0.5 // facing forward/front
  ): CollisionResult {
    // Only check collision if falling downward
    if (droplet.vy <= 0) {
      return { hit: false, tierIndex: -1, sectorType: 'gap', smashed: false };
    }

    // Normalize effective angle on the platform
    let effectiveAngle = (dropletWorldAngle - towerRotation) % (Math.PI * 2);
    if (effectiveAngle < 0) effectiveAngle += Math.PI * 2;

    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      if (tier.isSmashed) continue;

      const tierSurfaceY = tier.y;

      // Check if droplet passed through the tier surface during this frame
      // prevY + radius <= tierSurfaceY and currentY + radius >= tierSurfaceY
      const prevBottom = previousY + droplet.config.radius;
      const currBottom = droplet.y + droplet.config.radius;

      if (prevBottom <= tierSurfaceY && currBottom >= tierSurfaceY) {
        // Find which sector the droplet falls onto
        const sector = this.getSectorAtAngle(tier, effectiveAngle);

        if (!sector || sector.type === 'gap') {
          // Passed through a gap!
          droplet.registerTierPass();
          return { hit: false, tierIndex: i, sectorType: 'gap', smashed: false };
        }

        // If droplet is in Fireball mode, it smashes through safe OR hazard!
        if (droplet.isFireball) {
          tier.isSmashed = true;
          droplet.registerTierPass();
          return {
            hit: true,
            tierIndex: i,
            sectorType: sector.type,
            smashed: true
          };
        }

        // Normal landing / collision
        return {
          hit: true,
          tierIndex: i,
          sectorType: sector.type,
          smashed: false
        };
      }
    }

    return { hit: false, tierIndex: -1, sectorType: 'gap', smashed: false };
  }

  public static getSectorAtAngle(tier: PlatformTier, angle: number) {
    // Angle in [0, 2*PI)
    for (const sector of tier.sectors) {
      if (sector.startAngle <= sector.endAngle) {
        if (angle >= sector.startAngle && angle < sector.endAngle) {
          return sector;
        }
      } else {
        // Wraps around 2*PI
        if (angle >= sector.startAngle || angle < sector.endAngle) {
          return sector;
        }
      }
    }
    return null;
  }
}
