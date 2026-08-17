import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioSynthesizer, audio } from '../src/index';

describe('AudioSynthesizer', () => {
  let synth: AudioSynthesizer;
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
      createBuffer: vi.fn((_channels, length, sampleRate) => ({
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

    synth = new AudioSynthesizer();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default unmuted state and respects localStorage', () => {
    expect(synth.isMuted()).toBe(false);

    synth.setMuted(true);
    expect(synth.isMuted()).toBe(true);
    expect(localStorage.getItem('arcade-carnival-muted')).toBe('true');

    const synth2 = new AudioSynthesizer();
    expect(synth2.isMuted()).toBe(true);

    synth2.toggleMute();
    expect(synth2.isMuted()).toBe(false);
    expect(localStorage.getItem('arcade-carnival-muted')).toBe('false');
  });

  it('resumes suspended audio context on sound playback', () => {
    synth.playClick();
    expect(mockContext.resume).toHaveBeenCalled();
  });

  it('does not play sounds when muted', () => {
    synth.setMuted(true);
    mockContext.createOscillator.mockClear();

    synth.playClick();
    synth.playScore();
    synth.playBounce();
    synth.playExplosion();
    synth.playPowerup();
    synth.playError();
    synth.playVictory();

    expect(mockContext.createOscillator).not.toHaveBeenCalled();
  });

  it('plays click sound preset', () => {
    synth.playClick();
    expect(mockContext.createOscillator).toHaveBeenCalled();
  });

  it('plays score sound preset', () => {
    synth.playScore();
    expect(mockContext.createOscillator).toHaveBeenCalled();
  });

  it('plays bounce sound preset', () => {
    synth.playBounce();
    expect(mockContext.createOscillator).toHaveBeenCalled();
  });

  it('plays explosion sound preset', () => {
    synth.playExplosion();
    expect(mockContext.createOscillator).toHaveBeenCalled();
  });

  it('plays powerup sound preset', () => {
    synth.playPowerup();
    expect(mockContext.createOscillator).toHaveBeenCalled();
  });

  it('plays error sound preset', () => {
    synth.playError();
    expect(mockContext.createOscillator).toHaveBeenCalled();
  });

  it('plays victory sound preset', () => {
    synth.playVictory();
    expect(mockContext.createOscillator).toHaveBeenCalled();
  });

  it('exports singleton instance audio', () => {
    expect(audio).toBeInstanceOf(AudioSynthesizer);
  });
});
