# GSD Plan — Phase 44: Soap Carver & Hydraulic Press

## Phase Overview
- **Phase**: 44-soap-carve-and-hydraulic-crush
- **Requirements**:
  - `FR-02`: Soap & Wood Carver (`games/soap-carve/`) — Layered soap shaving cutter with curly peel particles, carving depth progression, collectible origami figurine discovery, blade scrape audio.
  - `FR-08`: Hydraulic Press Crusher (`games/hydraulic-crush/`) — Downward hydraulic piston mechanics, squash accordion deformation, squishy splatter physics, item selection, hydraulic hiss audio.
  - Shell and unit tests verification.

---

### Plan Breakdown
1. **`44-01-PLAN.md` — Soap Carver Sandbox (`games/soap-carve/`)**
   - Voxel/grid carving depth map data model (`SoapBlock.ts`).
   - Drag slice cutter collision with peeling curl particles (`PeelParticles.ts`).
   - Origami figurine reveal discovery mechanics (`FigurineDiscovery.ts`).
   - ASMR blade scrape Web Audio engine (`CarveAudio.ts`).
   - Canvas interactive scene (`SoapCarveScene.ts`), standalone HTML shell, and comprehensive Vitest unit tests (`SoapCarve.test.ts`).
2. **`44-02-PLAN.md` — Hydraulic Press Crusher (`games/hydraulic-crush/`)**
   - Hydraulic piston pressure, displacement & compression state machine (`PistonPhysics.ts`).
   - Squash accordion deformation & squishy splatter physics (`CrushSplatter.ts`).
   - Multi-item targets (Duck, Clock, Can, Watermelon, Diamond) with stiffness/splatter profiles (`CrushItems.ts`).
   - Procedural hydraulic hiss, groan, and squish Web Audio (`CrushAudio.ts`).
   - Interactive Canvas scene (`HydraulicCrushScene.ts`), standalone HTML shell, and comprehensive Vitest unit tests (`HydraulicCrush.test.ts`).
