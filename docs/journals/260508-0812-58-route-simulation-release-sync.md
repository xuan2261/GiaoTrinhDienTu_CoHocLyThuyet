---
title: "58 Route Simulation Release Sync"
date: 2026-05-08
tags: [simulation, qa, release]
---

# 58 Route Simulation Release Sync

## Context

Executed `ck:cook` auto/TDD sync for `plans/260507-1846-rich-animated-full-physics-58-routes/plan.md`. Implementation was already mostly present; remaining work was stale QA scripts, docs drift, and regressions found while running release gates.

## What Happened

- Replaced stale hardcoded unit syntax paths with recursive `js/**/*.js` discovery.
- Expanded physics unit coverage for `SimPhysicsStatics`, `SimPhysicsKinematics`, and `SimPhysicsDynamics`.
- Fixed renderer overlay crash by restoring `clean(value)` in route renderer primitives.
- Hardened professional lab drag readout so all route-specific derived models show changed feedback.
- Restored Ch2-1-1 trajectory preset buttons and updated renderer contract discovery for split modules.
- Restored actual vector drawing in renderer primitives, wired route `onTick()` animation callbacks, aligned renderer contract smoke with `index.html` script order, and fixed default keyboard nudge focus.
- Synced plan, phase docs, changelog, roadmap, architecture, code standards, and QA summary.

## Verification

`npm run test:sim:release` passed. The release gate included unit, quality, semantic, compile, audit, equation mapping, route/runtime/architecture/QA tools, and browser suite. Browser result: 268 passed, 1 skipped.

## Decisions

- Keep no-bundler/offline-first architecture.
- Keep route renderer/behavior contract strict; smoke discovery now follows current split-file naming.
- Treat manual low-end device soak as residual release risk, separate from automated gate pass.

## Next

- Run a real low-end tablet FPS and memory soak before public classroom rollout.
- Keep `js/pages.js` generated only; do not hand-edit offline bundle artifacts.
