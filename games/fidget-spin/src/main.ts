import { FidgetSpinScene } from './FidgetSpinScene';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) return;

  const scene = new FidgetSpinScene(canvas);
  scene.start();

  (window as unknown as { fidgetSpinScene: FidgetSpinScene }).fidgetSpinScene = scene;
});
