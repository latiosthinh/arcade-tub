/**
 * CRT Visual Overlay Controller
 * Manages scanline/vignette overlay injection and persistent localStorage toggle.
 */

const STORAGE_KEY = 'arcade_crt_mode';
const OVERLAY_ID = 'arcade-crt-overlay';
const ACTIVE_CLASS = 'crt-active';

/**
 * Checks if CRT overlay is currently enabled.
 * Default is false (disabled) unless explicitly saved as 'on'.
 */
export function isCrtEnabled(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val === 'on';
  } catch {
    return false;
  }
}

/**
 * Toggles CRT mode on or off, optionally accepting a forced boolean state.
 * Updates DOM class and localStorage persistence.
 */
export function toggleCrt(force?: boolean): boolean {
  const current = isCrtEnabled();
  const next = typeof force === 'boolean' ? force : !current;

  try {
    localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
  } catch {
    // Ignore storage quota/access errors
  }

  if (typeof document !== 'undefined' && document.body) {
    if (next) {
      document.body.classList.add(ACTIVE_CLASS);
    } else {
      document.body.classList.remove(ACTIVE_CLASS);
    }
  }

  return next;
}

/**
 * Initializes CRT overlay DOM container and applies stored preference.
 */
export function initCrtOverlay(): void {
  if (typeof document === 'undefined') return;

  let overlay = document.getElementById(OVERLAY_ID);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
  }

  const enabled = isCrtEnabled();
  if (enabled) {
    document.body.classList.add(ACTIVE_CLASS);
  } else {
    document.body.classList.remove(ACTIVE_CLASS);
  }
}
