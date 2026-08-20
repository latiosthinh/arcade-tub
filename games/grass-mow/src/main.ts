import { initPlayables } from '@arcade-carnival/playables-adapter';
import { GrassMowScene } from './GrassMowScene';

initPlayables();

const startApp = () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) return;

  const scene = new GrassMowScene(canvas);
  scene.start();

  (window as unknown as { grassMowScene: GrassMowScene }).grassMowScene = scene;
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
