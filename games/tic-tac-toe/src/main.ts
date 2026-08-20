import { TicTacToeScene } from './TicTacToeScene';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  canvas.width = 600;
  canvas.height = 650;

  const scene = new TicTacToeScene(canvas);
  scene.start();
});
