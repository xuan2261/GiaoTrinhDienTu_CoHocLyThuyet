# Red-Team Technical Review — Sim Correctness Realism Overhaul

**Reviewer:** Hostile / regression + perf + correctness focus
**Date:** 2026-05-18
**Plan under review:** `plans/260518-2300-sim-correctness-realism-overhaul/`
**Verdict:** APPROVE_WITH_REVISION (4 P0 blockers must land before `/ck:cook`)

---

## P0 — Must fix BEFORE cook

### P0-1 · Phase-04 whitelist regex doesn't accept the labels it claims to whitelist
**Files:** `phase-04-rc5-overlay-text-whitelist.md:36-44, 58-60`
**Evidence:** Ran the architecture-section pattern `^([A-Za-zα-ωΑ-Ω]([_'][A-Za-zα-ωΑ-Ω0-9]{1,3})?[₀-₉²³ⁿ]?|IC|FBD|RA|RB)$` against the requirement accept list. Verified failures:

```
aₙ  → FAIL    F'  → FAIL    R''  → FAIL    vₐ  → FAIL
```

Two pattern bugs:
- `[_']` group with `{1,3}` requires *at least one* char after subscript marker, so `aₙ` (subscript right after letter, no `_`) and `vₐ` (U+2090 subscript Latin a) never match.
- The `'`-suffix case requires a following alphanumeric, so `F'` (prime alone) and `R''` (double prime) never match.

Phase-01 source-grep test `accept = ['F\'','R\'\'',...]` will be RED on master AND stay RED after Phase 04 ships — the very test the phase claims to flip GREEN.

**Mitigation:** Rewrite as `^([A-Za-zα-ωΑ-Ω](?:_[A-Za-zα-ωΑ-Ω0-9]{1,3})?'{0,2}[₀-₉²³ⁿₐ-ₜ]?|IC|FBD|RA|RB)$`. Add `[ₐ-ₜ]` (U+2090–U+209C) for subscript Latin. Unit-test all 30 accept + 20 reject strings BEFORE renderer migration.

### P0-2 · `legacyHandles` removal fails silently in tests
**Files:** `phase-02-rc1-handle-body-anchor-coupling.md` step 7; `js/sim-professional-lab.js:1086-1097`
**Evidence:** Plan replaces fallback with `console.error(...); return []`. Phase-01 asserts `data-handle-ids` does not contain `legacy-primary`. After change `legacy-primary` is gone regardless of whether route correctly defines handles or silently mounts with empty list. No assertion checks `handles.length > 0` or captures console errors. Worst case: ch1 sub-route ships with zero drag handles and pipeline goes GREEN.

**Mitigation:**
- Promote console.error → `throw new Error(...)` so dev sees mount failure.
- Phase-01 spec adds `expect(routeMountState.handles.length).toBeGreaterThan(0)` per route.
- `page.on('console')` capture; fail spec on any `[sim] route ... no handles` line.

### P0-3 · Phase-08 "zero hardcoded hex in renderer files" undercounts by 18× — scope unbounded
**Files:** `phase-08-rc2-rc6-animation-density-theme-parity.md:100`
**Evidence:** Grep `#[0-9a-fA-F]{6}` in `js/sims/` returned **36 occurrences across 16 files**, not just `PARA_COLORS`:

- `ch1-force-law-behaviors.js:10` — `colors = { force: '#dc3545', result: '#fd7e14', support: '#0d6efd', moment: '#c9963a' }`
- `ch1-friction-centroid-solver-behaviors.js:11`, `ch1-support-spatial-behaviors.js:11`, `ch1-solver-exercises-behaviors.js:11` — same pattern in **behavior** files (plan enumerates renderers only)
- `ch2-trajectory-graph-renderers.js:68,82-86,148-151` — 8 inline hex per route
- `ch1-support-renderers.js:93` — `arrow(... '#e74c3c', 'P', 2.8)` inline literal in call
- `ch3-collision-exercises-renderers.js:100,119`, `ch3-newton-laws-renderers.js:46,63`, `ch3-theorems-renderers.js:96-97`

