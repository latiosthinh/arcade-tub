import { PaperLayer, PAPER_PALETTE } from './RollPhysics.js';

export type ObstacleType = 'saw' | 'teeth' | 'narrow-gate';

export interface TrackPickup {
  id: number;
  x: number; // lateral center (-trackWidth/2 to trackWidth/2)
  z: number; // track distance
  width: number;
  length: number;
  layer: PaperLayer;
  collected: boolean;
}

export interface TrackObstacle {
  id: number;
  type: ObstacleType;
  x: number; // center lateral position
  z: number; // forward distance position
  width: number;
  depth: number;
  damageLayers: number; // layers sliced off if hit
  active: boolean;
  oscillating?: boolean;
  oscSpeed?: number;
  oscRange?: number;
  baseX?: number;
}

export interface FinishRibbon {
  z: number;
  multiplier: number;
  color: string;
  cut: boolean;
}

export interface LevelTrack {
  trackLength: number;
  pickups: TrackPickup[];
  obstacles: TrackObstacle[];
  finishRibbons: FinishRibbon[];
}

export interface TrackGeneratorConfig {
  trackLength?: number;
  trackWidth?: number;
  minGap?: number;
}

export class TrackGenerator {
  public trackLength: number;
  public trackWidth: number;
  public minGap: number;

  constructor(config: TrackGeneratorConfig = {}) {
    this.trackLength = config.trackLength ?? 4500;
    this.trackWidth = config.trackWidth ?? 360;
    this.minGap = config.minGap ?? 180;
  }

  public generateLevel(level: number, seed: number = 12345): LevelTrack {
    const pickups: TrackPickup[] = [];
    const obstacles: TrackObstacle[] = [];
    const finishRibbons: FinishRibbon[] = [];

    // Pseudo random generator from seed
    let s = seed + level * 777;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    const halfW = (this.trackWidth - 60) / 2;
    let currentZ = 400; // start giving player breathing room
    let pickupId = 1;
    let obstacleId = 1;

    const levelMultiplier = 1 + (level - 1) * 0.15;
    const endZ = this.trackLength;

    while (currentZ < endZ - 400) {
      const roll = rnd();

      if (roll < 0.55) {
        // Generate paper pickup sheets (often in groups or dual lanes)
        const paletteIndex = Math.floor(rnd() * PAPER_PALETTE.length);
        const pColor = PAPER_PALETTE[paletteIndex];
        const sheetLayer: PaperLayer = {
          color: pColor.color,
          name: pColor.name,
          thickness: 3.0,
          scoreValue: pColor.score
        };

        const laneCount = rnd() > 0.4 ? 2 : 1;
        if (laneCount === 1) {
          const lateral = (rnd() * 2 - 1) * halfW * 0.7;
          pickups.push({
            id: pickupId++,
            x: lateral,
            z: currentZ,
            width: 44,
            length: 80,
            layer: sheetLayer,
            collected: false
          });
        } else {
          // Dual choices (left / right)
          const pLeft = PAPER_PALETTE[Math.floor(rnd() * PAPER_PALETTE.length)];
          const pRight = PAPER_PALETTE[Math.floor(rnd() * PAPER_PALETTE.length)];
          pickups.push({
            id: pickupId++,
            x: -halfW * 0.55,
            z: currentZ,
            width: 44,
            length: 80,
            layer: { color: pLeft.color, name: pLeft.name, thickness: 3.0, scoreValue: pLeft.score },
            collected: false
          });
          pickups.push({
            id: pickupId++,
            x: halfW * 0.55,
            z: currentZ,
            width: 44,
            length: 80,
            layer: { color: pRight.color, name: pRight.name, thickness: 3.0, scoreValue: pRight.score },
            collected: false
          });
        }
        currentZ += 140;
      } else {
        // Generate obstacles: Trimmer saw, teeth, or narrow gates
        const obsType: ObstacleType = rnd() < 0.45 ? 'saw' : (rnd() < 0.8 ? 'teeth' : 'narrow-gate');
        const obsX = (rnd() * 2 - 1) * (halfW * 0.65);
        const isOscillating = rnd() < 0.35 + level * 0.05;

        let width = 50;
        let damage = 2;

        if (obsType === 'saw') {
          width = 56;
          damage = 3;
        } else if (obsType === 'teeth') {
          width = 70;
          damage = 2;
        } else {
          width = 110;
          damage = 4;
        }

        obstacles.push({
          id: obstacleId++,
          type: obsType,
          x: obsX,
          z: currentZ,
          width,
          depth: 36,
          damageLayers: damage,
          active: true,
          oscillating: isOscillating,
          oscSpeed: 1.5 + rnd() * 2.0 * levelMultiplier,
          oscRange: halfW * 0.6,
          baseX: obsX
        });

        currentZ += this.minGap + rnd() * 120;
      }
    }

    // Finish Multiplier Ribbons at the end of track
    const ribbonStartZ = this.trackLength;
    const ribbonCount = 10;
    const ribbonSpacing = 80;
    const ribbonColors = ['#55EFC4', '#81ECEC', '#74B9FF', '#A29BFE', '#FFEAA7', '#FAB1A0', '#FF7675', '#FD79A8', '#FDCB6E', '#E17055'];

    for (let i = 0; i < ribbonCount; i++) {
      finishRibbons.push({
        z: ribbonStartZ + i * ribbonSpacing,
        multiplier: Number((1.5 + i * 0.5).toFixed(1)),
        color: ribbonColors[i % ribbonColors.length],
        cut: false
      });
    }

    return {
      trackLength: ribbonStartZ + ribbonCount * ribbonSpacing + 200,
      pickups,
      obstacles,
      finishRibbons
    };
  }
}
