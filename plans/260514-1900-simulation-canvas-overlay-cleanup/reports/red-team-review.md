---
title: "Red Team Review - Canvas Overlay Cleanup"
type: report
created: 2026-05-14
status: done
---

# Red Team Review - Canvas Overlay Cleanup

## Summary

Plan direction is correct, but dangerous if implemented as blind no-op without parity checks. Must prove formulas/values are not lost, only moved.

## Findings

| Severity | Finding | Mitigation |
|---|---|---|
| High | Shared `domMath` guard can hide all formulas instantly and create silent pedagogy regression | Phase 04/05 parity matrix required before final release |
| High | Some route visual-quality/structural tests may expect `domMath` marks | Update tests to assert no formula overlay and preserve renderer identity/visible route-owned handles |
| Medium | Solver/checker scenes use overlay math as part of the diagram, not just decoration | Classify routes with multiple overlay items and design per-route replacement |
| Medium | Readout cards may reintroduce duplicate/noisy values fixed by previous plan | Use explicit readouts only; keep readout dedup tests |
| Medium | Formula panel has one slot; some routes have multiple relevant formulas | Use primary formula in panel; secondary expressions as hint/readout labels only if needed |
| Low | CSS-only hiding could appear to pass screenshot checks but leave dead DOM | Tests must inspect DOM count/text, not screenshots only |

## Required Plan Changes

- Add failing-first tests before guard.
- Add inventory report with route/call-site classification.
- Add post-guard parity phases, not just shared primitive change.
- Update docs because current standards still mention formula overlay.

## Verdict

Proceed with shared guard + migration. Do not implement route cleanup before a complete baseline matrix exists.

## Unresolved Questions

- None.
