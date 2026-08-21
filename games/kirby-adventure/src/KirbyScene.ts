import { Camera } from './Camera';
import { RoomManager, RoomData, DoorEntity } from './RoomManager';
import { KirbyPhysics } from './KirbyPhysics';
import { TileMap } from './TileMap';
import { TileType, InputState, GameScene, SimpleInputManager } from './types';

export class KirbyScene implements GameScene {
  input: SimpleInputManager;
  camera: Camera;
  physics: KirbyPhysics;
  roomManager: RoomManager;

  private customInput: InputState | null = null;
  private prevJumpDown = false;
  private isInitialized = false;

  constructor(input?: SimpleInputManager) {
    this.input = input ?? new SimpleInputManager();
    this.camera = new Camera({ viewportWidth: 800, viewportHeight: 600 });
    this.physics = new KirbyPhysics({ x: 100, y: 100, width: 24, height: 24 });
    this.roomManager = new RoomManager();

    this.setupRooms();
  }

  private setupRooms(): void {
    // 60x18 outdoor stage
    const outdoorAscii = [
      '............................................................',
      '............................................................',
      '............................................................',
      '............................................................',
      '............................................................',
      '............................................................',
      '............................................................',
      '............................................................',
      '............................................................',
      '............................................................',
      '......................=======...............................',
      '............................................................',
      '.............***.................................D..........',
      '.........#######............................################',
      '......##....................................################',
      '################.....^^^^^..................################',
      '############################################################',
      '############################################################',
    ];

    const outdoorMap = TileMap.fromString(outdoorAscii, 32);
    const outdoorDoors: DoorEntity[] = [
      { id: 'door-to-cave', col: 49, row: 12, targetRoomId: 'stage-1-cave', targetDoorId: 'door-from-outdoor' },
    ];
    const outdoorRoom: RoomData = {
      id: 'stage-1-1',
      name: 'Green Greens - Zone 1',
      tileMap: outdoorMap,
      doors: outdoorDoors,
      defaultSpawn: { x: 64, y: 400 },
    };

    // 40x18 indoor cavern stage
    const caveAscii = [
      '########################################',
      '########################################',
      '##....................................##',
      '##....................................##',
      '##....................................##',
      '##....................................##',
      '##....................................##',
      '##...................========.........##',
      '##....................................##',
      '##....................................##',
      '##.........***........................##',
      '##......######........................##',
      '##..D.................................##',
      '################......................##',
      '######################............######',
      '######################^^^^^^^^^^^^######',
      '########################################',
      '########################################',
    ];

    const caveMap = TileMap.fromString(caveAscii, 32);
    const caveDoors: DoorEntity[] = [
      { id: 'door-from-outdoor', col: 4, row: 12, targetRoomId: 'stage-1-1', targetDoorId: 'door-to-cave' },
    ];
    const caveRoom: RoomData = {
      id: 'stage-1-cave',
      name: 'Crystal Underground',
      tileMap: caveMap,
      doors: caveDoors,
      defaultSpawn: { x: 128, y: 350 },
    };

    this.roomManager.addRoom(outdoorRoom);
    this.roomManager.addRoom(caveRoom);
  }

  init(viewportWidth = 800, viewportHeight = 600): void {
    this.camera = new Camera({ viewportWidth, viewportHeight });
    const { room, spawnPos } = this.roomManager.loadRoom('stage-1-1');

    this.camera.setBounds(room.tileMap.widthInPixels, room.tileMap.heightInPixels);
    this.physics.x = spawnPos.x;
    this.physics.y = spawnPos.y;
    this.camera.snapTo(this.physics.x, this.physics.y);
    this.isInitialized = true;
  }

  setCustomInput(input: InputState | null): void {
    this.customInput = input;
  }

