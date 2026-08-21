# Phase 64: Super-Jump Kinematics, Tree Traversal & Vertical Camera - Context

**Gathered:** 2026-08-21
**Status:** Ready for planning
**Mode:** Smart Discuss (Autonomous)

<domain>
## Phase Boundary

Player can execute ~3-screen super-jumps with full air control, land on one-way tree branches, slide on bamboo trunks, wall-jump up castle walls, and have the camera track vertical leaps smoothly without whiplash.

Covers requirements: PHYS-01, PHYS-02, PHYS-03, PHYS-04, PHYS-05.
</domain>

<decisions>
## Implementation Decisions

### 1. Ninja Super-Jump Physics Curve
- **Super-Jump Impulse:** High upward velocity ($v_y = -850\text{px/s}$) reaching ~500–600px altitude (nearly 3 screens high on a 240px tall stage).
- **Apex Hang Time:** Near top of jump ($|v_y| < 80\text{px/s}$), gravity is reduced by 60% (from $750\text{px/s}^2$ to $300\text{px/s}^2$) for floaty ninja grace.
- **Air Steering:** High horizontal mobility ($v_x = \pm 180\text{px/s}$) with responsive direction flipping mid-air.
- **Fast Ground Run:** Run speed $160\text{px/s}$ with instantaneous direction reversal (no slippery drift on ground).

### 2. Tree & Canopy Traversal
- **One-Way Branch Platforms:** Land on top of tree branches when falling ($v_y \ge 0$), pass through from below.
- **Swept Raycast Landing:** Prevent high-velocity downward tunneling through thin branches.
- **Bamboo Trunk Cling & Slide:** Contact with vertical bamboo trunks slows descent ($v_y = 60\text{px/s}$) and allows jumping off.

### 3. Castle Wall Cling & Wall-Jump (Stage 2)
- **Wall Cling:** Holding direction toward castle wall sticks Kage to wall with slow downward slide.
- **Wall-Jump:** Pressing Jump while clinging pushes Kage upward ($v_y = -700\text{px/s}$) and away from the wall ($v_x = -\text{wallDir} \times 200\text{px/s}$).

### 4. Asymmetric Velocity-Scaled Vertical Camera
- **Asymmetric Lerp:** Fast upward lerp factor (0.28) during high-speed leaps + top-biased look-ahead deadzone; gentle downward lerp (0.12) to prevent motion sickness.
- **Boundary Clamping:** Clamps to stage boundaries `[0, stageHeight - viewportHeight]`.

</decisions>
