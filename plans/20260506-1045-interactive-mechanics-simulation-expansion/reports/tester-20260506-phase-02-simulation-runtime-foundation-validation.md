---
type: report
topic: phase-02-simulation-runtime-foundation-validation
created: 2026-05-06
---

# Phase 02 Simulation Runtime Foundation Validation

## Tóm tắt

Đã chạy toàn bộ positive checks được yêu cầu. Tất cả command bắt buộc đều pass. `tools/audit.py` không có errors, chỉ có warnings nội dung. Browser smoke chạy được bằng Playwright headless: 18/18 current `SIM_MAP` routes mount `canvas`, và một sim đang chạy đã bị hủy RAF sau navigation.

## Test Results Overview

| Command / Check | Result |
|---|---|
| `node --check` cho 12 file JS runtime | PASS |
| `python -m compileall -q tools` | PASS |
| `python tools\smoke_simulation_runtime.py` | PASS |
| `python tools\smoke_simulation_routes.py` | PASS |
| `python tools\audit.py` | PASS with warnings |
| Browser smoke via Playwright headless | PASS |

## Coverage / Smoke Snapshot

| Metric | Value |
|---|---:|
| `SIM_MAP` routes | 18 |
| Coverage matrix routes | 78 |
| Covered by `SIM_MAP` | 18/78 |
| P1 covered | 18/58 |
| P1 missing | 40 |
| Browser-mounted current sim routes | 18/18 |

Browser lifecycle smoke:

| State | requested | cancelled | callbacks | pending |
|---|---:|---:|---:|---:|
| Before navigation | 3 | 0 | 2 | 1 |
| After navigation | 3 | 1 | 2 | 0 |

## Warnings

- `python tools\audit.py` reports 50 warnings, toàn bộ do còn `<img>` tags trong chapter fragments. Audit summary: `99 files | 49 OK | 50 warnings | 0 errors`.
- `python tools\smoke_simulation_routes.py` báo `P1 missing` 40 routes trong coverage matrix. Đây là thông tin coverage, không phải failure của Phase 02.
- Workspace này không có `.git`, nên `git diff`-based scope detection không dùng được.

## Failures

- None.

## Performance

- Không có benchmark riêng.
- Browser smoke hoàn tất nhanh trong vài giây và không thấy RAF tiếp tục chạy sau navigation.

## Critical Issues

- None blocking.

## Recommendations

1. Giữ `tools\smoke_simulation_runtime.py` và browser lifecycle smoke làm regression gate cho mọi thay đổi `loader.js`, `sim-core.js`, `simulations.js`.
2. Tách audit warnings về `<img>` tags thành một cleanup pass riêng, không gộp vào runtime validation.
3. Re-run route/browser smoke sau mọi thay đổi liên quan `SIM_MAP` hoặc disposal lifecycle.

## Unresolved Questions

- None.
