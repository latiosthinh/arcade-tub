import { SoapCarveScene } from './SoapCarveScene';
import { carveAudio } from './CarveAudio';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) return;

  const scene = new SoapCarveScene(canvas);
  scene.start();

  // UI bindings
  const progressText = document.getElementById('progressText');
  const progressBar = document.getElementById('progressBar');
  const paletteBtn = document.getElementById('paletteBtn');
  const resetBtn = document.getElementById('resetBtn');
  const figurineBtn = document.getElementById('figurineBtn');
  const muteBtn = document.getElementById('muteBtn');
  const victoryModal = document.getElementById('victoryModal');
  const victoryTitle = document.getElementById('victoryTitle');
  const victoryCloseBtn = document.getElementById('victoryCloseBtn');
  const victoryNextBtn = document.getElementById('victoryNextBtn');

  const updateUI = () => {
    const progress = scene.getFigurineProgress();
    if (progressText) progressText.innerText = `${progress}% Uncovered`;
    if (progressBar) progressBar.style.width = `${progress}%`;

    if (scene.isShowingVictory() && victoryModal) {
      const fig = scene.getCurrentFigurine();
      if (victoryTitle) victoryTitle.innerText = `You Found: ${fig.name}!`;
      victoryModal.classList.remove('hidden');
    }
  };

  setInterval(updateUI, 100);

  paletteBtn?.addEventListener('click', () => {
    scene.nextPalette();
  });

  resetBtn?.addEventListener('click', () => {
    scene.resetSoapBar();
  });

  figurineBtn?.addEventListener('click', () => {
    scene.nextFigurine();
  });

  muteBtn?.addEventListener('click', () => {
    const isMuted = !carveAudio.getMuted();
    carveAudio.setMuted(isMuted);
    muteBtn.innerText = isMuted ? '🔇' : '🔊';
  });

  victoryCloseBtn?.addEventListener('click', () => {
    scene.closeVictoryModal();
    victoryModal?.classList.add('hidden');
  });

  victoryNextBtn?.addEventListener('click', () => {
    scene.closeVictoryModal();
    victoryModal?.classList.add('hidden');
    scene.nextFigurine();
  });
});
