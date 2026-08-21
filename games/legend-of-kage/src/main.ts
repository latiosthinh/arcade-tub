import { KageScene } from './KageScene';
import { SimpleInputManager } from '../../packages/game-engine/src/InputManager';

function initGame() {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const scene = new KageScene();

  // Keyboard mapping
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
      scene.touchControls.inputState.jump = true;
      scene.touchControls.inputState.jumpJustPressed = true;
    }
    if (e.code === 'KeyZ' || e.code === 'KeyJ') {
      scene.touchControls.inputState.sword = true;
      scene.touchControls.inputState.swordJustPressed = true;
    }
    if (e.code === 'KeyX' || e.code === 'KeyK') {
      scene.touchControls.inputState.shuriken = true;
      scene.touchControls.inputState.shurikenJustPressed = true;
    }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') scene.touchControls.inputState.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') scene.touchControls.inputState.right = true;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') scene.touchControls.inputState.down = true;
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') scene.touchControls.inputState.jump = false;
    if (e.code === 'KeyZ' || e.code === 'KeyJ') scene.touchControls.inputState.sword = false;
    if (e.code === 'KeyX' || e.code === 'KeyK') scene.touchControls.inputState.shuriken = false;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') scene.touchControls.inputState.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') scene.touchControls.inputState.right = false;
    if (e.code === 'ArrowDown' || e.code === 'KeyS') scene.touchControls.inputState.down = false;
  });

  let lastTime = performance.now();

  function loop(currentTime: number) {
    const dt = Math.min((currentTime - lastTime) / 1000, 1 / 30);
    lastTime = currentTime;

    scene.update(dt);
    scene.render(ctx!);
    scene.touchControls.update();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', initGame);
}
