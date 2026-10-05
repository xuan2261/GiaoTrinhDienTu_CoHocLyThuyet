# Q0 source-bound browser evidence producer

## Status and acceptance boundary

Implemented an evidence producer for the production `index.html` → `loadPage(route)` → production simulation loader. It does not replace the app with a fixture and does not edit production files. It is deliberately separate from the older visual pilot, whose implementation-declared visual metrics must not become an independent oracle.

**Current browser/WebGL status: not run / blocked. Formal acceptance remains pending.** The coordinating task reported that the dot cloud browser rejected candidate loopback navigation with `ERR_BLOCKED_BY_CLIENT`, and shell Chromium launch attempts by another worker failed with singleton socket `EPERM`. No candidate browser process/render succeeded in those reports. The producer worker made **zero browser launch attempts**. The attributed receipt is `tools/sim-upgrade-qualification/runtime-blocker.json`; it records the source and limits of the report and is not itself browser evidence.

The runnable producer still needs a supported, explicitly permitted runtime. No security-disabling switches, sandbox bypasses, software-renderer-forcing switches, browser downloads, installations or alternative user-browser routes were used by this worker. Chromium is launched with `chromiumSandbox: true`. Custom browser arguments and remote/user profiles are not accepted. Firefox/WebKit are optional already-installed engines for future independent runs.

## Commands

All commands below run from the repository root. No package or lockfile changes are required.

```sh
# Pure Node tests; no browser or network listener is started
node --test tests/sim-upgrade-qualification.test.js

# Source manifest plus an explicit not-run plan; no Playwright import/launch
node tools/sim-upgrade-qualification/run.js --plan --profile desktop --out ../q0-evidence

# Future supported runtime only: 35 production defaults, one desktop profile
node tools/sim-upgrade-qualification/run.js --profile smoke --defaults-only --out ../q0-evidence

# Future supported runtime only: full desktop matrix plus discovered controls/events
node tools/sim-upgrade-qualification/run.js --profile desktop --out ../q0-evidence

# Optional already-installed second engine; no browser installation is performed
node tools/sim-upgrade-qualification/run.js --engine firefox --profile smoke --out ../q0-firefox
```

`--route ch3-6-2` deliberately limits the run to both relevant Sim2/Sim3 rows. `--headed` changes visibility only. `--executable /absolute/path/to/installed/browser` selects an already-available executable without changing browser security flags. Selection is written into the run manifest; subset/smoke evidence is never described as the full matrix. Exit 2 means blocked/incomplete capture, and exit 0 means plan generation or completed evidence collection with human review still pending.

## Source and artifact provenance

Each new UUID run directory contains:

- `source-manifest.json`: sorted file paths, byte lengths and SHA-256 for `index.html`, root `CoHocLyThuyet.pdf`, package/lockfile, all `js`, `css`, `lib`, `chapters`, `data`, `assets`, `images` and `media`. The source-set hash is SHA-256 over canonical JSON of those entries. This binds all 35 simulation modules, their cores, loader, styles, content, and vendored Three.js and other runtime libraries
- `collector-manifest.json`: independent SHA-256 binding of the five producer code files (including the collector-owned action plans/oracles); `producerVersion` and `collectorHash` are also in `run.json`
- `run.json`: source/collector hashes, Git HEAD plus dirty status (informational, never a substitute for byte hashes), OS, exact browser engine/version, profile selection, all expected default rows, detailed actual records, remaining coverage and acceptance status
- One PNG and JSON record for every successfully captured state, including unsupported-WebGL fallback states. PNG bytes are hashed. Console warnings/errors, page errors, failed requests, action receipts, timestamps, focus, DOM counts, readouts, inputs and bounding rectangles are retained

The read-only loopback server only serves files in the initial source manifest. It rehashes bytes immediately before each response and returns 409 on changed/unbound content. It refuses writes and symlinks/path escapes. Every served request is recorded with its digest. External network requests are blocked and reported; service workers are blocked and local responses use `Cache-Control: no-store`. Final source and collector verification reject changed/deleted bound files. A run made while source files change is incomplete and must be repeated against a frozen candidate.

The collector uses minimal wrappers around production shell creation and the Sim2→Sim3 `setState` bridge. Original functions receive unchanged arguments and return values. The wrapper captures real bridge states and physical clock when available; it does **not** fabricate full internal state for the other Sim2 routes. Those records explicitly identify their state as DOM readouts, control values and clock only. Implementation `__SIM3_DEBUG__` values are retained separately under `implementationDeclarations`, never used as layout/performance correctness oracles.

Every measurement includes a collector-owned method, source hash, state hash, timestamp and bounded scope. Captures are paused through the visible play/pause control. State/readouts/control values are hashed before and after the PNG; changes invalidate the record. This establishes a stable reported state, not that every animated decorative pixel was frozen. Full-page PNGs retain the production layout, scene, readout and controls; viewport, DPR, document scroll offsets, native input `step` and `data-physical-step`, theme and reduced-motion state are recorded with rectangles.

