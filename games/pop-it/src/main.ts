import { PopItScene } from './PopItScene';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) return;

  const scene = new PopItScene(canvas);
  scene.start();

  // Expose to window for testing / debugging
  (window as unknown as { popItScene: PopItScene }).popItScene = scene;
});
