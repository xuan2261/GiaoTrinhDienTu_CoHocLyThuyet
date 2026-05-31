/**
 * P1 — Physics port snapshot (verified-sticky).
 * require('../js/sim2/physics') trong Node → khớp giá trị dạng đóng đã verify.
 * KHÔNG live-compare file cũ: test phải sống sót sau khi P5 xóa js/sim-physics-*.js.
 * Chạy: node tests/sim2-physics-port.test.js
 */
'use strict';

const assert = require('assert');
const Physics = require('../js/sim2/physics');

const approx = (a, b, tol, msg) =>
  assert.ok(Math.abs(a - b) <= (tol || 1e-9), `${msg}: ${a} ≈ ${b} (tol ${tol})`);

// ─── statics ─────────────────────────────────────────────────────────────────
const S = Physics.statics;
assert.ok(S, 'physics.statics tồn tại');
approx(S.computeMoment(100, 2, 90), 200, 1e-9, 'computeMoment F·d·sin90');
approx(S.computeMoment(100, 2, 30), 100, 1e-9, 'computeMoment F·d·sin30 = 100·2·0.5');
{
  const c = S.resolveForceComponents(100, 30);
  approx(c.fx, 100 * Math.cos(Math.PI / 6), 1e-9, 'resolveForceComponents fx');
  approx(c.fy, 50, 1e-9, 'resolveForceComponents fy = 100·sin30');
}
{
  const beam = S.beamReactions(120, 3, 12); // tải 120N tại 3m trên dầm 12m
  approx(beam.ra, 120 * 9 / 12, 1e-9, 'beamReactions Ra = P(L-a)/L');
  approx(beam.rb, 120 * 3 / 12, 1e-9, 'beamReactions Rb = P·a/L');
  approx(beam.ra + beam.rb, 120, 1e-9, 'beamReactions ΣR = P');
}
{
  const c = S.centroidComposite([{ area: 1, cx: 0, cy: 0 }, { area: 1, cx: 2, cy: 0 }]);
  approx(c.cx, 1, 1e-9, 'centroidComposite cx (2 ô vuông đối xứng)');
  approx(c.cy, 0, 1e-9, 'centroidComposite cy');
}
approx(S.coupleMoment(50, 4), 200, 1e-9, 'coupleMoment M = F·d');
approx(S.frictionNormal(0.3, 100), 30, 1e-9, 'frictionNormal = μ·N');

// ─── kinematics ──────────────────────────────────────────────────────────────
const K = Physics.kinematics;
assert.ok(K, 'physics.kinematics tồn tại');
approx(K.gearRatio(2, 4), 0.5, 1e-9, 'gearRatio i = r1/r2');
approx(K.angularVelocity(1, 2, 3), 7, 1e-9, 'angularVelocity ω = ω0 + αt');
approx(K.angularDisplacement(0, 2, 3), 9, 1e-9, 'angularDisplacement φ = ½αt²');
approx(K.beltVelocity(5, 2), 10, 1e-9, 'beltVelocity v = ω·r');
approx(K.coriolisAcceleration(3, 2), 12, 1e-9, 'coriolis a = 2ω·v_r');
{
  // R = v²/a_n cho chuyển động tròn đều: v=2, a_n=v²/r với r=4 → R phải = 4
  const vx = 0, vy = 2, ax = -1, ay = 0; // a vuông góc v, |a_n|=1 → R = v²/1 = 4
  approx(K.radiusOfCurvature(vx, vy, ax, ay), 4, 1e-9, 'radiusOfCurvature R = |v|³/|v×a|');
}

// ─── dynamics ────────────────────────────────────────────────────────────────
const D = Physics.dynamics;
assert.ok(D, 'physics.dynamics tồn tại');
approx(D.accelerationFromForce(10, 2), 5, 1e-9, 'accelerationFromForce a = F/m');
approx(D.kineticEnergy(2, 3), 9, 1e-9, 'kineticEnergy T = ½mv²');
approx(D.workDone(10, 5, 0), 50, 1e-9, 'workDone A = F·d·cos0');
{
  // Bảo toàn động lượng + e: va chạm 1D
  const m1 = 2, m2 = 3, v1 = 4, v2 = -1, e = 0.5;
  const r = D.restitutionVelocity(m1, m2, v1, v2, e);
  const pBefore = m1 * v1 + m2 * v2;
  const pAfter = m1 * r.v1 + m2 * r.v2;
  approx(pAfter, pBefore, 1e-9, 'restitution bảo toàn động lượng');
  // hệ số phục hồi: (v2'-v1')/(v1-v2) = e
  approx((r.v2 - r.v1) / (v1 - v2), e, 1e-9, 'restitution e đúng định nghĩa');
}
{
  // e=1 (đàn hồi) bảo toàn động năng
  const m1 = 2, m2 = 3, v1 = 4, v2 = -1;
  const r = D.restitutionVelocity(m1, m2, v1, v2, 1);
  const tBefore = D.kineticEnergy(m1, v1) + D.kineticEnergy(m2, v2);
  const tAfter = D.kineticEnergy(m1, r.v1) + D.kineticEnergy(m2, r.v2);
  approx(tAfter, tBefore, 1e-9, 'va chạm đàn hồi e=1 bảo toàn động năng');
}
{
  // RK4 dao động điều hòa: x''=-x (ω=1), x0=1,v0=0 → x(t)=cos t. Sau t=2π, x≈1.
  const deriv = s => ({ dx: s.v, dv: -s.x });
  let state = { x: 1, v: 0 };
  const dt = 0.001;
  const N = Math.round((2 * Math.PI) / dt);
  for (let i = 0; i < N; i++) state = D.rk4Step(state, dt, deriv);
  approx(state.x, Math.cos(N * dt), 1e-3, 'RK4 SHM x(t) khớp cos t sau 1 chu kỳ');
  approx(state.v, -Math.sin(N * dt), 1e-3, 'RK4 SHM v(t) khớp -sin t');
}

console.log('sim2-physics-port: PASS');