## Matrix and actions

The default desktop plan is 320/768/1280 CSS pixels × DPR 1/2 × light/dark, height 900: 12 profiles × 35 defaults = **420 planned captures**, not 420 completed captures. Route membership is read from the production manifests.

| Engine | Production routes |
|---|---|
| Sim2 chapter 1 | ch1-1-3, ch1-1-4, ch1-1-5, ch1-1-6, ch1-2-3, ch1-1-8, ch1-3-2, ch1-3-6, ch1-5-3, ch1-6-3 |
| Sim2 chapter 2 | ch2-1-1, ch2-1-3, ch2-2-2, ch2-3-2, ch2-4-4, ch2-5-2, ch2-5-3 |
| Sim2 chapter 3 | ch3-2-2, ch3-2-3, ch3-1-3, ch3-3-1, ch3-5-2, ch3-5-3, ch3-5-4, ch3-6-2 |
| Paired Sim3 | ch1-1-5, ch1-5-3, ch2-1-3, ch2-2-2, ch2-3-2, ch2-4-4, ch2-5-3, ch3-1-3, ch3-5-3, ch3-6-2 |

Beyond defaults, producer version 1.1.0 discovers actual numeric/range bounds, handles, playback controls, and every `button[data-action]` / `button.sim2-action` from the mounted page. Action IDs must be nonempty and unique. Current labels, disabled state, and visibility are retained; missing, ambiguous, disabled, and hidden actions never become executed evidence. Every case remounts the production route. Actions include:

- Every finite min/max through keyboard Home/End for ranges or actual number input filling followed by Enter/Tab commit; requested and actual values remain separate when coupled constraints clamp an edge, and the receipt flags independent constraint review rather than suppressing the screenshot; range and companion number cases have separate artifact keys
- Handle ArrowRight, ArrowUp, Home and End. Handles hidden by 3D are explicitly not-run, not declared accessible. Numeric equivalents are exercised separately when present
- Pause/play, one trusted step click, reset after five steps, and a control change while running
- Twenty actual 2D→3D pairs, a running toggle and paused resize. Each transition records source state, focus, renderer and DOM counts; unsupported fallback observations do not count as rendered 3D
- Collision: 104/105/108 trusted step-button clicks for before/contact/after (nominal 1/60 s); late 3D mount after 108 steps. Actual clock/state are recorded rather than assumed to equal the target
- Rotation: 60/600 steps. Transmission, Coriolis and angular-momentum routes: five timestamped captures at step counts 0/15/30/45/60. A single screenshot is not treated as motion evidence

The producer adds one case per discovered physical-experiment action button, plus state-dependent sequences:

- Static-force/geometry resets follow an actual numeric perturbation; friction threshold also follows a changed μ
- Projectile apex → touchdown → replay; the replay receipt retains the immediate running observation separately from the collector's subsequent pause
- Fixed ellipse scale across two phase changes; acceleration component toggles; all three IC construction stages; zero-field sample and reset; signed velocity-field comparison at an off-axis IC using positive/negative ω, reverse, rest, reverse-at-zero and reset
- Newton run A → capture → change force → run B → clear, preserving/comparing the actual SVG reference point sequence
- Both receiving-body/system FBD selectors and accelerating-car/ground frame selectors
- Oscillator one-cycle action at default and changed k/m; short/long equal-impulse presets
- Angular reference capture at full and half radius, with a changed angle established first
- Collision before/at/after events, e=0/e=1 cases, reset, and true running auto-pause: 104 step clicks precede Play, then a bounded DOM observation waits for self-pause. A 105-click endpoint alone would not prove auto-pause. Timeout and pre-collector playback state are retained

Each operation captures its own PNG checkpoint. It has a schema-checked receipt binding the run ID, source hash, five-file collector hash, producer version, requested operation, actual locator dispatch/button or committed values, baseline, before/immediate/after states and hashes, and timestamps. The last receipt must match the screenshot state; operation order and state continuity are checked. Numeric requests remain separate from committed values; generic reset perturbations can be clamped by coupled constraints and flag independent constraint review.

Bounded collector-owned oracles independently calculate projectile event times/positions/velocities, friction threshold, Newton motion, oscillator period/state/energy, equal impulse, signed-field v = ω × r and |v| = |ω|r (including all three sampled measurement rows), angular energy/inertia, and current collision velocity/momentum/energy. Other checks compare actual DOM/SVG transitions and reset values. Collision checks use current v₁/v₂ readouts, never the product's predicted-v or predicted-loss rows as proof. Oracle verdicts are recomputed from receipt observations during validation; edited pass flags, missing observations, failed numerical checks, unbound actions and missing receipts cannot be promoted to success. Unknown future actions still get captured but have `not-evaluated` oracle status.

