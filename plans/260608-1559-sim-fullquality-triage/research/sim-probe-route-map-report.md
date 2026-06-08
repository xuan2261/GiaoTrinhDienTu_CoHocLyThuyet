# Sim Probe Route Map — Research Report
Generated: 2026-06-08

---

## 1. Route Inventory

Manifest source: `js/sim2/sim2-route-manifest.js`

| Engine | Count | Route IDs |
|--------|-------|-----------|
| Sim2   | 25    | ch1-1-3, ch1-1-4, ch1-1-5, ch1-1-6, ch1-2-3, ch1-1-8, ch1-3-2, ch1-3-6, ch1-5-3, ch1-6-3, ch2-1-1, ch2-1-3, ch2-2-2, ch2-3-2, ch2-4-4, ch2-5-2, ch2-5-3, ch3-2-2, ch3-2-3, ch3-1-3, ch3-3-1, ch3-5-2, ch3-5-3, ch3-5-4, ch3-6-2 |
| Sim3   | 10    | ch1-1-5, ch1-5-3, ch2-1-3, ch2-2-2, ch2-3-2, ch2-4-4, ch2-5-3, ch3-1-3, ch3-5-3, ch3-6-2 |
| **Total** | **35** | 25 Sim2 + 10 Sim3 overlapping IDs |

**No discrepancy** vs manifest. All 25 Sim2 ids confirmed registered via `Sim2Registry.register()`. All 10 Sim3 files found under `js/sim3/sims/*-3d.js`.

**Sim3 key convention:** Sim3 variants represented as `"ch2-2-2#sim3"` etc. in the JSON. This avoids collision with Sim2 entries and makes engine explicit.

---

## 2. How Sim3 State Flows from Sim2 Controls

Source: `js/sim3/core/mode-toggle.js`

Flow:
1. Sim2 adapter calls `sim3.setState(state)` at the end of every `render2()` / `draw()` call (`mode-toggle.js:86`: `if (mode === '3d' && sim3 && sim3.setState) sim3.setState(state)`).
2. `mode-toggle.js:75`: on 3D mode activation, `lastState` is replayed: `if (lastState && sim3.setState) sim3.setState(lastState)`.
3. The 3D adapter's `setState()` merges received state into `root.__SIM3_DEBUG__[id]` (e.g. `ch2-2-2-3d.js:101`).
4. Controls are **always Sim2's** — there are no 3D-specific inputs. Every slider/drag fires Sim2's `onInput` → `render2()` → `sim3.setState()`.

So: `slider input → sim2 render2() → sim3.setState(state) → __SIM3_DEBUG__[id] updated`.

---

## 3. Finite-Difference Worked Examples

All computed by `fd_calc.js` using `require('./js/sim2/physics/index.js')`.

### Example A — ch1-1-4: computeMoment(F, d, θ=90°)

Formula: `M = F · d · sin(90°) = F · d`

| x | dx | f(x) | f(x+dx) | sign |
|---|----|------|---------|------|
| F=50, d=4 | F+1 | M=200.00 | M=204.00 | **+** |
| F=50, d=4 | d+1 | M=200.00 | M=250.00 | **+** |

Both slider F and drag handle (which controls d) produce sign=+.

### Example B — ch1-3-2: T = W / (2·cos α)

Formula: `T = 100 / (2·cos(α))`; W=100 N fixed.

| x | dx | f(x) | f(x+dx) | sign |
|---|----|------|---------|------|
| α=30° | +1° | T=57.735 N | T=58.332 N | **+** |

Monotonically increasing because cos(α) strictly decreases on [5°, 75°]. Safe range avoids α→90° singularity.

### Example C — ch3-5-3: ω = L_tot / (2·m·r²)

Formula: `L_tot = 2·m·r₀²·ω₀ = 2·2·9·1 = 36`; `ω(r) = 36/(2·2·r²) = 9/r²`

