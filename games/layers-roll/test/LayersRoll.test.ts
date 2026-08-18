import { describe, it, expect, beforeEach } from 'vitest';
import { RollPhysics } from '../src/RollPhysics.js';
import { TrackGenerator } from '../src/TrackGenerator.js';
import { GameState } from '../src/GameState.js';

describe('Layers Roll Core Mechanics', () => {
  describe('RollPhysics & Layer Accumulation', () => {
    let roll: RollPhysics;

    beforeEach(() => {
      roll = new RollPhysics({
        baseRadius: 20,
        maxRadius: 60,
        width: 40,
        trackWidth: 300,
        forwardSpeed: 300,
        steerSpeed: 300
      });
    });

    it('initializes with base core layer and minimum radius', () => {
      expect(roll.layers.length).toBe(1);
      expect(roll.layers[0].name).toBe('cardboard-core');
      expect(roll.getRadius()).toBe(23.5); // base 20 + 3.5
      expect(roll.x).toBe(0);
      expect(roll.z).toBe(0);
    });

    it('grows radius and score value when layers are added', () => {
      roll.addLayer({
        color: '#FF7675',
        name: 'pink-sheet',
        thickness: 5,
        scoreValue: 50
      });

      expect(roll.layers.length).toBe(2);
      expect(roll.getRadius()).toBe(28.5);
      expect(roll.getTotalScoreValue()).toBe(60); // 10 core + 50
    });

    it('clamps radius to maxRadius', () => {
      for (let i = 0; i < 20; i++) {
        roll.addLayer({
          color: '#55EFC4',
          name: 'thick-sheet',
          thickness: 5,
          scoreValue: 20
        });
      }
      expect(roll.getRadius()).toBe(60);
    });

    it('removes outermost layers accurately', () => {
      roll.addLayer({ color: '#111', name: 'layer1', thickness: 2, scoreValue: 10 });
      roll.addLayer({ color: '#222', name: 'layer2', thickness: 2, scoreValue: 20 });
      roll.addLayer({ color: '#333', name: 'layer3', thickness: 2, scoreValue: 30 });

      const removed = roll.removeOutermostLayers(2);
      expect(removed.length).toBe(2);
      expect(removed[0].name).toBe('layer3');
      expect(removed[1].name).toBe('layer2');
      expect(roll.layers.length).toBe(2);
    });

    it('handles lateral steering within track boundary', () => {
      // trackWidth = 300, roll width = 40 => boundary is +/- 130
      roll.steer(-1);
      roll.update(1.0, true);
      expect(roll.x).toBe(-130);

      roll.steer(1);
      roll.update(2.0, true);
      expect(roll.x).toBe(130);
    });

    it('calculates rotation angle from forward movement', () => {
      const startAngle = roll.rotationAngle;
      roll.update(1.0, true);
      expect(roll.z).toBe(300);
      expect(roll.rotationAngle).toBeGreaterThan(startAngle);
    });
  });

  describe('TrackGenerator', () => {
    it('generates deterministic track elements with pickups, obstacles and ribbons', () => {
      const gen = new TrackGenerator({
        trackLength: 3000,
        trackWidth: 300
      });
      const track = gen.generateLevel(1, 42);

      expect(track.pickups.length).toBeGreaterThan(5);
      expect(track.obstacles.length).toBeGreaterThan(3);
      expect(track.finishRibbons.length).toBe(10);
      expect(track.finishRibbons[0].multiplier).toBe(1.5);
      expect(track.finishRibbons[track.finishRibbons.length - 1].multiplier).toBe(6.0);
    });
  });

  describe('GameState & Trimming Mechanics', () => {
    let state: GameState;

    beforeEach(() => {
      state = new GameState();
      state.startLevel(1);
    });

    it('collects pickups and increases score and layer count', () => {
      // Manually position pickup directly in path
      state.track.pickups = [
        {
          id: 99,
          x: 0,
          z: 20,
          width: 40,
          length: 40,
          layer: { color: '#FFEAA7', name: 'yellow', thickness: 3, scoreValue: 50 },
          collected: false
        }
      ];

      state.update(0.1); // roll moves forward 32px
      expect(state.track.pickups[0].collected).toBe(true);
      expect(state.score).toBe(50);
      expect(state.roll.layers.length).toBe(2);
    });

    it('slices layers on collision with obstacle', () => {
      // Add 2 extra layers
      state.roll.addLayer({ color: '#A', name: 'l1', thickness: 2, scoreValue: 10 });
      state.roll.addLayer({ color: '#B', name: 'l2', thickness: 2, scoreValue: 20 });
      expect(state.roll.layers.length).toBe(3);

      state.track.obstacles = [
        {
          id: 101,
          type: 'saw',
          x: 0,
          z: 20,
          width: 50,
          depth: 30,
          damageLayers: 2,
          active: true
        }
      ];

      state.update(0.1);
      expect(state.track.obstacles[0].active).toBe(false);
      expect(state.roll.layers.length).toBe(1); // 2 layers lost
      expect(state.status).toBe('playing');
    });

    it('triggers game over if all layers trimmed', () => {
      // Only 1 layer (core)
      state.track.obstacles = [
        {
          id: 102,
          type: 'teeth',
          x: 0,
          z: 20,
          width: 50,
          depth: 30,
          damageLayers: 3,
          active: true
        }
      ];

      state.update(0.1);
      expect(state.roll.layers.length).toBe(0);
      expect(state.status).toBe('gameover');
    });

    it('slices through ribbons at finish line and multiplies score', () => {
      state.score = 100;
      // Add 5 layers to cut through multiple ribbons
      for (let i = 0; i < 5; i++) {
        state.roll.addLayer({ color: '#C', name: `l${i}`, thickness: 2, scoreValue: 10 });
      }

      state.track.finishRibbons = [
        { z: 10, multiplier: 2.0, color: '#FF0', cut: false },
        { z: 20, multiplier: 3.0, color: '#0FF', cut: false }
      ];

      state.update(0.1); // moves beyond z=30
      expect(state.track.finishRibbons[0].cut).toBe(true);
      expect(state.track.finishRibbons[1].cut).toBe(true);
      expect(state.highestMultiplier).toBe(3.0);
      expect(state.status).toBe('victory');
      expect(state.finalScore).toBe(300);
    });
  });
});
