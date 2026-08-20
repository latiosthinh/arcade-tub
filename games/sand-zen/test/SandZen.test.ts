import { describe, it, expect, beforeEach } from 'vitest';
import { SandGrid, CELL_EMPTY, CELL_WALL, SAND_PALETTES } from '../src/SandGrid';
import { ZenToolManager } from '../src/ZenTools';
import { SandAudio } from '../src/SandAudio';

describe('SandGrid Cellular Automaton', () => {
  let grid: SandGrid;

  beforeEach(() => {
    grid = new SandGrid(40, 30);
  });

  it('initializes grid with empty cells and valid dimensions', () => {
    expect(grid.width).toBe(40);
    expect(grid.height).toBe(30);
    expect(grid.getCell(10, 10)).toBe(CELL_EMPTY);
  });

  it('simulates single sand grain falling straight down to bottom', () => {
    const color = 0xFF55AACC;
    grid.setCell(20, 0, color);
    expect(grid.getCell(20, 0)).toBe(color);

    // Step physics
    grid.step();
    expect(grid.getCell(20, 0)).toBe(CELL_EMPTY);
    expect(grid.getCell(20, 1)).toBe(color);

    // Step until it reaches bottom floor (y = 29)
    for (let i = 0; i < 40; i++) {
      grid.step();
    }
    expect(grid.getCell(20, 29)).toBe(color);
    expect(grid.getMovingGrainsCount()).toBe(0);
  });

  it('forms a pyramid dune with angle of repose when pouring sand on a single column', () => {
    const color = 0xFF4488FF;
    const dropX = 20;

    // Drop multiple grains at dropX
    for (let drop = 0; drop < 15; drop++) {
      grid.setCell(dropX, 0, color);
      for (let s = 0; s < 30; s++) {
        grid.step();
      }
    }

    // Peak at dropX should be higher than flanking sides
    let peakY = 29;
    while (peakY >= 0 && grid.getCell(dropX, peakY) !== CELL_EMPTY) {
      peakY--;
    }
    const peakHeight = 29 - peakY;

    // Should have spread out left and right
    expect(peakHeight).toBeGreaterThan(2);
    expect(grid.getCell(dropX - 1, 29)).not.toBe(CELL_EMPTY);
    expect(grid.getCell(dropX + 1, 29)).not.toBe(CELL_EMPTY);
  });

  it('deflector wall blocks sand and funnels it diagonally', () => {
    const color = 0xFF3399EE;
    // Add diagonal wall at (18, 10) to (24, 16)
    grid.addWall(18, 10, 24, 16);

    // Drop sand at (20, 0)
    grid.setCell(20, 0, color);
    for (let s = 0; s < 30; s++) {
      grid.step();
    }

    // Sand should have deflected and ended up at bottom (not passing through wall)
    expect(grid.getCell(18, 10)).toBe(CELL_WALL);
    let foundSand = false;
    for (let x = 0; x < 40; x++) {
      if (grid.getCell(x, 29) === color) {
        foundSand = true;
        break;
      }
    }
    expect(foundSand).toBe(true);
  });

  it('protects grid bounds on addSand and getCell/setCell', () => {
    expect(() => {
      grid.setCell(-5, -5, 123);
      grid.setCell(100, 100, 123);
      grid.getCell(-1, 0);
      grid.getCell(0, 100);
      grid.addSand(-10, -10, 0xFFFFFFFF, 5);
    }).not.toThrow();

    expect(grid.getCell(-1, 0)).toBe(CELL_WALL);
    expect(grid.getCell(0, 50)).toBe(CELL_WALL);
  });

  it('clears sand grains while keeping boundary walls if requested', () => {
    grid.setCell(10, 10, 0xFF112233);
    grid.setCell(15, 15, CELL_WALL);
    grid.clearSandKeepWalls();

    expect(grid.getCell(10, 10)).toBe(CELL_EMPTY);
    expect(grid.getCell(15, 15)).toBe(CELL_WALL);
  });
});

describe('ZenTools Manager', () => {
  let grid: SandGrid;
  let tools: ZenToolManager;

  beforeEach(() => {
    grid = new SandGrid(40, 30);
    tools = new ZenToolManager();
  });

  it('manages active tool and palettes', () => {
    expect(tools.currentTool).toBe('stream');
    tools.setTool('rake');
    expect(tools.currentTool).toBe('rake');

    const p0 = tools.currentPalette;
    tools.nextPalette();
    expect(tools.currentPalette).not.toEqual(p0);
  });

  it('applies rake displacement carving grooves into sand', () => {
    const color = 0xFF77AA55;
    // Fill a sand surface at y=20..29
    for (let x = 5; x < 35; x++) {
      for (let y = 20; y < 30; y++) {
        grid.setCell(x, y, color);
      }
    }

    const grainCountBefore = grid.countGrains();
    tools.applyRake(grid, 10, 20, 30, 20, 8, 3);
    const grainCountAfter = grid.countGrains();

    // Raking redistributes sand rather than destroying it
    expect(grainCountAfter).toBe(grainCountBefore);
  });

  it('places funnels as angled deflector walls with central aperture', () => {
    const funnel = tools.placeFunnel(grid, 20, 15, 16);
    expect(funnel).toBeDefined();
    expect(funnel.x).toBe(20);
    expect(funnel.y).toBe(15);

    // Left and right wings should be wall, center aperture should be empty
    expect(grid.getCell(20, 15)).toBe(CELL_EMPTY);
    expect(grid.getCell(12, 10)).toBe(CELL_WALL); // x - half = 20 - 8 = 12, y - depth = 15 - 5 = 10
    expect(grid.getCell(28, 10)).toBe(CELL_WALL); // x + half = 20 + 8 = 28, y - depth = 15 - 5 = 10
  });

  it('updates auto-hopper and spawns sand streams when enabled', () => {
    tools.hopperActive = true;
    tools.hopperX = 20;
    tools.hopperSpeed = 10;

    const initialGrains = grid.countGrains();
    tools.updateHopper(grid, 0.1);

    expect(grid.countGrains()).toBeGreaterThan(initialGrains);
    expect(tools.hopperX).not.toBe(20);
  });
});

describe('SandAudio Synthesizer', () => {
  let audio: SandAudio;

  beforeEach(() => {
    audio = new SandAudio();
  });

  it('initializes and manages muted state safely', () => {
    expect(audio.isMuted()).toBe(false);
    audio.setMuted(true);
    expect(audio.isMuted()).toBe(true);
  });

  it('updates sand whisper volume and triggers chime notes without error', () => {
    expect(() => {
      audio.updateMovingGrains(25);
      audio.triggerChime(0.8);
      audio.triggerRakeScrape();
      audio.stop();
    }).not.toThrow();
  });
});
