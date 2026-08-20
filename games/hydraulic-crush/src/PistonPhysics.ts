export interface PistonState {
  y: number;
  displacement: number;
  pressure: number;
  velocity: number;
  isStalled: boolean;
}

export class PistonPhysics {
  private y: number = 0;
  private maxStroke: number;
  private maxForce: number;
  private pressure: number = 0;
  private velocity: number = 0;
  private isStalled: boolean = false;

  constructor(maxStroke: number = 300, maxForce: number = 1000) {
    this.maxStroke = Math.max(1, maxStroke);
    this.maxForce = Math.max(1, maxForce);
  }

  public applyPressure(holding: boolean, itemStiffness: number, dt: number): void {
    const clampedStiffness = Math.max(0, Math.min(1.0, itemStiffness));
    const safeDt = Math.max(0.001, Math.min(0.1, dt));

    if (holding) {
      // Downward speed slows down as stiffness increases and as displacement deepens
      const compressionFactor = this.y / this.maxStroke;
      const speed = Math.max(20, 200 * (1.0 - clampedStiffness * 0.8 * compressionFactor));

      if (clampedStiffness >= 1.0 && compressionFactor >= 0.25) {
        // Stall condition (e.g. Diamond)
        this.isStalled = true;
        this.velocity = 0;
        this.pressure = Math.min(this.maxForce, this.pressure + 600 * safeDt);
      } else {
        this.isStalled = false;
        this.velocity = speed;
        this.y = Math.min(this.maxStroke, this.y + this.velocity * safeDt);
        
        // Pressure builds based on displacement depth and item stiffness
        const targetPressure = this.maxForce * (clampedStiffness * 0.7 + 0.3) * (this.y / this.maxStroke);
        this.pressure = Math.min(this.maxForce, Math.max(0, targetPressure));
      }
    } else {
      // Retraction
      this.isStalled = false;
      const retractSpeed = 350;
      this.velocity = -retractSpeed;
      this.y = Math.max(0, this.y - retractSpeed * safeDt);
      this.pressure = Math.max(0, this.pressure - 800 * safeDt);
    }
  }

  public getY(): number {
    return this.y;
  }

  public getDisplacement(): number {
    return Math.max(0, Math.min(1.0, this.y / this.maxStroke));
  }

  public getPressure(): number {
    return Math.max(0, Math.min(this.maxForce, this.pressure));
  }

  public getMaxPressure(): number {
    return this.maxForce;
  }

  public getMaxStroke(): number {
    return this.maxStroke;
  }

  public getIsStalled(): boolean {
    return this.isStalled;
  }

  public reset(): void {
    this.y = 0;
    this.pressure = 0;
    this.velocity = 0;
    this.isStalled = false;
  }
}
