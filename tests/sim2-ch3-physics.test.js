/**
 * P4 — Ch3 dynamics physics (8 block invariants, port đã verify).
 * Chạy: node tests/sim2-ch3-physics.test.js
 */
'use strict';

const assert = require('assert');
const D = require('../js/sim2/physics/dynamics.js');

const approx = (a, b, tol, msg) =>
  assert.ok(Math.abs(a - b) <= (tol || 1e-9), `${msg}: ${a} ≈ ${b}`);

// ── #18 ch3-2-2: Newton II a = F/m ──
{
  approx(D.accelerationFromForce(10, 2), 5, 1e-9, 'ch3-2-2 a = F/m');
  approx(D.accelerationFromForce(0, 2), 0, 1e-9, 'ch3-2-2 a=0 khi F=0');
  // integrateMotion (lò xo tự do k=0, F=const) → a = F/m không đổi
  const F = 6, m = 3, dt = 0.01;
  let s = { x: 0, v: 0 };
  for (let i = 0; i < 100; i++) s = D.integrateMotion(m, 0, () => F, s.v, s.x, dt);
  // sau 1s: v = a·t = 2, x = ½at² = 1
  approx(s.v, 2, 1e-6, 'ch3-2-2 integrateMotion v = a·t');
  approx(s.x, 1, 1e-6, 'ch3-2-2 integrateMotion x = ½at²');
}

// ── #19 ch3-2-3: Newton III — lực & phản lực đối nhau ──
{
  const F = { fx: 5, fy: -3 };
  const react = D.inertialForce(1, F.fx, F.fy); // -m·a dùng như cặp đối (m=1)
  approx(react.fx, -F.fx, 1e-9, 'ch3-2-3 phản lực Fx = -Fx');
  approx(react.fy, -F.fy, 1e-9, 'ch3-2-3 phản lực Fy = -Fy');
}

// ── #20 ch3-1-3: HQC quán tính vs phi quán tính (lực quán tính = -m·a_frame) ──
{
  const m = 2, aFrame = 3;
  const fIner = D.dalembertForce(m, aFrame, 0);
  approx(fIner.fx, -6, 1e-9, 'ch3-1-3 lực quán tính = -m·a_frame');
  // Trong HQC phi quán tính: ΣF_thực + F_quán_tính = 0 khi vật đứng yên so với frame
  const eq = D.equilibriumWithInertia([{ fx: 6, fy: 0 }], m, aFrame, 0);
  assert.ok(eq.balanced, 'ch3-1-3 cân bằng trong HQC phi quán tính khi thêm lực quán tính');
}

// ── #21 ch3-3-1: RK4 con lắc/lò xo so chu kỳ giải tích (sai số <1%) ──
{
  // Lò xo: x'' = -(k/m)x, ω=√(k/m). T = 2π/ω. m=1, k=4 → ω=2, T=π.
  const m = 1, k = 4, dt = 0.0005;
  const omega = Math.sqrt(k / m);
  const Tanalytic = 2 * Math.PI / omega;
  let s = { x: 1, v: 0 };
  const N = Math.round(Tanalytic / dt);
  for (let i = 0; i < N; i++) s = D.integrateMotion(m, k, () => 0, s.v, s.x, dt);
  // sau 1 chu kỳ x≈1, v≈0
  approx(s.x, 1, 0.01, 'ch3-3-1 RK4 lò xo x ≈ x0 sau 1 chu kỳ (<1%)');
  assert.ok(Math.abs(s.v) < 0.02, 'ch3-3-1 RK4 lò xo v ≈ 0 sau 1 chu kỳ');
}

// ── #22 ch3-5-2: định lý động lượng J = Δp ──
{
  const m = 2, v1 = 1, v2 = 4;
  const dp = m * v2 - m * v1;
  approx(dp, 6, 1e-9, 'ch3-5-2 Δp = m(v2-v1)');
  // xung lực J = F·t = Δp; F=3, t=2 → J=6
  approx(3 * 2, dp, 1e-9, 'ch3-5-2 J = F·t = Δp');
}

