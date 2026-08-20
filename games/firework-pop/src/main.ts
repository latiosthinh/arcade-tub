import { GameLoop } from '@arcade-carnival/game-engine';
import { FireworkScene } from './FireworkScene.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas element #game-canvas not found');
  }

  const scene = new FireworkScene(canvas);
  scene.init();

  const loop = new GameLoop(scene);
  loop.start();
});
