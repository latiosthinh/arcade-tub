import { GameLoop } from '@arcade-carnival/game-engine';
import { initPlayables, onPause, onResume } from '@arcade-carnival/playables-adapter';
import { SnakeEatScene } from './SnakeEatScene.js';

initPlayables();

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
if (canvas) {
  canvas.width = 800;
  canvas.height = 640;

  const loop = new GameLoop(canvas);
  const scene = new SnakeEatScene(canvas);

  onPause(() => {
    scene.pause();
  });

  onResume(() => {
    scene.resume();
  });

  loop.setScene(scene);
  loop.start();
}