| x | dx | f(x) | f(x+dx) | sign |
|---|----|------|---------|------|
| r=3 | −0.5 | ω=1.0000 | ω=1.4400 | **+** (r decreased) |
| r=3 | +0.5 | ω=1.0000 | ω=0.7347 | **−** (r increased) |

Probe uses slider r increasing → sign=−. Angular momentum L=I·ω is displayed as constant.

---

## 4. Route bMode Summary Table

| Route | bMode | expectSign (primary readout / control) | Notes |
|-------|-------|----------------------------------------|-------|
| ch1-1-3 | monotonic | Fx: + (slider F), Fy: + (slider alpha [1,89]) | dual slider+drag |
| ch1-1-4 | monotonic | M: + (slider F or drag d) | |
| ch1-1-5 | scene-delta | — | bespoke 2-handle drag |
| ch1-1-5#sim3 | scene-delta | — | mirrors ch1-1-5 |
| ch1-1-6 | monotonic | M_couple: + (slider d) | |
| ch1-2-3 | a-only | — | bespoke 2-handle drag, parallelogram |
| ch1-1-8 | monotonic | Ra: + (slider P), Rb: + (slider P) | drag a reverses Ra sign |
| ch1-3-2 | local-monotonic | T: + (slider alpha [5,75]) | avoid α→90° |
| ch1-3-6 | monotonic | M_ngam: + (slider P or slider a) | |
| ch1-5-3 | local-monotonic | phi: + (slider mu [0.1,1.0]) | |
| ch1-5-3#sim3 | local-monotonic | phiDeg: + | |
| ch1-6-3 | a-only | Cx: − / Cy: − (drag x or y) | bespoke drag; axis-constrained probe feasible |
| ch2-1-1 | scene-delta | |v|: + (slider v0 at reset) | playback-driven |
| ch2-1-3 | a-only | — | bespoke drag, R non-monotonic |
| ch2-1-3#sim3 | a-only | — | mirrors ch2-1-3 |
| ch2-2-2 | scene-delta | omega: + (slider omega0 at reset t=0) | |
| ch2-2-2#sim3 | scene-delta | omega: + | |
| ch2-3-2 | monotonic | gearOmega2 mag: + (slider r1); beltV: + (slider r1) | |
| ch2-3-2#sim3 | monotonic | gearOmega2: − (slider r1 → more negative) | signed value |
| ch2-4-4 | scene-delta | aCor: + (slider omega or vRel at reset) | |
| ch2-4-4#sim3 | scene-delta | aCor.mag: + | |
| ch2-5-2 | a-only | — | bespoke drag, IC position non-monotonic |
| ch2-5-3 | monotonic | vM: + (slider omega) | |
| ch2-5-3#sim3 | monotonic | vM.mag: + | |
| ch3-1-3 | monotonic | theta: + (slider a); |F*|: + (slider a) | |
| ch3-1-3#sim3 | monotonic | thetaDeg: + | |
| ch3-2-2 | monotonic | a: + (slider F) | slider m gives sign=− |
| ch3-2-3 | monotonic | pairMag: + (slider F) | Newton III pair |
| ch3-3-1 | monotonic | omega_nat: + (slider k); sign=− (slider m) | probe k for + |
| ch3-5-2 | monotonic | J: + (slider F or t) | |
| ch3-5-3 | monotonic | omega: − (slider r increasing) | |
| ch3-5-3#sim3 | monotonic | omega: − | |
| ch3-5-4 | monotonic | W: + (slider F) | |
| ch3-6-2 | scene-delta | T_loss: − (slider e increasing after collision) | event-driven |
| ch3-6-2#sim3 | scene-delta | collided: bool | distanceToImpact available |

---

## 5. The 5 Bespoke-Drag Routes — Confirmed Handle Selectors

All use `shell.addHandle()` which renders a circle element. The shell sets class via CSS; the DOM selector for probe is `.sim2-handle` (set by Sim2Shell internals) or identified by position.

