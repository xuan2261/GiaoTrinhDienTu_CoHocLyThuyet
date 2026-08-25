# Candidate technical browser smoke

Observed: `2026-08-25T14:30:55Z`
Artifact: `release/2026.08.25-candidate/package/`

## `file://`

- Loaded `index.html`; title: `Giáo trình điện tử – Cơ Học Lý Thuyết | Học viện Hải quân`.
- Author page rendered Bùi Thanh Xuân as `Thiếu tá, ThS`; the prior rank was absent.
- Full-text search for `mô men` returned 37 semantic results.
- Bundled PDF dialog opened without changing the lesson route; page 1 rendered to a `745 × 1053` canvas.

## HTTP

- Loaded the same staging package from `http://127.0.0.1:8766/`.
- Browser recorded 76 resource requests; 0 used an origin outside `127.0.0.1:8766`.
- Chapter navigation changed the route to `#ch1`.

This is technical smoke evidence, not the independent manual review. The manual checklist remains pending.
