import { describe, it, expect, beforeEach } from 'vitest';
import { RoomManager, DoorEntity, RoomData } from '../src/RoomManager';
import { TileMap } from '../src/TileMap';

describe('RoomManager', () => {
  let roomManager: RoomManager;
  let room1: RoomData;
  let room2: RoomData;

  beforeEach(() => {
    roomManager = new RoomManager();

    const ascii1 = [
      '####################',
      '#..................#',
      '#..D............D..#',
      '####################',
    ];
    const map1 = TileMap.fromString(ascii1, 32);
    const doors1: DoorEntity[] = [
      { id: 'door-left', col: 3, row: 2, targetRoomId: 'room-2', targetDoorId: 'door-entry' },
      { id: 'door-right', col: 16, row: 2, targetRoomId: 'room-2', targetDoorId: 'door-entry' },
    ];
    room1 = {
      id: 'room-1',
      name: 'Forest Path',
      tileMap: map1,
      doors: doors1,
      defaultSpawn: { x: 32, y: 64 },
    };

    const ascii2 = [
      '####################',
      '#..................#',
      '#....D.............#',
      '####################',
    ];
    const map2 = TileMap.fromString(ascii2, 32);
    const doors2: DoorEntity[] = [
      { id: 'door-entry', col: 5, row: 2, targetRoomId: 'room-1', targetDoorId: 'door-left' },
    ];
    room2 = {
      id: 'room-2',
      name: 'Crystal Cavern',
      tileMap: map2,
      doors: doors2,
      defaultSpawn: { x: 64, y: 64 },
    };

    roomManager.addRoom(room1);
    roomManager.addRoom(room2);
  });

  it('registers multiple rooms and loads room with spawn point', () => {
    expect(roomManager.hasRoom('room-1')).toBe(true);
    expect(roomManager.hasRoom('room-2')).toBe(true);

    const loaded = roomManager.loadRoom('room-1');
    expect(loaded.room.id).toBe('room-1');
    expect(loaded.spawnPos).toEqual({ x: 32, y: 64 });
    expect(roomManager.activeRoom?.id).toBe('room-1');

    // Load with targetDoorId
    const loaded2 = roomManager.loadRoom('room-2', 'door-entry');
    expect(loaded2.room.id).toBe('room-2');
    // Door is at col 5, row 2 -> 5 * 32 = 160, 2 * 32 = 64
    expect(loaded2.spawnPos).toEqual({ x: 160, y: 64 });
  });

  it('falls back to default spawn if target door is missing or invalid (T-56-03 mitigation)', () => {
    const loaded = roomManager.loadRoom('room-1', 'non-existent-door');
    expect(loaded.room.id).toBe('room-1');
    expect(loaded.spawnPos).toEqual({ x: 32, y: 64 });
  });

  it('detects door interaction only when player overlaps door and presses UP', () => {
    roomManager.loadRoom('room-1');
    // Door left is at col 3, row 2 -> bounds: x=96, y=64, w=32, h=32
    const playerAtDoor = { x: 100, y: 70, width: 20, height: 20 };
    const playerAway = { x: 200, y: 70, width: 20, height: 20 };

    // Player at door but not pressing up
    expect(roomManager.checkDoorInteraction(playerAtDoor, false)).toBeNull();

    // Player away pressing up
    expect(roomManager.checkDoorInteraction(playerAway, true)).toBeNull();

    // Player at door pressing up
    const door = roomManager.checkDoorInteraction(playerAtDoor, true);
    expect(door).not.toBeNull();
    expect(door?.id).toBe('door-left');
  });

  it('manages transition state machine (fade_out -> switching -> fade_in -> idle)', () => {
    roomManager.loadRoom('room-1');
    const door = room1.doors[0];

    expect(roomManager.isTransitioning()).toBe(false);
    expect(roomManager.getTransitionAlpha()).toBe(0);

    roomManager.startTransition(door, 0.2); // 200ms per phase
    expect(roomManager.isTransitioning()).toBe(true);
    expect(roomManager.state).toBe('fade_out');

    // Update half-way through fade-out
    roomManager.updateTransition(0.1, () => {});
    expect(roomManager.state).toBe('fade_out');
    expect(roomManager.getTransitionAlpha()).toBeCloseTo(0.5, 2);

    // Complete fade-out, triggering switch
    let switchedRoomId = '';
    let switchedSpawn = { x: 0, y: 0 };
    roomManager.updateTransition(0.11, (newRoom, spawnPos) => {
      switchedRoomId = newRoom.id;
      switchedSpawn = spawnPos;
    });

    expect(switchedRoomId).toBe('room-2');
    expect(switchedSpawn).toEqual({ x: 160, y: 64 });
    expect(roomManager.state).toBe('fade_in');
    expect(roomManager.activeRoom?.id).toBe('room-2');

    // Fade in
    roomManager.updateTransition(0.1, () => {});
    expect(roomManager.state).toBe('fade_in');
    expect(roomManager.getTransitionAlpha()).toBeCloseTo(0.5, 2);

    // Finish fade in
    roomManager.updateTransition(0.11, () => {});
    expect(roomManager.state).toBe('idle');
    expect(roomManager.isTransitioning()).toBe(false);
    expect(roomManager.getTransitionAlpha()).toBe(0);
  });
});
