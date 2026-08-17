import { GameLoop } from '@arcade-carnival/game-engine';
import { initPlayables } from '@arcade-carnival/playables-adapter';
import { Game2048Scene } from './Game2048Scene.js';

initPlayables();

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
if (canvas) {
  const loop = new GameLoop(canvas);
  const scene = new Game2048Scene(canvas);

  loop.setScene(scene);
  loop.start();
}
