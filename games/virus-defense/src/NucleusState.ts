export interface Antibody {
  id: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  healAmount: number;
  timeAlive: number;
  active: boolean;
}

export interface WaveConfig {
  wave: number;
  enemyCount: number;
  speedMultiplier: number;
  spawnInterval: number;
  types: ('spiker' | 'speedster' | 'splitter' | 'shield-carrier')[];
}

export class NucleusState {
  public centerX: number;
  public centerY: number;
  public radius: number;
  public hp: number;
  public maxHp: number;
  public antibodies: Antibody[];
  public wave: number;
  private nextAntibodyId: number;

  constructor(centerX = 400, centerY = 300, maxHp = 100) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = 45;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.antibodies = [];
    this.wave = 1;
    this.nextAntibodyId = 1;
  }

  public get isDestroyed(): boolean {
    return this.hp <= 0;
  }

  public takeDamage(amount: number): boolean {
    if (this.hp <= 0) return false;
    this.hp = Math.max(0, this.hp - amount);
    return true;
  }

  public heal(amount: number): void {
    if (this.hp <= 0) return;
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  public spawnAntibody(angle?: number, distance = 90): Antibody {
    const theta = angle !== undefined ? angle : Math.random() * Math.PI * 2;
    const x = this.centerX + Math.cos(theta) * distance;
    const y = this.centerY + Math.sin(theta) * distance;

    const antibody: Antibody = {
      id: this.nextAntibodyId++,
      x,
      y,
      baseX: x,
      baseY: y,
      radius: 12,
      healAmount: 15,
      timeAlive: 0,
      active: true,
    };

    this.antibodies.push(antibody);
    return antibody;
  }

  public collectAntibody(id: number): boolean {
    const ab = this.antibodies.find((a) => a.id === id && a.active);
    if (!ab) return false;
    ab.active = false;
    this.heal(ab.healAmount);
    return true;
  }

  public update(dt: number): void {
    for (const a of this.antibodies) {
      if (!a.active) continue;
      a.timeAlive += dt;
      // Gentle circular hover drift
      const wobble = Math.sin(a.timeAlive * 3) * 4;
      a.y = a.baseY + wobble;
    }

    this.antibodies = this.antibodies.filter((a) => a.active);
  }

  public getWaveConfig(wave: number): WaveConfig {
    const baseCount = 8;
    const enemyCount = Math.floor(baseCount + (wave - 1) * 4);
    const speedMultiplier = Math.min(2.0, 1.0 + (wave - 1) * 0.1);
    const spawnInterval = Math.max(0.4, 1.6 - (wave - 1) * 0.12);

    const types: ('spiker' | 'speedster' | 'splitter' | 'shield-carrier')[] = ['spiker'];
    if (wave >= 2) types.push('speedster');
    if (wave >= 3) types.push('splitter');
    if (wave >= 4) types.push('shield-carrier');

    return {
      wave,
      enemyCount,
      speedMultiplier,
      spawnInterval,
      types,
    };
  }

  public reset(): void {
    this.hp = this.maxHp;
    this.antibodies = [];
    this.wave = 1;
  }
}
