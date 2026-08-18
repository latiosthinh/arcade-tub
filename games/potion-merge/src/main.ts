import { GameLoop } from '@arcade-carnival/game-engine';
import { initPlayables, onPause, onResume } from '@arcade-carnival/playables-adapter';
import { PotionScene } from './PotionScene.js';

initPlayables();

const canvas = document.getElementById('game') as HTMLCanvasElement;
if (canvas) {
  const loop = new GameLoop(canvas);
  const scene = new PotionScene(canvas);

  onPause(() => {
    scene.pause();
  });

  onResume(() => {
    scene.resume();
  });

  loop.setScene(scene);
  loop.start();
}
