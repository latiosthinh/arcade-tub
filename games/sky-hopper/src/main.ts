import { GameLoop } from '@arcade-carnival/game-engine';
import { initPlayables, onPause, onResume } from '@arcade-carnival/playables-adapter';
import { SkyHopperScene } from './SkyHopperScene.js';

initPlayables();

const canvas = document.getElementById('game') as HTMLCanvasElement;
const loop = new GameLoop(canvas);
const scene = new SkyHopperScene(canvas);

onPause(() => {
  scene.pause();
});

onResume(() => {
  scene.resume();
});

loop.setScene(scene);
loop.start();
