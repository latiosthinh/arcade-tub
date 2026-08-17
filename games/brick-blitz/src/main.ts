import { GameLoop } from '@arcade-carnival/game-engine';
import { initPlayables, onPause, onResume } from '@arcade-carnival/playables-adapter';
import { BrickBlitzScene } from './BrickBlitzScene.js';

initPlayables();

const canvas = document.getElementById('game') as HTMLCanvasElement;
const loop = new GameLoop(canvas);
const scene = new BrickBlitzScene(canvas);

onPause(() => scene.pause());
onResume(() => scene.resume());

loop.setScene(scene);
loop.start();