**Mitigation:** Rescope success criterion (e.g. "zero top-level palette objects") OR add a Phase-08 sub-task explicitly migrating all 36 callsites incl. behaviors. As written, the criterion blocks phase indefinitely or is silently relaxed.

### P0-4 · Phase-05 source-shape test is brittle by design
**Files:** `phase-01-baseline-tdd-harness.md:67-68`; `phase-05-rc3a-primitive-spring-helix.md:71`
**Evidence:** Test asserts `P.spring` source contains `Math.sin`. Legitimate refactors that break it without changing behavior:
- Extract helix path to `_helixPath()` helper.
- Replace `Math.sin(t * coils * 2π)` with a precomputed lookup table.
- Use `Math.fround(Math.sin(...))` wrapper.

Conversely, replacing zigzag with Catmull-Rom (still wrong shape) avoids both `i % 4` and `Math.sin` → test passes for wrong implementation.

**Mitigation:** Replace source-grep with behavioral invariant — render to OffscreenCanvas, sample 32 points along axis, assert perpendicular displacement is sinusoidal (zero-crossing count = `2 * coilCount`). Researcher TDD §1 already endorses structural marks; assert `coilCount > 4` and `marks().filter(m => m.startsWith('lineTo:')).length >= coils * 16`.

---

## P1 — Must fix DURING cook

### P1-5 · Performance budget unverified vs combined Phase 05+06+07 cost
**Evidence:** Per-frame on ch3-3-2 (2 bodies + 3 springs):
- 3 springs × dual-pass × 16-pts/coil × ~10 coils ≈ 960 `lineTo` calls/frame.
- 2 bodies × (AO radial + body fill + rim radial) = 6 gradient fills/frame.
- Magnitude-scaled `ctx.shadowBlur` ≥ 12 on 4 force arrows (research §1: shadow blur is GPU-expensive).

Plan never quotes baseline FPS; never profiles. Phase-05 Risk says "reduce 16→12 if FPS drops" — reactive. Phase-09 step 4 measures FPS *after* all changes → too late to rescope individual phase.

**Mitigation:** Phase-05 step 1.5: record baseline FPS for ch3-3-2, ch3-6-2, ch1-2-3 on master. Track delta per phase, gate at ≤ -10% per phase before adding next.

### P1-6 · `derivedSpringGeometry` allocates per-frame
**Files:** `phase-03-rc4-spring-cable-base-coupling.md:38-51`
**Evidence:** Helper returns fresh `{x1,y1,x2,y2,coilCount,...}` each call. ch3-3-2 onTick × 60Hz × 3 springs = 180 alloc/sec, on top of `mark()` array allocs. Not catastrophic alone but compounds with Phase-05 dual-pass loops and Phase-06 `Math.sqrt`/`Math.atan2`.

**Mitigation:** Add output-arg form: `derivedSpringGeometry(wall, anchor, opts, out = {})`; reuse per-spring scratch object on scene state.

### P1-7 · Test budget: 58 × 3 drag positions = 174 page.evaluate ≠ <30s
**Files:** `phase-01:26` (<30s); `phase-02:1, 8`
**Evidence:** Existing `simulation-browser.spec.js` mount ~58 routes already takes >60s. 174 evaluate calls + per-route mount/unmount realistically 90-180s, not 30. Budget vs depth contradicts.

**Mitigation:** Either bump budget to 180s OR shard `@rc1` into one batched `page.evaluate` that loops routes in-page (single navigation, N assertions).

### P1-8 · `getAnchor` closure retention — no disposal gate
**Files:** `phase-02-rc1-handle-body-anchor-coupling.md`
**Evidence:** Each handle config carries `getAnchor: state => ...` closure over route state. `lab.dispose()` must drop handles array + behavior ref. Phase-02 lists no disposal-test gate. Phase-08 autoplay churns mount/unmount → real memory growth on long sessions.

