---
type: research-synthesis
created: 2026-05-14
---

# Research Synthesis

## Problem

Readout cards currently mix:

- Output values: `|R|`, `a_n`, `p trước`, `score`.
- Input controls: `Lực F`, `omega`, `m`, `t`, `alpha`.
- Generic state: `chế độ`, `α`, `thời gian`.

This makes the inspector dense and sometimes duplicates the same value.

## Options

| Option | Description | Pros | Cons | Decision |
|---|---|---|---|---|
| A | Route-only readouts; disable all append helpers | Cleanest UX | Could hide useful time/control context on animated routes | Too blunt |
| B | Add route policy flags for generic/control/time append | Minimal engine change, clear per scene | Need update scene catalogs | Recommended |
| C | Add semantic alias dedup only | Keeps current behavior | Still noisy; alias list grows | Partial only |
| D | Rewrite readout model with categories | Strong long-term API | Larger refactor, risk to 58 routes | Overkill now |

## Recommendation

Use Option B plus narrow alias cleanup.

Policy:

```js
readoutPolicy: {
  appendMode: false,
  appendAlpha: false,
  appendControls: false,
  appendTime: false
}
```

Keep backward compatibility:

- If `scene.readoutPolicy` missing, current behavior can remain initially.
- New cleanup phases set policy on affected scene groups.
- Existing `appendGenericReadouts: false` still honored.

## Route Policy Rule

- `scene.readouts`: physics outputs, computed statuses, learner-facing verification.
- `scene.controls`: input controls; not auto-readout by default.
- Time card: only if route objective needs time cursor/animation state.
- Mode card: only if learner chooses between meaningful modes.
- Alpha card: only if angle is not already in route readouts/control display.

## Testing Strategy

- Add a readout snapshot helper that returns `{route, label, key, value}`.
- Add targeted duplicate-alias tests for known P0 routes.
- Add an all-route policy audit with allowlist for intentional equalities.
- Keep existing browser/visual gates.

## Unresolved Questions

- None.
