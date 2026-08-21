import { Point, Rect } from './types';
import { TileMap } from './TileMap';

export interface DoorEntity {
  id: string;
  col: number;
  row: number;
  targetRoomId: string;
  targetDoorId: string;
}

export interface RoomData {
  id: string;
  name: string;
  tileMap: TileMap;
  doors: DoorEntity[];
  defaultSpawn: Point;
}

export type TransitionState = 'idle' | 'fade_out' | 'switching' | 'fade_in';

export class RoomManager {
  private rooms = new Map<string, RoomData>();
  activeRoom: RoomData | null = null;

  state: TransitionState = 'idle';
  private timer = 0;
  private duration = 0.3; // 300ms fade per direction
  private pendingDoor: DoorEntity | null = null;

  addRoom(room: RoomData): void {
    this.rooms.set(room.id, room);
  }

  hasRoom(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  getRoom(roomId: string): RoomData | undefined {
    return this.rooms.get(roomId);
  }

  loadRoom(roomId: string, targetDoorId?: string): { room: RoomData; spawnPos: Point } {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`Room with ID "${roomId}" not found.`);
    }

    this.activeRoom = room;

    let spawnPos: Point = { ...room.defaultSpawn };

    if (targetDoorId) {
      const door = room.doors.find((d) => d.id === targetDoorId);
      if (door) {
        spawnPos = {
          x: door.col * room.tileMap.tileSize,
          y: door.row * room.tileMap.tileSize,
        };
      }
    }

    return { room, spawnPos };
  }

  checkDoorInteraction(playerBounds: Rect, inputUp: boolean): DoorEntity | null {
    if (!this.activeRoom || !inputUp) {
      return null;
    }

    const tileSize = this.activeRoom.tileMap.tileSize;

    for (const door of this.activeRoom.doors) {
      const doorBounds: Rect = {
        x: door.col * tileSize,
        y: door.row * tileSize,
        width: tileSize,
        height: tileSize,
      };

      if (
        playerBounds.x < doorBounds.x + doorBounds.width &&
        playerBounds.x + playerBounds.width > doorBounds.x &&
        playerBounds.y < doorBounds.y + doorBounds.height &&
        playerBounds.y + playerBounds.height > doorBounds.y
      ) {
        return door;
      }
    }

    return null;
  }

  startTransition(door: DoorEntity, duration = 0.3): void {
    this.pendingDoor = door;
    this.duration = Math.max(0.01, duration);
    this.timer = 0;
    this.state = 'fade_out';
  }

  updateTransition(dt: number, onRoomSwitch: (newRoom: RoomData, spawnPos: Point) => void): void {
    if (this.state === 'idle') return;

    this.timer += dt;

    if (this.state === 'fade_out') {
      if (this.timer >= this.duration) {
        this.state = 'switching';
        this.timer = 0;

        if (this.pendingDoor) {
          const targetRoomId = this.pendingDoor.targetRoomId;
          const targetDoorId = this.pendingDoor.targetDoorId;

          // Safe lookup with fallback (T-56-03)
          if (this.hasRoom(targetRoomId)) {
            const { room, spawnPos } = this.loadRoom(targetRoomId, targetDoorId);
            onRoomSwitch(room, spawnPos);
          } else if (this.activeRoom) {
            onRoomSwitch(this.activeRoom, this.activeRoom.defaultSpawn);
          }
        }

        this.state = 'fade_in';
      }
    } else if (this.state === 'fade_in') {
      if (this.timer >= this.duration) {
        this.state = 'idle';
        this.timer = 0;
        this.pendingDoor = null;
      }
    }
  }

  getTransitionAlpha(): number {
    if (this.state === 'idle') return 0;
    if (this.state === 'switching') return 1;
    if (this.state === 'fade_out') {
      return Math.min(1, this.timer / this.duration);
    }
    if (this.state === 'fade_in') {
      return Math.max(0, 1 - this.timer / this.duration);
    }
    return 0;
  }

  isTransitioning(): boolean {
    return this.state !== 'idle';
  }
}
