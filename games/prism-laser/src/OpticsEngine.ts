export type BeamColor = 'white' | 'red' | 'green' | 'blue' | 'yellow' | 'magenta' | 'cyan';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type PieceType = 
  | 'emitter'      // Fires initial laser beam
  | 'target'       // Must be hit with required color to activate
  | 'mirror'       // 45-deg angled cardstock reflector (rotatable: 0, 90, 180, 270)
  | 'prism'        // Splits white into (Red + Blue) or refracts split beams
  | 'filter'       // Converts passing beam into specified color
  | 'blocker';     // Cardboard obstacle blocking beams

export interface BoardPiece {
  id: number;
  row: number;
  col: number;
  type: PieceType;
  direction?: Direction;       // for emitter (firing dir) or target (hit facing)
  angle?: number;              // for mirror (0: /, 90: \, 180: /, 270: \)
  color?: BeamColor;           // for filter or required target color
  rotatable: boolean;
  draggable: boolean;
  activated?: boolean;         // for target crystals
}

export interface BeamSegment {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  direction: Direction;
  color: BeamColor;
}

export class OpticsEngine {
  readonly rows: number;
  readonly cols: number;

  constructor(rows: number = 6, cols: number = 6) {
    this.rows = rows;
    this.cols = cols;
  }

  static getDirectionDelta(dir: Direction): { dr: number; dc: number } {
    switch (dir) {
      case 'UP': return { dr: -1, dc: 0 };
      case 'DOWN': return { dr: 1, dc: 0 };
      case 'LEFT': return { dr: 0, dc: -1 };
      case 'RIGHT': return { dr: 0, dc: 1 };
    }
  }

  static getOppositeDirection(dir: Direction): Direction {
    switch (dir) {
      case 'UP': return 'DOWN';
      case 'DOWN': return 'UP';
      case 'LEFT': return 'RIGHT';
      case 'RIGHT': return 'LEFT';
    }
  }

  // Calculate beam reflection off a 45-degree angle mirror
  // angle 0: '/' reflector (/), angle 90: '\' reflector (\)
  static reflect(incomingDir: Direction, angle: number): Direction | null {
    const normAngle = ((angle % 180) + 180) % 180;

    if (normAngle === 0) {
      // '/' mirror:
      // UP incoming -> reflects RIGHT
      // DOWN incoming -> reflects LEFT
      // LEFT incoming -> reflects DOWN
      // RIGHT incoming -> reflects UP
      switch (incomingDir) {
        case 'UP': return 'RIGHT';
        case 'DOWN': return 'LEFT';
        case 'LEFT': return 'DOWN';
        case 'RIGHT': return 'UP';
      }
    } else {
      // 90 deg '\' mirror:
      // UP incoming -> reflects LEFT
      // DOWN incoming -> reflects RIGHT
      // LEFT incoming -> reflects UP
      // RIGHT incoming -> reflects DOWN
      switch (incomingDir) {
        case 'UP': return 'LEFT';
        case 'DOWN': return 'RIGHT';
        case 'LEFT': return 'UP';
        case 'RIGHT': return 'DOWN';
      }
    }
  }

  traceBeams(pieces: BoardPiece[]): { segments: BeamSegment[]; activatedTargets: number[] } {
    const pieceGrid: (BoardPiece | undefined)[][] = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => undefined)
    );

    for (const p of pieces) {
      if (p.row >= 0 && p.row < this.rows && p.col >= 0 && p.col < this.cols) {
        const rowArr = pieceGrid[p.row];
        if (rowArr) {
          rowArr[p.col] = p;
        }
      }
    }

    // Reset target activation
    for (const p of pieces) {
      if (p.type === 'target') {
        p.activated = false;
      }
    }

    const segments: BeamSegment[] = [];
    const activatedTargets = new Set<number>();

    // Find all emitters
    const emitters = pieces.filter(p => p.type === 'emitter');

    // Beam Queue: { row, col, dir, color }
    interface BeamRay {
      r: number;
      c: number;
      dir: Direction;
      color: BeamColor;
    }

    const queue: BeamRay[] = emitters.map(e => ({
      r: e.row,
      c: e.col,
      dir: e.direction ?? 'RIGHT',
      color: e.color ?? 'white'
    }));

    const visited = new Set<string>();
    const maxSteps = 100;

    while (queue.length > 0) {
      const ray = queue.shift()!;
      let currR = ray.r;
      let currC = ray.c;
      let currDir = ray.dir;
      let currColor = ray.color;

      for (let step = 0; step < maxSteps; step++) {
        const delta = OpticsEngine.getDirectionDelta(currDir);
        const nextR = currR + delta.dr;
        const nextC = currC + delta.dc;

        // Check board bounds
        if (nextR < 0 || nextR >= this.rows || nextC < 0 || nextC >= this.cols) {
          segments.push({
            startRow: currR,
            startCol: currC,
            endRow: nextR,
            endCol: nextC,
            direction: currDir,
            color: currColor
          });
          break;
        }

        const visitKey = `${currR},${currC}->${nextR},${nextC}:${currDir}:${currColor}`;
        if (visited.has(visitKey)) {
          break; // Avoid infinite loops
        }
        visited.add(visitKey);

        const rowArr = pieceGrid[nextR];
        const piece = rowArr ? rowArr[nextC] : undefined;

        segments.push({
          startRow: currR,
          startCol: currC,
          endRow: nextR,
          endCol: nextC,
          direction: currDir,
          color: currColor
        });

        if (!piece) {
          currR = nextR;
          currC = nextC;
          continue;
        }

        // Hit a piece! Handle optics interaction
        if (piece.type === 'blocker') {
          break; // beam absorbed
        }

        if (piece.type === 'target') {
          // Check if color matches target requirement
          const requiredColor = piece.color ?? 'white';
          if (currColor === requiredColor || requiredColor === 'white') {
            piece.activated = true;
            activatedTargets.add(piece.id);
          }
          break; // target absorbs beam
        }

        if (piece.type === 'mirror') {
          const refDir = OpticsEngine.reflect(currDir, piece.angle ?? 0);
          if (refDir) {
            currR = nextR;
            currC = nextC;
            currDir = refDir;
            continue;
          } else {
            break;
          }
        }

        if (piece.type === 'filter') {
          // Filter changes beam color to filter's color and continues forward
          currR = nextR;
          currC = nextC;
          currColor = piece.color ?? 'red';
          continue;
        }

        if (piece.type === 'prism') {
          // Prism splits white light into Red and Blue beams at 90-degree angles
          currR = nextR;
          currC = nextC;

          if (currColor === 'white') {
            // Split into Left and Right relative directions
            const leftTurn: Direction =
              currDir === 'UP' ? 'LEFT' : currDir === 'DOWN' ? 'RIGHT' : currDir === 'LEFT' ? 'DOWN' : 'UP';
            const rightTurn: Direction =
              currDir === 'UP' ? 'RIGHT' : currDir === 'DOWN' ? 'LEFT' : currDir === 'LEFT' ? 'UP' : 'DOWN';

            queue.push({ r: currR, c: currC, dir: leftTurn, color: 'red' });
            queue.push({ r: currR, c: currC, dir: rightTurn, color: 'blue' });
          } else {
            // Non-white light passes straight through
            continue;
          }
          break;
        }

        break;
      }
    }

    return { segments, activatedTargets: Array.from(activatedTargets) };
  }

  isPuzzleSolved(pieces: BoardPiece[]): boolean {
    const targets = pieces.filter(p => p.type === 'target');
    if (targets.length === 0) return false;
    return targets.every(t => t.activated === true);
  }
}
