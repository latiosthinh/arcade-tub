import { BranchPlatform, BambooTrunk, Rect } from './types';

export class TreeCanopy {
  branches: BranchPlatform[] = [];
  trunks: BambooTrunk[] = [];

  constructor() {
    this.setupDefaultForest();
  }

  setupDefaultForest(): void {
    this.trunks = [
      { id: 'trunk_1', x: 200, topY: 100, bottomY: 560, width: 16 },
      { id: 'trunk_2', x: 500, topY: 80, bottomY: 560, width: 16 },
      { id: 'trunk_3', x: 800, topY: 120, bottomY: 560, width: 16 },
      { id: 'trunk_4', x: 1050, topY: 60, bottomY: 560, width: 16 },
    ];

    this.branches = [
      { id: 'b_1', x: 160, y: 420, width: 90, height: 10 },
      { id: 'b_2', x: 210, y: 280, width: 100, height: 10 },
      { id: 'b_3', x: 460, y: 380, width: 90, height: 10 },
      { id: 'b_4', x: 510, y: 220, width: 110, height: 10 },
      { id: 'b_5', x: 760, y: 340, width: 90, height: 10 },
      { id: 'b_6', x: 810, y: 190, width: 100, height: 10 },
      { id: 'b_7', x: 1010, y: 300, width: 90, height: 10 },
    ];
  }

  checkBranchLanding(x: number, y: number, width: number, height: number, prevY: number): BranchPlatform | null {
    const bottom = y + height;
    const prevBottom = prevY + height;

    for (const b of this.branches) {
      // Horizontal overlap
      const overlapX = x + width > b.x && x < b.x + b.width;
      // Swept vertical landing check
      const crossedTop = prevBottom <= b.y + 4 && bottom >= b.y;

      if (overlapX && crossedTop) {
        return b;
      }
    }
    return null;
  }

  checkTrunkGrip(bounds: Rect): BambooTrunk | null {
    for (const t of this.trunks) {
      const overlapX = bounds.x + bounds.width >= t.x - 4 && bounds.x <= t.x + t.width + 4;
      const overlapY = bounds.y + bounds.height >= t.topY && bounds.y <= t.bottomY;
      if (overlapX && overlapY) {
        return t;
      }
    }
    return null;
  }
}
