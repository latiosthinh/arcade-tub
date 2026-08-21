import { SaveManager } from './SaveManager';

export interface MapNode {
  id: string;
  stageId: string;
  x: number;
  y: number;
  label: string;
  isBoss?: boolean;
}

export class WorldMapScene {
  currentWorld = 1;
  selectedNodeIndex = 0;
  nodes: MapNode[] = [];

  constructor(private saveManager: SaveManager) {
    this.loadWorld(1);
  }

  loadWorld(worldNum: number): void {
    this.currentWorld = worldNum;
    this.selectedNodeIndex = 0;
    this.nodes = [
      { id: 'n1', stageId: `${worldNum}-1`, x: 40, y: 100, label: '1' },
      { id: 'n2', stageId: `${worldNum}-2`, x: 80, y: 80, label: '2' },
      { id: 'n3', stageId: `${worldNum}-3`, x: 120, y: 110, label: '3' },
      { id: 'n4', stageId: `${worldNum}-4`, x: 160, y: 90, label: '4' },
      { id: 'nboss', stageId: `${worldNum}-boss`, x: 200, y: 100, label: 'BOSS', isBoss: true },
    ];
  }

  isNodeUnlocked(index: number): boolean {
    if (index === 0) return true;
    const prevNode = this.nodes[index - 1];
    return this.saveManager.isStageCompleted(prevNode.stageId);
  }

  moveNext(): boolean {
    if (this.selectedNodeIndex < this.nodes.length - 1) {
      if (this.isNodeUnlocked(this.selectedNodeIndex + 1)) {
        this.selectedNodeIndex += 1;
        return true;
      }
    }
    return false;
  }

  movePrev(): boolean {
    if (this.selectedNodeIndex > 0) {
      this.selectedNodeIndex -= 1;
      return true;
    }
    return false;
  }

  getSelectedStageId(): string {
    return this.nodes[this.selectedNodeIndex].stageId;
  }
}
