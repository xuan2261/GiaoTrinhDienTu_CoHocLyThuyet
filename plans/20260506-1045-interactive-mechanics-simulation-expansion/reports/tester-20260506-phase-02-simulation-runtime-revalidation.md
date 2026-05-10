---
type: report
topic: phase-02-simulation-runtime-revalidation
created: 2026-05-06
---

# Phase 02 Simulation Runtime Revalidation

## Tóm tắt

Đã re-validate foundation sau khi fix lifecycle findings. Tất cả check bắt buộc pass. Browser smoke headless qua Playwright cũng pass, xác nhận mount simulation route và cleanup khi điều hướng đi.

## Test Results Overview

| Command / Check | Result |
|---|---|
| `node --check` cho toàn bộ `js/*.js` | PASS |
| `python -m compileall -q tools` | PASS |
| `python tools\smoke_simulation_runtime.py` | PASS |
| `python tools\smoke_simulation_routes.py` | PASS |
| `python tools\audit.py` | PASS with warnings |
| Browser smoke via Playwright headless + local server | PASS |

## Browser Smoke

| State | requested | cancelled | callbacks | pending | resizeAdds | resizeRemoves |
|---|---:|---:|---:|---:|---:|---:|
| Before navigation | 17 | 0 | 16 | 1 | 1 | 0 |
| After navigation | 17 | 1 | 16 | 0 | 1 | 1 |

Smoke route:

- Mount route: `ch2-1-1`
- Navigate away: `home`

Kết luận browser smoke:

- Route mount tạo được `.sim-container`.
- RAF đang chạy bị cancel sau điều hướng.
- `resize` listener được remove đúng lúc.

## Warnings

- `python tools\audit.py` vẫn báo 50 warnings, toàn bộ là `<img>` tags còn trong chapter fragments.
- Audit summary: `99 files | 49 OK | 50 warnings | 0 errors`.
- Đây là warnings nội dung, không blocking cho Phase 02.

## Critical Issues

- None blocking.

## Residual Risks

- Browser smoke mới cover một representative animated route, không chạy hết 18 routes trong browser.
- `tools\audit.py` còn warnings `<img>`; nên tách cleanup pass riêng nếu muốn giảm noise.

## Unresolved Questions

- None.
