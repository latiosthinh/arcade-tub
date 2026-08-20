import { BubbleScene } from './BubbleScene';
import { bubbleAudio } from './BubbleAudio';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  const scene = new BubbleScene(canvas, bubbleAudio);
  scene.start();
});
