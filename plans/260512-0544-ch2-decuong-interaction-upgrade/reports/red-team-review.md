# Ch2 Red Team Review

## Findings

| Risk | Severity | Why It Matters | Mitigation |
|---|---|---|---|
| Animation fights user drag | High | Direct manipulation feels broken | Drag pauses/resets animation state |
| Graph labels readable only desktop | High | Ch2 graph routes fail mobile usability | Add overflow/theme tests and compact labels |
| Wrong vector decomposition | High | Ch2 pedagogy depends on vector direction | Add representative semantic checks |
| Gear/transmission visuals decorative only | Medium | User cannot learn ratio relation | Radius/speed readouts must change with drag |
| Legacy pilot accidentally active | Medium | Route ambiguity | Keep pilot reference unless explicitly registered/tested |

## Required Plan Adjustments

- Tests must verify animation pause/play lifecycle.
- Time cursor and graph readout must be first-class acceptance.
- Plane/relative routes need semantic checks, not only visual nonblank.

## Verdict

Plan acceptable if Ch2 treats graph/time/animation as core interaction, not decoration.

## Unresolved Questions

Không có.
