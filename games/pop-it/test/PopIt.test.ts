import { describe, it, expect, beforeEach } from 'vitest';
import { PopItBoard, PopItShape, BOARD_SHAPES, DimpleCell } from '../src/PopItBoard';

describe('PopItBoard', () => {
  let board: PopItBoard;

  beforeEach(() => {
    board = new PopItBoard('square');
  });

  it('initializes all predefined shapes with valid dimple counts and properties', () => {
    const shapes: PopItShape[] = ['square', 'heart', 'hexagon', 'star'];
    shapes.forEach((shape) => {
      board.setShape(shape);
      expect(board.currentShape).toBe(shape);
      const dimples = board.getDimples();
      expect(dimples.length).toBeGreaterThan(5);
      dimples.forEach((dimple) => {
        expect(dimple.id).toBeDefined();
        expect(dimple.isPopped).toBe(false);
        expect(dimple.popDepth).toBe(0);
        expect(dimple.x).toBeGreaterThanOrEqual(0);
        expect(dimple.y).toBeGreaterThanOrEqual(0);
        expect(dimple.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  it('falls back safely if invalid shape provided (mitigating T-43-04)', () => {
    // @ts-expect-error testing invalid shape input
    board.setShape('invalid-shape');
    expect(board.currentShape).toBe('square');
    expect(board.getDimples().length).toBeGreaterThan(0);
  });

  it('pops dimple at coordinates and toggles pop state', () => {
    board.setBoardBounds(0, 0, 400, 400);
    const dimples = board.getDimples();
    const target = dimples[0];

    const popped = board.popDimpleAt(target.x, target.y, target.radius);
    expect(popped).not.toBeNull();
    expect(popped?.id).toBe(target.id);
    expect(popped?.isPopped).toBe(true);
    expect(board.getPoppedCount()).toBe(1);

    // Repeated pop on same face does not re-pop
    const repeat = board.popDimpleAt(target.x, target.y, target.radius);
    expect(repeat).toBeNull();
    expect(board.getPoppedCount()).toBe(1);
  });

  it('flips board and allows reverse popping', () => {
    board.setBoardBounds(0, 0, 400, 400);
    const dimples = board.getDimples();
    const first = dimples[0];

    // Pop on front
    board.popDimple(first.id);
    expect(board.getDimpleById(first.id)?.isPopped).toBe(true);

    // Flip board
    board.flipBoard();
    expect(board.isFlipped).toBe(true);

    // When flipped, the popped dimple on front is unpopped relative to reverse side
    // Reverse side pop: pressing it pushes it back
    const reversePopped = board.popDimple(first.id);
    expect(reversePopped).toBe(true);
    // Now from reverse side perspective, it is popped (so original front state is restored/inverted)
    expect(board.getDimpleById(first.id)?.isPopped).toBe(false);
  });

  it('detects when all dimples on active face are popped', () => {
    board.setShape('square');
    expect(board.isAllPopped()).toBe(false);

    const dimples = board.getDimples();
    dimples.forEach((d) => {
      board.popDimple(d.id);
    });

    expect(board.isAllPopped()).toBe(true);
    expect(board.getPoppedCount()).toBe(dimples.length);

    // Reset restores all dimples to unpopped
    board.resetBoard();
    expect(board.isAllPopped()).toBe(false);
    expect(board.getPoppedCount()).toBe(0);
  });

  it('computes swipe / sweep line popping correctly', () => {
    board.setBoardBounds(0, 0, 400, 400);
    const dimples = board.getDimples();
    // find bounding box of first row
    const row0 = dimples.filter((d) => d.row === 0);
    if (row0.length >= 2) {
      const minX = Math.min(...row0.map((d) => d.x));
      const maxX = Math.max(...row0.map((d) => d.x));
      const y = row0[0].y;

      const swept = board.sweepLine(minX, y, maxX, y, row0[0].radius);
      expect(swept.length).toBeGreaterThanOrEqual(row0.length);
      swept.forEach((d) => {
        expect(d.isPopped).toBe(true);
      });
    }
  });
});