**Mitigation:** Add `npm run test:sim:disposal` as Phase-02 success-criterion gate (already exists in pipeline per Phase-09:40); add `WeakRef(handles[0]).deref() === undefined` post-dispose assertion.

### P1-9 · `getAnchor` migration risk on dynamic / animated routes
**Files:** `phase-02` Risk Assessment — flagged but mitigation vague
**Evidence:** Routes like `ch2-2-2` rotation derive body position from `state.alpha` updated in onTick. If `getAnchor(state)` reads pre-tick raw state but renderer reads post-`derive` state, invariant `|handle.get() - getAnchor()| ≤ 8px` may flicker each frame.

**Mitigation:** Define contract: `getAnchor(state, derived)` where `derived = scene.derive(state)`. Renderer MUST call `getAnchor(state, derived)` to position body. Single source of truth, no two-state drift.

### P1-10 · Pattern-cache theme invalidation depends on missing event
**Files:** `phase-07:36`
**Evidence:** `document.addEventListener('themechange', ...)` — researcher report explicitly notes (Unresolved §2): event "not found in codebase scan". Phase falls back to MutationObserver but as risk mitigation, not primary. If MO attaches *after* `data-theme` is set at first mount, patterns stay locked to initial theme.

**Mitigation:** Make MutationObserver the primary mechanism. Add Phase-07 test that toggles `data-theme` and asserts `_patternCache.size === 0` after one rAF.

---

## P2 — Monitor

### P2-11 · OffscreenCanvas Safari < 16.4
Phase-09 cross-browser matrix lists Chrome/Firefox/Edge only. If audience includes Macs on older Safari, fallback path differs from OffscreenCanvas path; deterministic pattern bytes may diverge. **Mitigation:** Add Safari to Phase-09 matrix; key cache by `${material}-${theme}-${impl}`.

### P2-12 · Spark structural-mark explosion
`mark()` cap = 360 (`primitives.js:6`). Mid-collision frame already ≈150 marks; +16 spark emits push near cap → late-frame marks silently dropped → invariant tests miss tail draws. **Mitigation:** Wrap spark render in `withoutTrace()` OR raise cap to 512 with regression test.

---

## Verdict

**APPROVE_WITH_REVISION.** Structure is sound (TDD-first, phase isolation, 58-route registry preserved). Four P0 items are concrete bugs in the plan text, not speculative risks.

**Required before `/ck:cook`:**
1. Phase-04 — rewrite regex; add `[ₐ-ₜ]`; add prime-suffix branch; verify against full 30-accept matrix.
2. Phase-02 — `throw` (not `console.error`); add `handles.length > 0` assertion per route; capture console errors in spec.
3. Phase-08 — explicitly enumerate the 36 hex-literal callsites incl. behaviors, OR rescope success criterion. Current scope claim 18× too small.
4. Phase-05/01 — replace source-grep with behavioral assertion (sinusoidality check on rendered marks).

**Recommended during cook (P1):**
- Per-phase FPS baseline (P1-5).
- `getAnchor(state, derived)` contract (P1-9).
- Disposal gate in Phase-02 success criteria (P1-8).
- Sharded `@rc1` page.evaluate or 180s budget (P1-7).
- MutationObserver primary for theme cache (P1-10).

## Unresolved Questions

- Plan never specifies max expected force magnitude across 58 routes for `arrow.opts.magnitude` normalization (researcher §unresolved §4). Without this, magnitude scaling may saturate or stay flat — Phase-06 RED test "different hashes for different magnitudes" may pass trivially or fail on routes with single magnitude regime.
- Auto-cycle (Phase-08) interaction with browser tab-throttling (background tabs cap rAF to 1Hz) — does idle-cycle resume cleanly when tab returns to foreground?
- Pattern-cache lifetime: cleared on theme toggle, but is there an upper bound? With wood + metal + concrete × 2 themes = 6 entries — fine. Document the bound.