These checks use actual DOM readouts, committed controls, selected SVG attributes and the observed clock. They do not infer actual internal physical state from `__SIM3_DEBUG__`, and matching reported numbers does not prove that geometry/pixels depict them correctly. Every record retains pending human pixel review and formal acceptance.

Native actions are driven through browser input. There is no direct state injection to claim that adapter-only values are available through the UI. The runner does not yet implement every special-domain corner/preset, classify the visual direction of sequences, or establish assistive-technology behavior of the separate read-current-state button. The manifest distinguishes planned sequences from mounted discovery and executed checkpoint records.

## What is measured and what is still required

Measured browser observations: actual text/value/ARIA/focus, visible DOM label and control rectangles, overlapping label pairs and CSS overlap area, labels outside the active scene rectangle, actual canvas WebGL version/vendor/renderer/extensions/drawing buffer/context-lost status, Three.js `renderer.info` counters, PNG hash and stable-state bracket. Hidden labels are retained in raw data and excluded from the explicitly visible-box calculation. Empty label sets have null minimum margin, not an implied successful margin.

These observations **do not establish** mesh frustum coverage, arrowhead/SVG-stroke extent, text contrast, mesh/text occlusion, physically correct signs/directions, GPU memory reclamation, hardware GPU qualification, FPS, WCAG, or academic correctness. Renderer strings are reported as obtained, with no invented GPU/backend attribution. Three.js counters are explicitly not GPU-byte measurements.

Targets (zero mandatory-label overlap, initial 8 CSS px margin, proposed frame budgets) remain separate proposed values. No comparison against those targets grants acceptance. Supported WebGL plus a canvas only permits `evidence-captured`, with reviewer/acceptance still pending. Missing WebGL or fallback is `unsupported`; lost context, unstable captures, source drift, missing provenance, console errors and artifact mismatches cannot become success.

Remaining roadmap section 8 work is explicit in every manifest: second engine; real mobile/touch and screen-reader tasks; 200/400% browser zoom and reduced-motion matrix; all special-domain corners and numerical independent oracles; post-mount context loss/restore and null/throw/missing-THREE branches; GPU/observer/listener/RAF ownership baseline and warm-up plateau; route remount/reset/collision soaks; timed performance and input-to-render/hidden-tab/60/120Hz tests; human pixel review; separate formal decisions. Desktop DPR emulation is not real mobile evidence.

## Verification performed here

Pure Node TDD: an intentionally permissive scaffold produced **11 failing tests and one passing test**; implementation then passed all original 12. A second red run added two binding tests (source-serving mutation and symlink ancestors) before implementing those guards. The earlier producer baseline passed **20/20 tests**, including additional CLI, record and companion-number-key, coupled-bound-clamp capture and observer-forwarding/snapshot guards. This is collector/plan/source-binding coverage only; none is a substitute for executed browser capture.

`run.js --plan --profile desktop` executed successfully and generated a source-bound **not-run** manifest for 420 defaults. No PNG, real browser readout, real input action or WebGL rendering is claimed. Re-run that plan after the final source freeze and execute the actual producer only when a permitted runtime is available.

### U2 action-evidence verification (2026-10-03)

The extension followed separate failing-before/passing-after checks: four initial inventory/plan/oracle/receipt tests failed before implementation; two dispatch-contract tests failed before dispatch support; oracle-tamper and running-auto-pause tests failed before their guards; the existing record test was extended and failed before ordered-receipt/final-state guards; two signed-field sequence/oracle tests failed before the new reverse/rest action integration. CPU handler integration additionally exposed a coupled-bound clamp in a reset preparation; the request and actual commit now remain separate rather than falsely requiring the scalar target.

The final focused command passes **33/33 tests**. Production CPU route handlers supplied **45 distinct action handlers, 61 cases, 133 operations across the 25 Sim2 routes** for the current candidate. This is source/handler/schema validation, not mounted browser discovery. Transport-contract tests use recording test doubles only to verify which locator APIs would be called, receipt construction, and fail-closed dispatch; they do not establish trusted browser events, rendering, timing, or real UI behavior.

The real plan-only entrypoint was executed and tested to reject any Playwright import or HTTP listener creation. It binds the five collector files, retains 420 planned default captures, and leaves action discovery, all experiment plans, screenshots, and acceptance explicitly not-run/pending. A plan generated before the coordinating source freeze must be regenerated afterward. Browser launches, candidate input interactions, PNG captures and WebGL runs performed by this action-evidence worker: **zero**. The prior runtime blocker remains unchanged.

A final not-run envelope regression failed before introducing the shared constructor, then passed for skipped-action, scenario-error and route-error paths. All three use the same protected schema-version-2/source/collector/version envelope; legitimate not-run records validate without requiring a screenshot. Missing schema versions and attempted envelope overrides are rejected or prevented.