  private pollInput(): InputState {
    if (this.customInput) {
      return this.customInput;
    }

    const left = this.input.isDown('ArrowLeft') || this.input.isDown('KeyA');
    const right = this.input.isDown('ArrowRight') || this.input.isDown('KeyD');
    const up = this.input.isDown('ArrowUp') || this.input.isDown('KeyW');
    const down = this.input.isDown('ArrowDown') || this.input.isDown('KeyS');
    const jumpDown = this.input.isDown('Space') || this.input.isDown('KeyZ') || this.input.isDown('KeyK');

    const jumpJustPressed = jumpDown && !this.prevJumpDown;
    const jumpJustReleased = !jumpDown && this.prevJumpDown;
    this.prevJumpDown = jumpDown;

    return {
      left,
      right,
      up,
      down,
      jump: jumpDown,
      jumpJustPressed,
      jumpJustReleased,
    };
  }

  update(dt: number): void {
    if (!this.isInitialized) {
      this.init();
    }

    // Clamp dt inside update to not skip transition phases
    const updateDt = dt;
    const inputState = this.pollInput();

    if (this.roomManager.isTransitioning()) {
      this.roomManager.updateTransition(updateDt, (newRoom, spawnPos) => {
        this.camera.setBounds(newRoom.tileMap.widthInPixels, newRoom.tileMap.heightInPixels);
        this.physics.x = spawnPos.x;
        this.physics.y = spawnPos.y;
        this.physics.vx = 0;
        this.physics.vy = 0;
        this.camera.snapTo(this.physics.x, this.physics.y);
      });
    } else {
      const door = this.roomManager.checkDoorInteraction(this.physics.getBounds(), inputState.up);
      if (door) {
        this.roomManager.startTransition(door);
      } else if (this.roomManager.activeRoom) {
        const clampedPhysicsDt = Math.min(updateDt, 0.05);
        this.physics.update(clampedPhysicsDt, inputState, this.roomManager.activeRoom.tileMap);
      }
    }

    this.camera.update(
      this.physics.x + this.physics.width / 2,
      this.physics.y + this.physics.height / 2,
      this.physics.facing,
      updateDt,
    );

    this.input.update();
  }

  render(ctx: CanvasRenderingContext2D): void {
    const activeRoom = this.roomManager.activeRoom;
    if (!activeRoom) return;

    const { viewportWidth, viewportHeight } = this.camera;
    const tileSize = activeRoom.tileMap.tileSize;

    // 1. Clear / Sky background
    ctx.fillStyle = activeRoom.id === 'stage-1-1' ? '#70c5ff' : '#181425';
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);

