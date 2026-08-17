export type BalloonType = 'cyan' | 'pink' | 'yellow' | 'rainbow' | 'bomb';

export interface BalloonConfig {
  basePoints: number;
  radius: number;
  speedMultiplier: number;
  color: string;
  glowColor: string;
}

export const BALLOON_CONFIGS: Record<BalloonType, BalloonConfig> = {
  cyan: {
    basePoints: 100,
    radius: 26,
    speedMultiplier: 1.0,
    color: '#00f0ff',
    glowColor: 'rgba(0, 240, 255, 0.4)',
  },
  pink: {
    basePoints: 150,
    radius: 24,
    speedMultiplier: 1.15,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.4)',
  },
  yellow: {
    basePoints: 200,
    radius: 22,
    speedMultiplier: 1.3,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  rainbow: {
    basePoints: 300,
    radius: 28,
    speedMultiplier: 1.2,
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.5)',
  },
  bomb: {
    basePoints: -300,
    radius: 26,
    speedMultiplier: 0.9,
    color: '#1e293b',
    glowColor: 'rgba(239, 68, 68, 0.5)',
  },
};

export interface BalloonOptions {
  radius?: number;
  speedY?: number;
  wobbleSpeed?: number;
  wobbleAmp?: number;
  wobblePhase?: number;
}

export class Balloon {
  public readonly id: string;
  public readonly type: BalloonType;
  public readonly points: number;
  public readonly radius: number;
  public readonly speedMultiplier: number;
  public readonly color: string;

  public x: number;
  public y: number;
  public baseX: number;
  public speedY: number;
  public wobbleSpeed: number;
  public wobbleAmp: number;
  public wobblePhase: number;

  public popped = false;
  public escaped = false;

  constructor(id: string, type: BalloonType, startX: number, startY: number, options?: BalloonOptions) {
    this.id = id;
    this.type = type;
    const cfg = BALLOON_CONFIGS[type];
    this.points = cfg.basePoints;
    this.radius = options?.radius ?? cfg.radius;
    this.speedMultiplier = cfg.speedMultiplier;
    this.color = cfg.color;

    this.baseX = startX;
    this.x = startX;
    this.y = startY;

    this.speedY = options?.speedY ?? 120 * this.speedMultiplier;
    this.wobbleSpeed = options?.wobbleSpeed ?? (1.5 + Math.random() * 1.5);
    this.wobbleAmp = options?.wobbleAmp ?? (10 + Math.random() * 12);
    this.wobblePhase = options?.wobblePhase ?? Math.random() * Math.PI * 2;
  }

  get isAlive(): boolean {
    return !this.popped && !this.escaped;
  }

  update(dt: number): void {
    if (!this.isAlive) return;

    this.y -= this.speedY * dt;
    this.wobblePhase += this.wobbleSpeed * dt;
    this.x = this.baseX + Math.sin(this.wobblePhase) * this.wobbleAmp;
  }

  containsPoint(px: number, py: number): boolean {
    if (!this.isAlive) return false;

    const dx = px - this.x;
    const dy = py - this.y;
    // 1.1x forgiving radius for touch & fast clicks
    const hitRadius = this.radius * 1.1;
    return dx * dx + dy * dy <= hitRadius * hitRadius;
  }

  pop(): void {
    this.popped = true;
  }

  markEscaped(): void {
    this.escaped = true;
  }
}
