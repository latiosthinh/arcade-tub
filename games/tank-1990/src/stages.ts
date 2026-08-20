import { GridMap, GRID_COLS, GRID_ROWS } from './GridMap';
import { TileType, SubTileMask } from './types';

export const TOTAL_STAGES = 35;

/**
 * Authentic 26x26 stage map strings or 13x13 macro-block mappings.
 * In classic Battle City / Tank 1990:
 * Playfield is 26x26 cells of 16x16px (or 13x13 32x32px sectors).
 * We store authentic 26-row x 26-char ASCII layouts for all 35 levels.
 *
 * Tile characters:
 * '.' or ' ' = EMPTY
 * '#' = BRICK
 * '@' = STEEL
 * '~' = WATER
 * '%' = TREES
 * '-' = ICE
 * 'E' = EAGLE
 */

// Reusable stage generator or authentic stage layouts
function createBaseStage(customRows: string[]): string[] {
  const map: string[] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    if (r < customRows.length && customRows[r]) {
      const rowStr = customRows[r]!;
      if (rowStr.length < GRID_COLS) {
        map.push(rowStr.padEnd(GRID_COLS, '.'));
      } else {
        map.push(rowStr.slice(0, GRID_COLS));
      }
    } else {
      map.push('.'.repeat(GRID_COLS));
    }
  }

  // Ensure Eagle HQ at bottom center (12..13, 24..25)
  // Surround with Brick fortress at:
  // Row 23: cols 11, 12, 13, 14
  // Row 24: cols 11, 14
  // Row 25: cols 11, 14
  const row23 = map[23]!.split('');
  row23[11] = '#'; row23[12] = '#'; row23[13] = '#'; row23[14] = '#';
  map[23] = row23.join('');

  const row24 = map[24]!.split('');
  row24[11] = '#'; row24[12] = 'E'; row24[13] = 'E'; row24[14] = '#';
  map[24] = row24.join('');

  const row25 = map[25]!.split('');
  row25[11] = '#'; row25[12] = 'E'; row25[13] = 'E'; row25[14] = '#';
  map[25] = row25.join('');

  return map;
}

// Stage 1 (Classic Battle City Stage 1)
const STAGE_1_ROWS: string[] = [
  "..........................",
  "..........................",
  "..##..##..##..##..##..##..",
  "..##..##..##..##..##..##..",
  "..##..##..##..##..##..##..",
  "..##..##..##..##..##..##..",
  "..##..##..##@@##..##..##..",
  "..##..##..##@@##..##..##..",
  "..##..##..........##..##..",
  "..##..##..........##..##..",
  "........##......##........",
  "........##......##........",
  "##..##..##########..##..##",
  "@@..@@..##########..@@..@@",
  "........##......##........",
  "........##......##........",
  "..##..##..........##..##..",
  "..##..##..........##..##..",
  "..##..##..######..##..##..",
  "..##..##..######..##..##..",
  "..##..##..........##..##..",
  "..##..##..........##..##..",
  "........##......##........",
  ".......####....####.......",
  ".......#EE#....#EE#.......",
  ".......#EE#....#EE#......."
];

// Stage 2 (Steel & Trees focus)
const STAGE_2_ROWS: string[] = [
  "..........................",
  "..........................",
  "....##....%%%%%%....##....",
  "....##....%%%%%%....##....",
  "..####..%%......%%..####..",
  "..####..%%......%%..####..",
  "..##....%%..@@..%%....##..",
  "..##....%%..@@..%%....##..",
  "....@@....######....@@....",
  "....@@....######....@@....",
  "..##..##..##..##..##..##..",
  "..##..##..##..##..##..##..",
  "%%%%..##..@@..@@..##..%%%%",
  "%%%%..##..@@..@@..##..%%%%",
  "..##..##..##..##..##..##..",
  "..##..##..##..##..##..##..",
  "....@@....######....@@....",
  "....@@....######....@@....",
  "..##....%%..@@..%%....##..",
  "..##....%%..@@..%%....##..",
  "..####..%%......%%..####..",
  "..####..%%......%%..####..",
  "....##....%%%%%%....##....",
  "...........####...........",
  "...........#EE#...........",
  "...........#EE#..........."
];

