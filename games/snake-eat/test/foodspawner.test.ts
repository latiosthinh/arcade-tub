import { describe, it, expect, beforeEach } from 'vitest';
import { FoodSpawner, FoodType } from '../src/FoodSpawner';
import { Snake, Direction } from '../src/Snake';

describe('FoodSpawner', () => {
  let spawner: FoodSpawner;
  let snake: Snake;

  beforeEach(() => {
    spawner = new FoodSpawner(10, 10);
    snake = new Snake(5, 5, 3, Direction.RIGHT);
  });

  it('spawns regular food in unoccupied cell', () => {
    const food = spawner.spawnRegular(snake, 10, 10);
    expect(food).not.toBeNull();
    expect(food.type).toBe(FoodType.REGULAR);
    expect(snake.occupies(food.x, food.y)).toBe(false);
    expect(spawner.regularFood).toEqual(food);
  });

  it('spawns bonus golden food with timer', () => {
    const bonus = spawner.spawnBonus(snake, 10, 10);
    expect(bonus).not.toBeNull();
    expect(bonus!.type).toBe(FoodType.GOLDEN);
    expect(bonus!.lifetime).toBe(7.0);
    expect(snake.occupies(bonus!.x, bonus!.y)).toBe(false);
    expect(spawner.bonusFood).toEqual(bonus);
  });

  it('updates bonus food lifetime and expires when lifetime <= 0', () => {
    spawner.spawnBonus(snake, 10, 10);
    expect(spawner.bonusFood).not.toBeNull();

    const midRes = spawner.update(3.0, snake);
    expect(midRes.bonusExpired).toBe(false);
    expect(spawner.bonusFood?.lifetime).toBeCloseTo(4.0);

    const expRes = spawner.update(4.5, snake);
    expect(expRes.bonusExpired).toBe(true);
    expect(spawner.bonusFood).toBeNull();
  });

  it('checks eat collision for regular food and clears it', () => {
    const food = spawner.spawnRegular(snake, 10, 10);
    expect(spawner.checkEat(food.x, food.y)).toEqual({
      type: FoodType.REGULAR,
      points: 10,
      grow: 1,
    });
    expect(spawner.regularFood).toBeNull();
  });

  it('checks eat collision for golden bonus food and clears it', () => {
    const bonus = spawner.spawnBonus(snake, 10, 10)!;
    expect(spawner.checkEat(bonus.x, bonus.y)).toEqual({
      type: FoodType.GOLDEN,
      points: 50,
      grow: 2,
    });
    expect(spawner.bonusFood).toBeNull();
  });

  it('handles completely full grid gracefully without infinite loop', () => {
    // 2x2 grid filled completely
    const tinySpawner = new FoodSpawner(2, 2);
    const fullSnake = new Snake(0, 0, 1);
    fullSnake.body = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ];

    const food = tinySpawner.spawnRegular(fullSnake, 2, 2);
    expect(food).toBeNull();
  });

  it('resets spawner state', () => {
    spawner.spawnRegular(snake, 10, 10);
    spawner.spawnBonus(snake, 10, 10);
    spawner.reset();

    expect(spawner.regularFood).toBeNull();
    expect(spawner.bonusFood).toBeNull();
    expect(spawner.bonusSpawnTimer).toBe(0);
  });
});
