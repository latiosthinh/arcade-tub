import { GameLoop } from '@arcade-carnival/game-engine';
import { initPlayables, onPause, onResume } from '@arcade-carnival/playables-adapter';
import { KoiPondScene } from './KoiPondScene.js';

initPlayables();

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
if (canvas) {
  const loop = new GameLoop(canvas, 800, 600);
  const scene = new KoiPondScene(canvas);

  onPause(() => {
    // optional pause
  });
  onResume(() => {
    // optional resume
  });

  loop.setScene(scene);
  loop.start();
}
