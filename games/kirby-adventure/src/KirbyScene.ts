import { Camera } from './Camera';
import { RoomManager, RoomData, DoorEntity } from './RoomManager';
import { KirbyPhysics } from './KirbyPhysics';
import { KirbyActions } from './KirbyActions';
import { KirbyRenderer } from './KirbyRenderer';
import { KirbyAudio } from './KirbyAudio';
import { HealthSystem } from './HealthSystem';
import { ProjectileManager } from './Projectile';
import { EnemyManager } from './enemies/EnemyManager';
import { FoodItemManager } from './FoodItem';
import { ParticleEmitter } from './ParticleEmitter';
import { AbilityRegistry } from './abilities/AbilityRegistry';
import { AbilityStar } from './abilities/AbilityStar';
import { CopyAbility } from './abilities/AbilityTypes';
import { TileMap } from './TileMap';
import { TileType, InputState, GameScene, SimpleInputManager, AbilityType } from './types';

export class KirbyScene implements GameScene {
  input: SimpleInputManager;
  camera: Camera;
  physics: KirbyPhysics;
  actions: KirbyActions;
  renderer: KirbyRenderer;
  audio: KirbyAudio;
  health: HealthSystem;
  projectiles: ProjectileManager;
  enemyManager: EnemyManager;
  foodManager: FoodItemManager;
  particles: ParticleEmitter;
  roomManager: RoomManager;

  currentAbility: CopyAbility | null = null;
  abilityStars: AbilityStar[] = [];

  private customInput: InputState | null = null;
  private prevJumpDown = false;
  private prevAttackDown = false;
  private prevDownDown = false;
  private prevDiscardDown = false;
  private isInitialized = false;

  constructor(input?: SimpleInputManager) {
    this.input = input ?? new SimpleInputManager();
    this.camera = new Camera({ viewportWidth: 800, viewportHeight: 600 });
    this.physics = new KirbyPhysics({ x: 100, y: 100, width: 24, height: 24 });
    this.actions = new KirbyActions();
    this.renderer = new KirbyRenderer();
    this.audio = new KirbyAudio();
    this.health = new HealthSystem();
    this.projectiles = new ProjectileManager();
    this.enemyManager = new EnemyManager();
    this.foodManager = new FoodItemManager();
    this.particles = new ParticleEmitter();
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
      name: 'Vegetable Valley - Zone 1',
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
      name: 'Crystal Cavern',
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

    this.spawnRoomEntities(room.id);
    this.isInitialized = true;
  }

  private spawnRoomEntities(roomId: string): void {
    this.enemyManager.clear();
    this.foodManager.clear();

    if (roomId === 'stage-1-1') {
      this.enemyManager.spawn('waddle_dee', 250, 420);
      this.enemyManager.spawn('waddle_doo', 450, 420);
      this.enemyManager.spawn('blade_knight', 650, 420);
      this.enemyManager.spawn('hot_head', 950, 420);
      this.enemyManager.spawn('sir_kibble', 1250, 420);

      this.foodManager.addItem('food', 400, 320);
      this.foodManager.addItem('maxim_tomato', 1100, 320);
    } else if (roomId === 'stage-1-cave') {
      this.enemyManager.spawn('sparky', 250, 360);
      this.enemyManager.spawn('chilly', 450, 360);
      this.enemyManager.spawn('rocky', 600, 200);
      this.foodManager.addItem('food', 350, 280);
    }
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
    const attackDown = this.input.isDown('KeyX') || this.input.isDown('KeyJ') || this.input.isDown('KeyB');
    const discardDown = this.input.isDown('KeyC') || this.input.isDown('KeyV');

    const jumpJustPressed = jumpDown && !this.prevJumpDown;
    const jumpJustReleased = !jumpDown && this.prevJumpDown;
    this.prevJumpDown = jumpDown;

    const attackJustPressed = attackDown && !this.prevAttackDown;
    const attackJustReleased = !attackDown && this.prevAttackDown;
    this.prevAttackDown = attackDown;

    const downJustPressed = down && !this.prevDownDown;
    this.prevDownDown = down;

    const discardJustPressed = discardDown && !this.prevDiscardDown;
    this.prevDiscardDown = discardDown;

    return {
      left,
      right,
      up,
      down,
      jump: jumpDown,
      jumpJustPressed,
      jumpJustReleased,
      attack: attackDown,
      attackJustPressed,
      attackJustReleased,
      discard: discardJustPressed,
    };
  }

