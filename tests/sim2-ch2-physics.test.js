/**
 * P3 — Ch2 kinematics physics (7 block, dạng đóng đã verify).
 * Chạy: node tests/sim2-ch2-physics.test.js
 */
'use strict';

const assert = require('assert');
const K = require('../js/sim2/physics/kinematics.js');

const approx = (a, b, tol, msg) =>
  assert.ok(Math.abs(a - b) <= (tol || 1e-9), `${msg}: ${a} ≈ ${b}`);

// ── #11 ch2-1-1: quỹ đạo + v, a (đạo hàm số) ──
{
  // Parabol ném xiên: v0=20, α=45, g=9.81. Tại t, v và a suy từ đạo hàm.
  const posFn = t => K.parabolaPoint(20, 45, 9.81, t, 0, 0);
  const v = K.velocityFromTrajectory(posFn, 1);
  // vx = v0 cosα không đổi
  approx(v.vx, 20 * Math.cos(Math.PI / 4), 1e-3, 'ch2-1-1 vx = v0 cosα');
  const velFn = tt => K.velocityFromTrajectory(posFn, tt);
  const a = K.accelerationFromVelocity(velFn, 1);
  approx(a.ay, -9.81, 1e-2, 'ch2-1-1 ay = -g');
  approx(a.ax, 0, 1e-2, 'ch2-1-1 ax = 0');
}

// ── #12 ch2-1-3: bán kính cong R = v²/a_n = |v|³/|v×a| ──
{
  // Chuyển động tròn đều bán kính r=5, ω=2 → R phải = 5
  const r = 5, omega = 2;
  const posFn = t => K.circlePoint(r, omega, t, 0, 0, 0);
  const velFn = tt => K.velocityFromTrajectory(posFn, tt);
  const v = velFn(0.3);
  const a = K.accelerationFromVelocity(velFn, 0.3);
  const R = K.radiusOfCurvature(v.vx, v.vy, a.ax, a.ay);
  approx(R, r, 1e-2, 'ch2-1-3 R = bán kính tròn đều');
}

// ── #13 ch2-2-2: quay quanh trục — ω = ω0 + αt, φ = ω0 t + ½αt² ──
{
  approx(K.angularVelocity(1, 2, 3), 7, 1e-9, 'ch2-2-2 ω = ω0 + αt');
  approx(K.angularDisplacement(1, 2, 3), 12, 1e-9, 'ch2-2-2 φ = ω0 t + ½αt²');
  approx(K.tangentialVelocity(7, 0.5), 3.5, 1e-9, 'ch2-2-2 v_t = ω r');
}

// ── #14 ch2-3-2: truyền động — i = z2/z1 = ω1/ω2; v đai chung ──
{
  // gearRatio(r1, r2) = r1/r2; no-slip: ω1 r1 = ω2 r2
  approx(K.gearRatio(2, 4), 0.5, 1e-9, 'ch2-3-2 i = r1/r2');
  const omega1 = 10, r1 = 2, r2 = 4;
  const v = K.beltVelocity(omega1, r1);
  const omega2 = v / r2;
  approx(omega2, 5, 1e-9, 'ch2-3-2 ω2 = ω1 r1/r2 (no-slip)');
  const ns = K.noSlipCondition(omega1, r1, omega2, r2);
  assert.ok(ns.noSlip, 'ch2-3-2 no-slip: v1 = v2');
}

// ── #15 ch2-4-4: Coriolis a_cor = 2ω×v_rel (độ lớn + hướng) ──
{
  approx(K.coriolisAcceleration(3, 2), 12, 1e-9, 'ch2-4-4 |a_cor| = 2ω v_r');
  // hướng: ω theo +z, v_r theo +x → a_cor theo +y
  const ac = K.coriolisAccelerationVec(3, 2, 0);
  approx(ac.ax, 0, 1e-9, 'ch2-4-4 a_cor.x = 0 khi v_r//x');
  approx(ac.ay, 12, 1e-9, 'ch2-4-4 a_cor.y = 2ω v_r (vuông góc v_r)');
  // v_r theo +y → a_cor theo -x
  const ac2 = K.coriolisAccelerationVec(3, 0, 2);
  approx(ac2.ax, -12, 1e-9, 'ch2-4-4 a_cor ⟂ v_r (quay 90° ngược)');
}

// ── #16 ch2-5-2: tâm vận tốc tức thời (IC) suy hình học ──
{
  // 2 điểm A(0,0) v_A=(0,2); B(4,0) v_B=(0,2) → tịnh tiến thuần, IC ở vô cực (null)
  const icPure = K.locateInstantCenter({ x: 0, y: 0 }, { x: 4, y: 0 },
    { vx: 0, vy: 2 }, { vx: 0, vy: 2 });
  assert.ok(icPure === null, 'ch2-5-2 tịnh tiến thuần → IC null (vô cực)');
  // Quay quanh O: A(2,0) v_A vuông góc OA (=(0, ω·2)); B(0,2) v_B=(-ω·2,0). IC phải = O(0,0)
  const omega = 1.5;
  const ic = K.locateInstantCenter({ x: 2, y: 0 }, { x: 0, y: 2 },
    K.instantCenterVelocity(omega, 2, 0), K.instantCenterVelocity(omega, 0, 2));
  approx(ic.x, 0, 1e-6, 'ch2-5-2 IC.x = tâm quay O');
  approx(ic.y, 0, 1e-6, 'ch2-5-2 IC.y = tâm quay O');
}

// ── #17 ch2-5-3: phân bố vận tốc v_P = ω × r_{P/IC} ──
{
  const omega = 2;
  // điểm cách IC theo r=(3,0) → v = (-ω·0, ω·3) = (0,6)
  const v = K.instantCenterVelocity(omega, 3, 0);
  approx(v.vx, 0, 1e-9, 'ch2-5-3 v.x = -ω ry');
  approx(v.vy, 6, 1e-9, 'ch2-5-3 v.y = ω rx');
  // độ lớn tỉ lệ khoảng cách tới IC: r=(0,3) → |v| = ω·3 = 6
  const v2 = K.instantCenterVelocity(omega, 0, 3);
  approx(Math.hypot(v2.vx, v2.vy), 6, 1e-9, 'ch2-5-3 |v| = ω·|r| (tỉ lệ khoảng cách IC)');
}

console.log('sim2-ch2-physics: PASS (7/7)');
