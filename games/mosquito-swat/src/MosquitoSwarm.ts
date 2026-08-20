export type MosquitoType = 'standard' | 'speedy' | 'giant';

export interface Mosquito {
  id: number;
  type: MosquitoType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  stunned: boolean;
  stunTimer: number;
  phase: number;
  frequency: number;
  amplitude: number;
  angle: number;
  wingFlap: number;
}

export interface PowerupState {
  sprayTimer: number;
  electricTimer: number;
}

export interface SwatHitResult {
  mosquito: Mosquito;
  points: number;
  combo: number;
  killed: boolean;
}

export class MosquitoSwarm {
  public width: number;
  public height: number;
  public mosquitoes: Mosquito[] = [];
  public score: number = 0;
  public combo: number = 0;
  public comboTimer: number = 0;
  public powerupState: PowerupState = {
    sprayTimer: 0,
    electricTimer: 0
  };
  private nextId: number = 1;
  private spawnTimer: number = 0;

  constructor(width: number = 800, height: number = 600) {
    this.width = width;
    this.height = height;

    // Spawn rich initial swarm
    for (let i = 0; i < 16; i++) {
      const roll = Math.random();
      const type: MosquitoType = roll < 0.5 ? 'standard' : roll < 0.8 ? 'speedy' : 'giant';
      this.spawnMosquito(type);
    }
  }

  public spawnMosquito(
    type: MosquitoType = 'standard',
    x?: number,
    y?: number,
    vx?: number,
    vy?: number
  ): Mosquito {
    const defaultX = x ?? (Math.random() * (this.width - 100) + 50);
    const defaultY = y ?? (Math.random() * (this.height - 100) + 50);

    let speed = 80;
    let radius = 18;
    let hp = 1;

    if (type === 'speedy') {
      speed = 150;
      radius = 12;
      hp = 1;
    } else if (type === 'giant') {
      speed = 50;
      radius = 28;
      hp = 2;
    }

    const angle = Math.random() * Math.PI * 2;
    const initialVx = vx ?? Math.cos(angle) * speed;
    const initialVy = vy ?? Math.sin(angle) * speed;

    const mosquito: Mosquito = {
      id: this.nextId++,
      type,
      x: defaultX,
      y: defaultY,
      vx: initialVx,
      vy: initialVy,
      radius,
      hp,
      maxHp: hp,
      stunned: false,
      stunTimer: 0,
      phase: Math.random() * Math.PI * 2,
      frequency: 4 + Math.random() * 4,
      amplitude: 15 + Math.random() * 15,
      angle: 0,
      wingFlap: 0
    };

    this.mosquitoes.push(mosquito);
    return mosquito;
  }

  public update(dt: number): void {
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
      }
    }

    if (this.powerupState.sprayTimer > 0) {
      this.powerupState.sprayTimer -= dt;
    }
    if (this.powerupState.electricTimer > 0) {
      this.powerupState.electricTimer -= dt;
    }

    this.spawnTimer += dt;
    if (this.spawnTimer > 0.5 && this.mosquitoes.length < 35) {
      this.spawnTimer = 0;
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        const roll = Math.random();
        const type: MosquitoType = roll < 0.55 ? 'standard' : roll < 0.85 ? 'speedy' : 'giant';
        this.spawnMosquito(type);
      }
    }

    for (const m of this.mosquitoes) {
      if (this.powerupState.sprayTimer > 0) {
        m.stunned = true;
        m.stunTimer = this.powerupState.sprayTimer;
      } else if (m.stunTimer > 0) {
        m.stunTimer -= dt;
        if (m.stunTimer <= 0) {
          m.stunned = false;
        }
      }

      if (!m.stunned) {
        m.phase += dt * m.frequency;
        m.wingFlap += dt * 30;

        const perpX = -m.vy / (Math.hypot(m.vx, m.vy) || 1);
        const perpY = m.vx / (Math.hypot(m.vx, m.vy) || 1);
        const osc = Math.sin(m.phase) * m.amplitude;

        m.x += (m.vx + perpX * osc) * dt;
        m.y += (m.vy + perpY * osc) * dt;
        m.angle = Math.atan2(m.vy, m.vx);

        if (m.x < m.radius) {
          m.x = m.radius;
          m.vx = Math.abs(m.vx);
        } else if (m.x > this.width - m.radius) {
          m.x = this.width - m.radius;
          m.vx = -Math.abs(m.vx);
        }

        if (m.y < m.radius) {
          m.y = m.radius;
          m.vy = Math.abs(m.vy);
        } else if (m.y > this.height - m.radius) {
          m.y = this.height - m.radius;
          m.vy = -Math.abs(m.vy);
        }
      }
    }
  }

  public swatAt(x: number, y: number, radius: number = 40): Mosquito[] {
    const hits: Mosquito[] = [];
    const remaining: Mosquito[] = [];
    let hitCountInThisSwat = 0;

    for (const m of this.mosquitoes) {
      const dist = Math.hypot(m.x - x, m.y - y);
      if (dist <= radius + m.radius) {
        m.hp--;
        hitCountInThisSwat++;
        if (m.hp <= 0) {
          hits.push(m);
        } else {
          remaining.push(m);
        }
      } else {
        remaining.push(m);
      }
    }

    if (hitCountInThisSwat > 0) {
      this.combo += hitCountInThisSwat;
      this.comboTimer = 2.0;

      const electricMultiplier = this.powerupState.electricTimer > 0 ? 2 : 1;
      const basePointsPerKill = 100;
      const totalPoints = hits.length * basePointsPerKill * Math.max(1, this.combo) * electricMultiplier;
      this.score += totalPoints;
    }

    this.mosquitoes = remaining;
    return hits;
  }

  public activatePowerup(type: 'spray' | 'electric'): void {
    if (type === 'spray') {
      this.powerupState.sprayTimer = 3.5;
      for (const m of this.mosquitoes) {
        m.stunned = true;
        m.stunTimer = 3.5;
      }
    } else if (type === 'electric') {
      this.powerupState.electricTimer = 5.0;
    }
  }

  public reset(): void {
    this.mosquitoes = [];
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.powerupState.sprayTimer = 0;
    this.powerupState.electricTimer = 0;
    this.spawnTimer = 0;
  }
}
