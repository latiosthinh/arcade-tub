export interface PaperLayer {
  color: string;
  name: string;
  thickness: number; // radius contribution
  scoreValue: number;
}

export interface RollPhysicsConfig {
  baseRadius?: number;
  maxRadius?: number;
  width?: number; // width of cylinder roll
  forwardSpeed?: number;
  steerSpeed?: number;
  trackWidth?: number;
  minLayers?: number;
}

export const PAPER_PALETTE: { name: string; color: string; score: number }[] = [
  { name: 'kraft-brown', color: '#D2B48C', score: 10 },
  { name: 'pastel-pink', color: '#FF7675', score: 20 },
  { name: 'mint-green', color: '#55EFC4', score: 30 },
  { name: 'sky-blue', color: '#74B9FF', score: 40 },
  { name: 'lemon-yellow', color: '#FFEAA7', score: 50 },
  { name: 'lavender', color: '#A29BFE', score: 60 },
  { name: 'coral-orange', color: '#FAB1A0', score: 70 },
  { name: 'vibrant-magenta', color: '#FD79A8', score: 80 },
  { name: 'emerald-green', color: '#00B894', score: 90 },
  { name: 'royal-gold', color: '#FDCB6E', score: 100 }
];

export class RollPhysics {
  public x: number = 0; // lateral position (-trackWidth/2 to +trackWidth/2)
  public z: number = 0; // forward distance traveled along track
  public rotationAngle: number = 0; // roll angle in radians
  public baseRadius: number;
  public maxRadius: number;
  public width: number;
  public forwardSpeed: number;
  public steerSpeed: number;
  public trackWidth: number;
  public minLayers: number;
  public layers: PaperLayer[] = [];
  public steerInput: number = 0; // -1 (left) to 1 (right)

  constructor(config: RollPhysicsConfig = {}) {
    this.baseRadius = config.baseRadius ?? 20;
    this.maxRadius = config.maxRadius ?? 70;
    this.width = config.width ?? 48;
    this.forwardSpeed = config.forwardSpeed ?? 320;
    this.steerSpeed = config.steerSpeed ?? 380;
    this.trackWidth = config.trackWidth ?? 360;
    this.minLayers = config.minLayers ?? 1;

    this.reset();
  }

  public reset(): void {
    this.x = 0;
    this.z = 0;
    this.rotationAngle = 0;
    this.steerInput = 0;
    this.layers = [
      {
        color: '#D2B48C', // cardboard core
        name: 'cardboard-core',
        thickness: 3.5,
        scoreValue: 10
      }
    ];
  }

  public getRadius(): number {
    const layerThicknessSum = this.layers.reduce((sum, l) => sum + l.thickness, 0);
    return Math.min(this.maxRadius, this.baseRadius + layerThicknessSum);
  }

  public getLayerCount(): number {
    return this.layers.length;
  }

  public getTotalScoreValue(): number {
    return this.layers.reduce((sum, l) => sum + l.scoreValue, 0);
  }

  public addLayer(layer: PaperLayer): void {
    this.layers.push({ ...layer });
  }

  public removeOutermostLayers(count: number): PaperLayer[] {
    const removed: PaperLayer[] = [];
    const keepCount = Math.max(0, this.layers.length - count);
    while (this.layers.length > keepCount) {
      const popped = this.layers.pop();
      if (popped) removed.push(popped);
    }
    return removed;
  }

  public steer(direction: number): void {
    this.steerInput = Math.max(-1, Math.min(1, direction));
  }

  public setLateralPosition(targetX: number): void {
    const half = (this.trackWidth - this.width) / 2;
    this.x = Math.max(-half, Math.min(half, targetX));
  }

  public update(dt: number, isRolling: boolean = true): void {
    if (!isRolling) return;

    // Move forward
    const deltaZ = this.forwardSpeed * dt;
    this.z += deltaZ;

    // Rotation based on circumference: dTheta = dZ / radius
    const currentRadius = this.getRadius();
    this.rotationAngle += deltaZ / currentRadius;

    // Lateral steering
    if (this.steerInput !== 0) {
      this.x += this.steerInput * this.steerSpeed * dt;
      const half = (this.trackWidth - this.width) / 2;
      this.x = Math.max(-half, Math.min(half, this.x));
    }
  }
}
