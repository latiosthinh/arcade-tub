import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UIAudioSynthesizer, uiAudio } from '../../src/audio/ui-audio';

describe('UIAudioSynthesizer', () => {
  let synth: UIAudioSynthesizer;
  let mockContext: any;
  let mockGainNode: any;
  let mockOscillatorNode: any;

  beforeEach(() => {
    localStorage.clear();

    mockGainNode = {
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    mockOscillatorNode = {
      type: 'sine',
      frequency: {
        value: 440,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null as any,
    };

    mockContext = {
      state: 'suspended',
      currentTime: 0,
      resume: vi.fn().mockResolvedValue(undefined),
      createGain: vi.fn(() => ({
        ...mockGainNode,
        gain: { ...mockGainNode.gain },
      })),
      createOscillator: vi.fn(() => ({
        ...mockOscillatorNode,
        frequency: { ...mockOscillatorNode.frequency },
      })),
      createBuffer: vi.fn((_channels: number, length: number, sampleRate: number) => ({
        getChannelData: vi.fn(() => new Float32Array(length)),
        sampleRate,
        length,
      })),
      createBufferSource: vi.fn(() => ({
        buffer: null,
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null,
      })),
      destination: {},
    };

    function MockAudioContext(this: any) {
      return mockContext;
    }

    (window as any).AudioContext = MockAudioContext;
    delete (window as any).webkitAudioContext;

    synth = new UIAudioSynthesizer();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes from localStorage or defaults to false', () => {
    expect(synth.isMuted()).toBe(false);

    synth.setMuted(true);
    expect(synth.isMuted()).toBe(true);
    expect(localStorage.getItem('arcade-carnival-muted')).toBe('true');

    const synth2 = new UIAudioSynthesizer();
    expect(synth2.isMuted()).toBe(true);

    synth2.toggleMute();
    expect(synth2.isMuted()).toBe(false);
    expect(localStorage.getItem('arcade-carnival-muted')).toBe('false');
  });

  it('does not create oscillators when muted', () => {
    synth.setMuted(true);
    mockContext.createOscillator.mockClear();

    synth.playClick();
    synth.playHover();
    synth.playLaunch();
    synth.playTransition();
    synth.playCrtToggle();
    synth.playError();
    synth.playSuccess();

    expect(mockContext.createOscillator).not.toHaveBeenCalled();
  });

  it('resumes suspended audio context on interaction', () => {
    synth.playClick();
    expect(mockContext.resume).toHaveBeenCalled();
  });

  it('plays click sound preset', () => {
    synth.playClick();
    expect(mockContext.createOscillator).toHaveBeenCalled();
  });

  it('plays hover sound preset', () => {
    synth.playHover();
    expect(mockContext.createOscillator).toHaveBeenCalled();
  });

  it('plays launch sound preset', () => {
    synth.playLaunch();
    expect(mockContext.createOscillator).toHaveBeenCalled();
  });

  it('plays transition sound preset', () => {
    synth.playTransition();
    expect(mockContext.createOscillator).toHaveBeenCalled();
  });

  it('plays crtToggle sound preset', () => {
    synth.playCrtToggle();
    expect(mockContext.createOscillator).toHaveBeenCalled();
  });

  it('plays error sound preset', () => {
    synth.playError();
    expect(mockContext.createOscillator).toHaveBeenCalled();
  });

  it('plays success sound preset', () => {
    synth.playSuccess();
    expect(mockContext.createOscillator).toHaveBeenCalled();
  });

  it('handles headless environment without AudioContext safely', () => {
    delete (window as any).AudioContext;
    delete (window as any).webkitAudioContext;

    const headlessSynth = new UIAudioSynthesizer();
    expect(() => {
      headlessSynth.playClick();
      headlessSynth.playHover();
      headlessSynth.playLaunch();
      headlessSynth.playTransition();
      headlessSynth.playCrtToggle();
      headlessSynth.playError();
      headlessSynth.playSuccess();
    }).not.toThrow();
  });

  it('exports singleton instance uiAudio', () => {
    expect(uiAudio).toBeInstanceOf(UIAudioSynthesizer);
  });
});
