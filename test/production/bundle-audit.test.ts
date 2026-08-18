import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

describe('Production Bundle Audit (< 250KB Gzipped Budget)', () => {
  const distDir = path.resolve(__dirname, '../../dist');

  function getAllFiles(dir: string, fileList: string[] = []): string[] {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getAllFiles(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    }
    return fileList;
  }

  it('dist directory contains all production entry HTML files', () => {
    expect(fs.existsSync(distDir)).toBe(true);

    const requiredEntries = [
      'index.html',
      'embed.html',
      'games/safe-cracker/index.html',
      'games/brick-blitz/index.html',
      'games/sky-hopper/index.html',
      'games/crate-catch/index.html',
      'games/type-strike/index.html',
      'games/memory-cards/index.html',
      'games/memory-boxes/index.html',
      'games/pop-balloon/index.html',
      'games/space-racer/index.html',
      'games/virus-defense/index.html',
      'games/flappy-fish/index.html',
      'games/game-2048/index.html',
      'games/snake-eat/index.html',
      'games/bug-climb/index.html',
      'games/car-race/index.html',
      'games/drift-boss/index.html',
      'games/helix-jump/index.html',
      'games/square-bird/index.html',
      'games/layers-roll/index.html',
      'games/mini-battles/index.html',
      'games/dino-runner/index.html',
      'games/snow-rider/index.html',
      'games/paper-basket/index.html',
      'games/potion-merge/index.html',
      'games/mahjong-paper/index.html',
      'games/subway-runner/index.html',
      'games/prism-laser/index.html',
    ];

    for (const entry of requiredEntries) {
      const entryPath = path.join(distDir, entry);
      expect(fs.existsSync(entryPath)).toBe(true);
    }
  });

  it('total distribution bundle size remains strictly under 250KB gzipped', () => {
    const files = getAllFiles(distDir);
    expect(files.length).toBeGreaterThan(0);

    let totalGzip = 0;
    for (const file of files) {
      const buffer = fs.readFileSync(file);
      const gzipSize = zlib.gzipSync(buffer).length;
      totalGzip += gzipSize;
    }

    const totalGzipKb = totalGzip / 1024;
    expect(totalGzipKb).toBeLessThan(250);
  });

  it('all individual production assets remain strictly under 50KB gzipped', () => {
    const files = getAllFiles(distDir);

    for (const file of files) {
      const buffer = fs.readFileSync(file);
      const gzipSize = zlib.gzipSync(buffer).length;
      const gzipKb = gzipSize / 1024;
      const relPath = path.relative(distDir, file);

      expect(gzipKb).toBeLessThan(50);
    }
  });
});
