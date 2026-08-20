export interface BearingUpgrade {
  level: number;
  name: string;
  friction: number;
  cost: number;
  description: string;
}

export const BEARING_UPGRADES: BearingUpgrade[] = [
  { level: 0, name: 'Standard Steel', friction: 0.982, cost: 0, description: 'Basic metal ball bearings with standard drag' },
  { level: 1, name: 'ABEC-7 Precision', friction: 0.989, cost: 50, description: 'Polished chrome steel balls for extended spins' },
  { level: 2, name: 'Ceramic Hybrid', friction: 0.994, cost: 150, description: 'Silicon nitride ceramic balls with minimal resistance' },
  { level: 3, name: 'Full Ceramic Si3N4', friction: 0.997, cost: 350, description: 'Ultra-hard zero-lubricant aerospace ceramic' },
  { level: 4, name: 'Mag-Lev Zero-G', friction: 0.9992, cost: 800, description: 'Active magnetic levitation frictionless ring' },
];

export interface SpinnerConfig {
  maxAngularVelocity: number;
  momentOfInertia: number;
  bearingLevel: number;
}

export class SpinnerPhysics {
  public angle: number = 0;
  public angularVelocity: number = 0;
  public totalRevolutions: number = 0;
  public coins: number = 0;
  public bearingLevel: number = 0;
  public topRPM: number = 0;
  public config: SpinnerConfig;

  private uncreditedRevolutions: number = 0;

  constructor(config?: Partial<SpinnerConfig>) {
    this.config = {
      maxAngularVelocity: 150, // ~1430 RPM
      momentOfInertia: 1.0,
      bearingLevel: 0,
      ...config,
    };
    this.bearingLevel = this.config.bearingLevel;
  }

  public get bearingFriction(): number {
    const upgrade = BEARING_UPGRADES[this.bearingLevel] || BEARING_UPGRADES[0];
    return upgrade.friction;
  }

  public applyTorque(impulse: number): void {
    if (isNaN(impulse) || !isFinite(impulse)) return;
    this.angularVelocity += impulse / this.config.momentOfInertia;
    this.clampVelocity();
  }

  public applySwipe(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    dt: number,
    center: { x: number; y: number }
  ): void {
    const safeDt = Math.max(0.008, Math.min(0.2, dt));
    const vx = (p2.x - p1.x) / safeDt;
    const vy = (p2.y - p1.y) / safeDt;

    // Radius vector from center to midpoint of swipe
    const midX = (p1.x + p2.x) * 0.5;
    const midY = (p1.y + p2.y) * 0.5;
    const rx = midX - center.x;
    const ry = midY - center.y;

    const rLen = Math.sqrt(rx * rx + ry * ry);
    if (rLen < 10) return; // Ignore taps too close to center axis

    // 2D Cross product: r × v = rx * vy - ry * vx
    const cross = rx * vy - ry * vx;
    const tangentialVel = cross / rLen;

    // Convert tangential speed to angular impulse
    const impulse = (tangentialVel / rLen) * 0.45;
    this.applyTorque(impulse);
  }

  public update(dt: number): void {
    if (dt <= 0 || isNaN(dt)) return;
    
    // Substep simulation to prevent numerical instability and handle large delta times
    const maxSubstep = 1 / 60; // 16.6ms max step
    let remainingTime = Math.min(1.0, dt);

    while (remainingTime > 0) {
      const step = Math.min(remainingTime, maxSubstep);
      
      // Friction damping scaled to step time
      const damping = Math.pow(this.bearingFriction, step * 60);
      this.angularVelocity *= damping;

      // Snap to 0 when very slow
      if (Math.abs(this.angularVelocity) < 0.01) {
        this.angularVelocity = 0;
        break;
      }

      // Step angle
      const deltaAngle = this.angularVelocity * step;
      this.angle = (this.angle + deltaAngle) % (Math.PI * 2);
      if (this.angle < 0) this.angle += Math.PI * 2;

      // Revolution tracking & coin rewards
      const revStep = Math.abs(deltaAngle) / (Math.PI * 2);
      this.totalRevolutions += revStep;
      this.uncreditedRevolutions += revStep;

      remainingTime -= step;
    }

    const newCoins = Math.floor(this.uncreditedRevolutions);
    if (newCoins > 0) {
      this.coins += newCoins;
      this.uncreditedRevolutions -= newCoins;
    }

    // Tachometer top RPM tracking
    const currentRPM = this.getRPM();
    if (currentRPM > this.topRPM) {
      this.topRPM = currentRPM;
    }
  }

  public getRPM(): number {
    return (Math.abs(this.angularVelocity) / (Math.PI * 2)) * 60;
  }

  public upgradeBearing(overrideCoins?: number): boolean {
    const nextLevel = this.bearingLevel + 1;
    if (nextLevel >= BEARING_UPGRADES.length) return false;

    const cost = BEARING_UPGRADES[nextLevel].cost;
    const availableCoins = overrideCoins !== undefined ? overrideCoins : this.coins;

    if (availableCoins >= cost) {
      if (overrideCoins === undefined) {
        this.coins -= cost;
      }
      this.bearingLevel = nextLevel;
      return true;
    }
    return false;
  }

  private clampVelocity(): void {
    const max = this.config.maxAngularVelocity;
    if (this.angularVelocity > max) this.angularVelocity = max;
    if (this.angularVelocity < -max) this.angularVelocity = -max;
  }
}
