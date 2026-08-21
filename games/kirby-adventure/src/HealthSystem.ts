export const MAX_HP = 6;
export const INITIAL_LIVES = 3;
export const IFRAME_DURATION = 1.5; // seconds
export const BLINK_FREQUENCY = 10; // Hz

export class HealthSystem {
  hp = MAX_HP;
  maxHp = MAX_HP;
  lives = INITIAL_LIVES;
  score = 0;
  iframeTimer = 0;
  isDead = false;
  isGameOver = false;

  takeDamage(amount = 1): { tookDamage: boolean; knockedBack: boolean } {
    if (this.iframeTimer > 0 || this.isDead) {
      return { tookDamage: false, knockedBack: false };
    }

    this.hp = Math.max(0, this.hp - amount);
    this.iframeTimer = IFRAME_DURATION;

    if (this.hp <= 0) {
      this.die();
      return { tookDamage: true, knockedBack: false };
    }

    return { tookDamage: true, knockedBack: true };
  }

  heal(amount = 2): void {
    if (this.isDead) return;
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  healFull(): void {
    if (this.isDead) return;
    this.hp = this.maxHp;
  }

  addScore(points: number): void {
    this.score += points;
  }

  addLife(): void {
    this.lives += 1;
  }

  die(): void {
    this.isDead = true;
    this.lives -= 1;
    if (this.lives <= 0) {
      this.isGameOver = true;
    }
  }

  respawn(): void {
    if (this.isGameOver) return;
    this.hp = this.maxHp;
    this.isDead = false;
    this.iframeTimer = IFRAME_DURATION;
  }

  update(dt: number): void {
    if (this.iframeTimer > 0) {
      this.iframeTimer = Math.max(0, this.iframeTimer - dt);
    }
  }

  isInvulnerable(): boolean {
    return this.iframeTimer > 0;
  }

  isBlinking(): boolean {
    if (this.iframeTimer <= 0) return false;
    return Math.floor(this.iframeTimer * BLINK_FREQUENCY * 2) % 2 === 0;
  }
}
