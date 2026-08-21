import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TankAudio } from '../src/TankAudio';

describe('TankAudio Unit Tests', () => {
  let tankAudio: TankAudio;
  let mockAudioContextInstance: any;
  let mockCompressor: any;
  let mockMasterGain: any;
  let createdOscillators: any[];
  let createdGains: any[];
  let createdBuffers: any[];

  beforeEach(() => {
    createdOscillators = [];
    createdGains = [];
    createdBuffers = [];

    const createParam = (defaultVal: number) => ({
      value: defaultVal,
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      cancelScheduledValues: vi.fn(),
    });

    mockCompressor = {
      threshold: createParam(0),
      knee: createParam(0),
      ratio: createParam(0),
      attack: createParam(0),
      release: createParam(0),
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    mockMasterGain = {
      gain: createParam(1.0),
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    mockAudioContextInstance = {
      currentTime: 10.0,
      sampleRate: 44100,
      state: 'running',
      destination: {},
      createDynamicsCompressor: vi.fn(() => mockCompressor),
      createGain: vi.fn(() => {
        const g = {
          gain: createParam(1.0),
          connect: vi.fn(),
          disconnect: vi.fn(),
        };
        createdGains.push(g);
        return g;
      }),
      createOscillator: vi.fn(() => {
        const osc = {
          type: 'sine',
          frequency: createParam(440),
          connect: vi.fn(),
          disconnect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          onended: null,
        };
        createdOscillators.push(osc);
        return osc;
      }),
      createBuffer: vi.fn((channels: number, length: number, sampleRate: number) => {
        const channelData = new Float32Array(length);
        return {
          length,
          sampleRate,
          getChannelData: vi.fn(() => channelData),
        };
      }),
      createBufferSource: vi.fn(() => {
        const src = {
          buffer: null,
          connect: vi.fn(),
          disconnect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          onended: null,
        };
        createdBuffers.push(src);
        return src;
      }),
      resume: vi.fn().mockResolvedValue(undefined),
    };

    class MockAudioContext {
      constructor() {
        return mockAudioContextInstance;
      }
    }

    vi.stubGlobal('AudioContext', MockAudioContext);
    vi.stubGlobal('window', {
      AudioContext: MockAudioContext,
    });

    tankAudio = new TankAudio();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('1. Lazy Initialization & Master Dynamics Compressor', () => {
    it('initializes context and sets master DynamicsCompressorNode parameters correctly', () => {
      const ctx = tankAudio.ensureContext();
      expect(ctx).toBe(mockAudioContextInstance);
      expect(mockAudioContextInstance.createDynamicsCompressor).toHaveBeenCalledTimes(1);

      // Verify VISUAL-05 compressor calibration parameters
      expect(mockCompressor.threshold.setValueAtTime).toHaveBeenCalledWith(-12, 10.0);
      expect(mockCompressor.knee.setValueAtTime).toHaveBeenCalledWith(30, 10.0);
      expect(mockCompressor.ratio.setValueAtTime).toHaveBeenCalledWith(12, 10.0);
      expect(mockCompressor.attack.setValueAtTime).toHaveBeenCalledWith(0.003, 10.0);
      expect(mockCompressor.release.setValueAtTime).toHaveBeenCalledWith(0.25, 10.0);

      // Master gain connect to compressor, and compressor to destination
      expect(mockCompressor.connect).toHaveBeenCalledWith(mockAudioContextInstance.destination);
    });

    it('resumes suspended context when ensureContext is called', () => {
      mockAudioContextInstance.state = 'suspended';
      tankAudio.ensureContext();
      expect(mockAudioContextInstance.resume).toHaveBeenCalled();
    });

    it('gracefully handles missing window/AudioContext without throwing', () => {
      vi.stubGlobal('window', undefined);
      const headlessAudio = new TankAudio();
      expect(headlessAudio.ensureContext()).toBeNull();
      expect(() => headlessAudio.playShot()).not.toThrow();
    });
  });

  describe('2. Volume & Mute Controls', () => {
    it('mutes and unmutes audio with smooth gain ramps', () => {
      tankAudio.ensureContext();
      expect(tankAudio.isMuted()).toBe(false);

      tankAudio.setMuted(true);
      expect(tankAudio.isMuted()).toBe(true);

      tankAudio.toggleMute();
      expect(tankAudio.isMuted()).toBe(false);
    });

    it('clamps and updates volume level', () => {
      tankAudio.ensureContext();
      tankAudio.setVolume(0.8);
      tankAudio.setVolume(1.5); // should clamp to 1.0
      tankAudio.setVolume(-0.5); // should clamp to 0.0
      expect(tankAudio.isMuted()).toBe(false);
    });
  });

  describe('3. Procedural Sound Trigger Execution', () => {
    beforeEach(() => {
      tankAudio.ensureContext();
    });

    it('plays player shot with square wave and high starting pitch', () => {
      tankAudio.playShot(true);
      expect(createdOscillators.length).toBe(1);
      const osc = createdOscillators[0];
      expect(osc.type).toBe('square');
      expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(620, 10.0);
      expect(osc.start).toHaveBeenCalled();
      expect(osc.stop).toHaveBeenCalled();
    });

    it('plays enemy shot with triangle wave and lower starting pitch', () => {
      tankAudio.playShot(false);
      expect(createdOscillators.length).toBe(1);
      const osc = createdOscillators[0];
      expect(osc.type).toBe('triangle');
      expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(480, 10.0);
    });

    it('plays bullet ping for bullet-on-bullet cancellation', () => {
      tankAudio.playBulletPing();
      expect(createdOscillators.length).toBe(1);
      const osc = createdOscillators[0];
      expect(osc.type).toBe('triangle');
      expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(1250, 10.0);
    });

    it('plays crunchy brick hit with oscillator and noise buffer', () => {
      tankAudio.playBrickHit();
      expect(createdOscillators.length).toBe(1);
      expect(createdBuffers.length).toBe(1);
      expect(mockAudioContextInstance.createBuffer).toHaveBeenCalled();
    });

    it('plays steel hit with dual resonant oscillators', () => {
      tankAudio.playSteelHit();
      expect(createdOscillators.length).toBe(2);
      expect(createdOscillators[0].type).toBe('square');
      expect(createdOscillators[1].type).toBe('sine');
    });

    it('plays explosion blasts for small tanks and big HQ eagle', () => {
      tankAudio.playExplosion(false);
      expect(createdOscillators.length).toBe(1);
      expect(createdBuffers.length).toBe(1);

      tankAudio.playExplosion(true);
      expect(createdOscillators.length).toBe(2);
    });

    it('plays powerup spawn 2-note arpeggio', () => {
      tankAudio.playPowerupSpawn();
      expect(createdOscillators.length).toBe(2);
    });

    it('plays powerup pickup 4-note ascending fanfare', () => {
      tankAudio.playPowerupPickup();
      expect(createdOscillators.length).toBe(4);
    });

    it('plays eagle destroyed siren pulses + explosion', () => {
      tankAudio.playEagleDestroyed();
      // 1 explosion oscillator + 6 siren pulse oscillators
      expect(createdOscillators.length).toBe(7);
    });

    it('plays stage start 10-note opening fanfare', () => {
      tankAudio.playStageStart();
      expect(createdOscillators.length).toBe(10);
    });

    it('plays game over descending cadence', () => {
      tankAudio.playGameOver();
      expect(createdOscillators.length).toBe(4);
    });
  });

  describe('4. Continuous Engine Sound Lifecycle', () => {
    beforeEach(() => {
      tankAudio.ensureContext();
    });

    it('starts idle engine hum and transitions to moving pitch', () => {
      tankAudio.startEngine(false); // idle
      expect(createdOscillators.length).toBe(1);
      const engineOsc = createdOscillators[0];
      expect(engineOsc.type).toBe('triangle');
      expect(engineOsc.frequency.setValueAtTime).toHaveBeenCalledWith(45, 10.0);

      // Transition to moving
      tankAudio.startEngine(true);
      expect(engineOsc.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(65, 10.05);

      // Transition back to idle
      tankAudio.startEngine(false);
      expect(engineOsc.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(45, 10.05);

      // Stop engine
      tankAudio.stopEngine();
      expect(engineOsc.stop).toHaveBeenCalled();
    });

    it('safely no-ops when stopping inactive engine', () => {
      expect(() => tankAudio.stopEngine()).not.toThrow();
    });

    it('cleans up resources on destroy()', () => {
      mockAudioContextInstance.close = vi.fn();
      tankAudio.destroy();
      expect(mockAudioContextInstance.close).toHaveBeenCalled();
      expect(tankAudio.ctx).toBeNull();
    });
  });
});
