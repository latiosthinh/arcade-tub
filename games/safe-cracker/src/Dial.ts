export type ZoneType = 'score' | 'time';

export interface TargetZone {
  startAngle: number; // 0 to 2*PI
  endAngle: number;   // 0 to 2*PI
  type: ZoneType;
}

export class Dial {
  public pointerAngle: number = 0;
  public baseSpeed: number = 2.0; // rad/s
  public speedBoostMultiplier: number = 2.5;
  public radius: number = 170;
  public zones: TargetZone[] = [];
  public initialYellowArc: number = 0.45; // ~25.8 deg
  public initialBlueArc: number = 0.35;   // ~20.0 deg
  public minZoneArc: number = 0.15;       // ~8.6 deg

  constructor() {
    this.resetZones(0);
  }

  public normalizeAngle(rad: number): number {
    const twoPi = 2 * Math.PI;
    const rem = rad % twoPi;
    return rem < 0 ? rem + twoPi : rem;
  }

  public isAngleInArc(angle: number, start: number, end: number): boolean {
    const normAngle = this.normalizeAngle(angle);
    const normStart = this.normalizeAngle(start);
    const normEnd = this.normalizeAngle(end);

    if (normStart <= normEnd) {
      return normAngle >= normStart && normAngle <= normEnd;
    }
    // Arc wraps across 0 / 2*PI
    return normAngle >= normStart || normAngle <= normEnd;
  }

  public update(dt: number, speedMultiplier = 1.0, isBoosted = false): void {
    const safeDt = Number.isFinite(dt) ? Math.max(0, Math.min(dt, 2.0)) : 0;
    const safeMultiplier = Number.isFinite(speedMultiplier) ? Math.max(0, speedMultiplier) : 1.0;
    const boost = isBoosted ? this.speedBoostMultiplier : 1.0;
    const deltaAngle = this.baseSpeed * safeMultiplier * boost * safeDt;
    this.pointerAngle = this.normalizeAngle(this.pointerAngle + deltaAngle);
  }

  public checkHit(): { hit: boolean; type?: ZoneType } {
    for (const zone of this.zones) {
      if (this.isAngleInArc(this.pointerAngle, zone.startAngle, zone.endAngle)) {
        return { hit: true, type: zone.type };
      }
    }
    return { hit: false };
  }

  public resetZones(difficultyLevel = 0): void {
    const safeDiff = Math.max(0, difficultyLevel);
    const yellowArc = Math.max(this.minZoneArc, this.initialYellowArc - safeDiff * 0.02);
    const blueArc = Math.max(this.minZoneArc, this.initialBlueArc - safeDiff * 0.015);
    const minGap = 0.2; // minimum buffer between zones

    const twoPi = 2 * Math.PI;
    const yellowStart = Math.random() * twoPi;
    const yellowEnd = this.normalizeAngle(yellowStart + yellowArc);

    // Find non-overlapping position for blue zone
    // Total occupied by yellow including margins: yellowArc + 2 * minGap
    const availableSpan = twoPi - yellowArc - 2 * minGap - blueArc;
    const blueOffset = minGap + (Math.random() * Math.max(0, availableSpan));
    const blueStart = this.normalizeAngle(yellowStart + yellowArc + blueOffset);
    const blueEnd = this.normalizeAngle(blueStart + blueArc);

    this.zones = [
      {
        startAngle: yellowStart,
        endAngle: yellowEnd,
        type: 'score',
      },
      {
        startAngle: blueStart,
        endAngle: blueEnd,
        type: 'time',
      },
    ];
  }
}
