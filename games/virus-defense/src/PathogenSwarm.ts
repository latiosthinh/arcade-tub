import { Projectile } from './Turret';
import { NucleusState } from './NucleusState';

export type PathogenType = 'spiker' | 'speedster' | 'splitter' | 'shield-carrier';

export interface Pathogen {
  id: number;
  type: PathogenType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  angle: number;
  damage: number;
  scoreValue: number;
  isMicroSpiker?: boolean;
  timeAlive: number;
  wobblePhase: number;
  active: boolean;
}

export interface CollisionHit {
  pathogen: Pathogen;
  projectile: Projectile;
  killed: boolean;
  splitChildren: Pathogen[];
}

export interface BreachHit {
  pathogen: Pathogen;
  damage: number;
}

export class PathogenSwarm {
  public centerX: number;
  public centerY: number;
  public pathogens: Pathogen[];
  private nextPathogenId: number;
  public readonly maxPathogens = 60; // T-17-02 DoS mitigation

  constructor(centerX = 400, centerY = 300) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.pathogens = [];
    this.nextPathogenId = 1;
  }

  public get activePathogens(): Pathogen[] {
    return this.pathogens.filter((p) => p.active);
  }

  public spawn(
    type: PathogenType,
    speedMultiplier = 1.0,
    spawnAngle?: number,
    spawnDistance = 500
  ): Pathogen {
    const angle = spawnAngle !== undefined ? spawnAngle : Math.random() * Math.PI * 2;
    const x = this.centerX + Math.cos(angle) * spawnDistance;
    const y = this.centerY + Math.sin(angle) * spawnDistance;

    let baseSpeed = 90;
    let radius = 14;
    let hp = 1;
    let damage = 10;
    let scoreValue = 100;

    switch (type) {
      case 'speedster':
        baseSpeed = 160;
        radius = 11;
        hp = 1;
        damage = 5;
        scoreValue = 150;
        break;
      case 'splitter':
        baseSpeed = 65;
        radius = 20;
        hp = 2;
        damage = 15;
        scoreValue = 200;
        break;
      case 'shield-carrier':
        baseSpeed = 75;
        radius = 18;
        hp = 3;
        damage = 20;
        scoreValue = 250;
        break;
      case 'spiker':
      default:
        baseSpeed = 95;
        radius = 14;
        hp = 1;
        damage = 10;
        scoreValue = 100;
        break;
    }

    const speed = baseSpeed * speedMultiplier;
    const toCenterAngle = Math.atan2(this.centerY - y, this.centerX - x);

    const pathogen: Pathogen = {
      id: this.nextPathogenId++,
      type,
      x,
      y,
      vx: Math.cos(toCenterAngle) * speed,
      vy: Math.sin(toCenterAngle) * speed,
      radius,
      hp,
      maxHp: hp,
      speed,
      angle: toCenterAngle,
      damage,
      scoreValue,
      timeAlive: 0,
      wobblePhase: Math.random() * Math.PI * 2,
      active: true,
    };

    if (this.pathogens.length >= this.maxPathogens) {
      // Evict oldest or inactive
      const firstInactive = this.pathogens.findIndex((p) => !p.active);
      if (firstInactive >= 0) {
        this.pathogens.splice(firstInactive, 1);
      } else {
        this.pathogens.shift();
      }
    }

    this.pathogens.push(pathogen);
    return pathogen;
  }

  public spawnMicroSpikers(parent: Pathogen): Pathogen[] {
    const children: Pathogen[] = [];
    const offsets = [-0.4, 0.4];

    for (const offset of offsets) {
      const angle = parent.angle + offset;
      const speed = parent.speed * 1.3;
      const child: Pathogen = {
        id: this.nextPathogenId++,
        type: 'spiker',
        x: parent.x + Math.cos(angle + Math.PI / 2) * 12,
        y: parent.y + Math.sin(angle + Math.PI / 2) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 9,
        hp: 1,
        maxHp: 1,
        speed,
        angle,
        damage: 5,
        scoreValue: 75,
        isMicroSpiker: true,
        timeAlive: 0,
        wobblePhase: Math.random() * Math.PI * 2,
        active: true,
      };
      children.push(child);
      if (this.pathogens.length < this.maxPathogens) {
        this.pathogens.push(child);
      }
    }
    return children;
  }

  public checkProjectileCollisions(projectiles: Projectile[]): CollisionHit[] {
    const hits: CollisionHit[] = [];

    for (let pIdx = 0; pIdx < projectiles.length; pIdx++) {
      const proj = projectiles[pIdx];
      if (!proj.active) continue;

      for (let eIdx = 0; eIdx < this.pathogens.length; eIdx++) {
        const pathogen = this.pathogens[eIdx];
        if (!pathogen.active) continue;

        const dx = proj.x - pathogen.x;
        const dy = proj.y - pathogen.y;
        const distSq = dx * dx + dy * dy;
        const hitRadius = pathogen.radius + proj.radius;

        if (distSq <= hitRadius * hitRadius) {
          proj.active = false;
          pathogen.hp -= proj.damage;

          let killed = false;
          let splitChildren: Pathogen[] = [];

          if (pathogen.hp <= 0) {
            pathogen.active = false;
            killed = true;

            if (pathogen.type === 'splitter' && !pathogen.isMicroSpiker) {
              splitChildren = this.spawnMicroSpikers(pathogen);
            }
          }

          hits.push({
            pathogen,
            projectile: proj,
            killed,
            splitChildren,
          });

          break; // Projectile consumed on hit
        }
      }
    }

    return hits;
  }

  public checkNucleusCollisions(nucleus: NucleusState): BreachHit[] {
    const breaches: BreachHit[] = [];

    for (let i = 0; i < this.pathogens.length; i++) {
      const pathogen = this.pathogens[i];
      if (!pathogen.active) continue;

      const dx = this.centerX - pathogen.x;
      const dy = this.centerY - pathogen.y;
      const distSq = dx * dx + dy * dy;
      const breachRadius = nucleus.radius + pathogen.radius;

      if (distSq <= breachRadius * breachRadius) {
        pathogen.active = false;
        nucleus.takeDamage(pathogen.damage);
        breaches.push({
          pathogen,
          damage: pathogen.damage,
        });
      }
    }

    return breaches;
  }

  public update(dt: number): void {
    for (let i = 0; i < this.pathogens.length; i++) {
      const p = this.pathogens[i];
      if (!p.active) continue;

      p.timeAlive += dt;

      // Organic subtle wobble perpendicular to direction vector
      const wobble = Math.sin(p.timeAlive * 6 + p.wobblePhase) * 15;
      const perpAngle = p.angle + Math.PI / 2;

      p.x += (Math.cos(p.angle) * p.speed + Math.cos(perpAngle) * wobble) * dt;
      p.y += (Math.sin(p.angle) * p.speed + Math.sin(perpAngle) * wobble) * dt;

      // Update angle to home gently towards center
      const currentToCenter = Math.atan2(this.centerY - p.y, this.centerX - p.x);
      p.angle = currentToCenter;
    }

    this.pathogens = this.pathogens.filter((p) => p.active);
  }

  public clear(): void {
    this.pathogens = [];
  }
}
