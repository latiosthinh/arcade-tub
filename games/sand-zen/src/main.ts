import { SandZenScene } from './SandZenScene';
import { sandAudio } from './SandAudio';
import { ZenToolType } from './ZenTools';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) return;

  const scene = new SandZenScene(canvas);
  scene.start();

  // Tool buttons
  const toolButtons = document.querySelectorAll<HTMLButtonElement>('.tool-btn');
  toolButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tool = btn.dataset.tool as ZenToolType;
      if (tool) {
        scene.zenTools.setTool(tool);
        toolButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // Hopper toggle
  const hopperBtn = document.getElementById('hopperBtn');
  hopperBtn?.addEventListener('click', () => {
    scene.zenTools.hopperActive = !scene.zenTools.hopperActive;
    hopperBtn.classList.toggle('active', scene.zenTools.hopperActive);
  });

  // Palette switcher & Swatches
  const paletteBtn = document.getElementById('paletteBtn');
  const swatchesContainer = document.getElementById('swatchesContainer');

  const updateSwatches = () => {
    if (!swatchesContainer) return;
    swatchesContainer.innerHTML = '';
    const pal = scene.zenTools.currentPalette;

    pal.colors.forEach((col, idx) => {
      const swatch = document.createElement('button');
      swatch.className = `swatch ${idx === scene.zenTools.currentColorIndex ? 'active' : ''}`;
      // Convert packed 0xAABBGGRR / hex color to CSS rgb
      const r = col & 0xFF;
      const g = (col >> 8) & 0xFF;
      const b = (col >> 16) & 0xFF;
      swatch.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

      swatch.addEventListener('click', () => {
        scene.zenTools.setColorIndex(idx);
        updateSwatches();
      });

      swatchesContainer.appendChild(swatch);
    });
  };

  paletteBtn?.addEventListener('click', () => {
    scene.zenTools.nextPalette();
    updateSwatches();
  });

  updateSwatches();

  // Clear basin
  const clearBtn = document.getElementById('clearBtn');
  clearBtn?.addEventListener('click', () => {
    scene.sandGrid.clearSandKeepWalls();
  });

  // Mute audio
  const muteBtn = document.getElementById('muteBtn');
  muteBtn?.addEventListener('click', () => {
    const isMuted = !sandAudio.isMuted();
    sandAudio.setMuted(isMuted);
    muteBtn.innerText = isMuted ? '🔇' : '🔊';
  });
});
