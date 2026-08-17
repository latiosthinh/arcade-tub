import { GameLoop } from '@arcade-carnival/game-engine';
import { initPlayables, onPause, onResume } from '@arcade-carnival/playables-adapter';
import { VirusDefenseScene } from './VirusDefenseScene.js';

initPlayables();

const canvas = document.getElementById('game') as HTMLCanvasElement;
if (canvas) {
  const loop = new GameLoop(canvas);
  const scene = new VirusDefenseScene(canvas);

  onPause(() => {
    scene.pause();
  });

  onResume(() => {
    scene.resume();
  });

  loop.setScene(scene);
  loop.start();
}
