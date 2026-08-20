import { TrackLane, Cart } from './Cart.js';
import { StackPhysics, FallingItemType } from './StackPhysics.js';

export type { FallingItemType } from './StackPhysics.js';

export interface FallingItem {
  id: string;
  type: FallingItemType;
  lane: TrackLane;
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  alive: boolean;
  basePoints: number;
}

export interface ItemCollisionResult {
  hit: boolean;
  item?: FallingItem;
  caught: boolean;
  isBomb: boolean;
  isRepair: boolean;
  isShield: boolean;
}

export class FallingItemManager {
  items: FallingItem[] = [];
  spawnTimer: number = 0;
  spawnInterval: number = 1.2;
  baseFallSpeed: number = 180;
  missedCrates: number = 0;
  idCounter: number = 0;
  round: number = 1;
  screenWidth: number = 800;
  screenHeight: number = 600;

  reset(): void {
    this.items = [];
    this.spawnTimer = 0;
    this.spawnInterval = 1.2;
    this.baseFallSpeed = 180;
    this.missedCrates = 0;
    this.idCounter = 0;
    this.round = 1;
  }

  setRound(round: number): void {
    this.round = round;
    this.baseFallSpeed = 180 + (round - 1) * 35;
    this.spawnInterval = Math.max(0.5, 1.2 - (round - 1) * 0.1);
  }

  spawnItem(forcedType?: FallingItemType, forcedLane?: TrackLane, forcedX?: number): FallingItem {
    const lane: TrackLane = forcedLane ?? (Math.random() < 0.55 ? 'front' : 'back');

    let type: FallingItemType;
    if (forcedType) {
      type = forcedType;
    } else {
      const bombChance = 0.15 + Math.min(0.20, (this.round - 1) * 0.03);
      const powerupChance = 0.08;
      const roll = Math.random();

      if (roll < bombChance) {
        type = 'bomb';
      } else if (roll < bombChance + powerupChance) {
        type = Math.random() < 0.5 ? 'powerup_repair' : 'powerup_shield';
      } else {
        const crateRoll = Math.random();
        if (crateRoll < 0.40) {
          type = 'crate_small';
        } else if (crateRoll < 0.70) {
          type = 'crate_medium';
        } else if (crateRoll < 0.90) {
          type = 'crate_large';
        } else {
          type = 'crate_golden';
        }
      }
    }

    let width = 32;
    let height = 24;
    let basePoints = 0;

    switch (type) {
      case 'crate_small':
        width = 32;
        height = 24;
        basePoints = 100;
        break;
      case 'crate_medium':
        width = 44;
        height = 30;
        basePoints = 150;
        break;
      case 'crate_large':
        width = 56;
        height = 36;
        basePoints = 200;
        break;
      case 'crate_golden':
        width = 40;
        height = 30;
        basePoints = 500;
        break;
      case 'powerup_repair':
        width = 30;
        height = 30;
        basePoints = 0;
        break;
      case 'powerup_shield':
        width = 30;
        height = 30;
        basePoints = 0;
        break;
      case 'bomb':
        width = 32;
        height = 32;
        basePoints = 0;
        break;
    }

    if (lane === 'back') {
      width *= 0.85;
      height *= 0.85;
    }

    const x = forcedX !== undefined ? forcedX : 30 + Math.random() * (this.screenWidth - width - 60);
    const y = -height;
    const vy = this.baseFallSpeed * (0.9 + Math.random() * 0.2);

    const item: FallingItem = {
      id: `item_${++this.idCounter}`,
      type,
      lane,
      x,
      y,
      width,
      height,
      vy,
      alive: true,
      basePoints,
    };

    this.items.push(item);
    return item;
  }

  update(dt: number): void {
    this.spawnTimer += dt;
    while (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer -= this.spawnInterval;
      this.spawnItem();
    }

    for (const item of this.items) {
      if (item.alive) {
        item.y += item.vy * dt;
        if (item.y > this.screenHeight + 20) {
          item.alive = false;
          if (item.type.startsWith('crate_')) {
            this.missedCrates++;
          }
        }
      }
    }
  }

  checkCatch(cart: Cart, stackPhysics: StackPhysics): ItemCollisionResult[] {
    const results: ItemCollisionResult[] = [];
    const scale = cart.getEffectiveScale();
    const cartY = cart.lane === 'front' ? cart.frontLaneY : cart.backLaneY;
    const targetCatchY = stackPhysics.crates.length > 0 ? stackPhysics.getStackTopY(cartY) : cartY;
    const topCrate = stackPhysics.crates.length > 0 ? stackPhysics.crates[stackPhysics.crates.length - 1] : null;
    const catchWidth = (topCrate ? topCrate.width + 30 : cart.width + 20) * scale;
    const catchCenterX = cart.x + (cart.width * scale) / 2;

    for (const item of this.items) {
      if (!item.alive) continue;
      if (item.lane !== cart.lane) continue;

      const itemCenterX = item.x + item.width / 2;
      const horizontalMatch = Math.abs(itemCenterX - catchCenterX) <= catchWidth / 2 + item.width / 3;

      // Generous vertical catch window: catches even when falling fast or close to the rim/top
      const itemBottom = item.y + item.height;
      const verticalMatch = itemBottom >= targetCatchY - 24 && item.y <= targetCatchY + 36;

      if (horizontalMatch && verticalMatch) {
        item.alive = false;
        if (item.type === 'bomb') {
          results.push({
            hit: true,
            item,
            caught: false,
            isBomb: true,
            isRepair: false,
            isShield: false,
          });
        } else if (item.type === 'powerup_repair') {
          results.push({
            hit: true,
            item,
            caught: true,
            isBomb: false,
            isRepair: true,
            isShield: false,
          });
        } else if (item.type === 'powerup_shield') {
          results.push({
            hit: true,
            item,
            caught: true,
            isBomb: false,
            isRepair: false,
            isShield: true,
          });
        } else {
          const offset = itemCenterX - catchCenterX;
          stackPhysics.addCrate(item, offset);
          results.push({
            hit: true,
            item,
            caught: true,
            isBomb: false,
            isRepair: false,
            isShield: false,
          });
        }
      }
    }

    return results;
  }

  cullOffscreen(): void {
    this.items = this.items.filter((i) => i.alive);
  }
}