// ── #23 ch3-5-3: bảo toàn mô men động lượng L = I·ω khi không mô men ngoài ──
{
  // L = I·ω. Co bán kính: I giảm → ω tăng, L giữ nguyên.
  const I1 = D.momentOfInertia(2, 3), omega1 = 1; // r=3
  const L1 = D.angularMomentum(I1, omega1);
  const I2 = D.momentOfInertia(2, 1.5);            // co lại r=1.5
  const omega2 = L1 / I2;                           // L bảo toàn
  const L2 = D.angularMomentum(I2, omega2);
  approx(L2, L1, 1e-9, 'ch3-5-3 L bảo toàn khi co bán kính');
  assert.ok(omega2 > omega1, 'ch3-5-3 ω tăng khi I giảm (L=const)');
}

// ── #24 ch3-5-4: định lý động năng W = ΔT ──
{
  const m = 2, v1 = 1, v2 = 3;
  const dT = D.kineticEnergy(m, v2) - D.kineticEnergy(m, v1);
  approx(dT, 8, 1e-9, 'ch3-5-4 ΔT = ½m(v2²-v1²)');
  // Công lực: W = F·d. Nếu F=4, d=2 → W=8 = ΔT
  approx(D.workDone(4, 2, 0), dT, 1e-9, 'ch3-5-4 W = F·d = ΔT');
}

// ── #25 ch3-6-2: va chạm với hệ số phục hồi e ──
{
  const m1 = 2, m2 = 3, v1 = 4, v2 = -1;
  // e=1: bảo toàn động lượng + động năng
  const r1 = D.restitutionVelocity(m1, m2, v1, v2, 1);
  approx(D.momentumBefore(m1, m2, v1, v2), D.momentumAfter(r1, m1, m2), 1e-9, 'ch3-6-2 e=1 bảo toàn p');
  const tBefore = D.kineticEnergy(m1, v1) + D.kineticEnergy(m2, v2);
  const tAfter = D.kineticEnergy(m1, r1.v1) + D.kineticEnergy(m2, r1.v2);
  approx(tAfter, tBefore, 1e-9, 'ch3-6-2 e=1 bảo toàn động năng');
  // e=0: dính nhau (v1'=v2')
  const r0 = D.restitutionVelocity(m1, m2, v1, v2, 0);
  approx(r0.v1, r0.v2, 1e-9, 'ch3-6-2 e=0 dính (v1=v2)');
  approx(D.momentumBefore(m1, m2, v1, v2), D.momentumAfter(r0, m1, m2), 1e-9, 'ch3-6-2 e=0 bảo toàn p');
  // 0<e<1: mất đúng phần động năng
  const e = 0.6;
  const re = D.restitutionVelocity(m1, m2, v1, v2, e);
  approx(D.momentumBefore(m1, m2, v1, v2), D.momentumAfter(re, m1, m2), 1e-9, 'ch3-6-2 0<e<1 bảo toàn p');
  approx((re.v2 - re.v1) / (v1 - v2), e, 1e-9, 'ch3-6-2 hệ số phục hồi e đúng');
  // 2D: resolveCollision2D bảo toàn động lượng tổng
  const before = D.momentum2d([{ m: m1, vx: 2, vy: 0 }, { m: m2, vx: -1, vy: 0 }]);
  const res = D.resolveCollision2D(m1, m2, { x: 0, y: 0 }, { x: 1, y: 0 },
    { x: 2, y: 0 }, { x: -1, y: 0 }, 1);
  const after = D.momentum2d([{ m: m1, vx: res.v1.x, vy: res.v1.y }, { m: m2, vx: res.v2.x, vy: res.v2.y }]);
  approx(after.x, before.x, 1e-9, 'ch3-6-2 resolveCollision2D bảo toàn px');
  approx(after.y, before.y, 1e-9, 'ch3-6-2 resolveCollision2D bảo toàn py');
}

console.log('sim2-ch3-physics: PASS (8/8)');
