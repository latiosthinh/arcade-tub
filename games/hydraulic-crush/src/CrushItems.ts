export interface CrushItemDef {
  id: string;
  name: string;
  stiffness: number; // 0.0 (soft) to 1.0 (hard/unyielding)
  yieldThreshold: number; // displacement fraction at which collapse occurs
  yieldPressure: number; // pressure (bar) threshold
  wrinkleLayers: number;
  splatterColor: string;
  particleCount: number;
  explosionForce: number;
  isJuicy: boolean;
  unbreakable?: boolean;
  soundProfile: 'squish' | 'crunch' | 'metallic' | 'glass';
  baseColor: string;
  accentColor: string;
}

export interface DeformationState {
  scaleX: number;
  scaleY: number;
  wrinkleOffset: number;
  isCrushed: boolean;
}

export const CRUSH_ITEMS: Record<string, CrushItemDef> = {
  duck: {
    id: 'duck',
    name: 'Rubber Duck',
    stiffness: 0.15,
    yieldThreshold: 0.85,
    yieldPressure: 350,
    wrinkleLayers: 3,
    splatterColor: '#f1c40f',
    particleCount: 25,
    explosionForce: 7.0,
    isJuicy: false,
    soundProfile: 'squish',
    baseColor: '#f1c40f',
    accentColor: '#e67e22'
  },
  can: {
    id: 'can',
    name: 'Soda Can',
    stiffness: 0.45,
    yieldThreshold: 0.65,
    yieldPressure: 450,
    wrinkleLayers: 6,
    splatterColor: '#e74c3c',
    particleCount: 40,
    explosionForce: 9.0,
    isJuicy: true,
    soundProfile: 'metallic',
    baseColor: '#e74c3c',
    accentColor: '#bdc3c7'
  },
  clock: {
    id: 'clock',
    name: 'Alarm Clock',
    stiffness: 0.6,
    yieldThreshold: 0.5,
    yieldPressure: 600,
    wrinkleLayers: 4,
    splatterColor: '#34495e',
    particleCount: 45,
    explosionForce: 10.0,
    isJuicy: false,
    soundProfile: 'crunch',
    baseColor: '#3498db',
    accentColor: '#f39c12'
  },
  watermelon: {
    id: 'watermelon',
    name: 'Watermelon',
    stiffness: 0.3,
    yieldThreshold: 0.4,
    yieldPressure: 300,
    wrinkleLayers: 2,
    splatterColor: '#e74c3c',
    particleCount: 60,
    explosionForce: 12.0,
    isJuicy: true,
    soundProfile: 'squish',
    baseColor: '#2ecc71',
    accentColor: '#e74c3c'
  },
  slime: {
    id: 'slime',
    name: 'Slime Ball',
    stiffness: 0.08,
    yieldThreshold: 0.92,
    yieldPressure: 200,
    wrinkleLayers: 5,
    splatterColor: '#9b59b6',
    particleCount: 50,
    explosionForce: 8.5,
    isJuicy: true,
    soundProfile: 'squish',
    baseColor: '#a55eea',
    accentColor: '#26de81'
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    stiffness: 1.0,
    yieldThreshold: 1.0,
    yieldPressure: 9999,
    wrinkleLayers: 1,
    splatterColor: '#00d2d3',
    particleCount: 10,
    explosionForce: 4.0,
    isJuicy: false,
    unbreakable: true,
    soundProfile: 'glass',
    baseColor: '#00d2d3',
    accentColor: '#54a0ff'
  }
};

export class CrushItemManager {
  private items: Record<string, CrushItemDef>;

  constructor(items: Record<string, CrushItemDef> = CRUSH_ITEMS) {
    this.items = items;
  }

  public getItem(id: string): CrushItemDef {
    const item = this.items[id];
    if (!item) {
      return this.items['duck'];
    }
    return item;
  }

  public getAllItems(): CrushItemDef[] {
    return Object.values(this.items);
  }

  public getDeformation(item: CrushItemDef, displacement: number): DeformationState {
    const clampedDisp = Math.max(0, Math.min(1.0, displacement));
    
    // Vertical squash scale
    const scaleY = Math.max(0.08, 1.0 - clampedDisp * 0.9);
    
    // Volume preserving horizontal accordion bulge: scaleX = 1 / scaleY (for 2D area preservation) or clamped
    const scaleX = Math.min(3.5, 1.0 / scaleY);
    
    // Wrinkle wobble offset
    const wrinkleOffset = Math.sin(clampedDisp * Math.PI * item.wrinkleLayers) * 6 * clampedDisp;
    
    return {
      scaleX,
      scaleY,
      wrinkleOffset,
      isCrushed: clampedDisp >= item.yieldThreshold && !item.unbreakable
    };
  }

  public checkYieldCollapse(item: CrushItemDef, pressure: number, displacement: number): boolean {
    if (item.unbreakable) return false;
    return displacement >= item.yieldThreshold || pressure >= item.yieldPressure;
  }
}
