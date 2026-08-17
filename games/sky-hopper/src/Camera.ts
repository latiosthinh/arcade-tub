export class Camera {
  y: number = 0;
  viewportWidth: number = 800;
  viewportHeight: number = 600;
  targetOffset: number = 320;

  reset(initialPlayerY: number = 500): void {
    this.y = initialPlayerY - this.targetOffset;
  }

  update(playerY: number, _dt: number): void {
    const targetY = playerY - this.targetOffset;
    if (targetY < this.y) {
      this.y = targetY;
    }
  }

  toScreenY(worldY: number): number {
    return worldY - this.y;
  }

  toWorldY(screenY: number): number {
    return screenY + this.y;
  }

  isOutOfBounds(worldY: number): boolean {
    return worldY > this.y + this.viewportHeight;
  }

  isVisible(worldY: number, height: number): boolean {
    return worldY + height >= this.y && worldY <= this.y + this.viewportHeight;
  }
}
