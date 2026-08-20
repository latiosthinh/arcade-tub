import { GrassMowScene } from './GrassMowScene';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) return;

  const scene = new GrassMowScene(canvas);
  scene.start();

  (window as unknown as { grassMowScene: GrassMowScene }).grassMowScene = scene;
});