  update(dt: number): void {
    if (!this.isInitialized) {
      this.init();
    }

    const updateDt = dt;
    const inputState = this.pollInput();
    const activeRoom = this.roomManager.activeRoom;

    if (this.roomManager.isTransitioning()) {
      this.roomManager.updateTransition(updateDt, (newRoom, spawnPos) => {
        this.camera.setBounds(newRoom.tileMap.widthInPixels, newRoom.tileMap.heightInPixels);
        this.physics.x = spawnPos.x;
        this.physics.y = spawnPos.y;
        this.physics.vx = 0;
        this.physics.vy = 0;
        this.camera.snapTo(this.physics.x, this.physics.y);
        this.spawnRoomEntities(newRoom.id);
      });
      return;
    }

    if (!activeRoom) return;

    // 1. Door Interaction
    const door = this.roomManager.checkDoorInteraction(this.physics.getBounds(), inputState.up);
    if (door) {
      this.roomManager.startTransition(door);
      return;
    }

    // 2. Kirby Core Action Handling
    // Ducking / Down State
    if (inputState.down && this.physics.grounded && !inputState.left && !inputState.right) {
      if (this.actions.mouthContent && inputState.down) {
        // Swallow
        const swallowed = this.actions.swallow();
        if (swallowed?.abilityGrant) {
          this.setAbility(swallowed.abilityGrant);
        }
      } else {
        this.actions.setDucking(true, this.physics);
      }
    } else {
      this.actions.setDucking(false, this.physics);
    }

    // Slide Attack (Down + Attack or Down + Jump)
    if (inputState.down && (inputState.attackJustPressed || (inputState.jumpJustPressed && this.physics.grounded))) {
      this.actions.startSlide(this.physics);
    }

    // Float Puffs & Exhale
    if (inputState.jumpJustPressed && !this.physics.grounded) {
      this.actions.puffFloat(this.physics);
      this.audio.playJump();
    }

    // Inhale / Attack
    if (this.currentAbility) {
      if (inputState.attackJustPressed) {
        this.currentAbility.activate(this.physics, this.projectiles);
      }
    } else {
      if (this.actions.mouthContent) {
        if (inputState.attackJustPressed) {
          this.actions.spit(this.physics, this.projectiles);
          this.audio.playSpit();
        }
      } else {
        if (inputState.attack) {
          this.actions.startInhale();
          this.audio.playInhale();
        } else {
          this.actions.stopInhale();
        }
      }
    }

    // Discard Ability
    if (inputState.discard && this.currentAbility) {
      this.dropAbility();
    }

    // Exhale if floating and attack pressed
    if (this.actions.isFloating && inputState.attackJustPressed) {
      this.actions.exhaleAirBullet(this.physics, this.projectiles);
      this.audio.playSpit();
    }

    // 3. Physics & Actions Tick
    const clampedPhysicsDt = Math.min(updateDt, 0.05);
    this.physics.update(clampedPhysicsDt, inputState, activeRoom.tileMap);
    this.actions.update(clampedPhysicsDt, this.physics);
    this.health.update(clampedPhysicsDt);
    this.particles.update(clampedPhysicsDt);

    // 4. Inhale Target Detection
    if (this.actions.isInhaling) {
      const cone = this.actions.getInhaleCone(this.physics);
      for (const enemy of this.enemyManager.getEnemies()) {
        if (enemy.canBeInhaled() && this.actions.isInInhaleCone(cone, enemy.getBounds(), activeRoom.tileMap)) {
          enemy.isBeingInhaled = true;
          // Pull toward mouth
          const dx = (this.physics.x + this.physics.width / 2) - (enemy.x + enemy.width / 2);
          const dy = (this.physics.y + this.physics.height / 2) - (enemy.y + enemy.height / 2);
          enemy.x += dx * 0.15;
          enemy.y += dy * 0.15;

          if (Math.hypot(dx, dy) < 16) {
            enemy.isDead = true;
            this.actions.captureInMouth({
              type: 'enemy',
              enemyType: enemy.type,
              abilityGrant: enemy.abilityGrant,
            });
            break;
          }
        }
      }
    }

    // 5. Ability Star Updates & Capture
    for (const star of this.abilityStars) {
      star.update(clampedPhysicsDt, activeRoom.tileMap);
      if (!star.isDead && this.actions.isInhaling) {
        const cone = this.actions.getInhaleCone(this.physics);
        if (this.actions.isInInhaleCone(cone, star.getBounds(), activeRoom.tileMap)) {
          star.isDead = true;
          this.actions.captureInMouth({
            type: 'ability_star',
            abilityGrant: star.ability,
          });
        }
      }
    }
    this.abilityStars = this.abilityStars.filter((s) => !s.isDead);

    // 6. Active Ability Update & Attack Hit Resolution
    if (this.currentAbility) {
      const attack = this.currentAbility.update(clampedPhysicsDt, this.physics, this.projectiles);
      if (attack && attack.hitboxes.length > 0) {
        for (const hitbox of attack.hitboxes) {
          const hitEnemy = this.enemyManager.checkCollision(hitbox);
          if (hitEnemy) {
            const killed = hitEnemy.takeDamage(attack.damage);
            this.particles.burst(hitEnemy.x, hitEnemy.y, 12);
            if (killed) {
              this.health.addScore(100);
            }
          }
        }
      }
    }

    // 7. Projectiles Update & Collision
    this.projectiles.update(clampedPhysicsDt, activeRoom.tileMap);
    for (const p of this.projectiles.getProjectiles()) {
      const hitEnemy = this.enemyManager.checkCollision({ x: p.x, y: p.y, width: p.width, height: p.height });
      if (hitEnemy) {
        const killed = hitEnemy.takeDamage(p.damage);
        this.particles.burst(hitEnemy.x, hitEnemy.y, 14);
        if (!p.piercing) {
          p.isDead = true;
        }
        if (killed) {
          this.health.addScore(100);
        }
      }
    }

    // 8. Enemy Updates & Player Damage Collision
    this.enemyManager.update(clampedPhysicsDt, activeRoom.tileMap, this.physics.getBounds());
    if (!this.health.isInvulnerable() && !this.actions.isSliding) {
      const collidingEnemy = this.enemyManager.checkCollision(this.physics.getBounds());
      if (collidingEnemy && !collidingEnemy.isBeingInhaled) {
        this.takeDamage(1);
      }
    }

    // 9. Food Pickup Collision
    const food = this.foodManager.checkCollision(this.physics.getBounds());
    if (food) {
      if (food.type === 'maxim_tomato') {
        this.health.healFull();
      } else {
        this.health.heal(2);
      }
      this.particles.burst(food.x, food.y, 8, ['#FFEB3B', '#FF4081']);
      this.health.addScore(50);
    }

    // 10. Camera Update
    this.camera.update(
      this.physics.x + this.physics.width / 2,
      this.physics.y + this.physics.height / 2,
      this.physics.facing,
      updateDt,
    );

    this.input.update();
  }