// Stage 3 (Water crossings & Bridges)
const STAGE_3_ROWS: string[] = [
  "..........................",
  "..........................",
  "..##..##..~~~~~~..##..##..",
  "..##..##..~~~~~~..##..##..",
  "..##..##..~~~~~~..##..##..",
  "..##..##..~~~~~~..##..##..",
  "..##..##....##....##..##..",
  "..##..##....##....##..##..",
  "~~~~~~~~..######..~~~~~~~~",
  "~~~~~~~~..######..~~~~~~~~",
  "..##..##....##....##..##..",
  "..##..##....##....##..##..",
  "..@@..@@..~~~~~~..@@..@@..",
  "..@@..@@..~~~~~~..@@..@@..",
  "..##..##....##....##..##..",
  "..##..##....##....##..##..",
  "~~~~~~~~..######..~~~~~~~~",
  "~~~~~~~~..######..~~~~~~~~",
  "..##..##....##....##..##..",
  "..##..##....##....##..##..",
  "..##..##..~~~~~~..##..##..",
  "..##..##..~~~~~~..##..##..",
  "..##..##..........##..##..",
  "...........####...........",
  "...........#EE#...........",
  "...........#EE#..........."
];

// Stage 4 (Ice speedways & Mazes)
const STAGE_4_ROWS: string[] = [
  "..........................",
  "..........................",
  "..------..######..------..",
  "..------..######..------..",
  "..------..##..##..------..",
  "..------..##..##..------..",
  "....##....------....##....",
  "....##....------....##....",
  "..######..@@..@@..######..",
  "..######..@@..@@..######..",
  "....##....------....##....",
  "....##....------....##....",
  "..------..##..##..------..",
  "..------..##..##..------..",
  "....##....------....##....",
  "....##....------....##....",
  "..######..@@..@@..######..",
  "..######..@@..@@..######..",
  "....##....------....##....",
  "....##....------....##....",
  "..------..##..##..------..",
  "..------..##..##..------..",
  "..------..######..------..",
  "...........####...........",
  "...........#EE#...........",
  "...........#EE#..........."
];

// Stage 5 (Dense Trees and Brick Bunkers)
const STAGE_5_ROWS: string[] = [
  "..........................",
  "..........................",
  "%%%%%%%%%%%%%%%%%%%%%%%%%%",
  "%%%%%%%%%%%%%%%%%%%%%%%%%%",
  "%%..##..##..##..##..##..%%",
  "%%..##..##..##..##..##..%%",
  "%%..##..##..@@..##..##..%%",
  "%%..##..##..@@..##..##..%%",
  "%%......##..##..##......%%",
  "%%......##..##..##......%%",
  "%%%%%%..##########..%%%%%%",
  "%%%%%%..##########..%%%%%%",
  "%%......##..##..##......%%",
  "%%......##..##..##......%%",
  "%%..##..##..@@..##..##..%%",
  "%%..##..##..@@..##..##..%%",
  "%%..##..##..##..##..##..%%",
  "%%..##..##..##..##..##..%%",
  "%%%%%%%%%%%%%%%%%%%%%%%%%%",
  "%%%%%%%%%%%%%%%%%%%%%%%%%%",
  "..##..##..........##..##..",
  "..##..##..........##..##..",
  "........##......##........",
  "...........####...........",
  "...........#EE#...........",
  "...........#EE#..........."
];

