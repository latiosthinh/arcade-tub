import { KirbyScene } from './KirbyScene';
import { SimpleInputManager } from './types';

function initGame() {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const input = new SimpleInputManager();
  const scene = new KirbyScene(input);

  let lastTime = performance.now();

  function loop(currentTime: number) {
    const dt = Math.min((currentTime - lastTime) / 1000, 1 / 30);
    lastTime = currentTime;

    scene.update(dt);
    scene.render(ctx!);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', initGame);
}