    // 2. Parallax background scenery
    if (activeRoom.id === 'stage-1-1') {
      ctx.fillStyle = '#a3e0ff';
      const cloudScroll = (this.camera.x * 0.2) % 400;
      for (let cx = -cloudScroll; cx < viewportWidth + 400; cx += 300) {
        ctx.beginPath();
        ctx.arc(cx, 120, 45, 0, Math.PI * 2);
        ctx.arc(cx + 35, 110, 55, 0, Math.PI * 2);
        ctx.arc(cx + 70, 120, 40, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#62b57b';
      const hillScroll = (this.camera.x * 0.4) % 600;
      for (let hx = -hillScroll; hx < viewportWidth + 600; hx += 400) {
        ctx.beginPath();
        ctx.arc(hx, viewportHeight + 50, 200, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Render Culled Tiles
    const bounds = this.camera.getVisibleTileBounds(
      tileSize,
      activeRoom.tileMap.cols,
      activeRoom.tileMap.rows,
    );

    for (let r = bounds.startRow; r <= bounds.endRow; r++) {
      for (let c = bounds.startCol; c <= bounds.endCol; c++) {
        const tileType = activeRoom.tileMap.getTile(c, r);
        if (tileType === TileType.AIR) continue;

        const screenPos = this.camera.worldToScreen(c * tileSize, r * tileSize);

        switch (tileType) {
          case TileType.SOLID:
            ctx.fillStyle = activeRoom.id === 'stage-1-1' ? '#4d8a35' : '#3f3851';
            ctx.fillRect(screenPos.x, screenPos.y, tileSize, tileSize);
            // Grass topper on outdoor solid tiles
            if (activeRoom.id === 'stage-1-1' && activeRoom.tileMap.getTile(c, r - 1) === TileType.AIR) {
              ctx.fillStyle = '#7ac943';
              ctx.fillRect(screenPos.x, screenPos.y, tileSize, 6);
            }
            break;

          case TileType.ONE_WAY:
            ctx.fillStyle = '#b07842';
            ctx.fillRect(screenPos.x, screenPos.y, tileSize, 8);
            ctx.fillStyle = '#8f5727';
            ctx.fillRect(screenPos.x, screenPos.y + 6, tileSize, 2);
            break;

          case TileType.HAZARD:
            ctx.fillStyle = '#de3838';
            ctx.beginPath();
            ctx.moveTo(screenPos.x, screenPos.y + tileSize);
            ctx.lineTo(screenPos.x + tileSize / 2, screenPos.y);
            ctx.lineTo(screenPos.x + tileSize, screenPos.y + tileSize);
            ctx.closePath();
            ctx.fill();
            break;

          case TileType.BREAKABLE:
            ctx.fillStyle = '#fbb829';
            ctx.fillRect(screenPos.x + 2, screenPos.y + 2, tileSize - 4, tileSize - 4);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(screenPos.x + tileSize / 2 - 2, screenPos.y + tileSize / 2 - 2, 4, 4);
            break;
        }
      }
    }

    // 4. Render Doors
    for (const door of activeRoom.doors) {
      const doorScreen = this.camera.worldToScreen(door.col * tileSize, door.row * tileSize);
      ctx.fillStyle = '#6a4023';
      ctx.fillRect(doorScreen.x + 4, doorScreen.y, tileSize - 8, tileSize);
      ctx.fillStyle = '#ffd15c';
      ctx.beginPath();
      ctx.arc(doorScreen.x + tileSize / 2, doorScreen.y + 8, tileSize / 2 - 4, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#111111';
      ctx.fillRect(doorScreen.x + 8, doorScreen.y + 8, tileSize - 16, tileSize - 8);
    }

    // 5. Render Kirby Proxy Character
    const kirbyScreen = this.camera.worldToScreen(this.physics.x, this.physics.y);
    const centerX = kirbyScreen.x + this.physics.width / 2;
    const centerY = kirbyScreen.y + this.physics.height / 2;
    const radius = this.physics.width / 2;

    // Body
    ctx.fillStyle = '#ff7b9c';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e04875';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eyes
    const eyeOffset = this.physics.facing * 3;
    ctx.fillStyle = '#211832';
    ctx.beginPath();
    ctx.ellipse(centerX + eyeOffset - 2, centerY - 2, 2, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(centerX + eyeOffset + 4, centerY - 2, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks
    ctx.fillStyle = '#ff3366';
    ctx.beginPath();
    ctx.arc(centerX + eyeOffset - 6, centerY + 3, 2, 0, Math.PI * 2);
    ctx.arc(centerX + eyeOffset + 8, centerY + 3, 2, 0, Math.PI * 2);
    ctx.fill();

    // Feet
    ctx.fillStyle = '#d62246';
    ctx.beginPath();
    ctx.ellipse(centerX - 6, centerY + radius - 2, 5, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(centerX + 6, centerY + radius - 2, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. Transition Overlay (Fade)
    if (this.roomManager.isTransitioning()) {
      const alpha = this.roomManager.getTransitionAlpha();
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(0, 0, viewportWidth, viewportHeight);
    }

    // 7. HUD / Debug Stats
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText(`Room: ${activeRoom.name}`, 12, 20);
    ctx.fillText(
      `Pos: (${Math.round(this.physics.x)}, ${Math.round(this.physics.y)}) | Grounded: ${this.physics.grounded}`,
      12,
      36,
    );
  }
}
