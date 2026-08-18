import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const GAME_IDS = [
  'safe-cracker',
  'brick-blitz',
  'sky-hopper',
  'crate-catch',
  'type-strike',
  'memory-cards',
  'memory-boxes',
  'pop-balloon',
  'space-racer',
  'virus-defense',
  'flappy-fish',
  'game-2048',
  'snake-eat',
  'bug-climb',
  'car-race',
  'potion-merge',
  'mahjong-paper',
];

describe('Game Shell HTML Containers', () => {
  GAME_IDS.forEach((gameId) => {
    describe(`Game Shell: ${gameId}`, () => {
      const htmlPath = path.resolve(__dirname, `../games/${gameId}/index.html`);

      it('file exists', () => {
        expect(fs.existsSync(htmlPath)).toBe(true);
      });

      it('loads Google Fonts for Patrick Hand, Cabin Sketch, and Comfortaa', () => {
        const content = fs.readFileSync(htmlPath, 'utf-8');
        expect(content).toContain('fonts.googleapis.com');
        expect(content).toContain('Patrick+Hand');
        expect(content).toContain('Cabin+Sketch');
        expect(content).toContain('Comfortaa');
      });

      it('has papercraft parchment background and cardboard frame border & shadow', () => {
        const content = fs.readFileSync(htmlPath, 'utf-8');
        expect(content).toContain('#FAF6EE');
        expect(content).toMatch(/border:\s*3px\s+solid\s+#2B2118/);
        expect(content).toMatch(/box-shadow:\s*4px\s+4px\s+0px\s+#2B2118/);
      });
    });
  });
});
