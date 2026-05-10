# Phase 04: Ch2 Kinematics 16 Routes — DONE

## Files Created/Modified

| File | Action |
|------|--------|
| `js/routes/chapter-kinematics-routes.js` | Created (1601 lines) |
| `index.html` | Modified (added script tag) |

## Route Implementation Summary

| # | Route ID | Title | Features |
|---|----------|-------|----------|
| 1 | ch2-1-1 | Quỹ đạo chuyển động | Path selector (circle/ellipse/lemniscate), v/a vectors, ρ readout |
| 2 | ch2-1-2 | Quỹ đạo + Đồ thị x(t), y(t) | Dual canvas: sim + x(t)/y(t) graph, synced cursor |
| 3 | ch2-2-1 | Đồ thị vận tốc - thời gian | Sim + v(t) graph, readout v at current t |
| 4 | ch2-2-2 | Đồ thị gia tốc - thời gian | Sim + a(t) graph, readout a at current t |
| 5 | ch2-3-1 | Tọa độ tự nhiên | τ/n basis vectors, s(t), θ(t), ds/dt, dθ/dt |
| 6 | ch2-3-2 | Mẫu chuyển động | Preset selector (uniform/accelerated/circular/harmonic) |
| 7 | ch2-4-1 | Chuyển động quay | Wheel animation, θ(t) graph, θ=θ₀+ω₀t+½αt² |
| 8 | ch2-4-2 | Vận tốc & Gia tốc góc | Wheel + ω(t)/α(t) graph |
| 9 | ch2-5-1 | Truyền động bánh răng | 2 gears with teeth, ω₂=ω₁×N₁/N₂ |
| 10 | ch2-5-2 | Hệ puli - dây curoa | 2 pulleys + belt, v_belt=r×ω |
| 11 | ch2-5-3 | Cơ cấu tay quay - con trượt | Slider-crank, x=r·cos(θ)+√(l²-r²sin²θ) |
| 12 | ch2-6-1 | Chuyển động tương đối | Particles A/B, v_A=v_B+v_AB velocity triangle |
| 13 | ch2-6-2 | Vận tốc kéo theo | Rotating platform, v_carrier=ω×r |
| 14 | ch2-6-3 | Gia tốc Coriolis | Rotating disk + radial particle, a_C=2·ω·v_rel |
| 15 | ch2-7-1 | Tâm vận tốc tức thời (IC) | Body with IC marker, v=ω×r_IC |
| 16 | ch2-7-2 | Chuyển động phẳng - IC lăn | Rolling wheel, IC at contact, v=ω×r_IC |

## Architecture

- **Pattern**: `window.SimRegistry['routeId'] = fn(host)` + `window.RouteRegistry.register(...)`
- **Setup**: `simSetup(host, title, hint)` → `{lab, canvas, ctx, animator, timeline, pbUI}`
- **Animation**: `Animator` (RAF, speed) + `Timeline` (4000ms) + `PlaybackUI` in toolbar
- **Rendering**: `requestAnimationFrame` loop with state read
- **Trail**: 60-point FIFO, `shift()` when exceeded
- **Dual canvas**: Routes 2,3,4,7,8 create a secondary graph canvas appended to `lab.scene`
- **Shared helpers**: `drawArrow`, `drawBall`, `roundRect`, `drawPanel`, `drawGrid`, `drawWheel`, `drawGear`, `drawBeltPulley`, `drawGraphAxes`, `simSetup`, `makeState`

## Color Scheme

- bg: `#091a33`
- gold: `#c9963a` (UI accents, path trace)
- velocity: `#3498db` (blue arrows)
- acceleration: `#e74c3c` (red arrows)
- path trail: `rgba(201,150,58,0.2)`

## Script Loading Order

`index.html` line 407: `chapter-kinematics-routes.js` loads after pilot routes, before Ch1 statics.

## Validation

- 16 route IDs registered in both `RouteRegistry` and `SimRegistry`
- All IDs match between `register()` and `SimRegistry['id'] = fn` assignments
- `SIM_MAP` auto-builds from `SimRegistry.entries()` — all 16 routes auto-mounted
- Balanced IIFE: `(function() {...})()` — 1 open, 1 close

## Unresolved

- None.
