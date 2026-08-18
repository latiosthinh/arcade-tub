import { GameLoop } from '@arcade-carnival/game-engine';
import { initPlayables, onPause, onResume } from '@arcade-carnival/playables-adapter';
import { BugClimbScene } from './BugClimbScene';

function init(): void {
  initPlayables();

  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas element #game-canvas not found');
  }

  const scene = new BugClimbScene(canvas);
  const loop = new GameLoop(canvas);
  loop.setScene(scene);

  onPause(() => {
    scene.pause();
    loop.stop();
  });

  onResume(() => {
    scene.resume();
    loop.start();
  });

  loop.start();
}

window.addEventListener('DOMContentLoaded', init);
