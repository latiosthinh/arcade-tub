import { GameLoop, InputManager } from '@arcade-carnival/game-engine';
import { initPlayables, onPause, onResume } from '@arcade-carnival/playables-adapter';
import { MemoryBoxesScene } from './MemoryBoxesScene.js';

initPlayables();

const canvas = document.getElementById('game') as HTMLCanvasElement;
if (canvas) {
  const loop = new GameLoop(canvas);
  const input = new InputManager();
  const scene = new MemoryBoxesScene(canvas, input);

  onPause(() => {
    scene.pause();
  });

  onResume(() => {
    scene.resume();
  });

  loop.setScene(scene);
  loop.start();
}
