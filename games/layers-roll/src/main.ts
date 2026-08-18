import { GameLoop } from '@arcade-carnival/game-engine';
import { initPlayables, onPause, onResume } from '@arcade-carnival/playables-adapter';
import { LayersRollScene } from './LayersRollScene.js';

initPlayables();

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
if (canvas) {
  const loop = new GameLoop(canvas);
  const scene = new LayersRollScene(canvas);

  onPause(() => {
    scene.pause();
  });

  onResume(() => {
    scene.resume();
  });

  loop.setScene(scene);
  loop.start();
}
