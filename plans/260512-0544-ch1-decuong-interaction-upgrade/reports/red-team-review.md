# Ch1 Red Team Review

## Findings

| Risk | Severity | Why It Matters | Mitigation |
|---|---|---|---|
| Reintroduce legacy `js/routes/ch1/*` | High | Could create two competing route systems | Treat legacy/pilot as reference unless active runtime explicitly uses it |
| Generic handle passes tests but weak pedagogy | High | User asked thao tác like DeCuong, not only technical pass | Per-route handle label + readout acceptance |
| Support reactions visually wrong | High | Ch1 physics credibility depends on direction/components | Add numeric formulas to route acceptance |
| Huge renderer file growth | Medium | Violates 220-line gate | Split by topic before adding new logic |
| CSS overflow on mobile | Medium | DeCuong-style controls must be touch-first | Mobile screenshot/overflow checks per phase |

## Required Plan Adjustments

- Every phase must include tests, not only final QA.
- Legacy/pilot scope must be explicit and non-active by default.
- Ch1 route groups must be small enough to review visually.

## Verdict

Plan acceptable if it refuses engine rewrite and gates each route by direct interaction + physics readout.

## Unresolved Questions

Không có.
