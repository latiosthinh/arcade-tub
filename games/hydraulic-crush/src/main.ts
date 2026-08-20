import { HydraulicCrushScene } from './HydraulicCrushScene';
import { crushAudio } from './CrushAudio';
import { CRUSH_ITEMS } from './CrushItems';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const scene = new HydraulicCrushScene(canvas);
  scene.start();

  // Setup Item Carousel Buttons
  const carousel = document.getElementById('item-carousel');
  if (carousel) {
    Object.values(CRUSH_ITEMS).forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'item-btn';
      btn.setAttribute('data-id', item.id);
      btn.innerText = item.name;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.item-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        scene.selectItem(item.id);
      });
      carousel.appendChild(btn);
    });

    // Mark first active
    const firstBtn = carousel.querySelector('.item-btn');
    if (firstBtn) firstBtn.classList.add('active');
  }

  // Reset Button
  const resetBtn = document.getElementById('btn-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      scene.resetItem();
    });
  }

  // Audio Toggle Button
  const muteBtn = document.getElementById('btn-mute');
  const updateMuteUi = () => {
    if (muteBtn) {
      muteBtn.innerText = crushAudio.isMuted() ? 'UNMUTE' : 'MUTE';
    }
  };
  if (muteBtn) {
    updateMuteUi();
    muteBtn.addEventListener('click', () => {
      crushAudio.toggleMute();
      updateMuteUi();
    });
  }

  // Hold Button for Touch / Pointer
  const crushActionBtn = document.getElementById('btn-crush-hold');
  if (crushActionBtn) {
    const startPress = (e: Event) => {
      e.preventDefault();
      const fakeEvent = new MouseEvent('mousedown');
      canvas.dispatchEvent(fakeEvent);
    };
    const endPress = (e: Event) => {
      e.preventDefault();
      const fakeEvent = new MouseEvent('mouseup');
      window.dispatchEvent(fakeEvent);
    };

    crushActionBtn.addEventListener('mousedown', startPress);
    crushActionBtn.addEventListener('touchstart', startPress, { passive: false });
    crushActionBtn.addEventListener('mouseup', endPress);
    crushActionBtn.addEventListener('touchend', endPress, { passive: false });
    crushActionBtn.addEventListener('touchcancel', endPress, { passive: false });
  }
});
