export type SectorType = 'safe' | 'hazard' | 'gap';

export interface Sector {
  startAngle: number; // in radians, 0 to 2*PI
  endAngle: number;   // in radians, 0 to 2*PI
  type: SectorType;
  color?: string;
}

export interface PlatformTier {
  id: number;
  y: number; // height along the tower (tier index * spacing)
  sectors: Sector[];
  isSmashed?: boolean;
  splatters?: Array<{ angle: number; radius: number; color: string; size: number }>;
}

export interface TowerConfig {
  totalTiers: number;
  tierSpacing: number;
  cylinderRadius: number;
  discOuterRadius: number;
  discInnerRadius: number;
  themeColors?: {
    tower: string;
    safe: string;
    hazard: string;
    background: string;
  };
}

export class TowerGenerator {
  public config: TowerConfig;

  constructor(config: Partial<TowerConfig> = {}) {
    this.config = {
      totalTiers: config.totalTiers ?? 30,
      tierSpacing: config.tierSpacing ?? 120,
      cylinderRadius: config.cylinderRadius ?? 45,
      discOuterRadius: config.discOuterRadius ?? 140,
      discInnerRadius: config.discInnerRadius ?? 45,
      themeColors: config.themeColors ?? {
        tower: '#E5D9C5',
        safe: '#4ECDC4',
        hazard: '#E74C3C',
        background: '#FAF6EE'
      }
    };
  }

  public generate(seed: number = 12345): PlatformTier[] {
    const tiers: PlatformTier[] = [];
    let currentSeed = seed;

    // Pseudo-random generator for reproducible levels
    const rng = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };

    for (let i = 0; i < this.config.totalTiers; i++) {
      const y = i * this.config.tierSpacing;
      const sectors: Sector[] = [];

      if (i === 0) {
        // First tier (starting platform) - mostly safe, 1 gap to start dropping
        const gapSize = Math.PI * 0.4;
        const gapStart = rng() * Math.PI * 2;
        const gapEnd = (gapStart + gapSize) % (Math.PI * 2);

        if (gapStart < gapEnd) {
          sectors.push({ startAngle: 0, endAngle: gapStart, type: 'safe' });
          sectors.push({ startAngle: gapStart, endAngle: gapEnd, type: 'gap' });
          sectors.push({ startAngle: gapEnd, endAngle: Math.PI * 2, type: 'safe' });
        } else {
          sectors.push({ startAngle: 0, endAngle: gapEnd, type: 'gap' });
          sectors.push({ startAngle: gapEnd, endAngle: gapStart, type: 'safe' });
          sectors.push({ startAngle: gapStart, endAngle: Math.PI * 2, type: 'gap' });
        }
      } else if (i === this.config.totalTiers - 1) {
        // Goal tier - full safe landing disc
        sectors.push({ startAngle: 0, endAngle: Math.PI * 2, type: 'safe' });
      } else {
        // Intermediate tiers: 1-2 gaps, 0-3 hazard sectors, rest safe
        const numSlices = 8; // 8 sectors per ring (45 deg each)
        const sliceAngle = (Math.PI * 2) / numSlices;
        
        // Decide how many gaps (1 or 2)
        const gapCount = rng() > 0.6 ? 2 : 1;
        const gapIndices = new Set<number>();
        while (gapIndices.size < gapCount) {
          gapIndices.add(Math.floor(rng() * numSlices));
        }

        // Decide hazard count based on depth (progress difficulty)
        const maxHazards = Math.min(3, 1 + Math.floor((i / this.config.totalTiers) * 3));
        const hazardCount = Math.floor(rng() * maxHazards);
        const hazardIndices = new Set<number>();
        while (hazardIndices.size < hazardCount) {
          const idx = Math.floor(rng() * numSlices);
          if (!gapIndices.has(idx)) {
            hazardIndices.add(idx);
          }
        }

        for (let s = 0; s < numSlices; s++) {
          const startAngle = s * sliceAngle;
          const endAngle = (s + 1) * sliceAngle;
          let type: SectorType = 'safe';

          if (gapIndices.has(s)) {
            type = 'gap';
          } else if (hazardIndices.has(s)) {
            type = 'hazard';
          }

          sectors.push({ startAngle, endAngle, type });
        }
      }

      tiers.push({
        id: i,
        y,
        sectors,
        isSmashed: false,
        splatters: []
      });
    }

    return tiers;
  }
}
