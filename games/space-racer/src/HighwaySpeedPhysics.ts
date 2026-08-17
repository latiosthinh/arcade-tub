export class HighwaySpeedPhysics {
  /**
   * Calculates current track speed scaling logarithmically with distance traveled.
   */
  public static calculateSpeed(
    distance: number,
    baseSpeed: number = 300,
    maxSpeed: number = 900,
    isBoosting: boolean = false
  ): number {
    const rampFactor = Math.min(1.0, Math.log10(1 + distance / 1000) / 2.0);
    const speed = baseSpeed + (maxSpeed - baseSpeed) * rampFactor;
    return isBoosting ? speed * 1.5 : speed;
  }

  /**
   * Calculates score multiplier factor based on speed (1.0x to 3.0x+).
   */
  public static getSpeedMultiplier(speed: number, baseSpeed: number = 300): number {
    return Math.max(1.0, +(speed / baseSpeed).toFixed(1));
  }

  /**
   * Checks if an obstacle at the camera horizon plane (z ~ 0) constitutes a near-miss without colliding.
   */
  public static checkNearMiss(
    shipX: number,
    shipWidth: number,
    obsX: number,
    obsWidth: number,
    obsZ: number,
    nearMissWindowPx: number = 90
  ): boolean {
    // Only detect near-miss when obstacle is passing camera threshold (z between -0.05 and 0.08)
    if (obsZ > 0.08 || obsZ < -0.05) {
      return false;
    }

    const shipHalf = shipWidth / 2;
    const obsHalf = obsWidth / 2;

    const shipLeft = shipX - shipHalf;
    const shipRight = shipX + shipHalf;
    const obsLeft = obsX - obsHalf;
    const obsRight = obsX + obsHalf;

    // Check direct collision
    const isDirectCollision = !(obsRight < shipLeft || obsLeft > shipRight);
    if (isDirectCollision) {
      return false;
    }

    // Check if within near-miss proximity margin
    const dist = Math.abs(shipX - obsX);
    const combinedHalf = shipHalf + obsHalf;
    return dist <= combinedHalf + nearMissWindowPx;
  }
}