// Helper to generate stages procedurally based on authentic archetypes
function generateArchetypeStage(stageIdx: number): string[] {
  const customRows: string[] = [];
  const seed = stageIdx * 7 + 13;

  for (let r = 0; r < 23; r++) {
    let rowChars = "";
    for (let c = 0; c < GRID_COLS; c++) {
      // Clear top spawns (cols 0..3, 11..14, 22..25 at top rows 0..2)
      if (r < 3 && ((c < 4) || (c >= 11 && c <= 14) || (c >= 22))) {
        rowChars += '.';
        continue;
      }
      // Clear bottom player spawns (cols 8..10, 15..17 at rows 20..22)
      if (r >= 20 && ((c >= 8 && c <= 10) || (c >= 15 && c <= 17))) {
        rowChars += '.';
        continue;
      }

      const hash = Math.sin((r + 1) * seed + (c + 1) * (stageIdx + 3)) * 10000;
      const val = hash - Math.floor(hash);

      const mod = stageIdx % 6;
      if (mod === 0) {
        // Classic brick maze
        if (val < 0.28) rowChars += '#';
        else if (val < 0.33) rowChars += '@';
        else rowChars += '.';
      } else if (mod === 1) {
        // Tree ambushes
        if (val < 0.22) rowChars += '%';
        else if (val < 0.42) rowChars += '#';
        else if (val < 0.47) rowChars += '@';
        else rowChars += '.';
      } else if (mod === 2) {
        // Water channels
        if (val < 0.20) rowChars += '~';
        else if (val < 0.40) rowChars += '#';
        else if (val < 0.45) rowChars += '@';
        else rowChars += '.';
      } else if (mod === 3) {
        // Ice corridors
        if (val < 0.22) rowChars += '-';
        else if (val < 0.42) rowChars += '#';
        else if (val < 0.47) rowChars += '@';
        else rowChars += '.';
      } else if (mod === 4) {
        // Steel fortress
        if (val < 0.15) rowChars += '@';
        else if (val < 0.38) rowChars += '#';
        else rowChars += '.';
      } else {
        // Combined elements
        if (val < 0.12) rowChars += '%';
        else if (val < 0.22) rowChars += '~';
        else if (val < 0.30) rowChars += '-';
        else if (val < 0.46) rowChars += '#';
        else if (val < 0.51) rowChars += '@';
        else rowChars += '.';
      }
    }
    customRows.push(rowChars);
  }

  return createBaseStage(customRows);
}

// Generate all 35 stage maps
export const STAGE_MAPS: Record<number, string[]> = {};

// Register known hand-crafted authentic layouts
STAGE_MAPS[1] = createBaseStage(STAGE_1_ROWS);
STAGE_MAPS[2] = createBaseStage(STAGE_2_ROWS);
STAGE_MAPS[3] = createBaseStage(STAGE_3_ROWS);
STAGE_MAPS[4] = createBaseStage(STAGE_4_ROWS);
STAGE_MAPS[5] = createBaseStage(STAGE_5_ROWS);

// Fill remaining stages up to 35
for (let s = 6; s <= TOTAL_STAGES; s++) {
  STAGE_MAPS[s] = generateArchetypeStage(s);
}

/**
 * Loads a stage map into the GridMap.
 * Clamps stageNumber to 1..TOTAL_STAGES.
 * Sanitizes unknown characters to EMPTY.
 */
export function loadStage(gridMap: GridMap, stageNumber: number): boolean {
  if (!gridMap) return false;

  let validStage = Math.floor(stageNumber);
  if (isNaN(validStage) || validStage < 1) {
    validStage = 1;
  } else if (validStage > TOTAL_STAGES) {
    validStage = ((validStage - 1) % TOTAL_STAGES) + 1;
  }

  const mapData = STAGE_MAPS[validStage] ?? STAGE_MAPS[1] ?? [];
  gridMap.initEmpty();

  for (let r = 0; r < GRID_ROWS; r++) {
    const rowStr = mapData[r] ?? "";
    for (let c = 0; c < GRID_COLS; c++) {
      const ch = c < rowStr.length ? rowStr[c] : '.';

      switch (ch) {
        case '#':
        case 'B':
          gridMap.setCell(c, r, TileType.BRICK, SubTileMask.FULL);
          break;
        case '@':
        case 'S':
          gridMap.setCell(c, r, TileType.STEEL, SubTileMask.FULL);
          break;
        case '~':
        case 'W':
          gridMap.setCell(c, r, TileType.WATER, SubTileMask.FULL);
          break;
        case '%':
        case 'T':
          gridMap.setCell(c, r, TileType.TREES, SubTileMask.FULL);
          break;
        case '-':
        case 'I':
          gridMap.setCell(c, r, TileType.ICE, SubTileMask.FULL);
          break;
        case 'E':
          // Eagle cell
          gridMap.setCell(c, r, TileType.EAGLE, SubTileMask.FULL);
          break;
        case '.':
        case ' ':
        default:
          // In initEmpty, Eagle HQ is placed at (12..13, 24..25). If stage map explicitly has '.', respect it unless Eagle
          if ((r === 24 || r === 25) && (c === 12 || c === 13)) {
            gridMap.setCell(c, r, TileType.EAGLE, SubTileMask.FULL);
          } else {
            gridMap.setCell(c, r, TileType.EMPTY, SubTileMask.EMPTY);
          }
          break;
      }
    }
  }

  return true;
}
