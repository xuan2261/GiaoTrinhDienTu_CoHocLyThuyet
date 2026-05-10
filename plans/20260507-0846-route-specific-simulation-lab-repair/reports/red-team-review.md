# Red Team Review

## Summary

Plan is necessary. Biggest failure risk: replacing one generic engine with 58 unmaintainable hand-written scenes. Use route-specific configs plus shared templates, and force tests to catch both duplicate scenes and broken mounting.

## Findings

| Risk | Severity | Attack | Mitigation |
|---|---|---|---|
| Scene uniqueness test can be gamed by changing only text | High | Routes look different in DOM but same simulation learning value. | Browser canvas hash + control/readout signature + catalog `template/visualKey`. |
| 58 route configs can exceed file-size rules | High | One giant `sim-route-scenes.js` becomes hard to review. | Split by chapter/section group; keep registry/templates separate. |
| Pixel hash gate can be flaky | Medium | Anti-aliasing differs by browser/OS. | Compare duplicate hashes within same run; no fixed golden hashes. |
| Assessment checkpoints may drift | High | New readouts change keys, old checkpoints check wrong state. | Phase 10 explicit checkpoint/readout alignment. |
| Generic templates still too generic | High | Same renderer with tiny params still feels same. | Every route needs distinct initial layout, direct manipulation target, formula, and feedback. |
| Browser suite runtime grows too much | Medium | Full 58 route identity checks slow every dev loop. | Add filtered route option for phase gates; full gate only before release. |
| Existing completed plans may hide regression | Medium | "completed" status gives false confidence. | New plan explicitly corrects completed plan regression. |
| Adding script tags can break load order | Medium | Scene registry unavailable at mount. | Phase 2 runtime smoke and explicit index load order check. |

## Required Changes To Plan

- Phase 1 must create failing identity gates before scene migration.
- Phase 2 must preserve `SIM_MAP` compatibility and route count.
- Content phases must list exact routes.
- Final QA must include old gates plus new scene identity gates.

## Verdict

Proceed. Do not implement route scenes without the identity gate.

Unresolved questions: none.
