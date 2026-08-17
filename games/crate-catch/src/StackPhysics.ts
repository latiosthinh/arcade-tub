export type FallingItemType =
  | 'crate_small'
  | 'crate_medium'
  | 'crate_large'
  | 'crate_golden'
  | 'powerup_repair'
  | 'powerup_shield'
  | 'bomb';

export interface StackedCrate {
  id: string;
  type: FallingItemType;
  width: number;
  height: number;
  basePoints: number;
  offsetX: number;
}

export interface StackBankingResult {
  totalPoints: number;
  crateCount: number;
  multiplier: number;
}

export class StackPhysics {
  crates: StackedCrate[] = [];
  wobbleAngle: number = 0;
  wobbleVelocity: number = 0;
  shieldTimer: number = 0;
  maxTippingAngle: number = 0.45;
  maxMultiplier: number = 10;
  prevCartVx: number = 0;

  reset(): void {
    this.crates = [];
    this.wobbleAngle = 0;
    this.wobbleVelocity = 0;
    this.shieldTimer = 0;
    this.prevCartVx = 0;
  }

  addCrate(
    item: { id: string; type: FallingItemType; width: number; height: number; basePoints: number },
    landingOffsetX: number = 0
  ): void {
    const clampedOffset = Math.max(-15, Math.min(15, landingOffsetX));
    this.crates.push({
      id: item.id,
      type: item.type,
      width: item.width,
      height: item.height,
      basePoints: item.basePoints,
      offsetX: clampedOffset,
    });
  }

  getTotalHeight(): number {
    return this.crates.reduce((acc, c) => acc + c.height, 0);
  }

  getStackTopY(cartY: number): number {
    return cartY - this.getTotalHeight();
  }

  getMultiplier(): number {
    return Math.max(1, Math.min(this.maxMultiplier, this.crates.length));
  }

  activateShield(duration: number = 10.0): void {
    this.shieldTimer = duration;
  }

  isShieldActive(): boolean {
    return this.shieldTimer > 0;
  }

  bank(): StackBankingResult {
    if (this.crates.length === 0) {
      return { totalPoints: 0, crateCount: 0, multiplier: 1 };
    }

    const multiplier = this.getMultiplier();
    const baseSum = this.crates.reduce((acc, c) => acc + c.basePoints, 0);
    const totalPoints = baseSum * multiplier;
    const crateCount = this.crates.length;

    this.crates = [];
    this.wobbleAngle = 0;
    this.wobbleVelocity = 0;

    return { totalPoints, crateCount, multiplier };
  }

  explodeScatter(): StackedCrate[] {
    const lost = [...this.crates];
    this.crates = [];
    this.wobbleAngle = 0;
    this.wobbleVelocity = 0;
    return lost;
  }

  update(dt: number, cartVx: number): { collapsed: boolean; lostCrates: StackedCrate[] } {
    if (this.shieldTimer > 0) {
      this.shieldTimer = Math.max(0, this.shieldTimer - dt);
    }

    const cartAx = (cartVx - this.prevCartVx) / Math.max(0.001, dt);
    this.prevCartVx = cartVx;

    if (this.crates.length === 0) {
      this.wobbleAngle = 0;
      this.wobbleVelocity = 0;
      return { collapsed: false, lostCrates: [] };
    }

    const inertial = -cartAx * 0.0008 * (1 + this.crates.length * 0.25);
    const restoring = -this.wobbleAngle * 10.0;
    const damping = -this.wobbleVelocity * (this.isShieldActive() ? 15.0 : 3.0);
    const angAccel = restoring + damping + inertial;

    this.wobbleVelocity += angAccel * dt;
    this.wobbleAngle += this.wobbleVelocity * dt;

    if (this.isShieldActive()) {
      this.wobbleAngle *= 0.85;
    }

    if (Math.abs(this.wobbleAngle) > this.maxTippingAngle && !this.isShieldActive()) {
      const lost = this.explodeScatter();
      return { collapsed: true, lostCrates: lost };
    }

    return { collapsed: false, lostCrates: [] };
  }
}
