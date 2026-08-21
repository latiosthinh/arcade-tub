import { describe, it, expect, beforeEach } from 'vitest';
import { WaddleDee } from '../src/enemies/WaddleDee';
import { WaddleDoo } from '../src/enemies/WaddleDoo';
import { BladeKnight } from '../src/enemies/BladeKnight';
import { HotHead } from '../src/enemies/HotHead';
import { Chilly } from '../src/enemies/Chilly';
import { Sparky } from '../src/enemies/Sparky';
import { SirKibble } from '../src/enemies/SirKibble';
import { Rocky } from '../src/enemies/Rocky';
import { TileMap } from '../src/TileMap';
import { TileType } from '../src/types';

describe('Enemy AI & Ability Grants', () => {
  let tileMap: TileMap;

  beforeEach(() => {
    tileMap = new TileMap(10, 10, 16, new Array(100).fill(TileType.AIR));
    // Add solid floor
    for (let c = 0; c < 10; c++) {
      tileMap.setTile(c, 8, TileType.SOLID);
    }
  });

  it('WaddleDee patrols and turns at obstacles (ENMY-01)', () => {
    const dee = new WaddleDee('dee_1', 50, 110);
    expect(dee.abilityGrant).toBeNull();

    dee.update(0.1, tileMap);
    expect(dee.x).toBeLessThan(50); // moving left
  });

  it('WaddleDoo attacks with beam and grants Beam (ENMY-02)', () => {
    const doo = new WaddleDoo('doo_1', 80, 110);
    expect(doo.abilityGrant).toBe('beam');
  });

  it('BladeKnight slashes and grants Sword (ENMY-03)', () => {
    const knight = new BladeKnight('knight_1', 80, 110);
    expect(knight.abilityGrant).toBe('sword');
    expect(knight.hp).toBe(2);
  });

  it('HotHead breathes fire and grants Fire (ENMY-04)', () => {
    const hothead = new HotHead('hot_1', 80, 110);
    expect(hothead.abilityGrant).toBe('fire');
  });

  it('Chilly pulses freeze aura and grants Ice (ENMY-05)', () => {
    const chilly = new Chilly('chilly_1', 80, 110);
    expect(chilly.abilityGrant).toBe('ice');
    const attack = chilly.update(0.1);
    expect(attack).not.toBeNull();
    expect(attack?.damage).toBe(1);
  });

  it('Sparky pulses electric field and grants Spark (ENMY-06)', () => {
    const sparky = new Sparky('sparky_1', 80, 110);
    expect(sparky.abilityGrant).toBe('spark');
  });

  it('SirKibble throws boomerang cutter and grants Cutter (ENMY-07)', () => {
    const kibble = new SirKibble('kibble_1', 80, 110);
    expect(kibble.abilityGrant).toBe('cutter');
  });

  it('Rocky drops stone and grants Stone (ENMY-08)', () => {
    const rocky = new Rocky('rocky_1', 80, 50);
    expect(rocky.abilityGrant).toBe('stone');
    expect(rocky.hp).toBe(3);
  });
});
