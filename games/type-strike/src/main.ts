import { GameLoop } from '@arcade-carnival/game-engine';
import { initPlayables, onPause, onResume } from '@arcade-carnival/playables-adapter';
import { TypeStrikeScene } from './TypeStrikeScene.js';

initPlayables();

const canvas = document.getElementById('game') as HTMLCanvasElement;
canvas.width = 800;
canvas.height = 600;

const scene = new TypeStrikeScene(canvas);
const loop = new GameLoop(canvas);

onPause(() => {
  scene.pause();
});

onResume(() => {
  scene.resume();
});

loop.setScene(scene);
loop.start();
