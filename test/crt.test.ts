import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initCrtOverlay, toggleCrt, isCrtEnabled } from '../src/crt';

describe('CRT Overlay Controller', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
    const existing = document.getElementById('arcade-crt-overlay');
    if (existing) {
      existing.remove();
    }
  });

  it('isCrtEnabled returns true by default or when not explicitly off', () => {
    expect(isCrtEnabled()).toBe(true);
    localStorage.setItem('arcade_crt_mode', 'on');
    expect(isCrtEnabled()).toBe(true);
    localStorage.setItem('arcade_crt_mode', 'off');
    expect(isCrtEnabled()).toBe(false);
  });

  it('initCrtOverlay attaches overlay element and adds crt-active class by default', () => {
    initCrtOverlay();
    const overlay = document.getElementById('arcade-crt-overlay');
    expect(overlay).not.toBeNull();
    expect(document.body.classList.contains('crt-active')).toBe(true);
  });

  it('initCrtOverlay respects stored off preference', () => {
    localStorage.setItem('arcade_crt_mode', 'off');
    initCrtOverlay();
    expect(document.body.classList.contains('crt-active')).toBe(false);
  });

  it('toggleCrt switches state, updates localStorage, and alters DOM class', () => {
    initCrtOverlay();
    expect(isCrtEnabled()).toBe(true);
    expect(document.body.classList.contains('crt-active')).toBe(true);

    const newState = toggleCrt();
    expect(newState).toBe(false);
    expect(isCrtEnabled()).toBe(false);
    expect(localStorage.getItem('arcade_crt_mode')).toBe('off');
    expect(document.body.classList.contains('crt-active')).toBe(false);

    const nextState = toggleCrt();
    expect(nextState).toBe(true);
    expect(isCrtEnabled()).toBe(true);
    expect(localStorage.getItem('arcade_crt_mode')).toBe('on');
    expect(document.body.classList.contains('crt-active')).toBe(true);
  });

  it('toggleCrt accepts explicit force boolean', () => {
    initCrtOverlay();
    toggleCrt(false);
    expect(isCrtEnabled()).toBe(false);
    expect(localStorage.getItem('arcade_crt_mode')).toBe('off');

    toggleCrt(true);
    expect(isCrtEnabled()).toBe(true);
    expect(localStorage.getItem('arcade_crt_mode')).toBe('on');
  });
});
