import { GameRunner } from '@arcade-carnival/game-engine';
import { initPlayables } from '@arcade-carnival/playables-adapter';
import { SnowScene } from './SnowScene.js';

window.addEventListener('DOMContentLoaded', () => {
  initPlayables();
  const canvas = document.getElementById('game') as HTMLCanvasElement;
  if (!canvas) throw new Error('Game canvas not found');

  const scene = new SnowScene(canvas);
  const runner = new GameRunner(scene);
  runner.start();
});
