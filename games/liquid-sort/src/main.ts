import { initPlayables } from '@arcade-carnival/playables-adapter';
import { LiquidSortScene } from './LiquidSortScene';
import { liquidAudio } from './LiquidAudio';

initPlayables();

const startApp = () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) return;

  const scene = new LiquidSortScene(canvas);
  scene.start();

  // DOM Elements
  const levelBadge = document.getElementById('levelBadge');
  const undoBtn = document.getElementById('undoBtn') as HTMLButtonElement;
  const undoCountBadge = document.getElementById('undoCount');
  const restartBtn = document.getElementById('restartBtn');
  const muteBtn = document.getElementById('muteBtn');

  const winModal = document.getElementById('winModal');
  const nextLevelBtn = document.getElementById('nextLevelBtn');

  // UI state synchronizer
  const updateUI = () => {
    if (levelBadge) {
      levelBadge.innerText = `🧪 Level ${scene.currentLevel}`;
    }
    if (undoBtn && undoCountBadge) {
      const undoCount = scene.engine.getUndoCount();
      undoBtn.disabled = !scene.engine.canUndo();
      undoCountBadge.innerText = `${undoCount}`;
      undoCountBadge.style.display = undoCount > 0 ? 'inline-block' : 'none';
    }
    if (winModal) {
      winModal.style.display = scene.isWon ? 'flex' : 'none';
    }
  };

  scene.onStateChange = updateUI;
  scene.onLevelComplete = () => {
    updateUI();
  };

  // Undo button
  undoBtn?.addEventListener('click', () => {
    scene.undo();
  });

  // Restart button
  restartBtn?.addEventListener('click', () => {
    scene.restart();
  });

  // Next level button
  nextLevelBtn?.addEventListener('click', () => {
    scene.loadLevel(scene.currentLevel + 1);
  });

  // Mute audio toggle
  muteBtn?.addEventListener('click', () => {
    const isMuted = !liquidAudio.isMuted();
    liquidAudio.setMuted(isMuted);
    if (muteBtn) muteBtn.innerText = isMuted ? '🔇' : '🔊';
  });

  updateUI();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
