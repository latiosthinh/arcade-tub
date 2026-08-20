import { NetSwatScene } from './NetSwatScene';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  canvas.width = 800;
  canvas.height = 600;

  const scene = new NetSwatScene(canvas);
  scene.start();
});
