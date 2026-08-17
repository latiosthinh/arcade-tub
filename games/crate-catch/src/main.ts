import { GameLoop } from '@arcade-carnival/game-engine';
import { initPlayables, onPause, onResume } from '@arcade-carnival/playables-adapter';
import { CrateCatchScene } from './CrateCatchScene.js';

function main(): void {
  initPlayables();

  const canvas = document.getElementById('game') as HTMLCanvasElement | null;
  if (!canvas) {
    console.error('Canvas element #game not found');
    return;
  }

  const loop = new GameLoop(canvas);
  const scene = new CrateCatchScene(canvas);

  onPause(() => {
    scene.pause();
  });

  onResume(() => {
    scene.resume();
  });

  loop.setScene(scene);
  loop.start();
}

window.addEventListener('DOMContentLoaded', main);