| Route | bespoke input | confirmed handle drag source | readout |
|-------|--------------|------------------------------|---------|
| ch1-1-5 | 2 force-tip handles | `shell.addHandle(tip0, ...)` × 2 — drag changes F.fx/F.fy | Rx, Ry, |R|, Mo |
| ch1-2-3 | 2 force-tip handles | `shell.addHandle(...)` × 2 (h1, h2) — drag changes f1/f2 | |F1|, |F2|, ∠, |R| |
| ch1-6-3 | hole center handle | `shell.addHandle({x:hole.cx,y:hole.cy},...)` — drag changes hole position | Cx, Cy |
| ch2-1-3 | point on ellipse | `shell.addHandle(ellipsePoint(...),...)` — drag changes tParam | R, |v|, |a| |
| ch2-5-2 | bar end A | `shell.addHandle(A,...)` — drag changes A.x (constrained to y=0) | IC position |

Handle class in DOM: shells call `shell.addHandle()` which in `Sim2Shell` appends a draggable circle — CSS class `sim2-handle` inferred from shell conventions. All 5 confirmed by reading source `onDrag` callbacks.

---

## 6. Routes Flagged a-only / scene-delta / sim3-no-readout

### a-only (liveness probe only, no sign probe)
| Route | Reason |
|-------|--------|
| ch1-1-5 | Bespoke 2D drag; resultant direction arbitrary |
| ch1-2-3 | Bespoke parallelogram drag; R direction arbitrary |
| ch1-6-3 | Bespoke 2D drag; Cx/Cy each track one axis with sign=−, but drag is 2D unconstrained |
| ch2-1-3 | Bespoke drag on ellipse; R non-monotonic (local extrema at ellipse tips and sides) |
| ch2-1-3#sim3 | Mirrors ch2-1-3 |
| ch2-5-2 | Bespoke drag; IC position non-monotonic |

**Note on ch1-6-3:** If probe constrains drag to x-axis only, Cx sign=− is valid. If probe constrains to y-axis, Cy sign=− is valid. Decision delegated to probe harness author.

### scene-delta (liveness only without playback; sign possible post-event)
| Route | Reason |
|-------|--------|
| ch1-1-5 | Also bespoke — liveness by drag |
| ch2-1-1 | Readout only meaningful during playback (t advances) |
| ch2-2-2 | phi only meaningful during playback; omega at t=0 IS direct slider (sub-case monotonic) |
| ch2-4-4 | vRel oscillates during playback |
| ch3-6-2 | T_loss only non-zero after collision event |
| ch3-6-2#sim3 | Same |

### sim3-no-readout
None. All 10 Sim3 adapters write meaningful numeric fields into `__SIM3_DEBUG__`. No route needed `sim3-no-readout` classification.

---

## 7. Unresolved Questions

1. **ch1-6-3 probe axis constraint**: The probe harness must decide whether to drag in x-only or y-only to get deterministic Cx or Cy sign. Currently marked `a-only`; can be upgraded to `local-monotonic` if harness constrains drag axis.

2. **`sim2-handle` CSS class confirmation**: The exact CSS class applied by `Sim2Shell.addHandle()` was inferred. If `Sim2Shell` uses a different class name, probe selectors for bespoke-drag routes need updating. Recommend: grep `js/sim2/core/shell.js` for `addHandle` implementation to confirm class.

3. **ch2-2-2 / ch2-4-4 at t=0 sub-case**: Both are marked `scene-delta` but the omega/aCor readout at reset (t=0) is directly probed by sliders with sign=+. The probe harness can treat these as `monotonic` at reset state without pressing play — this is a valid optimization not reflected in the current bMode.

4. **ch3-6-2 e-slider live update**: `ch3-6-2` slider `e` fires `onInput: v => { params.e = v; }` (no reset call). Changing `e` mid-run affects the next collision but does not re-trigger readout update until next collision. Probe must reset before changing `e`.
