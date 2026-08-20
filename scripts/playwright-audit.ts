import { chromium } from 'playwright';
import { preview } from 'vite';
import * as fs from 'fs';
import * as path from 'path';

const GAMES = [
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
  'drift-boss',
  'helix-jump',
  'square-bird',
  'layers-roll',
  'mini-battles',
  'dino-runner',
  'snow-rider',
  'paper-basket',
  'potion-merge',
  'mahjong-paper',
  'subway-runner',
  'prism-laser'
];

interface AuditResult {
  id: string;
  loaded: boolean;
  hasCanvas: boolean;
  errors: string[];
  warnings: string[];
  hubUrlReachable: boolean;
  gameTitle?: string;
  stateInfo?: any;
  uiChecks: {
    startScreenOk: boolean;
    playableReaction: boolean;
    audioContextCreated: boolean;
    canvasDimensions: { width: number; height: number };
    customDomOverlays: string[];
  };
  notes: string[];
}

async function runAudit() {
  console.log('Starting Vite preview server programmatically...');
  const server = await preview({
    preview: {
      port: 4173,
      host: 'localhost'
    }
  });

  const serverUrl = server.resolvedUrls.local[0] || 'http://localhost:4173/';
  console.log(`Server running at ${serverUrl}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const results: AuditResult[] = [];
  const screenshotDir = path.resolve('audit-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // 1. Audit Main Hub
  console.log('Auditing Hub...');
  const page = await context.newPage();
  const hubErrors: string[] = [];
  page.on('pageerror', err => hubErrors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') hubErrors.push(msg.text());
  });

  await page.goto(`${serverUrl}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(screenshotDir, 'hub.png') });
  await page.close();

  // 2. Audit each game directly
  for (const gameId of GAMES) {
    console.log(`Auditing game: ${gameId}...`);
    const gamePage = await context.newPage();
    const errors: string[] = [];
    const warnings: string[] = [];

    gamePage.on('pageerror', err => errors.push(err.message));
    gamePage.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
      if (msg.type() === 'warning') warnings.push(msg.text());
    });

    const result: AuditResult = {
      id: gameId,
      loaded: false,
      hasCanvas: false,
      errors: [],
      warnings: [],
      hubUrlReachable: true,
      uiChecks: {
        startScreenOk: false,
        playableReaction: false,
        audioContextCreated: false,
        canvasDimensions: { width: 0, height: 0 },
        customDomOverlays: []
      },
      notes: []
    };

    try {
      // Direct load
      await gamePage.goto(`${serverUrl}games/${gameId}/index.html`, {
        waitUntil: 'networkidle',
        timeout: 10000
      });

      result.loaded = true;

      // Check canvas
      const canvas = await gamePage.$('canvas');
      if (canvas) {
        result.hasCanvas = true;
        const box = await canvas.boundingBox();
        if (box) {
          result.uiChecks.canvasDimensions = { width: Math.round(box.width), height: Math.round(box.height) };
        }
      }

      // Check DOM overlays
      const overlays = await gamePage.$$eval('div, button, h1, h2, span', elements => {
        return elements
          .filter(el => el.textContent && el.textContent.trim().length > 0 && el.offsetHeight > 0)
          .map(el => (el.textContent || '').trim().slice(0, 30))
          .slice(0, 10);
      });
      result.uiChecks.customDomOverlays = overlays;

      await gamePage.screenshot({ path: path.join(screenshotDir, `${gameId}-start.png`) });

      // Try interacting: Click or press Space / Enter / Arrow keys
      await gamePage.keyboard.press('Space');
      await gamePage.waitForTimeout(300);
      await gamePage.mouse.click(640, 360);
      await gamePage.waitForTimeout(500);
      await gamePage.keyboard.press('ArrowUp');
      await gamePage.waitForTimeout(300);
      await gamePage.keyboard.press('KeyW');
      await gamePage.waitForTimeout(500);

      await gamePage.screenshot({ path: path.join(screenshotDir, `${gameId}-action.png`) });

      // Evaluate internal state if available
      const state = await gamePage.evaluate(() => {
        const win = window as any;
        return {
          hasEngine: !!win.engine || !!win.game,
          audioCtxState: win.AudioContext ? 'supported' : 'none'
        };
      });
      result.stateInfo = state;
      result.uiChecks.startScreenOk = result.hasCanvas || overlays.length > 0;
      result.uiChecks.playableReaction = errors.length === 0;

    } catch (e: any) {
      errors.push(`Audit failure: ${e.message}`);
    }

    result.errors = errors;
    result.warnings = warnings;
    results.push(result);
    await gamePage.close();
  }

  // 3. Audit Game inside Hub Player Route
  console.log('Auditing Hub Player route navigation...');
  for (const sampleId of ['safe-cracker', 'brick-blitz', 'sky-hopper', 'drift-boss', 'potion-merge', 'subway-runner', 'prism-laser']) {
    const hubGamePage = await context.newPage();
    const hErrors: string[] = [];
    hubGamePage.on('pageerror', err => hErrors.push(err.message));
    try {
      await hubGamePage.goto(`${serverUrl}#/game/${sampleId}`, { waitUntil: 'networkidle', timeout: 10000 });
      await hubGamePage.waitForTimeout(1000);
      await hubGamePage.screenshot({ path: path.join(screenshotDir, `hub-player-${sampleId}.png`) });
    } catch (e: any) {
      console.error(`Hub player route failed for ${sampleId}:`, e.message);
    }
    await hubGamePage.close();
  }

  fs.writeFileSync('audit-results.json', JSON.stringify({ hubErrors, results }, null, 2));
  console.log('Audit complete. Results written to audit-results.json');

  await browser.close();
  await server.close();
}

runAudit().catch(console.error);