  setAbility(type: AbilityType): void {
    if (this.currentAbility) {
      this.currentAbility.dispose();
    }
    this.currentAbility = AbilityRegistry.create(type);
    this.audio.playAbilityGain();
    this.particles.burst(this.physics.x, this.physics.y, 20, ['#FFD700', '#FF4081', '#00E676', '#00B0FF']);
  }

  dropAbility(): void {
    if (!this.currentAbility) return;
    const type = this.currentAbility.type;
    this.currentAbility.dispose();
    this.currentAbility = null;
    this.abilityStars.push(new AbilityStar(this.physics.x, this.physics.y - 10, type, this.physics.facing));
  }

  takeDamage(amount = 1): void {
    const res = this.health.takeDamage(amount);
    if (res.tookDamage) {
      this.audio.playDamage();
      this.particles.burst(this.physics.x, this.physics.y, 10, ['#E91E63', '#BDBDBD']);

      if (this.currentAbility) {
        this.dropAbility();
      }

      if (res.knockedBack) {
        this.physics.vy = -140;
        this.physics.vx = -this.physics.facing * 120;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const activeRoom = this.roomManager.activeRoom;
    if (!activeRoom) return;

    const { viewportWidth, viewportHeight } = this.camera;
    const tileSize = activeRoom.tileMap.tileSize;

    // 1. Clear / Background with parallax
    this.renderer.renderBackground(ctx, this.camera, 'green');

    // 2. Render Culled Tiles
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
            ctx.fillStyle = '#4d8a35';
            ctx.fillRect(screenPos.x, screenPos.y, tileSize, tileSize);
            if (activeRoom.tileMap.getTile(c, r - 1) === TileType.AIR) {
              ctx.fillStyle = '#7ac943';
              ctx.fillRect(screenPos.x, screenPos.y, tileSize, 6);
            }
            break;

          case TileType.ONE_WAY:
            ctx.fillStyle = '#b07842';
            ctx.fillRect(screenPos.x, screenPos.y, tileSize, 8);
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
            break;
        }
      }
    }

