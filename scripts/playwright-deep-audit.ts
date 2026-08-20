import { chromium } from 'playwright';
import { preview } from 'vite';
import * as fs from 'fs';
import * as path from 'path';

const GAMES = [
  { id: 'safe-cracker', actions: async (p: any) => { await p.keyboard.press('Space'); await p.waitForTimeout(500); await p.keyboard.press('Space'); } },
  { id: 'brick-blitz', actions: async (p: any) => { await p.keyboard.press('Space'); await p.waitForTimeout(400); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(400); await p.keyboard.press('ArrowRight'); } },
  { id: 'sky-hopper', actions: async (p: any) => { await p.keyboard.press('Space'); await p.waitForTimeout(400); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(500); await p.keyboard.press('KeyZ'); } },
  { id: 'crate-catch', actions: async (p: any) => { await p.keyboard.press('Space'); await p.waitForTimeout(400); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(400); await p.keyboard.press('ArrowRight'); } },
  { id: 'type-strike', actions: async (p: any) => { await p.keyboard.press('Space'); await p.waitForTimeout(400); await p.keyboard.type('laser', { delay: 100 }); } },
  { id: 'memory-cards', actions: async (p: any) => { await p.keyboard.press('Space'); await p.mouse.click(400, 300); await p.waitForTimeout(300); await p.mouse.click(500, 300); } },
  { id: 'memory-boxes', actions: async (p: any) => { await p.keyboard.press('Space'); await p.waitForTimeout(800); await p.mouse.click(400, 300); } },
  { id: 'pop-balloon', actions: async (p: any) => { await p.keyboard.press('Space'); await p.mouse.click(400, 300); await p.mouse.click(450, 250); } },
  { id: 'space-racer', actions: async (p: any) => { await p.keyboard.press('Space'); await p.waitForTimeout(300); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(300); await p.keyboard.press('ArrowRight'); } },
  { id: 'virus-defense', actions: async (p: any) => { await p.keyboard.press('Space'); await p.mouse.move(500, 200); await p.mouse.down(); await p.waitForTimeout(500); await p.mouse.up(); } },
  { id: 'flappy-fish', actions: async (p: any) => { await p.keyboard.press('Space'); await p.waitForTimeout(300); await p.keyboard.press('Space'); await p.waitForTimeout(300); await p.keyboard.press('Space'); } },
  { id: 'game-2048', actions: async (p: any) => { await p.keyboard.press('Space'); await p.keyboard.press('ArrowUp'); await p.waitForTimeout(200); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(200); await p.keyboard.press('ArrowDown'); } },
  { id: 'snake-eat', actions: async (p: any) => { await p.keyboard.press('Space'); await p.waitForTimeout(300); await p.keyboard.press('ArrowUp'); await p.waitForTimeout(300); await p.keyboard.press('ArrowLeft'); } },
  { id: 'bug-climb', actions: async (p: any) => { await p.keyboard.press('Space'); await p.waitForTimeout(300); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(300); await p.keyboard.press('ArrowRight'); } },
  { id: 'car-race', actions: async (p: any) => { await p.keyboard.press('Space'); await p.waitForTimeout(300); await p.keyboard.press('ArrowLeft'); await p.keyboard.press('Space'); } },
  { id: 'drift-boss', actions: async (p: any) => { await p.keyboard.down('Space'); await p.waitForTimeout(600); await p.keyboard.up('Space'); } },
  { id: 'helix-jump', actions: async (p: any) => { await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(300); await p.keyboard.press('ArrowRight'); } },
  { id: 'square-bird', actions: async (p: any) => { await p.keyboard.press('Space'); await p.waitForTimeout(300); await p.keyboard.press('Space'); await p.waitForTimeout(300); await p.keyboard.press('Space'); } },
  { id: 'layers-roll', actions: async (p: any) => { await p.mouse.move(400, 300); await p.mouse.down(); await p.mouse.move(450, 300); await p.waitForTimeout(500); await p.mouse.up(); } },
  { id: 'mini-battles', actions: async (p: any) => { await p.keyboard.press('KeyW'); await p.waitForTimeout(300); await p.keyboard.press('ArrowUp'); } },
  { id: 'dino-runner', actions: async (p: any) => { await p.keyboard.press('Space'); await p.waitForTimeout(400); await p.keyboard.press('ArrowDown'); } },
  { id: 'snow-rider', actions: async (p: any) => { await p.keyboard.press('Space'); await p.waitForTimeout(400); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(300); await p.keyboard.press('Space'); } },
  { id: 'paper-basket', actions: async (p: any) => { await p.keyboard.press('Space'); await p.waitForTimeout(300); await p.keyboard.press('Space'); } },
  { id: 'potion-merge', actions: async (p: any) => { await p.mouse.click(400, 150); await p.waitForTimeout(500); await p.mouse.click(450, 150); } },
  { id: 'mahjong-paper', actions: async (p: any) => { await p.mouse.click(350, 300); await p.waitForTimeout(300); await p.mouse.click(450, 300); } },
  { id: 'subway-runner', actions: async (p: any) => { await p.keyboard.press('Space'); await p.waitForTimeout(300); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(300); await p.keyboard.press('ArrowUp'); } },
  { id: 'prism-laser', actions: async (p: any) => { await p.mouse.click(360, 360); await p.waitForTimeout(300); await p.keyboard.press('KeyR'); } }
];

async function deepGameplayAudit() {
  const server = await preview({
    preview: {
      port: 4173,
      host: 'localhost'
    }
  });

  const serverUrl = server.resolvedUrls.local[0] || 'http://localhost:4173/';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });

  const deepResults: any[] = [];
  const dir = path.resolve('audit-gameplay-shots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const game of GAMES) {
    const page = await context.newPage();
    const errors: string[] = [];
    const warnings: string[] = [];

    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
      if (msg.type() === 'warning') warnings.push(msg.text());
    });

    await page.goto(`${serverUrl}games/${game.id}/index.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    try {
      await game.actions(page);
      await page.waitForTimeout(500);
    } catch (e: any) {
      errors.push(`Action failed: ${e.message}`);
    }

    await page.screenshot({ path: path.join(dir, `${game.id}-active.png`) });

    deepResults.push({
      id: game.id,
      errors,
      warnings,
      status: errors.length === 0 ? 'PASS' : 'FAIL'
    });

    await page.close();
  }

  fs.writeFileSync('deep-audit-results.json', JSON.stringify(deepResults, null, 2));
  console.log('Deep audit done! All 27 games tested.');

  await browser.close();
  await server.close();
}

deepGameplayAudit().catch(console.error);
