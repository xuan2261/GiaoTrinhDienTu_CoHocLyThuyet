# Candidate technical browser smoke

Observed: `2026-08-21T00:00:00Z`  
Artifact: `release/2026.08.21-candidate/package/`

## `file://`

- Loaded `index.html`; title: `Giáo trình điện tử – Cơ Học Lý Thuyết | Học viện Hải quân`.
- Full-text search for `mô men` returned semantic listbox options and navigated to `#ch1-1-4`.
- Representative Sim2 control responded to keyboard input: force slider `50` → `55` with `ArrowRight`.
- Bundled PDF dialog opened without changing the lesson route; page 1 rendered to a `596 × 842` canvas.

## HTTP

- Loaded the same staging package from `http://127.0.0.1:8765/`.
- Browser recorded 72 resource requests; 0 used an origin outside `127.0.0.1:8765`.
- Chapter navigation changed the route to `#ch1`.

This is technical smoke evidence, not the independent manual review. The manual checklist remains pending.
