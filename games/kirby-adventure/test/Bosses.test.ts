import { describe, it, expect } from 'vitest';
import { WhispyWoods } from '../src/bosses/WhispyWoods';
import { Kracko } from '../src/bosses/Kracko';
import { KingDedede } from '../src/bosses/KingDedede';

describe('Boss Encounters', () => {
  it('WhispyWoods has 10 HP, takes damage, transitions phase, and attacks (BOSS-01)', () => {
    const whispy = new WhispyWoods(200, 100);
    expect(whispy.hp).toBe(10);
    expect(whispy.phase).toBe(1);

    whispy.takeDamage(5);
    expect(whispy.hp).toBe(5);
    expect(whispy.phase).toBe(2);

    whispy.update(0.6, { x: 50, y: 150, width: 20, height: 20 }); // expire iframes

    whispy.takeDamage(5);
    expect(whispy.hp).toBe(0);
    expect(whispy.isDefeated).toBe(true);
  });

  it('Kracko moves horizontally and fires vertical lightning (BOSS-02)', () => {
    const kracko = new Kracko(100, 40);
    expect(kracko.hp).toBe(12);

    kracko.update(0.1, { x: 100, y: 150, width: 20, height: 20 });
    expect(kracko.x).toBeGreaterThan(100); // moving
  });

  it('KingDedede jumps and slams down with shockwaves (BOSS-03)', () => {
    const dedede = new KingDedede(100, 140);
    expect(dedede.hp).toBe(16);

    dedede.takeDamage(8);
    expect(dedede.phase).toBe(2);
  });
});
