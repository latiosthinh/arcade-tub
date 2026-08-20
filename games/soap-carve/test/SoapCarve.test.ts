import { describe, it, expect, beforeEach } from 'vitest';
import { SoapBlock, SOAP_PALETTES } from '../src/SoapBlock';
import { PeelParticleSystem } from '../src/PeelParticles';
import { FigurineDiscovery, FIGURINES } from '../src/FigurineDiscovery';

describe('SoapBlock', () => {
  let soapBlock: SoapBlock;

  beforeEach(() => {
    soapBlock = new SoapBlock(40, 30, 6);
  });

  it('initializes with uniform depth 0 and 0% carved', () => {
    expect(soapBlock.cols).toBe(40);
    expect(soapBlock.rows).toBe(30);
    expect(soapBlock.maxDepth).toBe(6);
    expect(soapBlock.getDepth(0, 0)).toBe(0);
    expect(soapBlock.getDepth(20, 15)).toBe(0);
    expect(soapBlock.getOverallCarvedPercentage()).toBe(0);
  });

  it('carves depth along a line slice and returns shaved voxel count', () => {
    const result = soapBlock.carveSlice(10, 15, 30, 15, 2, 1);
    expect(result.carvedCount).toBeGreaterThan(0);
    expect(soapBlock.getDepth(20, 15)).toBeGreaterThanOrEqual(1);
    expect(soapBlock.getOverallCarvedPercentage()).toBeGreaterThan(0);
    expect(result.shavedColors.length).toBeGreaterThan(0);
  });

  it('clamps depth safely at maxDepth without overflow', () => {
    for (let i = 0; i < 10; i++) {
      soapBlock.carveSlice(5, 5, 10, 5, 2, 2);
    }
    expect(soapBlock.getDepth(7, 5)).toBe(6);
    expect(soapBlock.getDepth(7, 5)).toBeLessThanOrEqual(6);
  });

  it('resets grid to 0 with chosen palette', () => {
    soapBlock.carveSlice(0, 0, 39, 29, 5, 4);
    expect(soapBlock.getOverallCarvedPercentage()).toBeGreaterThan(0);
    soapBlock.reset(1);
    expect(soapBlock.getOverallCarvedPercentage()).toBe(0);
    expect(soapBlock.palette.name).toBe(SOAP_PALETTES[1].name);
  });

  it('safely bounds slicing out-of-grid coordinates (T-44-01 mitigation)', () => {
    const res = soapBlock.carveSlice(-10, -10, 100, 100, 3, 1);
    expect(res.carvedCount).toBeGreaterThan(0);
    expect(soapBlock.getDepth(0, 0)).toBeGreaterThanOrEqual(0);
  });
});

describe('PeelParticleSystem', () => {
  let particleSys: PeelParticleSystem;

  beforeEach(() => {
    particleSys = new PeelParticleSystem(150);
  });

  it('spawns peel particles and updates physics (curl, flutter, gravity)', () => {
    particleSys.spawnPeel(100, 100, 50, -30, '#FFB7B2', 20);
    expect(particleSys.particles.length).toBe(1);

    const p = particleSys.particles[0];
    const initialY = p.y;
    const initialCurl = p.curlAngle;

    particleSys.update(0.1);

    expect(p.life).toBeLessThan(1.0);
    expect(p.curlAngle).not.toBe(initialCurl);
    expect(p.y).not.toBe(initialY);
  });

  it('hard-caps maximum particles and recycles oldest (T-44-02 mitigation)', () => {
    for (let i = 0; i < 200; i++) {
      particleSys.spawnPeel(i, i, 10, 10, '#A8E6CF', 15);
    }
    expect(particleSys.particles.length).toBeLessThanOrEqual(150);
  });
});

describe('FigurineDiscovery', () => {
  let discovery: FigurineDiscovery;
  let soapBlock: SoapBlock;

  beforeEach(() => {
    discovery = new FigurineDiscovery(FIGURINES[0]); // Swan
    soapBlock = new SoapBlock(40, 30, 6);
  });

  it('tracks reveal percentage based on overlying soap block depth', () => {
    expect(discovery.checkReveal(soapBlock)).toBe(false);
    expect(discovery.revealPercentage).toBe(0);

    // Carve area over figurine
    soapBlock.carveSlice(0, 0, 39, 29, 30, 6);

    const isUnlocked = discovery.checkReveal(soapBlock);
    expect(discovery.revealPercentage).toBeGreaterThanOrEqual(80);
    expect(isUnlocked).toBe(true);
  });

  it('unlocks figurine and records collection status', () => {
    expect(discovery.isUnlocked(FIGURINES[0].id)).toBe(false);
    discovery.unlockFigurine(FIGURINES[0].id);
    expect(discovery.isUnlocked(FIGURINES[0].id)).toBe(true);
  });
});
