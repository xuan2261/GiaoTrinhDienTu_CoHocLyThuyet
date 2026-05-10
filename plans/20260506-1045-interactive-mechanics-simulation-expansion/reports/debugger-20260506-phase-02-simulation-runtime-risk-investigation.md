---
type: debugger-report
topic: phase-02-simulation-runtime-risk-investigation
created: 2026-05-06
---

# Phase 02 Simulation Runtime Risk Investigation

## Executive Summary

- Previous lifecycle blocker is resolved on current runtime path.
- No current blocker found in RAF cleanup, resize listener cleanup, registry handoff, or startup load order.
- 2 residual runtime risks remain:
  - mount failure leaks scope-managed cleanup because `simulations.js` does not dispose scope on thrown mount.
  - fallback `fetch()` route path in `loader.js` has no stale-request guard; can render stale content after rapid route changes.
- Large module files are tech debt only, not a runtime blocker in this pass.

## Scope + Evidence

- Read: `index.html`, `js/loader.js`, `js/sim-core.js`, `js/sim-statics.js`, `js/sim-kinematics.js`, `js/sim-dynamics.js`, `js/simulations.js`, `tools/smoke_simulation_runtime.py`, existing Phase 02 report.
- Ran: `python tools\smoke_simulation_runtime.py` -> `PASS`
- Ran: `python tools\smoke_simulation_routes.py` -> `PASS`, `SIM_MAP routes: 18`
- Verified: `111/111` route ids from `loader.js` fragment map exist in `js/pages.js` bundle.

## Hypotheses Tested

### H1. Old lifecycle blocker still exists: RAF or resize listeners survive route change

Status: eliminated.

Evidence:

- `loadPage()` disposes active sim before content replacement: `js/loader.js:177-185`
- mounted simulation disposer stored in `activeSimulationDispose`: `js/loader.js:377-381`
- registry wrapper creates a scope and disposes it on unmount: `js/simulations.js:18-29`
- scope cancels all tracked RAF ids and flips `disposed=true`: `js/sim-core.js:17-50`
- only raw `requestAnimationFrame/cancelAnimationFrame` calls are in `js/sim-core.js`
- only global `resize` listener is in `createSimContainer()` and is registered for cleanup via `scope.onDispose()`: `js/sim-core.js:89-98`
- domain modules use `requestSimFrame(scope, ...)`, not raw RAF: search across `js/sim-*.js`

Conclusion:

- Previous blocker is actually resolved for the current 18 mounted simulations.

### H2. Load order still broken

Status: eliminated as current blocker.

Evidence:

- Script order in `index.html`:
  - `js/app.js`
  - `js/pages.js`
  - `js/loader.js`
  - `js/sim-core.js`
  - `js/sim-statics.js`
  - `js/sim-kinematics.js`
  - `js/sim-dynamics.js`
  - `js/sim-activities.js`
  - `js/simulations.js`
- `loadPage(hash)` bootstrap happens only in `DOMContentLoaded` handler from `js/app.js:376-385`
- `DOMContentLoaded` fires after all non-deferred script tags at end of `body` have executed, so `window.SIM_MAP` exists before first hash bootstrap.

Conclusion:

- `loader.js` loading before sim modules is structurally fragile, but not a live blocker with current bootstrap timing.

### H3. Route transitions can still corrupt runtime state

Status: partially confirmed, but not on current main path.

Evidence:

- `loadPage()` updates `currentPageId` before any async fallback fetch: `js/loader.js:184-185`
- fallback fetch path awaits network/file fetch: `js/loader.js:231-234`
- after await, content is written with no request token / stale-check: `js/loader.js:238-256`
- `initSimulations(ca)` uses global `currentPageId`, not the original `id`: `js/loader.js:372-385`
- current build bundles all 111 fragment routes in `js/pages.js`, so main path uses `PAGES[id]` and does not hit `await fetch(path)` for known routes.

Timeline for residual race if fallback path is used:

1. `loadPage('A')` sets `currentPageId='A'`, enters `await fetch(pathA)`.
2. User navigates to `B`; `loadPage('B')` sets `currentPageId='B'`, renders B.
3. Slow `A` resolves later, writes A content.
4. `initSimulations(ca)` consults global `currentPageId='B'`.
5. Result can be stale content A with sim selection for B, or stale overwrite with wrong route state.

Conclusion:

- Real residual bug in fallback mode.
- Not a present blocker for the shipped bundled runtime because bundle coverage is complete.

### H4. Registry wrapper still misses cleanup edge cases

Status: confirmed residual risk.

Evidence:

- `simulations.js:18-24` creates scope and calls `simFn(host)` inside `withScope(scope, ...)`
- no `try/finally` around mount path
- `js/sim-core.js:97-98` registers `window.resize` cleanup only through `scope.onDispose`
- `js/loader.js:377-381` stores disposer only after mount returns successfully

Failure chain:

1. `simFn(host)` starts mount.
2. `createSimContainer()` adds window `resize` listener.
3. later code in `simFn` throws before return.
4. `mount()` exits by exception; scope disposer never called.
5. `activeSimulationDispose` never gets assigned.
6. load falls into `loadPage()` catch and rewrites content, but leaked `resize` listener remains.

Conclusion:

- Hidden cleanup leak on mount failure.
- Not proven to happen in current 18 sims, because current smoke passes and no current mount-time throw observed.

## Blocker vs Tech Debt

True blockers now:

- None proven on current bundled runtime path.

Residual runtime risks:

- exception during mount leaks scope cleanup
- stale-route race on fallback fetch path

Tech debt only:

- `sim-statics.js`, `sim-kinematics.js`, `sim-dynamics.js` are large files
- no evidence these file sizes alone create a Phase 02 runtime failure

## Recommendations

Priority 1:

- make `mount()` exception-safe: dispose scope in `catch/finally` if `simFn(host)` throws

Priority 2:

- add request token / generation guard in `loadPage()` before writing `content-area` after async fetch

Priority 3:

- extend `tools/smoke_simulation_runtime.py` to check:
  - mount wrapper has failure cleanup
  - `loadPage()` has stale-request guard when fallback fetch path exists
  - no raw RAF or global resize outside `sim-core.js`

## Unresolved Questions

- None.
