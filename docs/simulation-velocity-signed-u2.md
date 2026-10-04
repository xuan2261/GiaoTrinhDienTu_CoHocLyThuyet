# U2: signed angular velocity in the rigid-body velocity field

Date: 2026-10-03 UTC. This is one bounded lesson for `ch2-5-3` and `Sim3Ch253`, based on the delivered U1 implementation. It supersedes only the signed/zero-ω deferral in `simulation-upgrades-ch2.md`; the other deferred items there remain deferred.

## Lesson and physical contract

The learner predicts and compares the same instantaneous field at +ω, −ω and zero, while keeping the reference point P and sample M fixed:

- Position in metres, angular velocity in rad/s and velocity in m/s
- Source x points right and y points up. This adapter uses the **vertical XY plane, with angular velocity on ±Z**. CCW/CW means viewed from +Z toward that plane, not apparent motion relative to the oblique camera
- `vx = −ω(y − Py)`, `vy = ω(x − Px)`, and `|v| = |ω|r ≥ 0`
- Negating ω negates both velocity components and preserves speed, radius and capped display length
- The model constrains `v(P)=0`. At ω=0 all velocities vanish, the body is instantaneously at rest, and the IC is not unique. P remains a selected reference marker, labeled `P (mốc)`. This is not a pure-translation model
- When P=M but ω≠0, vM is zero and has no defined direction, while the rest of the field still rotates in the named CW/CCW sense
- The field is static and redraws on state changes. The illustrative plate does not simulate finite motion about a permanent hinge

The default remains P=(−1,−1) m, M=(2,1.5) m and ω=+1 rad/s, giving vM=(−2.5,+3) m/s and |vM|=√15.25 m/s. No force, mass or inertial model has been added.

## Controls and presentation

The existing omega range and paired numeric input now accept [−2.5,+2.5] rad/s. The configured range/keyboard step remains 0.1 rad/s; the shared controls retain their existing exact finite-decimal numeric-input semantics. The two existing IC inputs and keyboard/drag handle remain unchanged.

Actions:

| ID | Visible action | Effect |
|---|---|---|
| `reverse-omega` | Đảo chiều ω (giữ \|ω\|) | Negate current ω; zero stays exactly zero. Preserve P and M |
| `rest-field` | Đứng yên (ω = 0) | Set ω=0, preserving P and M |
| `zero-sample` | Đặt IC tại M (vM = 0) | Existing action: set P=M, preserve ω |
| `reset-field` | Đặt lại trường | Existing action: restore P=(−1,−1), ω=+1 |

New keyed readouts name `direction`, `sampleDirection` and `ICStatus`. The shared read-current-state button can read these with the existing quantities. Direction is textual, not color-only. This is a source-level accessibility affordance, not assistive-technology acceptance.

The speed formula now uses |ω|. SI component/speed values and the three existing fixed measurement rows are never capped. The bridge carries the same SI state plus `rotationDirection` (`ccw`, `cw`, `rest`) into 3D. The production mode bridge still snapshots/freezes state; the adapter does not advance it.

All 63 existing 2D field samples remain. At rest their segments have zero length; the origin dots remain visible as sample locations, and the main velocity arrow is hidden. All seven 3D field arrows, the sample velocity arrow and angular-velocity arrow are hidden at exact zero. Zero-vector labels explicitly read `v_M = 0` and `ω = 0`. Near-zero finite nonzero values retain their sign; no artificial directional threshold is introduced.

Existing geometry, camera, sample positions and scales/caps are preserved:

- 2D sample velocity ×0.4, cap 1.8; field ×0.18, cap 0.9
- 3D positions ×0.55; sample velocity ×0.24; field ×0.14; velocity cap 2.2
- The 3D seven field points remain illustrative positions derived from P and M, not a newly introduced fixed spatial grid

## Test-first evidence

New suite: `tests/sim-velocity-signed-u2.test.js`.

Before modifying the route/adapter, all seven tests failed. They exercised the production control paths and exposed the old +0.3 minimum, absent rest/direction/actions and the resultant unsupported signed adapter states. The recorded command exited 1. These are feature-contract failures, not seven independent defects in the existing physics kernel. The underlying signed cross-product and zero-hiding primitive were already correct.

After the implementation, the suite passes **7/7**. Coverage includes:

1. Signed bounds, configured 0.1 step, exact unchanged default state/measurements and absolute-value speed formula
2. **2,807 paired ±ω cases:** 401 magnitudes across seven IC positions, including four corners, P=M and an off-grid interior point. Independent component, sign-symmetry, `v·r=0` and `|v|=|ω|r` checks cover the main sample and all three fixed measurements; numeric control events, rather than bypassed callbacks, set the state
3. All **63 2D field samples** at four IC positions and seven signed/zero omega values, with independent direction, cap-count and capped-display oracles; the main SVG arrow uses the real world/screen transform
4. Exact CW/CCW/rest text, undefined zero-vector direction, non-unique IC at rest and finite near-zero ±10⁻¹³ rad/s
5. Reverse/rest/reset/zero-sample actions and Home/End/ArrowUp control callbacks, including reverse-at-zero and uncapped exact-decimal reversal
6. **606 real-Three CPU states:** six IC positions ×101 omega values, verifying all nine arrows' actual quaternion direction, visibility, physical magnitude and display length. Geometry object references and camera position are unchanged by parameter edits
7. **20 complete production 2D→3D→2D cycles** over positive, negative and rest states, preserving exact frozen nested SI snapshots, readouts and input values. Controls outside the hidden viewport continue updating the active adapter. Disposed 3D hosts and route DOM are removed

Numerical oracles are independently computed in the tests, not adopted from debug truth flags. Absolute tolerance is 10⁻⁹ for source quantities and direction math; three-decimal readout tolerance is 0.0005001. The sweep samples the continuous finite numeric-input domain; it does not claim an exhaustive proof over real numbers.

Commands run on the candidate:

```sh
node --test tests/sim-velocity-signed-u2.test.js
node --test tests/sim-velocity-signed-u2.test.js tests/sim-upgrades-ch2.test.js tests/sim2-audit-repairs.test.js tests/sim3-audit-regression.test.js
```

The combined run passes **45/45**, with zero failures/skips. This includes the existing Chapter 2, 2D repair and real-Three regression suites. Production route, shell, controls, transform, panel, mode bridge, adapter and vendored Three.js r160 execute in the new fixture; DOM events, canvas drawing, the label layer and WebGLRenderer are CPU stand-ins. No browser was launched.

## Acceptance and scope boundaries

Actual WebGL, native browser range/keyboard/pointer/touch interaction, assistive technology, layout/pixel review, responsive/zoom/theming, performance and GPU resource acceptance remain **pending**. CPU event dispatch is not native interaction, and geometry/quaternion checks are not pixel acceptance. In particular, newly reachable negative-ω corner states need actual arrow/label framing review; the new text/readout rows and action buttons need narrow-screen and 200/400% zoom checks.

No camera controls, selectable density, user-selected M, new grid, renderer change, instancing, shared-core/package edit, dependency installation, publication, commit, push or deployment belongs to this lesson. No existing formal acceptance status is promoted by these CPU tests.