    // 3. Render Doors
    for (const door of activeRoom.doors) {
      const doorScreen = this.camera.worldToScreen(door.col * tileSize, door.row * tileSize);
      ctx.fillStyle = '#6a4023';
      ctx.fillRect(doorScreen.x + 4, doorScreen.y, tileSize - 8, tileSize);
      ctx.fillStyle = '#ffd15c';
      ctx.beginPath();
      ctx.arc(doorScreen.x + tileSize / 2, doorScreen.y + 8, tileSize / 2 - 4, Math.PI, 0);
      ctx.fill();
    }

    // 4. Render Food Pickups
    for (const food of this.foodManager.getItems()) {
      const s = this.camera.worldToScreen(food.x, food.y);
      ctx.fillStyle = food.type === 'maxim_tomato' ? '#E53935' : '#FFB300';
      ctx.beginPath();
      ctx.arc(s.x + 7, s.y + 7, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 5. Render Ability Stars
    for (const star of this.abilityStars) {
      if (star.isFlashing()) continue;
      const s = this.camera.worldToScreen(star.x, star.y);
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(s.x + 8, s.y + 8, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FF6D00';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 6. Render Enemies
    for (const enemy of this.enemyManager.getEnemies()) {
      const s = this.camera.worldToScreen(enemy.x, enemy.y);
      ctx.fillStyle = enemy.abilityGrant ? '#FF7043' : '#FFB74D';
      ctx.beginPath();
      ctx.arc(s.x + enemy.width / 2, s.y + enemy.height / 2, enemy.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2B2118';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 7. Render Projectiles
    for (const p of this.projectiles.getProjectiles()) {
      const s = this.camera.worldToScreen(p.x, p.y);
      ctx.fillStyle = p.type === 'star' ? '#FFEB3B' : '#81D4FA';
      ctx.beginPath();
      ctx.arc(s.x + p.width / 2, s.y + p.height / 2, p.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 8. Render Inhale Cone
    if (this.actions.isInhaling) {
      const cone = this.actions.getInhaleCone(this.physics);
      const s = this.camera.worldToScreen(cone.originX, cone.originY);
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + cone.reach * cone.direction, s.y - cone.width / 2);
      ctx.lineTo(s.x + cone.reach * cone.direction, s.y + cone.width / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 9. Render Kirby Character
    this.renderer.renderKirby(ctx, this.camera, this.physics, this.actions, this.health, this.currentAbility);

    // 10. Render Particles
    this.particles.render(ctx, this.camera);

    // 11. Room Transition Overlay
    if (this.roomManager.isTransitioning()) {
      const alpha = this.roomManager.getTransitionAlpha();
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(0, 0, viewportWidth, viewportHeight);
    }

    // 12. HUD Overlay
    this.renderer.renderHUD(ctx, this.health, this.currentAbility, this.health.score, activeRoom.name);
  }
}
