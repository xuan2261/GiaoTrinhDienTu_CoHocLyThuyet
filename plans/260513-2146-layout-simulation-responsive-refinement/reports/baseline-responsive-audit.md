# Baseline Responsive Audit

Date: 2026-05-13

## Scope

Routes checked after adding TDD gates and before final close:

| Type | Routes |
|---|---|
| Reading | `ch3-7-3` |
| Simulation | `ch1-2-3`, `ch2-5-2`, `ch3-6-2` |

## Initial TDD Findings

| Finding | Evidence |
|---|---|
| Reading/mobile overflow existed | `ch3-7-3` had page overflow from `.page-nav .pn-btn.next` at `390px` |
| Simulation width was not independently tested | Existing responsive tests only checked representative shell overflow |
| Mobile search was too compressed | `.topbar .search input` became unusable at `390px` before topbar compact rules |
| Tablet simulation was still content-wrapper constrained | `768px` layout needed scoped widening outside inner content card |

## Final Metrics

| Route | Viewport | Page overflow | Content width | Sim width | Topbar visible children |
|---|---:|---:|---:|---:|---:|
| `ch3-7-3` | `1366x768` | 0 | 751.30 | n/a | 7 |
| `ch1-2-3` | `1366x768` | 0 | 751.30 | 1061.38 | 7 |
| `ch2-5-2` | `1366x768` | 0 | 751.30 | 1061.38 | 7 |
| `ch3-6-2` | `1366x768` | 0 | 751.30 | 1061.38 | 7 |
| `ch3-7-3` | `768x812` | 0 | 680.00 | n/a | 5 |
| `ch1-2-3` | `768x812` | 0 | 680.00 | 740.00 | 5 |
| `ch2-5-2` | `768x812` | 0 | 680.00 | 740.00 | 5 |
| `ch3-6-2` | `768x812` | 0 | 680.00 | 740.00 | 5 |
| `ch3-7-3` | `390x844` | 0 | 390.00 | n/a | 5 |
| `ch1-2-3` | `390x844` | 0 | 390.00 | 342.00 | 5 |
| `ch2-5-2` | `390x844` | 0 | 390.00 | 342.00 | 5 |
| `ch3-6-2` | `390x844` | 0 | 390.00 | 342.00 | 5 |

## Screenshots

Saved under `plans/260513-2146-layout-simulation-responsive-refinement/reports/screenshots/`.

## Unresolved Questions

None.
